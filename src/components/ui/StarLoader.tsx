'use client';

export default function StarLoader({ className = '' }: { className?: string }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width="80" height="80" viewBox="0 0 100 100" className="overflow-visible">
        <defs>
          <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Rays */}
        {rays.map((angle, i) => (
          <line
            key={angle}
            x1="50"
            y1="50"
            x2="50"
            y2="22"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
            transform={`rotate(${angle} 50 50)`}
          >
            <animate
              attributeName="y2"
              values="22;14;22"
              dur="1.2s"
              begin={`${i * 0.1}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur="1.2s"
              begin={`${i * 0.1}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}

        {/* Zigzag star body */}
        <polygon
          points="50,16 58,40 84,40 64,55 72,82 50,65 28,82 36,55 16,40 42,40"
          fill="url(#starGrad)"
        >
          <animate
            attributeName="points"
            values="
              50,16 58,40 84,40 64,55 72,82 50,65 28,82 36,55 16,40 42,40;
              50,22 60,42 86,42 66,56 74,84 50,67 26,84 34,56 14,42 40,42;
              50,16 58,40 84,40 64,55 72,82 50,65 28,82 36,55 16,40 42,40
            "
            dur="1.5s"
            repeatCount="indefinite"
          />
        </polygon>

        {/* Inner glow */}
        <polygon
          points="50,28 54,42 68,42 57,50 60,65 50,55 40,65 43,50 32,42 46,42"
          fill="#fff"
          opacity="0.25"
        >
          <animate
            attributeName="opacity"
            values="0.25;0.45;0.25"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </polygon>

        {/* Glow ring */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.15">
          <animate
            attributeName="r"
            values="38;44;38"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.15;0;0.15"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}
