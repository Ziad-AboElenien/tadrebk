'use client';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const dimensions = {
  sm: { width: 56, height: 51 },
  md: { width: 90, height: 82 },
  lg: { width: 128, height: 116 },
};

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const { width, height } = dimensions[size];
  return (
    <div role="status" aria-label="Loading" className={`inline-flex items-center justify-center ${className}`}>
      <style>{`
        .tadrebk-loader {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .tadrebk-loader__triangle {
          stroke-dasharray: 1;
          animation: tadrebk-draw 1.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .tadrebk-loader__dot {
          animation: tadrebk-fade 1.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .tadrebk-loader__tassel {
          transform-origin: 95px 44px;
          animation: tadrebk-swing 1.3s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        @keyframes tadrebk-draw {
          0%   { stroke-dashoffset: 1; }
          50%  { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1; }
        }
        @keyframes tadrebk-fade {
          0%, 40%  { opacity: 0; }
          60%, 100% { opacity: 1; }
        }
        @keyframes tadrebk-swing {
          0%, 100% { transform: rotate(-7deg); }
          50%      { transform: rotate(7deg); }
        }
      `}</style>
      <svg className="tadrebk-loader" viewBox="0 0 110 100" width={width} height={height}>
        <polygon points="55,22 100,46 55,66 10,46" fill="#16233A" />
        <path d="M30,46 v20 a7,7 0 0 0 14,0 v-14" fill="none" stroke="#16233A" strokeWidth="12" strokeLinecap="round" />
        <path d="M55,52 v18 a7,7 0 0 0 14,0 v-16" fill="none" stroke="#16233A" strokeWidth="12" strokeLinecap="round" />
        <path className="tadrebk-loader__triangle" d="M37,46 L55,32 L73,46" fill="none" stroke="#4CB675" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
        <circle className="tadrebk-loader__dot" cx="73" cy="46" r="7" fill="#4CB675" />
        <g className="tadrebk-loader__tassel">
          <line x1="95" y1="44" x2="91" y2="70" stroke="#16233A" strokeWidth="3" />
          <circle cx="90" cy="74" r="4" fill="#16233A" />
        </g>
      </svg>
    </div>
  );
}
