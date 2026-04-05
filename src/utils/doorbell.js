/**
 * Διπλός τόνος «κουδούνι» (Web Audio API, χωρίς αρχείο ήχου).
 * Σε μερικά browsers χρειάζεται πρώτα αλληλεπίδραση χρήστη στην σελίδα.
 */
export function playDoorbell() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return

    if (!playDoorbell._ctx) {
      playDoorbell._ctx = new AC()
    }
    const ctx = playDoorbell._ctx
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    function chime(freq, start, duration) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + start)
      gain.gain.setValueAtTime(0.0001, now + start)
      gain.gain.exponentialRampToValueAtTime(0.22, now + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + duration + 0.08)
    }

    chime(880, 0, 0.28)
    chime(659.25, 0.32, 0.38)
  } catch {
    /* ignore */
  }
}
