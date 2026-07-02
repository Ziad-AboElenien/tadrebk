'use client';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const viewBoxSizes = { sm: 40, md: 60, lg: 80 };

const rays = [0, 45, 90, 135, 180, 225, 270, 315];

function Rays({ vb }: { vb: number }) {
  const c = vb / 2;
  const r1 = vb * 0.22;
  const r2 = vb * 0.08;
  return (
    <>
      {rays.map((angle, i) => (
        <line
          key={angle}
          x1={c - r2 * Math.cos((angle * Math.PI) / 180)}
          y1={c - r2 * Math.sin((angle * Math.PI) / 180)}
          x2={c - r1 * Math.cos((angle * Math.PI) / 180)}
          y2={c - r1 * Math.sin((angle * Math.PI) / 180)}
          stroke="#10b981"
          strokeWidth={vb * 0.035}
          strokeLinecap="round"
          opacity="0.5"
        >
          <animate
            attributeName="opacity"
            values="0.3;0.9;0.3"
            dur="1.2s"
            begin={`${i * 0.08}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}
    </>
  );
}

function StarPolygon({ vb }: { vb: number }) {
  const c = vb / 2;
  const s = (n: number) => (n / 100) * vb;
  return (
    <polygon
      points={`${c},${s(16)} ${c + s(8)},${s(40)} ${c + s(34)},${s(40)} ${c + s(14)},${s(55)} ${c + s(22)},${s(82)} ${c},${s(65)} ${c - s(22)},${s(82)} ${c - s(14)},${s(55)} ${c - s(34)},${s(40)} ${c - s(8)},${s(40)}`}
      fill="url(#starGrad)"
    >
      <animate
        attributeName="points"
        values={`
          ${c},${s(16)} ${c + s(8)},${s(40)} ${c + s(34)},${s(40)} ${c + s(14)},${s(55)} ${c + s(22)},${s(82)} ${c},${s(65)} ${c - s(22)},${s(82)} ${c - s(14)},${s(55)} ${c - s(34)},${s(40)} ${c - s(8)},${s(40)}
          ${c},${s(22)} ${c + s(10)},${s(42)} ${c + s(36)},${s(42)} ${c + s(16)},${s(56)} ${c + s(24)},${s(84)} ${c},${s(67)} ${c - s(24)},${s(84)} ${c - s(16)},${s(56)} ${c - s(36)},${s(42)} ${c - s(10)},${s(42)}
          ${c},${s(16)} ${c + s(8)},${s(40)} ${c + s(34)},${s(40)} ${c + s(14)},${s(55)} ${c + s(22)},${s(82)} ${c},${s(65)} ${c - s(22)},${s(82)} ${c - s(14)},${s(55)} ${c - s(34)},${s(40)} ${c - s(8)},${s(40)}
        `}
        dur="1.5s"
        repeatCount="indefinite"
      />
    </polygon>
  );
}

function InnerGlow({ vb }: { vb: number }) {
  const c = vb / 2;
  const s = (n: number) => (n / 100) * vb;
  return (
    <polygon
      points={`${c},${s(28)} ${c + s(4)},${s(42)} ${c + s(18)},${s(42)} ${c + s(7)},${s(50)} ${c + s(10)},${s(65)} ${c},${s(55)} ${c - s(10)},${s(65)} ${c - s(7)},${s(50)} ${c - s(18)},${s(42)} ${c - s(4)},${s(42)}`}
      fill="#fff"
      opacity="0.25"
    >
      <animate attributeName="opacity" values="0.2;0.4;0.2" dur="1.5s" repeatCount="indefinite" />
    </polygon>
  );
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const vb = viewBoxSizes[size];

  return (
    <div role="status" aria-label="Loading" className={`inline-flex items-center justify-center ${className}`}>
      <svg width={vb} height={vb} viewBox={`0 0 ${vb} ${vb}`} className="overflow-visible">
        <defs>
          <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <Rays vb={vb} />
        <StarPolygon vb={vb} />
        <InnerGlow vb={vb} />
        <circle cx={vb / 2} cy={vb / 2} r={vb * 0.38} fill="none" stroke="#10b981" strokeWidth={vb * 0.015} opacity="0.12">
          <animate attributeName="r" values={`${vb * 0.38};${vb * 0.44};${vb * 0.38}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.12;0;0.12" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
