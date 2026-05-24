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

let bgMusicInterval = null;
let bgMusicNodes = [];
let isMusicPlaying = false;
let bgGainNode = null;
let activeProfileIdx = 0;
const baseMusicVolume = 0.22; // Louder, clear study focus volume as requested

export const MUSIC_PROFILES = [
  { id: "lofi", name: "Lofi Study", desc: "Warm ambient pads and focus bells" },
  { id: "cyber", name: "Cyber Horizon", desc: "Retro minor synthwave chords" },
  { id: "zen", name: "Zen Garden", desc: "Peaceful sine drones and healing chimes" },
  { id: "space", name: "Nebula Drone", desc: "Deep space low-frequency hum" },
  { id: "pixel", name: "Retro Pixel", desc: "8-bit chiptune square synths" },
  { id: "techno", name: "Chronos Focus", desc: "Calm procedural pulse beats" }
];

const PROFILE_CONFIGS = {
  0: { // Lofi Study (A minor)
    chords: [
      [110.00, 220.00, 261.63, 329.63, 392.00], // Am7
      [87.31, 174.61, 220.00, 261.63, 329.63], // Fmaj7
      [65.41, 130.81, 196.00, 261.63, 329.63], // Cmaj7
      [82.41, 164.81, 196.00, 246.94, 293.66]  // Em7
    ],
    arpNotes: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00],
    oscType: "triangle",
    cutoff: 350,
    interval: 6000,
    arpChance: 0.4,
    arpType: "sine",
    gainMult: 1.0
  },
  1: { // Cyber Horizon (D minor synthwave)
    chords: [
      [73.42, 146.83, 174.61, 220.00, 261.63], // Dm7
      [58.27, 116.54, 174.61, 220.00, 293.66], // Bbmaj7
      [65.41, 130.81, 196.00, 233.08, 329.63], // C7
      [110.00, 220.00, 246.94, 293.66, 392.00] // Am7
    ],
    arpNotes: [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 392.00, 440.00, 523.25, 587.33],
    oscType: "sawtooth",
    cutoff: 280,
    interval: 5000,
    arpChance: 0.45,
    arpType: "triangle",
    gainMult: 0.75 // Sawtooth is louder
  },
  2: { // Zen Garden (G major chimes)
    chords: [
      [65.41, 130.81, 196.00, 261.63, 329.63], // Cmaj7
      [98.00, 196.00, 293.66, 392.00, 440.00], // Gsus4
      [87.31, 174.61, 220.00, 261.63, 329.63], // Fmaj7
      [98.00, 146.83, 220.00, 293.66, 392.00]  // G6
    ],
    arpNotes: [392.00, 440.00, 493.88, 587.33, 659.25, 783.99, 880.00, 987.77, 1174.66, 1318.51],
    oscType: "sine",
    cutoff: 400,
    interval: 8000,
    arpChance: 0.35,
    arpType: "sine",
    gainMult: 1.4 // Sine pads need higher gain
  },
  3: { // Nebula Drone (Deep Space lowpass)
    chords: [
      [82.41, 123.47, 164.81, 196.00, 293.66], // Em9
      [65.41, 130.81, 196.00, 246.94, 329.63], // Cmaj9
      [110.00, 165.00, 220.00, 261.63, 392.00], // Am9
      [61.74, 123.47, 185.00, 220.00, 311.13]  // B7b9
    ],
    arpNotes: [82.41, 110.00, 123.47, 146.83, 164.81, 196.00, 220.00, 246.94, 293.66, 329.63],
    oscType: "triangle",
    cutoff: 170, // low cutoff
    interval: 7000,
    arpChance: 0.2, // sparse
    arpType: "sine",
    gainMult: 1.2
  },
  4: { // Retro Pixel (8-bit square synths)
    chords: [
      [130.81, 164.81, 196.00], // C
      [98.00, 146.83, 196.00],  // G
      [110.00, 130.81, 164.81], // Am
      [87.31, 130.81, 174.61]  // F
    ],
    arpNotes: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00],
    oscType: "triangle",
    cutoff: 800,
    interval: 4000,
    arpChance: 0.55,
    arpType: "square",
    gainMult: 0.45 // keep gain low for square wave
  },
  5: { // Chronos Focus (Ambient techno pulsing beats)
    chords: [
      [92.50, 185.00, 220.00, 277.18, 329.63], // F#m7
      [73.42, 146.83, 220.00, 277.18, 369.99], // Dmaj7
      [123.47, 246.94, 293.66, 369.99, 440.00], // Bm7
      [69.30, 138.59, 207.65, 246.94, 329.63]  // C#m7
    ],
    arpNotes: [185.00, 220.00, 246.94, 277.18, 329.63, 369.99, 440.00, 493.88, 554.37, 659.25, 739.99],
    oscType: "triangle",
    cutoff: 280,
    interval: 5000,
    arpChance: 0.4,
    arpType: "sine",
    gainMult: 1.0
  }
};

export function startBackgroundMusic(profileIdx = 0) {
  try {
    const ctx = getAudioContext();
    
    // If music is already playing but the profile has changed, stop and restart
    if (isMusicPlaying) {
      if (activeProfileIdx === profileIdx) return;
      stopBackgroundMusic();
    }
    
    isMusicPlaying = true;
    activeProfileIdx = profileIdx;
    
    const cfg = PROFILE_CONFIGS[profileIdx] || PROFILE_CONFIGS[0];
    
    // Create master gain control for the ambient background loop
    bgGainNode = ctx.createGain();
    bgGainNode.gain.setValueAtTime(baseMusicVolume * cfg.gainMult, ctx.currentTime);
    bgGainNode.connect(ctx.destination);
    
    let currentChordIdx = 0;
    
    const playChordStep = (time) => {
      if (!isMusicPlaying) return;
      
      const chord = cfg.chords[currentChordIdx];
      currentChordIdx = (currentChordIdx + 1) % cfg.chords.length;
      
      // Warm low-pass filter
      const chordFilter = ctx.createBiquadFilter();
      chordFilter.type = "lowpass";
      chordFilter.frequency.setValueAtTime(cfg.cutoff, time);
      chordFilter.Q.setValueAtTime(1, time);
      chordFilter.connect(bgGainNode);

      // Play soft synthesized pads
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = cfg.oscType;
        osc.frequency.setValueAtTime(freq, time);
        
        const detuneAmt = (Math.random() - 0.5) * 12; // +/- 6 cents
        osc.detune.setValueAtTime(detuneAmt, time);

        // Slow attack and release envelopes proportional to interval length
        const transitionSec = (cfg.interval / 1000) / 3;
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.12 / chord.length, time + transitionSec);
        gain.gain.setValueAtTime(0.12 / chord.length, time + (cfg.interval / 1000) - transitionSec);
        gain.gain.exponentialRampToValueAtTime(0.001, time + (cfg.interval / 1000) + 0.5);
        
        osc.connect(gain);
        gain.connect(chordFilter);
        
        osc.start(time);
        osc.stop(time + (cfg.interval / 1000) + 0.8);
        
        bgMusicNodes.push(osc);
      });

      // Ambient chimes / clicks / pulses scheduler
      const steps = 8;
      const stepDuration = (cfg.interval / 1000) / steps;
      for (let s = 0; s < steps; s++) {
        if (Math.random() < cfg.arpChance) {
          const arpTime = time + s * stepDuration;
          const noteFreq = cfg.arpNotes[Math.floor(Math.random() * cfg.arpNotes.length)];
          
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const delay = ctx.createDelay();
          const feedback = ctx.createGain();
          
          osc.type = cfg.arpType;
          osc.frequency.setValueAtTime(noteFreq, arpTime);
          
          gain.gain.setValueAtTime(0.001, arpTime);
          gain.gain.linearRampToValueAtTime(0.025, arpTime + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, arpTime + 1.5);
          
          // Delay loop parameters
          delay.delayTime.setValueAtTime(0.35, arpTime);
          feedback.gain.setValueAtTime(0.28, arpTime);
          
          osc.connect(gain);
          gain.connect(bgGainNode);
          
          // Feedback Loop
          gain.connect(delay);
          delay.connect(feedback);
          feedback.connect(delay);
          delay.connect(bgGainNode);
          
          osc.start(arpTime);
          osc.stop(arpTime + 2.5);
          
          bgMusicNodes.push(osc);
        }
      }
    };
    
    const bufferTime = 0.15;
    playChordStep(ctx.currentTime + bufferTime);
    
    bgMusicInterval = setInterval(() => {
      if (isMusicPlaying) {
        playChordStep(ctx.currentTime + bufferTime);
      }
      if (bgMusicNodes.length > 80) {
        bgMusicNodes = bgMusicNodes.slice(-25);
      }
    }, cfg.interval);

  } catch (e) {
    console.error("BG Music error:", e);
  }
}

export function stopBackgroundMusic() {
  try {
    isMusicPlaying = false;
    if (bgMusicInterval) {
      clearInterval(bgMusicInterval);
      bgMusicInterval = null;
    }
    bgMusicNodes.forEach((node) => {
      try {
        node.stop();
      } catch (err) {}
    });
    bgMusicNodes = [];
    if (bgGainNode) {
      bgGainNode.disconnect();
      bgGainNode = null;
    }
  } catch (e) {
    console.error("Stop BG Music error:", e);
  }
}


