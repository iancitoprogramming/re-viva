import { ImageResponse } from 'next/og'

// OG image generada en build (Satori). Se aplica a todas las rutas.
// Si mas adelante hay una pieza de diseño real, reemplazar este archivo
// por opengraph-image.png (1200x630) en esta misma carpeta.

export const alt = 'REVIVA by IGZ Trainer — Entrenamiento personalizado'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const GOLD = '#C9A84C'
const IVORY = '#F5F2E7'

export default function OgImage() {
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
          background: 'linear-gradient(160deg, #0A0A08 0%, #0F2A1F 55%, #1B3D2F 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '10px 28px',
            borderRadius: 999,
            border: `1px solid rgba(201,168,76,0.35)`,
            background: 'rgba(201,168,76,0.10)',
            color: GOLD,
            fontSize: 26,
            letterSpacing: 6,
            textTransform: 'uppercase',
            marginBottom: 42,
          }}
        >
          Método IGZ Trainer
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 148,
            fontWeight: 700,
            color: GOLD,
            letterSpacing: 10,
            marginBottom: 28,
          }}
        >
          REVIVA
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 36,
            color: IVORY,
            opacity: 0.85,
            textAlign: 'center',
          }}
        >
          Nutrición + entrenamiento + acompañamiento real
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 52,
            fontSize: 26,
            color: IVORY,
            opacity: 0.45,
          }}
        >
          www.revivabyigz.com
        </div>
      </div>
    ),
    size,
  )
}
