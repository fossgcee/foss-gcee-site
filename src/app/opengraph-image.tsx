import { ImageResponse } from 'next/og';

export const alt = 'FOSSGCEE - Free and Open Source Software Club at Government College of Engineering, Erode';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '60px 80px',
          backgroundColor: '#080808',
          backgroundImage:
            'radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 40%)',
          color: '#ffffff',
          fontFamily: 'monospace',
          border: '12px solid #1a1a1a',
        }}
      >
        {/* Top Header Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '10px 24px',
            borderRadius: '9999px',
            fontSize: '18px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#d4d4d4',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
            }}
          />
          Free &amp; Open Source Software Club
        </div>

        {/* Center Title & Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: '68px',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            FOSSGCEE
            <span style={{ color: '#10b981', marginLeft: '16px' }}>_</span>
          </div>

          <div
            style={{
              fontSize: '28px',
              color: '#a3a3a3',
              maxWidth: '900px',
              lineHeight: 1.4,
            }}
          >
            Government College of Engineering, Erode
          </div>

          <div
            style={{
              fontSize: '20px',
              color: '#737373',
              maxWidth: '950px',
              lineHeight: 1.4,
            }}
          >
            Promoting Linux, open-source culture, developer workshops, hackathons, and real-world contributions.
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '24px',
            fontSize: '18px',
            color: '#a3a3a3',
          }}
        >
          <div style={{ display: 'flex', gap: '30px' }}>
            <span>⚡ Linux &amp; Git</span>
            <span>⚡ Community Projects</span>
            <span>⚡ Hackathons</span>
          </div>
          <div style={{ color: '#ffffff', fontWeight: 700 }}>fossgcee.vercel.app</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
