import type { ReviewAction } from "../shared/schemas.js";

export interface SrsState {
  status: "NEW" | "LEARNING" | "REVIEW" | "MASTERED";
  ease: number;
  intervalDays: number;
  repetitions: number;
  correctCount: number;
  incorrectCount: number;
}

export interface SrsResult extends SrsState { nextReviewAt: string; lastReviewedAt: string }

/** Deterministic SM-2-inspired schedule. Dates are injected to keep tests stable. */
export function reviewSrs(state: SrsState, action: ReviewAction, reviewedAt = new Date()): SrsResult {
  let ease = state.ease;
  let repetitions = state.repetitions;
  let intervalDays = state.intervalDays;
  let correctCount = state.correctCount;
  let incorrectCount = state.incorrectCount;

  if (action === "AGAIN") {
    repetitions = 0; intervalDays = 1; ease = Math.max(1.3, ease - 0.2); incorrectCount += 1;
  } else {
    repetitions += 1; correctCount += 1;
    if (action === "HARD") { ease = Math.max(1.3, ease - 0.15); intervalDays = Math.max(1, Math.round((intervalDays || 1) * 1.2)); }
    if (action === "GOOD") { intervalDays = repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.max(4, Math.round(intervalDays * ease)); }
    if (action === "EASY") { ease = Math.min(3, ease + 0.15); intervalDays = repetitions === 1 ? 4 : Math.max(7, Math.round((intervalDays || 3) * ease * 1.3)); }
  }

  const status = repetitions >= 8 && intervalDays >= 60 ? "MASTERED" : repetitions >= 2 ? "REVIEW" : "LEARNING";
  const next = new Date(reviewedAt);
  next.setUTCDate(next.getUTCDate() + intervalDays);
  return { status, ease: Number(ease.toFixed(2)), intervalDays, repetitions, correctCount, incorrectCount, nextReviewAt: next.toISOString(), lastReviewedAt: reviewedAt.toISOString() };
}
