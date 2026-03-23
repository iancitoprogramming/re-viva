// Servicio de email con Resend
// Envía notificaciones al trainer cuando un cliente completa el formulario

import { Resend } from 'resend'
import type { OnboardingData, IGZResult } from '@/types'

// Fallback vacío para que el build de Vercel no falle si la variable no está en build-time.
// En runtime, RESEND_API_KEY debe estar configurada en las env vars de Vercel.
const resend = new Resend(process.env.RESEND_API_KEY || '')

const TRAINER_EMAIL = process.env.TRAINER_EMAIL!

// RESEND_FROM_EMAIL debe usar un dominio verificado en Resend.
// Opciones:
//   a) Dominio propio verificado: "REVIVA IGZ <noreply@igztrainer.com>"
//   b) Para pruebas (solo llega al dueño de la cuenta Resend): "onboarding@resend.dev"
// Ver: https://resend.com/domains
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

// Etiquetas legibles para los enums
const labels = {
  genero:    { MASCULINO: 'Masculino', FEMENINO: 'Femenino' },
  objetivo:  { VOLUMEN: 'Volumen', DEFINICION: 'Definición', RECOMPOSICION: 'Recomposición' },
  estres:    { BAJO: 'Bajo', MEDIO: 'Medio', ALTO: 'Alto' },
  adherencia:{ BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta' },
  clasif:    { VOLUMEN: '📈 VOLUMEN', DEFINICION: '🔥 DEFINICIÓN', RECOMPOSICION: '⚖️ RECOMPOSICIÓN' },
}

// Email al cliente: código para recuperar contraseña
export async function enviarCodigoRecuperacion(
  nombre: string,
  email: string,
  codigo: string
): Promise<{ ok: boolean; error?: string }> {
  console.log(`[EMAIL] Enviando código de recuperación a: ${email} | from: ${FROM_EMAIL}`)

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to:   email,
      subject: 'Tu código para restablecer la contraseña — REVIVA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #F8F5EF; padding: 32px 20px;">

          <div style="text-align: center; margin-bottom: 28px;">
            <span style="font-size: 22px; font-weight: 700; color: #2D5A3D; letter-spacing: 2px;">REVIVA</span>
            <span style="font-size: 12px; color: #9B9589; margin-left: 6px;">by IGZ Trainer</span>
          </div>

          <div style="background: #FFFFFF; border-radius: 16px; border: 1px solid #DDD8CC; padding: 32px;">
            <p style="color: #1A2416; font-size: 16px; margin: 0 0 8px 0;">Hola, <strong>${nombre}</strong></p>
            <p style="color: #6B7B64; font-size: 14px; margin: 0 0 28px 0;">
              Recibimos una solicitud para restablecer tu contraseña. Tu código es:
            </p>

            <div style="background: #F2EDE3; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px; border: 1px solid #DDD8CC;">
              <span style="font-size: 40px; font-weight: 700; letter-spacing: 10px; color: #1A2416;">${codigo}</span>
            </div>

            <p style="color: #9B9589; font-size: 13px; margin: 0; text-align: center;">
              Este código expira en <strong>15 minutos</strong>.<br/>
              Si no solicitaste este cambio, podés ignorar este email.
            </p>
          </div>

          <p style="color: #9B9589; font-size: 11px; text-align: center; margin-top: 20px;">
            REVIVA · IGZ Trainer · Email automático
          </p>
        </div>
      `,
    })

    if (result.error) {
      console.error('[EMAIL] Resend devolvió error:', JSON.stringify(result.error))
      return { ok: false, error: result.error.message }
    }

    console.log('[EMAIL] Enviado OK — ID:', result.data?.id)
    return { ok: true }

  } catch (err: unknown) {
    const e = err as Error
    console.error('[EMAIL] Excepción al enviar:', e.message, e)
    return { ok: false, error: e.message }
  }
}

// Notificación al trainer: nuevo cliente completó el formulario
export async function enviarNotificacionNuevoCliente(
  nombreCliente: string,
  emailCliente: string,
  perfil: OnboardingData,
  igz: IGZResult
) {
  console.log(`[EMAIL] Notificando nuevo cliente a trainer: ${TRAINER_EMAIL} | from: ${FROM_EMAIL}`)

  try {
    const result = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      TRAINER_EMAIL,
      subject: `🆕 Nuevo cliente: ${nombreCliente}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">

          <div style="background: #065f46; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 22px;">Re-Viva IGZ Trainer</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.8;">Nuevo cliente registrado</p>
          </div>

          <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">

            <h2 style="color: #111827; font-size: 18px; margin-top: 0;">
              👤 ${nombreCliente}
            </h2>
            <p style="color: #6b7280; margin-top: -10px;">${emailCliente}</p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

            <h3 style="color: #374151; font-size: 15px; margin-bottom: 12px;">📋 DATOS DEL FORMULARIO</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="background: #f9fafb;">
                <td style="padding: 8px 12px; color: #6b7280; width: 45%;">Género</td>
                <td style="padding: 8px 12px; font-weight: 600;">${labels.genero[perfil.genero]}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; color: #6b7280;">Edad</td>
                <td style="padding: 8px 12px; font-weight: 600;">${perfil.edad} años</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="padding: 8px 12px; color: #6b7280;">Peso / Altura</td>
                <td style="padding: 8px 12px; font-weight: 600;">${perfil.peso} kg / ${perfil.altura} cm</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; color: #6b7280;">Objetivo</td>
                <td style="padding: 8px 12px; font-weight: 600;">${labels.objetivo[perfil.objetivo]}</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="padding: 8px 12px; color: #6b7280;">Días de entrenamiento</td>
                <td style="padding: 8px 12px; font-weight: 600;">${perfil.diasEntrenamiento} días/semana</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; color: #6b7280;">Nivel de estrés</td>
                <td style="padding: 8px 12px; font-weight: 600;">${labels.estres[perfil.nivelEstres]}</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="padding: 8px 12px; color: #6b7280;">Horas de sueño</td>
                <td style="padding: 8px 12px; font-weight: 600;">${perfil.horasSueno} hs/noche</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; color: #6b7280;">Adherencia</td>
                <td style="padding: 8px 12px; font-weight: 600;">${labels.adherencia[perfil.adherencia]}</td>
              </tr>
            </table>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

            <h3 style="color: #374151; font-size: 15px; margin-bottom: 12px;">⚡ PRE-CÁLCULO MOTOR IGZ</h3>
            <div style="background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 16px;">
              <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #065f46;">
                Clasificación: ${labels.clasif[igz.clasificacion]}
              </p>
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="color: #065f46; padding: 4px 0;">🔥 Calorías</td>
                  <td style="font-weight: 700; color: #111827;">${igz.calorias} kcal/día</td>
                </tr>
                <tr>
                  <td style="color: #065f46; padding: 4px 0;">💪 Proteína</td>
                  <td style="font-weight: 700; color: #111827;">${igz.proteina}g</td>
                </tr>
                <tr>
                  <td style="color: #065f46; padding: 4px 0;">🌾 Hidratos</td>
                  <td style="font-weight: 700; color: #111827;">${igz.hidratos}g</td>
                </tr>
                <tr>
                  <td style="color: #065f46; padding: 4px 0;">🥑 Grasas</td>
                  <td style="font-weight: 700; color: #111827;">${igz.grasas}g</td>
                </tr>
              </table>
            </div>

            <p style="margin-top: 20px; font-size: 13px; color: #9ca3af; text-align: center;">
              Re-Viva IGZ Trainer · Este email es automático, no responder
            </p>
          </div>
        </div>
      `,
    })

    if (result.error) {
      console.error('[EMAIL] Resend error (notif trainer):', JSON.stringify(result.error))
    } else {
      console.log('[EMAIL] Notificación trainer enviada OK — ID:', result.data?.id)
    }
  } catch (err: unknown) {
    // No lanzar — la notif al trainer no debe bloquear el onboarding del cliente
    console.error('[EMAIL] Error notificando trainer:', (err as Error).message)
  }
}
