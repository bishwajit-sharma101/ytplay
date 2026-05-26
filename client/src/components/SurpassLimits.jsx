import { useState, useEffect, useRef } from "react";

// Each segment: the text, when it starts (ms), ends (ms), visual style
const SEGMENTS = [
  {
    start: 0,
    end: 3900,
    words: ["PEOPLE", "ARE", "NOTHING", "BUT", "TOOLS", "TO", "ME."],
    style: "quote",     // Cinzel serif — cold, measured
    size: "lg",
  },
  {
    start: 3900,
    end: 5500,
    words: ["ALL", "OF", "THEM."],
    style: "impact",    // Bebas — punches hard
    size: "xl",
  },
  {
    start: 5500,
    end: 9000,
    words: ["I", "DON'T", "CARE", "WHAT", "I", "HAVE", "TO", "DO", "TO", "WIN."],
    style: "quote",
    size: "md",
  },
  {
    start: 9000,
    end: 12800,
    words: ["I", "DON'T", "CARE", "WHAT", "I", "HAVE", "TO", "SACRIFICE."],
    style: "quote",
    size: "md",
  },
  {
    start: 12800,
    end: 17500,
    words: ["IN", "THIS", "WORLD,", "WINNING", "IS", "EVERYTHING."],
    style: "proclamation", // Cinzel heavy — golden tint, regal
    size: "lg",
  },
  {
    start: 17500,
    end: 21500,
    words: ["AS", "LONG", "AS", "I", "WIN", "IN", "THE", "END..."],
    style: "whisper",    // smaller, italic feel
    size: "md",
  },
  {
    start: 21500,
    end: 25000,
    words: ["...THAT'S", "ALL", "THAT", "MATTERS."],
    style: "whisper",
    size: "lg",
  },
  {
    start: 25000,
    end: 28500,
    words: ["SURPASS", "YOUR", "LIMITS."],
    style: "limitbreak",  // Bebas — massive, white on fire
    size: "hero",
  },
  {
    start: 28500,
    end: 32000,
    words: ["FOCUS.", "CONQUER."],
    style: "limitbreak",
    size: "hero",
  },
  {
    start: 32000,
    end: 34032,
    words: ["GO", "DOMINATE."],
    style: "limitbreak",
    size: "hero",
  },
];

const FONT = {
  quote:        "'Cinzel', serif",
  impact:       "'Bebas Neue', sans-serif",
  proclamation: "'Cinzel', serif",
  whisper:      "'Cinzel', serif",
  limitbreak:   "'Bebas Neue', sans-serif",
};

const FONT_SIZE = {
  sm:   "clamp(18px, 2.5vw, 28px)",
  md:   "clamp(24px, 3.5vw, 44px)",
  lg:   "clamp(32px, 5vw, 62px)",
  xl:   "clamp(48px, 8vw, 90px)",
  hero: "clamp(60px, 11vw, 130px)",
};

const LETTER_SPACING = {
  quote:        "0.22em",
  impact:       "0.08em",
  proclamation: "0.28em",
  whisper:      "0.3em",
  limitbreak:   "0.06em",
};

export default function SurpassLimits({ onClose }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 1.0;
      audio.play().catch(() => {});
    }
    return () => {
      clearTimeout(t);
      if (audio) { audio.pause(); audio.currentTime = 0; }
    };
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const currentMs  = currentTime * 1000;
  const segment    = SEGMENTS.find(s => currentMs >= s.start && currentMs < s.end);
  const isBeatDrop = currentMs >= 25000;
  const isFlash    = currentMs >= 24700 && currentMs < 25400;

  // Stagger timing: how long each word waits before appearing
  const wordDelay = (seg) => {
    const dur = (seg.end - seg.start) / 1000; // total seconds
    // distribute words evenly across 60% of the segment, rest is hold
    return Math.min(0.55, (dur * 0.6) / seg.words.length);
  };

  return (
    <>
      {/* Inline critical-path font + animation declarations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Bebas+Neue&display=swap');

        .sl-root {
          position: fixed;
          inset: 0;
          background: #000;
          z-index: 99999;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* Pure black letterbox bars — they slide in from edges */
        .sl-bar {
          position: absolute;
          left: 0;
          right: 0;
          height: 14vh;
          background: #000;
          z-index: 30;
          transition: transform 1.4s cubic-bezier(0.77, 0, 0.175, 1);
        }
        .sl-bar-top    { top: 0;    transform: translateY(-100%); }
        .sl-bar-bottom { bottom: 0; transform: translateY(100%); }
        .sl-root.mounted .sl-bar-top    { transform: translateY(0); }
        .sl-root.mounted .sl-bar-bottom { transform: translateY(0); }

        /* Subtle vignette — only a soft rim, not the whole bg */
        .sl-vignette {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background: radial-gradient(ellipse at center,
            transparent 45%,
            rgba(0,0,0,0.92) 100%
          );
        }

        /* Beat-drop: rim turns deep red — only the edges */
        .sl-vignette.beat {
          background: radial-gradient(ellipse at center,
            transparent 40%,
            rgba(180, 10, 10, 0.55) 100%
          );
          transition: background 0.6s ease;
        }

        /* White flash frame at the exact drop */
        .sl-flash {
          position: absolute;
          inset: 0;
          z-index: 25;
          background: #fff;
          opacity: 0;
          pointer-events: none;
          animation: flashIn 0.7s ease-out forwards;
        }
        @keyframes flashIn {
          0%   { opacity: 0.85; }
          100% { opacity: 0; }
        }

        /* Exit button */
        .sl-exit {
          position: absolute;
          top: 36px;
          right: 36px;
          z-index: 50;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.45);
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: 3px;
          padding: 10px 22px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.35s ease;
        }
        .sl-exit:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.06);
        }

        /* Stage area between the bars */
        .sl-stage {
          position: relative;
          z-index: 15;
          width: 100%;
          padding: 0 8vw;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        /* Each word appears individually */
        .sl-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(28px);
          animation: wordRise 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          margin: 0 0.15em;
          white-space: nowrap;
        }

        @keyframes wordRise {
          0%   { opacity: 0; transform: translateY(30px); }
          60%  { opacity: 1; transform: translateY(-3px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Underline rule that draws across after words appear */
        .sl-rule {
          width: 0;
          height: 1px;
          background: rgba(255,255,255,0.35);
          margin-top: 18px;
          animation: ruleDraw 0.9s ease-out forwards;
        }
        @keyframes ruleDraw {
          from { width: 0;    opacity: 0; }
          to   { width: 60%;  opacity: 1; }
        }

        /* Quote style — Cinzel, spaced, elegant */
        .style-quote .sl-line-text {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          color: rgba(235, 230, 220, 0.95);
          text-shadow: 0 1px 25px rgba(255,255,255,0.08);
        }

        /* Impact style — Bebas, bold, fast */
        .style-impact .sl-line-text {
          font-family: 'Bebas Neue', sans-serif;
          color: #ffffff;
          text-shadow: 0 0 40px rgba(255,255,255,0.3);
        }
        .style-impact .sl-rule { background: rgba(255,255,255,0.6); }

        /* Proclamation — Cinzel heavy, golden */
        .style-proclamation .sl-line-text {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          color: #f5e6c0;
          text-shadow: 0 0 60px rgba(200, 150, 60, 0.5);
        }
        .style-proclamation .sl-rule { background: rgba(200, 160, 80, 0.5); }

        /* Whisper — soft, dimmer */
        .style-whisper .sl-line-text {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          color: rgba(200, 195, 190, 0.78);
          text-shadow: none;
        }
        .style-whisper .sl-rule { opacity: 0.3; }

        /* Limit break — Bebas massive, white with golden rim-light */
        .style-limitbreak .sl-line-text {
          font-family: 'Bebas Neue', sans-serif;
          color: #ffffff;
          text-shadow:
            0 0 80px rgba(255, 160, 30, 0.55),
            0 0 160px rgba(255, 90, 0, 0.3);
        }
        .style-limitbreak .sl-rule {
          background: linear-gradient(90deg, transparent, rgba(255,160,30,0.7), transparent);
          height: 2px;
          width: 50%;
        }

        /* Grain overlay for cinematic noise */
        .sl-grain {
          position: absolute;
          inset: 0;
          z-index: 8;
          pointer-events: none;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 256px 256px;
        }
      `}</style>

      <div className={`sl-root ${mounted ? "mounted" : ""}`}>
        {/* Cinema bars */}
        <div className="sl-bar sl-bar-top" />
        <div className="sl-bar sl-bar-bottom" />

        {/* Grain noise */}
        <div className="sl-grain" />

        {/* Vignette */}
        <div className={`sl-vignette ${isBeatDrop ? "beat" : ""}`} />

        {/* One-frame white flash at beat drop */}
        {isFlash && <div className="sl-flash" />}

        {/* Exit */}
        <button className="sl-exit" onClick={onClose}>✕ &nbsp; EXIT</button>

        {/* Audio */}
        <audio
          ref={audioRef}
          src="/motivation.mpeg"
          onTimeUpdate={handleTimeUpdate}
          onEnded={onClose}
          style={{ display: "none" }}
          autoPlay
        />

        {/* Main stage */}
        {segment && (
          <div
            key={segment.start}  // remount = restart animations on new segment
            className={`sl-stage style-${segment.style}`}
          >
            {/* Words row */}
            <div
              className="sl-line-text"
              style={{
                fontFamily:    FONT[segment.style],
                fontSize:      FONT_SIZE[segment.size],
                letterSpacing: LETTER_SPACING[segment.style],
                lineHeight:    1.15,
                display:       "flex",
                flexWrap:      "wrap",
                justifyContent:"center",
                gap:           "0",
              }}
            >
              {segment.words.map((word, i) => (
                <span
                  key={i}
                  className="sl-word"
                  style={{
                    animationDelay: `${i * wordDelay(segment)}s`,
                    // hold the word visible for the rest of the segment
                    animationFillMode: "forwards",
                  }}
                >
                  {word}
                </span>
              ))}
            </div>

            {/* Underline rule — appears after words finish */}
            <div
              className="sl-rule"
              style={{
                animationDelay: `${segment.words.length * wordDelay(segment) + 0.1}s`,
                animationFillMode: "both",
                opacity: 0,
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
