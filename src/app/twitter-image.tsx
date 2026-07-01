import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Tadrebk — Find Internships in Egypt';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 900,
              color: 'white',
            }}
          >
            T
          </div>
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: '#f1f5f9',
              letterSpacing: '-0.02em',
            }}
          >
            Tadrebk
          </span>
        </div>
        <p
          style={{
            fontSize: 28,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: 700,
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          The first platform in Egypt connecting university students with top internship opportunities
        </p>
      </div>
    ),
    { ...size },
  );
}
