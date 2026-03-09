export type Band = 'Exceptional' | 'Very Good' | 'Good' | 'Improvement Needed' | 'Unacceptable';

/**
 * Calculate section percentage from a score map.
 * Max per section = 10 competencies × 5 = 50 points.
 */
export function calcSec(scores: Record<string, number>): number {
  const vals = Object.values(scores);
  if (vals.length === 0) return 0;
  const sum = vals.reduce((a, b) => a + b, 0);
  return (sum / 50) * 100;
}

/**
 * Calculate overall score from behavioral and functional score maps.
 * Overall = (Behavioral % × 0.5) + (Functional % × 0.5)
 * If only one section has scores, that section's percentage is used.
 */
export function calcOverall(
  behavioral: Record<string, number>,
  functional: Record<string, number>
): number {
  const behPct = calcSec(behavioral);
  const funPct = calcSec(functional);

  const hasBeh = Object.keys(behavioral).length > 0;
  const hasFun = Object.keys(functional).length > 0;

  if (hasBeh && hasFun) return behPct * 0.5 + funPct * 0.5;
  if (hasBeh) return behPct;
  if (hasFun) return funPct;
  return 0;
}

/**
 * Get performance band label from a percentage score.
 */
export function getBand(pct: number): Band {
  if (pct >= 90) return 'Exceptional';
  if (pct >= 80) return 'Very Good';
  if (pct >= 60) return 'Good';
  if (pct >= 40) return 'Improvement Needed';
  return 'Unacceptable';
}
