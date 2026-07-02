'use client';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: '0.8px', md: '1.25px', lg: '1.8px' };

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div role="status" aria-label="Loading" className={`inline-flex items-center justify-center ${className}`}>
      <style>{`
        .star-loader {
          --color-1: #10b981;
          --color-2: #059669;
          --size: ${sizes[size]};

          transform: rotateZ(45deg);
          perspective: calc(1000 * var(--size));
          border-radius: 50%;
          width: calc(48 * var(--size));
          height: calc(48 * var(--size));
          color: var(--color-1);
          position: relative;
          display: inline-block;
        }
        .star-loader::before,
        .star-loader::after {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: inherit;
          height: inherit;
          border-radius: 50%;
          transform: rotateX(70deg);
          animation: 1s starSpin linear infinite;
        }
        .star-loader::after {
          color: var(--color-2);
          transform: rotateY(70deg);
          animation-delay: 0.4s;
        }
        @keyframes starSpin {
          0%, 100% { box-shadow: 0.2em 0 0 0 currentcolor; }
          12% { box-shadow: 0.2em 0.2em 0 0 currentcolor; }
          25% { box-shadow: 0 0.2em 0 0 currentcolor; }
          37% { box-shadow: -0.2em 0.2em 0 0 currentcolor; }
          50% { box-shadow: -0.2em 0 0 0 currentcolor; }
          62% { box-shadow: -0.2em -0.2em 0 0 currentcolor; }
          75% { box-shadow: 0 -0.2em 0 0 currentcolor; }
          87% { box-shadow: 0.2em -0.2em 0 0 currentcolor; }
        }
      `}</style>
      <span className="star-loader" />
    </div>
  );
}
