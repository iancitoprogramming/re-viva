// Términos y Condiciones de Re-Viva — fuente única para /terminos.
// Versión 2026-11. BORRADOR OPERATIVO: revisar con un abogado antes de darlo
// por definitivo (en especial arrepentimiento, garantía y servicio de compra).
// Los [corchetes] son datos que faltan completar.

import { PRECIO_GESTION_COMPRA } from '@/lib/constants'

export const TERMINOS_VERSION = '2026-11'

export type SeccionLegal = { id: string; titulo: string; parrafos: string[] }

const precioCompra = `$${PRECIO_GESTION_COMPRA.toLocaleString('es-AR')}`

export const TERMINOS: SeccionLegal[] = [
  {
    id: 'servicio',
    titulo: '1. Qué es Re-Viva',
    parrafos: [
      'Re-Viva es el servicio de coaching de entrenamiento y nutrición de Ian Gutiérrez (IGZ Trainer) [razón social y CUIT a completar]. Vendemos planes de entrenamiento, planes de nutrición, seguimiento online y presencial, y productos digitales (ebooks y cursos).',
      'Re-Viva no es atención médica. Ian es entrenador personal, no médico ni nutricionista matriculado. Los planes son educativos y orientativos, y no reemplazan una consulta con un profesional de la salud.',
    ],
  },
  {
    id: 'como-funciona',
    titulo: '2. Cómo funciona',
    parrafos: [
      'Te registrás, completás el cuestionario de ingreso y pagás. Con el pago confirmado y el cuestionario completo, recibís tus documentos de Entrenamiento y Nutrición dentro de las 72 horas hábiles. Si falta algún dato (por ejemplo, tu horario de entrenamiento), te lo pedimos antes de armarlos.',
      'Lo que incluye cada plan es lo que figura en la web al momento de contratarlo. El seguimiento (ajustes y check-ins) aplica solo a los planes que lo incluyen.',
      'Tenés que cargar datos verdaderos y completos, incluyendo lesiones, condiciones médicas y medicación. Si algo cambia durante el plan, avisanos.',
    ],
  },
  {
    id: 'pagos',
    titulo: '3. Precios y pagos',
    parrafos: [
      'Los precios están en pesos argentinos e incluyen impuestos. Pueden actualizarse; un cambio de precio nunca afecta el período que ya pagaste.',
      'Podés pagar con Mercado Pago (pago único o débito automático) o por transferencia bancaria. Con transferencia, el plan se activa cuando nos llega el comprobante.',
    ],
  },
  {
    id: 'suscripcion',
    titulo: '4. Débito automático y cancelación',
    parrafos: [
      'Los planes mensuales con débito automático se renuevan solos cada mes en Mercado Pago hasta que los canceles.',
      'Podés cancelar cuando quieras desde tu cuenta de Mercado Pago (Suscripciones) o escribiéndonos por WhatsApp. La cancelación corta los cobros siguientes; el mes en curso ya pagado sigue activo hasta su vencimiento y no se reintegra, salvo lo previsto en los puntos 5 y 6.',
    ],
  },
  {
    id: 'arrepentimiento',
    titulo: '5. Derecho de arrepentimiento',
    parrafos: [
      'Tenés 10 días corridos desde la contratación para arrepentirte, sin dar explicaciones y sin costo (Ley 24.240, art. 34, y Res. 424/2020). Escribinos por WhatsApp o mail con el texto "ME ARREPIENTO" y tu email de registro. Te devolvemos el dinero por el mismo medio de pago.',
      'Si en esos 10 días ya recibiste tus documentos personalizados, aplica la excepción del art. 1116 del Código Civil y Comercial (bienes confeccionados según tus especificaciones). En ese caso, igual tenés la garantía del punto 6.',
    ],
  },
  {
    id: 'garantia',
    titulo: '6. Garantía Re-Viva',
    parrafos: [
      'Planes con seguimiento (Online y Online + Presencial): si en los primeros 30 días cumplís tu parte y no ves un cambio medible (peso, cintura o cargas de entrenamiento), el mes siguiente de seguimiento va por nuestra cuenta, y seguimos ajustando hasta que lo veas.',
      'Cumplir tu parte significa: entrenar al menos el 80% de las sesiones del plan, seguir el plan de comidas al menos el 80% de los días y mandar el check-in semanal (peso, medidas o fotos) las 4 semanas. Esos check-ins son la forma de medirlo.',
      'Plan On Demand: si algo de tus documentos no se entiende o no se adapta a lo que declaraste, lo corregimos sin cargo dentro de los 14 días de la entrega.',
      'La garantía es de servicio, no un reembolso de dinero. No aplica si los datos del cuestionario fueron falsos o incompletos.',
    ],
  },
  {
    id: 'presencial',
    titulo: '7. Planes presenciales',
    parrafos: [
      'El plan presencial reserva una agenda mensual para vos. Las ausencias no modifican el valor del plan y las recuperaciones dependen de la disponibilidad de agenda.',
      'Los planes presenciales son procesos intensivos y finitos: máximo dos ciclos por persona. Después, la continuidad pasa a modalidad online.',
    ],
  },
  {
    id: 'compra',
    titulo: '8. Servicio "Lo hago por vos" (compra del súper)',
    parrafos: [
      `Es opcional. Ian arma y hace tu compra semanal en el supermercado online que elijas (por ejemplo, Coto Digital) según tu lista de compras. La gestión cuesta ${precioCompra} por compra; la mercadería y el envío los pagás aparte, con tu tarjeta, al precio del supermercado.`,
      'Para hacerla necesitamos tu dirección, una franja horaria en la que puedas recibir y los datos de la tarjeta con la que se paga. Los datos de la tarjeta se usan solo para esa compra: no se guardan en la plataforma y se borran al terminar la gestión.',
      'Al recibir el pedido, el titular de la tarjeta tiene que estar presente y mostrar su DNI junto con la tarjeta física con la que se pagó. Si no, el supermercado no entrega la mercadería.',
      'Precios, stock, reemplazos, horarios y estado de entrega son responsabilidad del supermercado. Si falta un producto, elegimos el reemplazo más parecido para tu plan.',
    ],
  },
  {
    id: 'afiliados',
    titulo: '9. Suplementos y links de afiliado',
    parrafos: [
      'Algunos links del catálogo de suplementos y de los documentos son links de afiliado: si comprás a través de ellos, Re-Viva puede recibir una comisión, sin costo extra para vos.',
      'Los productos se eligen por eficiencia y precio-calidad, no por la comisión. Ningún suplemento es obligatorio para tener resultados, y ninguna recomendación reemplaza una consulta médica, sobre todo si tomás medicación, estás embarazada o tenés una condición de salud.',
    ],
  },
  {
    id: 'salud',
    titulo: '10. Salud y responsabilidad',
    parrafos: [
      'Antes de empezar, consultá con un médico que confirme tu aptitud física. El ejercicio tiene riesgos propios; si sentís dolor agudo, mareos, falta de aire o palpitaciones, cortá la actividad y consultá.',
      'Los resultados dependen de tu adherencia, tu descanso, tu genética y factores que no controlamos. No prometemos resultados específicos fuera de lo que dice la garantía del punto 6.',
    ],
  },
  {
    id: 'propiedad',
    titulo: '11. Uso de los documentos',
    parrafos: [
      'Tus documentos son personales e intransferibles. No se pueden compartir, revender ni publicar sin autorización escrita. Los ebooks y cursos son para uso personal.',
    ],
  },
  {
    id: 'datos',
    titulo: '12. Tus datos',
    parrafos: [
      'Tratamos tus datos según la Ley 25.326 de Protección de Datos Personales. Los usamos solo para armar, hacer el seguimiento y mejorar tu plan, y no los compartimos con terceros salvo obligación legal o tu consentimiento.',
      'Podés pedir acceso, corrección o eliminación de tus datos escribiendo a [mail de contacto]. La Agencia de Acceso a la Información Pública es la autoridad de control de la Ley 25.326.',
    ],
  },
  {
    id: 'contacto',
    titulo: '13. Contacto y cambios',
    parrafos: [
      'Contacto: WhatsApp +54 9 11 2283-5621 · Instagram @igztrainer · [mail de contacto].',
      'Podemos actualizar estos términos. La versión vigente es la publicada en revivabyigz.com/terminos; los cambios no afectan lo que ya contrataste.',
    ],
  },
]
