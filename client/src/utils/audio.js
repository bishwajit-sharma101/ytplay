let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playMatchFound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Add a low-pass filter to make the sawtooth sound warm and modern
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 1.0);

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, ctx.currentTime); // Start at A3
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.0); // Sweep up to A5

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.0);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

let humOsc = null;
let humGain = null;
let lfoOsc = null;

export function startWatchHum() {
  try {
    const ctx = getAudioContext();
    if (humOsc) return; // Already running

    humOsc = ctx.createOscillator();
    humGain = ctx.createGain();
    lfoOsc = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    humOsc.type = "sine";
    humOsc.frequency.setValueAtTime(85, ctx.currentTime); // Low 85Hz bass hum

    lfoOsc.frequency.setValueAtTime(1.5, ctx.currentTime); // 1.5Hz pulsation
    lfoGain.gain.setValueAtTime(0.03, ctx.currentTime);

    lfoOsc.connect(lfoGain);
    lfoGain.connect(humGain.gain);

    humOsc.connect(humGain);
    humGain.connect(ctx.destination);

    humGain.gain.setValueAtTime(0.08, ctx.currentTime); // Low level background hum

    lfoOsc.start();
    humOsc.start();
  } catch (e) {
    console.error("Audio error:", e);
  }
}

export function stopWatchHum() {
  try {
    if (humOsc) {
      humOsc.stop();
      humOsc.disconnect();
      humOsc = null;
    }
    if (lfoOsc) {
      lfoOsc.stop();
      lfoOsc.disconnect();
      lfoOsc = null;
    }
    if (humGain) {
      humGain.disconnect();
      humGain = null;
    }
  } catch (e) {
    console.error("Audio error:", e);
  }
}

export function playClockTick(isFast = false) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(isFast ? 1000 : 700, ctx.currentTime);
    
    gain.gain.setValueAtTime(isFast ? 0.2 : 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

export function playCorrect() {
  try {
    const ctx = getAudioContext();
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
    });
  } catch (e) {
    console.error("Audio error:", e);
  }
}

export function playIncorrect() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

export function playGlitch() {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.45);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

export function playWhoosh() {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 0.7;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(100, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.3);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.7);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.75);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

export function playVictory() {
  try {
    const ctx = getAudioContext();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.4);

      osc.start(ctx.currentTime + idx * 0.06);
      osc.stop(ctx.currentTime + idx * 0.06 + 0.45);
    });
  } catch (e) {
    console.error("Audio error:", e);
  }
}

export function playDefeat() {
  try {
    const ctx = getAudioContext();
    const notes = [146.83, 174.61, 220.00]; // D3, F3, A3 (D Minor triad)
    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(freq * 0.85, ctx.currentTime + 1.4);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, ctx.currentTime);

      osc.disconnect();
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);

      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    });
  } catch (e) {
    console.error("Audio error:", e);
  }
}

/**
 * Countdown beep — distinct pitch for each second.
 * count=3 → high beep, count=2 → mid beep, count=1 → low beep, count=0 → GO fanfare
 */
export function playCountdownBeep(count) {
  try {
    const ctx = getAudioContext();

    if (count === 0) {
      // Gentle, soft "GO" notification chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.12); // Sweep up to C6
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
      return;
    }

    // Soft, short C5 beeps instead of piercing high pitches
    const freq = 440; // A4 (soft hum)

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.04, ctx.currentTime); // Soft volume (0.04 instead of 0.18)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08); // Short duration

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.error("Audio error:", e);
  }
}
