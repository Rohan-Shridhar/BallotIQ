/**
 * Client-safe quiz utilities.
 * Contains pure functions that do NOT require the Gemini API key.
 * Safe to import from client components and hooks.
 */

import type { ElectionStep, KnowledgeLevel, QuizQuestion } from '@/types';

/**
 * Builds a high-quality fallback quiz locally from steps data.
 * No API key required — runs entirely client-side.
 */
export function generateLocalFallbackQuiz(
  steps: ElectionStep[],
  knowledgeLevel: KnowledgeLevel
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  if (steps.length === 0) return [];

  for (let i = 0; i < 5; i++) {
    const stepIndex = i % steps.length;
    const s = steps[stepIndex];
    if (!s) continue;

    const type = i < steps.length ? 'concept' : i < steps.length * 2 ? 'requirement' : 'tip';

    let q = `Regarding ${s.title}, what is most important?`;
    let opts = s.microQuizQuestion?.options ?? ['Correct', 'Incorrect 1', 'Incorrect 2', 'Incorrect 3'];
    let cIdx = s.microQuizQuestion?.correctIndex ?? 0;

    if (type === 'concept') {
      q = s.microQuizQuestion?.question ?? `What is the main purpose of ${s.title}?`;
    } else if (type === 'requirement' && s.requirements.length > 0) {
      q = `Which of these is a requirement for ${s.title}?`;
      opts = [s.requirements[0], 'A non-official document', 'A library card', 'No ID required'];
      cIdx = 0;
    } else if (type === 'tip' && s.tips.length > 0) {
      q = `A helpful tip for ${s.title} is:`;
      opts = [s.tips[0], 'Wait until the last minute', 'Ignore official notices', 'Only vote in the evening'];
      cIdx = 0;
    }

    questions.push({
      id: `fallback_q${i + 1}_${s.id}`,
      question: q,
      options: opts,
      correctIndex: cIdx,
      explanation: s.detailedExplanation || s.description,
      difficulty: (
        knowledgeLevel === 'beginner' ? 'easy' :
          knowledgeLevel === 'intermediate' ? 'medium' : 'hard'
      ) as 'easy' | 'medium' | 'hard',
      relatedStepId: s.id,
    });
  }
  return questions;
}
