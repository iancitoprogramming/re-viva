# Changelog

Versiones del sitio en producción (`https://www.revivabyigz.com`). Cómo se numeran: `CLAUDE.md` §11, "Versiones".

## 1.1.1 — 2026-11-14

Cobro con Mercado Pago, listo para la prueba real.

- **El webhook registra cada cobro del débito automático** con el evento `subscription_authorized_payment` (antes dependía de que el pago trajera el id de la suscripción, que era el supuesto menos seguro).
- **Un cobro se registra una sola vez** aunque MP lo avise dos veces en paralelo: índice único en `Payment.paymentId` (migración `20261114000000_payment_mp_id_unico`) y cambio de estado condicional. Antes, dos avisos simultáneos podían correr el vencimiento dos meses y mandar dos mails.
- Devoluciones y contracargos de un pago aprobado avisan al trainer.
- Las notificaciones de prueba del panel de MP (ids que no existen) responden 200 en vez de 500.
- `/api/payments/process` toma del brick solo medio de pago y pagador; `notification_url` pide solo webhooks firmados (`source_news=webhooks`); el resumen de la tarjeta dice `REVIVA IGZ`.

## 1.1.0 — 2026-11-14

- **Se eliminó la generación de planes con IA.** Los planes se arman a mano, así que se borraron la cola de revisiones del admin (`/admin/revisiones`), las rutas `/api/plans/*` y `/api/admin/reviews/*`, el pipeline (`src/lib/plans/`) y la dependencia `@anthropic-ai/sdk`. Las tablas `PlanGeneration`, `PendingTrainerReview` y `PlanToRegenerate` quedan en la base, sin uso.
- Mails activos: `RESEND_FROM_EMAIL=REVIVA IGZ <noreply@revivabyigz.com>`, con el dominio verificado en Resend.
- Avisos automáticos (cumpleaños, vencimientos, check-in) protegidos con `CRON_SECRET`.

## 1.0.0 — 2026-11-13

También entró el PR #35: recordatorio semanal de check-in, archivado de planes y prellenado del cuestionario desde `/ingreso`.


Primera versión numerada: el sitio pasa a su dominio propio.

- `www.revivabyigz.com` sirve esta app (antes la servía la landing del dev); `revivabyigz.com` redirige con 308.
- Base de Supabase reactivada y migraciones al día: catálogo de suplementos del research (14 productos con link), biblioteca de ejercicios, débito automático y límite de intentos.
- Variables de producción apuntadas al dominio: `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `WEBAUTHN_RPID`, `WEBAUTHN_ORIGIN`. Las passkeys creadas en `re-viva.vercel.app` hay que registrarlas de nuevo.
- Regla de trabajo: todo cambio pasa por preview antes de producción.
