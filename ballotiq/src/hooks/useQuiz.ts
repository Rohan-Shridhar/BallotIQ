'use client';

/**
 * Hook for managing the final certification quiz.
 * Generates personalized questions and tracks results.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ElectionStep, QuizPhase, QuizQuestion, QuizResult, UserContext } from '@/types';
import { generateLocalFallbackQuiz } from '@/lib/gemini/quizUtils';
import { apiGeneratePersonalizedQuiz } from '@/lib/gemini/api';
import { captureEvent } from '@/lib/posthog/helper';
import { EVENTS } from '@/lib/posthog/events';

interface UseQuizReturn {
  questions: QuizQuestion[];
  currentQuestion: QuizQuestion | null;
  currentIndex: number;
  results: QuizResult[];
  phase: QuizPhase;
  score: number;
  answerQuestion: (index: number) => void;
  nextQuestion: () => void;
  loading: boolean;
}

/**
 * Manages the final personalized quiz flow.
 * @param completedSteps - Steps the user has studied
 * @param userContext - User session context
 * @returns Quiz state and controls
 */
export function useQuiz(
  completedSteps: ElectionStep[],
  userContext: UserContext | null
): UseQuizReturn {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [phase, setPhase] = useState<QuizPhase>(completedSteps.length === 0 ? 'active' : 'loading');
  const [loading, setLoading] = useState(completedSteps.length !== 0);
  const startTimeRef = useRef<number>(0);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!userContext || fetchedRef.current) return;
    
    captureEvent(EVENTS.QUIZ_STARTED, {
      country_code: userContext.countryCode,
      knowledge_level: userContext.knowledgeLevel,
      completed_steps: completedSteps.length,
    });

    // 1. Instantly provide fallback questions for <2s load time
    const localFallback = generateLocalFallbackQuiz(completedSteps, userContext.knowledgeLevel);
    if (localFallback.length > 0) {
      setTimeout(() => {
        setQuestions(localFallback);
        setLoading(false);
        setPhase('active');
      }, 0);
    }

    if (completedSteps.length === 0) {
      return;
    }

    fetchedRef.current = true;

    async function loadQuiz() {
      // Don't set loading(true) again if we already have fallback questions
      try {
        const qs = await apiGeneratePersonalizedQuiz(
          completedSteps,
          userContext!.knowledgeLevel,
          userContext!.countryCode,
          userContext!.sessionId
        );
        
        // Only swap if user hasn't started yet to avoid jarring UX
        setQuestions((prev) => (currentIndex === 0 && results.length === 0 ? qs : prev));
        startTimeRef.current = startTimeRef.current || Date.now();
      } catch (err) {
        console.error('Quiz AI fetch failed, using fallback', err);
      } finally {
        setLoading(false);
        setPhase('active');
      }
    }
    loadQuiz();
  }, [completedSteps, userContext]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Records the user's answer for the current question and calculates performance metrics. */
  const answerQuestion = useCallback((selectedIndex: number) => {
    if (!questions[currentIndex]) return;
    const q = questions[currentIndex];
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    const correct = selectedIndex === q.correctIndex;
    const result: QuizResult = {
      questionId: q.id,
      selectedIndex,
      isCorrect: correct,
      timeTakenSeconds: timeTaken,
    };
    captureEvent(EVENTS.QUIZ_QUESTION_ANSWERED, {
      question_index: currentIndex,
      correct,
      time_taken_seconds: timeTaken,
    });
    setResults((prev) => [...prev, result]);
    setPhase('reviewing');
  }, [questions, currentIndex]);

  /** Advances the quiz to the next question or transitions to the completion phase. */
  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setPhase('active');
      startTimeRef.current = Date.now();
    } else {
      const finalScore = results.filter((r) => r.isCorrect).length;
      const passed = finalScore >= Math.ceil(questions.length * 0.7);
      captureEvent(EVENTS.QUIZ_COMPLETED, {
        score: finalScore,
        total: questions.length,
        passed,
      });
      if (passed) {
        captureEvent(EVENTS.CERTIFICATION_EARNED, {
          score: finalScore,
          total: questions.length,
        });
      } else {
        captureEvent(EVENTS.QUIZ_FAILED, {
          score: finalScore,
          total: questions.length,
        });
      }
      setPhase('complete');
    }
  }, [currentIndex, questions.length, results]);

  const score = results.filter((r) => r.isCorrect).length;

  return {
    questions,
    currentQuestion: questions[currentIndex] ?? null,
    currentIndex, results, phase, score,
    answerQuestion, nextQuestion, loading,
  };
}
