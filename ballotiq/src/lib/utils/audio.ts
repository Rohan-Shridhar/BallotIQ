/**
 * Utility functions for auditory feedback in the application.
 * Uses the Web Audio API to synthesise short tones — no external assets required.
 */

/**
 * Plays a short, pleasant two-tone "ding" to signal step completion.
 *
 * Design:
 *  - Two oscillators (fundamental + octave) for a richer, bell-like timbre.
 *  - Total duration ≤ 300 ms — unobtrusive but clearly audible.
 *  - Fails silently so it never breaks the main user flow.
 */
export function playCompletionSound(): void {
  try {
    const ctx = new AudioContext();

    // Gain node for a smooth fade-out (avoids the harsh click at stop())
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.35, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    gainNode.connect(ctx.destination);

    // Fundamental tone — A5 (880 Hz)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc1.connect(gainNode);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.28);

    // Octave harmony — A6 (1760 Hz) at lower volume for sparkle
    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(0.15, ctx.currentTime);
    harmGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    harmGain.connect(ctx.destination);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, ctx.currentTime);
    osc2.connect(harmGain);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.18);

    // Close the context once both oscillators have finished to free resources
    osc1.onended = () => {
      ctx.close().catch(() => {/* ignore */});
    };
  } catch {
    // AudioContext may be blocked (e.g. missing user gesture) — fail silently
  }
}
