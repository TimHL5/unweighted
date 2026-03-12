import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
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
          background: 'linear-gradient(135deg, #1A1A2E 0%, #0F3460 100%)',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            marginBottom: 16,
          }}
        >
          Unweighted
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#E94560',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          The only calorie tracker that keeps you accountable
        </div>
      </div>
    ),
    { ...size }
  )
}
