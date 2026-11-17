import React from 'react';

interface TriRobotAvatarProps {
  size?: number;
  className?: string;
  isThinking?: boolean;
  animated?: boolean;
  eyeColor?: string;
  helmetColor?: string;
}

export const TriRobotAvatar: React.FC<TriRobotAvatarProps> = ({
  size = 40,
  className = '',
  isThinking = false,
  animated = true,
  helmetColor = '#0082ff',
  eyeColor = '#00f0ff'
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title="Tri AI - Risk & Execution Officer"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Cyber Neon Glow Filter */}
          <filter id="tri-eye-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Helmet Gradient */}
          <linearGradient id="tri-helmet-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00c8ff" />
            <stop offset="45%" stopColor={helmetColor} />
            <stop offset="100%" stopColor="#0052cc" />
          </linearGradient>

          {/* Visor Deep OLED Glass */}
          <linearGradient id="tri-visor-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#08101e" />
            <stop offset="100%" stopColor="#03060c" />
          </linearGradient>

          {/* Ear Bump Gradient */}
          <linearGradient id="tri-ear-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00b4ff" />
            <stop offset="100%" stopColor="#0047b3" />
          </linearGradient>

          <style>{`
            /* Natural glance around movements */
            @keyframes tri-look {
              0%, 100% { transform: translate(0, 0); }
              12% { transform: translate(-3.2px, 0.5px); }
              24% { transform: translate(-3.2px, 0.5px); }
              36% { transform: translate(3.2px, -0.5px); }
              48% { transform: translate(3.2px, -0.5px); }
              60% { transform: translate(0, -1.8px); }
              72% { transform: translate(0, 0); }
              84% { transform: translate(1.8px, 1.2px); }
            }

            /* Natural eye blink */
            @keyframes tri-blink {
              0%, 42%, 46%, 100% { transform: scaleY(1); }
              44% { transform: scaleY(0.08); }
            }

            /* Expressive joyful smile animation */
            @keyframes tri-smile-pulse {
              0%, 100% { 
                transform: scale(1) translateY(0); 
                filter: drop-shadow(0 0 2px rgba(0, 240, 255, 0.6));
              }
              50% { 
                transform: scale(1.18) translateY(-1px); 
                filter: drop-shadow(0 0 5px rgba(0, 240, 255, 0.95));
              }
            }

            /* Cheerful eye squint when smile peaks */
            @keyframes tri-eye-squint {
              0%, 40%, 60%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(0.85) scaleX(1.08); }
            }

            /* Cute cheek blush pulse */
            @keyframes tri-blush-pulse {
              0%, 100% { opacity: 0.25; transform: scale(0.9); }
              50% { opacity: 0.85; transform: scale(1.2); }
            }

            /* Antenna energetic sway */
            @keyframes tri-antenna-sway {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-7deg); }
              75% { transform: rotate(7deg); }
            }

            /* Antenna tip pulsating beacon */
            @keyframes tri-tip-glow {
              0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 3px #00f0ff); }
              50% { opacity: 1; filter: drop-shadow(0 0 8px #00f0ff); }
            }

            /* Thinking state bob */
            @keyframes tri-think {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-2.5px) scale(1.03); }
            }

            .tri-animated-eyes {
              transform-origin: 50% 50%;
              animation: tri-look 6s ease-in-out infinite;
            }

            .tri-blink-left {
              transform-origin: 36px 49.5px;
              animation: tri-blink 4.4s infinite ease-in-out, tri-eye-squint 3.2s infinite ease-in-out;
            }

            .tri-blink-right {
              transform-origin: 64px 49.5px;
              animation: tri-blink 4.4s infinite ease-in-out, tri-eye-squint 3.2s infinite ease-in-out;
            }

            .tri-animated-smile {
              transform-origin: 50px 62px;
              animation: tri-smile-pulse 3.2s ease-in-out infinite;
            }

            .tri-animated-blush {
              transform-origin: 50% 50%;
              animation: tri-blush-pulse 3.2s ease-in-out infinite;
            }

            .tri-animated-antenna {
              transform-origin: 50px 24px;
              animation: tri-antenna-sway 4s ease-in-out infinite;
            }

            .tri-tip-beacon {
              animation: tri-tip-glow 2.2s ease-in-out infinite;
            }

            .tri-thinking-bob {
              animation: tri-think 1.1s ease-in-out infinite;
            }
          `}</style>
        </defs>

        <g className={animated && isThinking ? 'tri-thinking-bob' : ''}>
          {/* Antenna */}
          <g className={animated ? 'tri-animated-antenna' : ''}>
            {/* Antenna neck/stem */}
            <rect
              x="47.5"
              y="11"
              width="5"
              height="15"
              rx="2.5"
              fill="url(#tri-helmet-gradient)"
            />
            {/* Antenna circular tip / beacon */}
            <circle
              cx="50"
              cy="9.5"
              r="6.5"
              fill={eyeColor}
              className={animated ? 'tri-tip-beacon' : ''}
            />
            {/* Antenna highlight glint */}
            <circle
              cx="48.2"
              cy="7.8"
              r="2"
              fill="white"
              fillOpacity="0.85"
            />
          </g>

          {/* Left Ear Bump with Cyber Ring */}
          <rect
            x="7.5"
            y="42"
            width="14"
            height="27"
            rx="7"
            fill="url(#tri-ear-gradient)"
          />
          <line
            x1="14.5"
            y1="48"
            x2="14.5"
            y2="63"
            stroke="#00f0ff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Right Ear Bump with Cyber Ring */}
          <rect
            x="78.5"
            y="42"
            width="14"
            height="27"
            rx="7"
            fill="url(#tri-ear-gradient)"
          />
          <line
            x1="85.5"
            y1="48"
            x2="85.5"
            y2="63"
            stroke="#00f0ff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Main Helmet Head Shell */}
          <path
            d="M 50,21
               C 75,21 89,33 89,54
               C 89,75 77,87 50,87
               C 23,87 11,75 11,54
               C 11,33 25,21 50,21 Z"
            fill="url(#tri-helmet-gradient)"
          />

          {/* Helmet Top Specular Gloss Reflection */}
          <path
            d="M 32,24
               C 42,22 58,22 68,24
               C 61,28 39,28 32,24 Z"
            fill="white"
            fillOpacity="0.45"
          />

          {/* Inner OLED Glass Visor Frame (Neon Stroke) */}
          <path
            d="M 50,29
               C 70,29 80.5,37 80.5,53.5
               C 80.5,67.5 71,73.5 50,73.5
               C 29,73.5 19.5,67.5 19.5,53.5
               C 19.5,37 30,29 50,29 Z"
            fill="url(#tri-visor-gradient)"
            stroke="#0082ff"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />

          {/* Visor Diagonal Glass Sheen Reflection */}
          <path
            d="M 28,32
               C 45,30 68,34 74,42
               C 66,40 38,36 28,32 Z"
            fill="white"
            fillOpacity="0.12"
          />

          {/* Cheek Blush LEDs (Cute pulsing blush when happy) */}
          <g className={animated ? 'tri-animated-blush' : ''}>
            <ellipse cx="26.5" cy="56" rx="3.5" ry="2" fill="#00f0ff" opacity="0.4" />
            <ellipse cx="73.5" cy="56" rx="3.5" ry="2" fill="#00f0ff" opacity="0.4" />
          </g>

          {/* Animated Eyes Group */}
          <g className={animated ? 'tri-animated-eyes' : ''}>
            {/* Left Eye */}
            <g className={animated ? 'tri-blink-left' : ''}>
              <circle
                cx="36"
                cy="49.5"
                r="6.5"
                fill={eyeColor}
                filter="url(#tri-eye-glow)"
              />
              {/* Primary Eye sparkle glint */}
              <circle
                cx="34.2"
                cy="47.2"
                r="2.2"
                fill="#FFFFFF"
                fillOpacity="0.95"
              />
              {/* Secondary micro glint */}
              <circle
                cx="37.8"
                cy="51.2"
                r="1"
                fill="#FFFFFF"
                fillOpacity="0.8"
              />
            </g>

            {/* Right Eye */}
            <g className={animated ? 'tri-blink-right' : ''}>
              <circle
                cx="64"
                cy="49.5"
                r="6.5"
                fill={eyeColor}
                filter="url(#tri-eye-glow)"
              />
              {/* Primary Eye sparkle glint */}
              <circle
                cx="62.2"
                cy="47.2"
                r="2.2"
                fill="#FFFFFF"
                fillOpacity="0.95"
              />
              {/* Secondary micro glint */}
              <circle
                cx="65.8"
                cy="51.2"
                r="1"
                fill="#FFFFFF"
                fillOpacity="0.8"
              />
            </g>
          </g>

          {/* Animated Glowing Smile */}
          <g className={animated ? 'tri-animated-smile' : ''}>
            {/* Expressive beaming curved smile with smooth rounded ends */}
            <path
              d="M 42.5,58.5
                 C 44.5,66.5 55.5,66.5 57.5,58.5
                 C 55,61.8 45,61.8 42.5,58.5 Z"
              fill={eyeColor}
              filter="url(#tri-eye-glow)"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
