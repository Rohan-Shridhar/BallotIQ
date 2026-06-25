'use client';

/**
 * THE CORE INTELLIGENCE HOOK.
 * Tracks consecutive errors and triggers adaptation mode
 * when a user struggles with micro-quiz questions.
 */

import { useState, useCallback } from 'react';
import type { ElectionStep, UserContext } from '@/types';
import { apiReExplainConcept } from '@/lib/gemini/api';
import { saveUserContext } from '@/lib/firebase/firestore';
import { logAdaptationTriggered } from '@/lib/firebase/analytics';
import { captureEvent } from '@/lib/posthog/helper';
import { EVENTS } from '@/lib/posthog/events';

/** Consecutive wrong answers before adaptation triggers */
const ADAPTATION_THRESHOLD = 2;

interface UseAdaptiveLearningReturn {
  currentStepIndex: number;
  adaptationActive: boolean;
  consecutiveErrors: number;
  showAdaptationPrompt: boolean;
  reExplanation: string | null;
  isReExplaining: boolean;
  handleMicroQuizResult: (correct: boolean, step: ElectionStep, userAnswer: string, correctAnswer: string) => Promise<void>;
  clearReExplanation: () => void;
  confirmAdaptation: () => void;
  dismissAdaptation: () => void;
  moveToNextStep: () => void;
  setCurrentStepIndex: (index: number) => void;
}

/**
 * Manages adaptive learning logic — the intelligence layer.
 * @param userContext - User's session context
 * @param steps - Current election steps
 * @returns Adaptation state and handlers
 */
export function useAdaptiveLearning(
  userContext: UserContext | null,
  steps: ElectionStep[],
  completedSteps: string[] = []
): UseAdaptiveLearningReturn {
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    // Resume at the first uncompleted step
    const firstUncompleted = steps.findIndex(s => !completedSteps.includes(s.id));
    return firstUncompleted === -1 ? 0 : firstUncompleted;
  });
  const [adaptationActive, setAdaptationActive] = useState(false);
  const [showAdaptationPrompt, setShowAdaptationPrompt] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [reExplanation, setReExplanation] = useState<string | null>(null);
  const [isReExplaining, setIsReExplaining] = useState(false);

  const confirmAdaptation = useCallback(() => {
    setAdaptationActive(true);
    setShowAdaptationPrompt(false);
    if (userContext) {
      const updatedCtx = { ...userContext, adaptationActive: true };
      saveUserContext(updatedCtx).catch(console.error);
      logAdaptationTriggered('user_request', currentStepIndex).catch(console.error);
      captureEvent(EVENTS.ADAPTATION_TRIGGERED, {
        trigger: 'user_request',
        step_index: currentStepIndex,
        country_code: userContext.countryCode,
        knowledge_level: userContext.knowledgeLevel,
      });
    }
  }, [userContext, currentStepIndex]);

  const dismissAdaptation = useCallback(() => {
    setConsecutiveErrors(0);
    setShowAdaptationPrompt(false);
  }, []);

  /** Clears the AI re-explanation so the user can retake the quiz fresh. */
  const clearReExplanation = useCallback(() => {
    setReExplanation(null);
  }, []);

  const handleMicroQuizResult = useCallback(async (
    correct: boolean,
    step: ElectionStep,
    userAnswer: string,
    correctAnswer: string
  ) => {
    if (correct) {
      setConsecutiveErrors(0);
      setReExplanation(null);
      return;
    }

    setConsecutiveErrors((prev) => {
      const next = prev + 1;
      // Show adaptation prompt after threshold
      if (next >= ADAPTATION_THRESHOLD && !adaptationActive) {
        setShowAdaptationPrompt(true);
        captureEvent(EVENTS.ADAPTATION_TRIGGERED, {
          trigger: 'threshold',
          consecutive_errors: next,
          step_id: step.id,
        });
      }
      return next;
    });

    const isNowAdaptive = adaptationActive;

    // Fetch re-explanation from Gemini
    captureEvent(EVENTS.RE_EXPLANATION_REQUESTED, {
      step_id: step.id,
      step_title: step.title,
      consecutive_errors: consecutiveErrors + 1,
    });
    setIsReExplaining(true);
    try {
      const explanation = await apiReExplainConcept(
        step, userAnswer, correctAnswer,
        isNowAdaptive ? 'beginner' : (userContext?.knowledgeLevel ?? 'beginner'),
        userContext?.sessionId
      );
      setReExplanation(explanation);
    } catch {
      setReExplanation(`The correct answer is "${correctAnswer}". ${step.simpleExplanation}`);
    } finally {
      setIsReExplaining(false);
    }
  }, [adaptationActive, userContext]);

  const moveToNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setReExplanation(null);
    }
  }, [currentStepIndex, steps.length]);

  return {
    currentStepIndex, adaptationActive, consecutiveErrors, showAdaptationPrompt,
    reExplanation, isReExplaining,
    handleMicroQuizResult, clearReExplanation, confirmAdaptation, dismissAdaptation,
    moveToNextStep, setCurrentStepIndex,
  };
}
