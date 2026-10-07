// Servicio de email con Nodemailer (SMTP)
// Compatible con Gmail, Outlook, Zoho, cualquier proveedor SMTP

import nodemailer from 'nodemailer'
import type { OnboardingData, IGZResult } from '@/types'

// ─── Transporter singleton ────────────────────────────────────────────────────
// Se crea una vez y se reutiliza. En Vercel (serverless) se crea por invocación,
// lo cual es normal — nodemailer maneja la conexión correctamente.

function crearTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  // Sin credenciales nodemailer falla con un error de SMTP poco legible.
  // Cortamos antes y con mensaje claro: las 6 funciones de este archivo
  // llaman a crearTransporter() dentro de un try/catch que lo loguea.
  if (!user || !pass) {
    throw new Error(
      'Faltan credenciales SMTP. Definí GMAIL_USER y GMAIL_APP_PASSWORD en .env y en Vercel.'
    )
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: { user, pass },
  })
}

const TRAINER_EMAIL = process.env.TRAINER_EMAIL!
// Gmail SMTP solo acepta como remitente la cuenta autenticada: el From
// tiene que ser GMAIL_USER. No hay fallback posible.
const FROM_EMAIL    = `REVIVA IGZ <${process.env.GMAIL_USER}>`

// Etiquetas legibles para los enums
const labels = {
  genero:    { MASCULINO: 'Masculino', FEMENINO: 'Femenino' },
  objetivo:  { VOLUMEN: 'Volumen', DEFINICION: 'Definición', RECOMPOSICION: 'Recomposición' },
  estres:    { BAJO: 'Bajo', MEDIO: 'Medio', ALTO: 'Alto' },
  adherencia:{ BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta' },
  clasif:    { VOLUMEN: 'VOLUMEN', DEFINICION: 'DEFINICIÓN', RECOMPOSICION: 'RECOMPOSICIÓN' },
}

// ─── EMAIL: código de recuperación de contraseña ─────────────────────────────
export async function enviarCodigoRecuperacion(
  nombre: string,
  email: string,
  codigo: string
): Promise<{ ok: boolean; error?: string }> {
  console.log(`[EMAIL] Enviando código de recuperación a: ${email}`)

  try {
    const transporter = crearTransporter()
    await transporter.sendMail({
      from:    FROM_EMAIL,
      to:      email,
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

    console.log('[EMAIL] Código de recuperación enviado OK')
    return { ok: true }

  } catch (err: unknown) {
    const e = err as Error
    console.error('[EMAIL] Error al enviar código de recuperación:', e.message)
    return { ok: false, error: e.message }
  }
}

// ─── EMAIL: notificación al trainer — nuevo cliente ───────────────────────────
export async function enviarNotificacionNuevoCliente(
  nombreCliente: string,
  emailCliente: string,
  perfil: OnboardingData,
  igz: IGZResult
) {
  console.log(`[EMAIL] Notificando nuevo cliente a trainer: ${TRAINER_EMAIL}`)

  try {
    const transporter = crearTransporter()
    await transporter.sendMail({
      from:    FROM_EMAIL,
      to:      TRAINER_EMAIL,
      subject: `Nuevo cliente: ${nombreCliente}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8F5EF; padding: 24px 16px;">

          <div style="background: #2D5A3D; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
            <p style="margin: 0; font-size: 11px; opacity: 0.7; text-transform: uppercase; letter-spacing: 2px;">REVIVA · IGZ Trainer</p>
            <h1 style="margin: 6px 0 0 0; font-size: 20px;">Nuevo cliente registrado</h1>
          </div>

          <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #DDD8CC; border-top: none;">

            <h2 style="color: #1A2416; font-size: 17px; margin: 0 0 4px 0;">${nombreCliente}</h2>
            <p style="color: #9B9589; margin: 0 0 20px 0; font-size: 13px;">${emailCliente}</p>

            <hr style="border: none; border-top: 1px solid #DDD8CC; margin: 0 0 20px 0;" />

            <h3 style="color: #1A2416; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Datos del formulario</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              ${[
                ['Género',             labels.genero[perfil.genero as keyof typeof labels.genero]],
                ['Edad',               `${perfil.edad} años`],
                ['Peso / Altura',      `${perfil.peso} kg / ${perfil.altura} cm`],
                ['Objetivo',           labels.objetivo[perfil.objetivo as keyof typeof labels.objetivo]],
                ['Días entrenamiento', `${perfil.diasEntrenamiento} días/semana`],
                ['Nivel de estrés',    labels.estres[perfil.nivelEstres as keyof typeof labels.estres]],
                ['Horas de sueño',     `${perfil.horasSueno} hs/noche`],
                ['Adherencia',         labels.adherencia[perfil.adherencia as keyof typeof labels.adherencia]],
              ].map(([k, v], i) => `
                <tr style="background: ${i % 2 === 0 ? '#F8F5EF' : '#FFFFFF'};">
                  <td style="padding: 8px 12px; color: #6B7B64; width: 45%;">${k}</td>
                  <td style="padding: 8px 12px; font-weight: 600; color: #1A2416;">${v}</td>
                </tr>
              `).join('')}
              ${perfil.preferenciasAlimentarias ? `
                <tr style="background: #F8F5EF;">
                  <td style="padding: 8px 12px; color: #6B7B64; vertical-align: top;">Preferencias</td>
                  <td style="padding: 8px 12px; font-weight: 600; color: #1A2416;">${perfil.preferenciasAlimentarias}</td>
                </tr>
              ` : ''}
              ${perfil.lesiones ? `
                <tr style="background: #FEF9EC;">
                  <td style="padding: 8px 12px; color: #6B7B64; vertical-align: top;">⚠️ Lesiones</td>
                  <td style="padding: 8px 12px; font-weight: 600; color: #1A2416;">${perfil.lesiones}</td>
                </tr>
              ` : ''}
            </table>

            <hr style="border: none; border-top: 1px solid #DDD8CC; margin: 20px 0;" />

            <h3 style="color: #1A2416; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Pre-cálculo Motor IGZ</h3>
            <div style="background: #F0F7F3; border: 1px solid #C9D9C9; border-radius: 10px; padding: 16px;">
              <p style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #2D5A3D;">
                ${labels.clasif[igz.clasificacion as keyof typeof labels.clasif]}
              </p>
              <table style="width: 100%; font-size: 13px;">
                ${[
                  ['Calorías', `${igz.calorias} kcal/día`],
                  ['Proteína', `${igz.proteina}g`],
                  ['Hidratos', `${igz.hidratos}g`],
                  ['Grasas',   `${igz.grasas}g`],
                ].map(([k, v]) => `
                  <tr>
                    <td style="color: #2D5A3D; padding: 3px 0;">${k}</td>
                    <td style="font-weight: 700; color: #1A2416;">${v}</td>
                  </tr>
                `).join('')}
              </table>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #9B9589; text-align: center;">
              REVIVA · IGZ Trainer · Email automático
            </p>
          </div>
        </div>
      `,
    })

    console.log('[EMAIL] Notificación trainer enviada OK')

  } catch (err: unknown) {
    // No lanzar — la notificación al trainer no debe bloquear el onboarding del cliente
    console.error('[EMAIL] Error notificando trainer:', (err as Error).message)
  }
}

// ─── EMAIL: notificación al cliente — plan activado ───────────────────────────
export async function enviarEmailActivacion(
  nombreCliente: string,
  emailCliente: string,
  clasificacion: string,
  calorias: number,
  proteina: number,
  hidratos: number,
  grasas: number,
  notasTrainer?: string | null
) {
  console.log(`[EMAIL] Notificando activación a cliente: ${emailCliente}`)

  const nombreClasificacion: Record<string, string> = {
    VOLUMEN:       'Protocolo Volumen',
    DEFINICION:    'Protocolo Definición',
    RECOMPOSICION: 'Protocolo Recomposición',
  }

  try {
    const transporter = crearTransporter()
    await transporter.sendMail({
      from:    FROM_EMAIL,
      to:      emailCliente,
      subject: `Tu plan está listo, ${nombreCliente} — REVIVA`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #F8F5EF; padding: 32px 20px;">

          <div style="text-align: center; margin-bottom: 28px;">
            <span style="font-size: 22px; font-weight: 700; color: #2D5A3D; letter-spacing: 2px;">REVIVA</span>
            <span style="font-size: 12px; color: #9B9589; margin-left: 6px;">by IGZ Trainer</span>
          </div>

          <div style="background: #FFFFFF; border-radius: 16px; border: 1px solid #DDD8CC; padding: 32px;">
            <p style="color: #1A2416; font-size: 16px; margin: 0 0 8px 0;">Hola, <strong>${nombreCliente}</strong> 👋</p>
            <p style="color: #6B7B64; font-size: 14px; margin: 0 0 24px 0;">
              Tu plan personalizado está listo. Ya podés verlo completo en tu dashboard.
            </p>

            <div style="background: #2D5A3D; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
              <p style="color: #EDE8DF; font-size: 11px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Tu protocolo</p>
              <p style="color: #FFFFFF; font-size: 17px; font-weight: 700; margin: 0;">${nombreClasificacion[clasificacion] ?? clasificacion}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; color: #6B7B64; border-bottom: 1px solid #EDE8DF;">Calorías diarias</td>
                <td style="padding: 8px 0; font-weight: 700; color: #1A2416; text-align: right; border-bottom: 1px solid #EDE8DF;">${calorias.toLocaleString('es-AR')} kcal</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7B64; border-bottom: 1px solid #EDE8DF;">Proteína</td>
                <td style="padding: 8px 0; font-weight: 700; color: #1A2416; text-align: right; border-bottom: 1px solid #EDE8DF;">${proteina}g</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7B64; border-bottom: 1px solid #EDE8DF;">Hidratos</td>
                <td style="padding: 8px 0; font-weight: 700; color: #1A2416; text-align: right; border-bottom: 1px solid #EDE8DF;">${hidratos}g</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7B64;">Grasas</td>
                <td style="padding: 8px 0; font-weight: 700; color: #1A2416; text-align: right;">${grasas}g</td>
              </tr>
            </table>

            ${notasTrainer ? `
              <div style="background: #F2EDE3; border-radius: 10px; padding: 16px; margin-bottom: 24px; border: 1px solid #DDD8CC;">
                <p style="color: #9B9589; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Notas de tu trainer</p>
                <p style="color: #1A2416; font-size: 14px; margin: 0; line-height: 1.6;">${notasTrainer.replace(/\n/g, '<br/>')}</p>
              </div>
            ` : ''}

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://reviva.igztrainer.com'}/login?redirect=/dashboard"
                 style="display: inline-block; background: #2D5A3D; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px;">
                Ver mi plan →
              </a>
            </div>
            <p style="color: #9B9589; font-size: 12px; text-align: center; margin-top: 12px;">
              Si ya estás logueado, entrás directo. Si no, iniciá sesión primero.
            </p>
          </div>

          <p style="color: #9B9589; font-size: 11px; text-align: center; margin-top: 20px;">
            REVIVA · IGZ Trainer · Email automático
          </p>
        </div>
      `,
    })

    console.log('[EMAIL] Email de activación enviado OK')

  } catch (err: unknown) {
    // No lanzar — el error de email no debe bloquear la activación del plan
    console.error('[EMAIL] Error enviando email de activación:', (err as Error).message)
  }
}

// ─── EMAIL: credenciales para cliente registrado por el trainer ───────────────
export async function enviarCredencialesCliente(
  nombre: string,
  email: string,
  passwordTemporal: string
): Promise<void> {
  const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://reviva.vercel.app'}/login`

  try {
    const transporter = crearTransporter()
    await transporter.sendMail({
      from:    FROM_EMAIL,
      to:      email,
      subject: `${nombre}, tu acceso a REVIVA está listo`,
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; background: #F8F5EF; padding: 32px 20px;">
          <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #EDE8DF;">

            <p style="color: #9B9589; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 20px 0;">REVIVA · IGZ Trainer</p>

            <h1 style="font-size: 22px; color: #1A2416; margin: 0 0 12px 0; line-height: 1.3;">
              Hola ${nombre}, tu acceso está listo.
            </h1>

            <p style="color: #6B7B64; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
              Ian te registró en REVIVA. A continuación tus datos de acceso para ingresar a la plataforma y completar tu perfil.
            </p>

            <div style="background: #F2EDE3; border-radius: 10px; padding: 20px; margin-bottom: 24px; border: 1px solid #DDD8CC;">
              <p style="color: #9B9589; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Tus datos de acceso</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #6B7B64; font-size: 14px;">Email</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #1A2416; font-size: 14px; text-align: right;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6B7B64; font-size: 14px;">Contraseña temporal</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #2D5A3D; font-size: 14px; text-align: right; font-family: monospace;">${passwordTemporal}</td>
                </tr>
              </table>
            </div>

            <p style="color: #9B9589; font-size: 13px; margin: 0 0 20px 0;">
              Una vez que ingreses, podés cambiar tu contraseña desde la configuración. Te recomendamos hacerlo.
            </p>

            <div style="text-align: center;">
              <a href="${loginUrl}"
                 style="display: inline-block; background: #2D5A3D; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px;">
                Ingresar a REVIVA →
              </a>
            </div>
          </div>

          <p style="color: #9B9589; font-size: 11px; text-align: center; margin-top: 20px;">
            REVIVA · IGZ Trainer · Email automático
          </p>
        </div>
      `,
    })
    console.log(`[EMAIL] Credenciales enviadas a: ${email}`)
  } catch (err: unknown) {
    console.error('[EMAIL] Error enviando credenciales:', (err as Error).message)
  }
}

// ─── EMAIL: felicitación de cumpleaños ────────────────────────────────────────
export async function enviarFelicitacionCumpleanos(
  nombre: string,
  email: string
): Promise<void> {
  const dashUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://reviva.igztrainer.com'}/login?redirect=/dashboard`
  try {
    const transporter = crearTransporter()
    await transporter.sendMail({
      from:    FROM_EMAIL,
      to:      email,
      subject: `¡Feliz cumpleaños, ${nombre}! — REVIVA`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #F8F5EF; padding: 32px 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 22px; font-weight: 700; color: #2D5A3D; letter-spacing: 2px;">REVIVA</span>
            <span style="font-size: 12px; color: #9B9589; margin-left: 6px;">by IGZ Trainer</span>
          </div>
          <div style="background: #FFFFFF; border-radius: 16px; border: 1px solid #DDD8CC; padding: 32px; text-align: center;">
            <p style="font-size: 40px; margin: 0 0 16px 0;">🎂</p>
            <h1 style="color: #1A2416; font-size: 22px; margin: 0 0 12px 0;">¡Feliz cumpleaños, ${nombre}!</h1>
            <p style="color: #6B7B64; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
              Hoy es un buen día para recordar hasta dónde llegaste.<br/>
              Seguí construyendo — el mejor año está por venir.
            </p>
            <p style="color: #6B7B64; font-size: 14px; margin: 0 0 24px 0;">
              — Ian, IGZ Trainer
            </p>
            <a href="${dashUrl}"
               style="display: inline-block; background: #2D5A3D; color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px;">
              Ver mi plan →
            </a>
          </div>
          <p style="color: #9B9589; font-size: 11px; text-align: center; margin-top: 20px;">
            REVIVA · IGZ Trainer · Email automático
          </p>
        </div>
      `,
    })
    console.log(`[EMAIL] Cumpleaños enviado a: ${email}`)
  } catch (err: unknown) {
    console.error('[EMAIL] Error cumpleaños:', (err as Error).message)
  }
}

// ─── EMAIL: recordatorio de vencimiento ──────────────────────────────────────
export async function enviarRecordatorioVencimiento(
  nombre: string,
  email: string,
  fechaVencimiento: Date
): Promise<void> {
  const diasRestantes = Math.ceil((fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const fechaStr = fechaVencimiento.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  const dashUrl  = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://reviva.igztrainer.com'}/login?redirect=/dashboard`
  const waUrl    = `https://wa.me/${process.env.WHATSAPP_NUMBER ?? '5491122835621'}?text=${encodeURIComponent(`Hola Ian, quiero renovar mi plan de REVIVA.`)}`

  try {
    const transporter = crearTransporter()
    await transporter.sendMail({
      from:    FROM_EMAIL,
      to:      email,
      subject: `Tu plan REVIVA vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #F8F5EF; padding: 32px 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 22px; font-weight: 700; color: #2D5A3D; letter-spacing: 2px;">REVIVA</span>
            <span style="font-size: 12px; color: #9B9589; margin-left: 6px;">by IGZ Trainer</span>
          </div>
          <div style="background: #FFFFFF; border-radius: 16px; border: 1px solid #DDD8CC; padding: 32px;">
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 10px; padding: 16px; margin-bottom: 24px; text-align: center;">
              <p style="color: #92400E; font-weight: 700; font-size: 15px; margin: 0;">
                ⏰ Tu plan vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}
              </p>
              <p style="color: #B45309; font-size: 13px; margin: 4px 0 0 0;">${fechaStr}</p>
            </div>
            <p style="color: #1A2416; font-size: 16px; margin: 0 0 8px 0;">Hola, <strong>${nombre}</strong></p>
            <p style="color: #6B7B64; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              Tu plan de REVIVA está por vencer. Si querés continuar con tu proceso, este es el momento de renovar.
            </p>
            <p style="color: #6B7B64; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              Hablame por WhatsApp y coordinamos la continuidad de tu proceso.
            </p>
            <div style="text-align: center; margin-bottom: 16px;">
              <a href="${waUrl}"
                 style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px;">
                Renovar mi plan por WhatsApp →
              </a>
            </div>
            <div style="text-align: center;">
              <a href="${dashUrl}"
                 style="display: inline-block; color: #2D5A3D; text-decoration: none; font-size: 13px;">
                Ver mi plan actual →
              </a>
            </div>
          </div>
          <p style="color: #9B9589; font-size: 11px; text-align: center; margin-top: 20px;">
            REVIVA · IGZ Trainer · Email automático
          </p>
        </div>
      `,
    })
    console.log(`[EMAIL] Recordatorio vencimiento enviado a: ${email}`)
  } catch (err: unknown) {
    console.error('[EMAIL] Error recordatorio vencimiento:', (err as Error).message)
  }
}

// ─── EMAIL: notificación al trainer — pago aprobado en Mercado Pago ──────────
// Antes vivía en api/payments/webhook con un cliente de Resend aparte y un
// `from` inválido (noreply@reviva.recuperar). Un solo transporte para todo.
export async function enviarNotificacionPagoAprobado(
  nombreCliente: string,
  emailCliente: string,
  planTipo: string,
  monto: number,
): Promise<void> {
  try {
    const transporter = crearTransporter()
    await transporter.sendMail({
      from:    FROM_EMAIL,
      to:      TRAINER_EMAIL,
      subject: `✅ Pago aprobado — ${nombreCliente}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #F8F5EF; padding: 32px 20px;">
          <div style="text-align: center; margin-bottom: 28px;">
            <span style="font-size: 22px; font-weight: 700; color: #2D5A3D; letter-spacing: 2px;">REVIVA</span>
            <span style="font-size: 12px; color: #9B9589; margin-left: 6px;">by IGZ Trainer</span>
          </div>
          <div style="background: #FFFFFF; border-radius: 16px; border: 1px solid #DDD8CC; padding: 32px;">
            <p style="color: #1A2416; font-size: 16px; margin: 0 0 20px 0;"><strong>Nuevo pago vía Mercado Pago</strong></p>
            <p style="color: #6B7B64; font-size: 14px; margin: 0 0 6px 0;"><strong>Cliente:</strong> ${nombreCliente} (${emailCliente})</p>
            <p style="color: #6B7B64; font-size: 14px; margin: 0 0 6px 0;"><strong>Plan:</strong> ${planTipo}</p>
            <p style="color: #6B7B64; font-size: 14px; margin: 0 0 20px 0;"><strong>Monto:</strong> $${monto.toLocaleString('es-AR')}</p>
            <p style="color: #9B9589; font-size: 13px; margin: 0;">
              El pago ya fue confirmado por Mercado Pago. El cliente está esperando la activación del plan.
            </p>
          </div>
          <p style="color: #9B9589; font-size: 11px; text-align: center; margin-top: 20px;">
            REVIVA · IGZ Trainer · Email automático
          </p>
        </div>
      `,
    })
    console.log(`[EMAIL] Aviso de pago aprobado enviado al trainer (${nombreCliente})`)
  } catch (err: unknown) {
    console.error('[EMAIL] Error aviso de pago aprobado:', (err as Error).message)
  }
}
