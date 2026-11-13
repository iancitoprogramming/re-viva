# Pendientes: qué quedó hecho y qué falta

Estado al 9 de noviembre de 2026, rama `claude/project-audit-optimization-e22039` (PR #34). Contexto y números en `docs/roadmap-6m.md`.

**13/11:** traspaso del dominio en curso. Ya está agregado en Vercel, sin verificar. La base de Supabase estaba pausada y se reactivó. Faltan 3 migraciones. Pasos en `docs/traspaso-dominio.md`.

## Hecho en esta rama

| Bloque | Archivos clave | Estado |
|---|---|---|
| Cobro: pagos vinculados por `external_reference`, monto desde el servidor, webhook con firma | `src/lib/pagos.ts`, `src/app/api/payments/*` | Compila y tipa. **Sin probar contra Mercado Pago real.** |
| Débito automático por API con registro de cobros, renovación automática del vencimiento y aviso de bajas | `src/lib/suscripciones.ts`, `src/lib/periodoSuscripcion.ts`, `src/app/api/payments/suscripcion/route.ts`, `src/components/DebitoAutomatico.tsx` | Reglas de período testeadas. **Circuito con MP sin probar.** |
| Protección de rutas en servidor | `src/proxy.ts` | Probado en el navegador: `/admin`, `/dashboard`, `/curso/*`, `/mis-cursos`, `/leaderboard` redirigen a login sin sesión. |
| Límite de intentos en login, registro, recuperación y reset | `src/lib/rateLimit.ts`, `src/app/api/auth/*` | Compila. **Sin probar contra la base** (acá no hay una). |
| Redirect abierto en login (`?redirect=//otro-sitio`) | `src/app/login/page.tsx` | Corregido. |
| Biblioteca de ejercicios y guía de grabación | `src/lib/ejercicios/*`, `src/app/ejercicios/*`, `src/app/admin/ejercicios/page.tsx`, `docs/Guia-Grabacion-Ejercicios.docx` | Páginas públicas probadas. La carga desde el admin no. |
| `/pendiente` con plan y precio, avisos de vencimiento con link de renovación | `src/app/pendiente/page.tsx`, `src/app/api/cron/vencimientos/route.ts` | Probado en el navegador (la página). |

## Antes de mergear o apenas se mergea

1. **Migraciones.** Hay dos nuevas, idempotentes: `20261110000000_ejercicio_video` y `20261110010000_suscripciones_rate_limit`. Sin ellas: la biblioteca se ve vacía, el límite de intentos cae a memoria (débil) y el débito automático por API devuelve error (el botón ofrece el link `mpago.la` de respaldo). Pasos en `docs/unificacion.md` §5. No se tocó producción.
2. **Mercado Pago, panel de webhooks:** tildar los eventos **Pagos** y **Planes y suscripciones**, con la URL `https://<dominio>/api/payments/webhook`.
3. **Prueba real de pago único:** comprar un ebook. Tiene que quedar `Payment.status = approved`, aparecer en `/admin/ebooks-pendientes` y llegar el mail al trainer.
4. **Prueba real de débito automático:** suscribirse a `online-mensual` desde `/pendiente?plan=online-mensual`. Verificar, en este orden:
   - que MP acepte el alta con el mail ingresado (si el mail no coincide con la cuenta de MP, el alta falla: por eso se pregunta);
   - que la fila de `Suscripcion` pase a `authorized` (evento `subscription_preapproval`);
   - que el cobro cree un `Payment` con `preferenceId = suscripcion:<id>`. Esto depende de que el pago traiga el `external_reference` de la suscripción o `metadata.preapproval_id`. **Es el supuesto menos seguro del diseño:** si el pago llega sin ninguno de los dos, mirar el log `[Webhook MP] Pago … sin registro local`, ver qué campo trae el id de la suscripción y sumarlo en `procesarPago` (`src/app/api/payments/webhook/route.ts`);
   - que cancelar desde el dashboard deje la suscripción en `cancelled` y llegue el aviso al trainer.
5. **Variables en Vercel** que siguen faltando: `CRON_SECRET`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`, `ANTHROPIC_API_KEY`, `ALTA_NOTIFICACION_EMAIL`.

## Lo que queda (para el próximo modelo)

Ordenado por impacto. Ninguna requiere decisiones de arquitectura.

1. **Un solo formulario de entrada.** Hoy `/onboarding` (con cuenta) y `/ingreso` (sin cuenta, tabla `altas`) piden casi lo mismo. Decisión tomada en el roadmap: `/ingreso` es la puerta y la cuenta se crea al pagar. Falta: al terminar `/ingreso`, mostrar planes y llevar a registro con el mail precargado; al registrarse con el mismo mail, vincular el `Alta` y saltear `/onboarding`.
2. **Recordatorio de check-in semanal.** Existe `POST /api/checkin` y la UI en el dashboard; falta el cron que avise a los activos que no mandaron check-in en 7 días (mismo patrón que `src/app/api/cron/vencimientos/route.ts`).
3. **Videos en el documento de entrenamiento.** `scripts/generar-plantillas-docx.ts` dice "link a video" como texto. Usar `linkEjercicio(slug)` de `src/lib/ejercicios/video.ts`.
4. **Estado ARCHIVADO.** El enum existe, falta ruta y botón en `/admin/cliente/[id]`. Sirve para sacar de "activos" a los 24 planes sin vencimiento que ya no son clientes.
5. **Login pierde el plan elegido.** `src/app/login/page.tsx` manda a `/pendiente?nombre=…` sin `plan`; leer `tipoPlan` del plan pendiente o del último `Payment`.
6. **Lint:** 11 errores preexistentes (`npx eslint`), casi todos comillas sin escapar y un `setState` en efecto.
7. **Contraseña mínima de 8** en registro y reset (servidor y mensajes del cliente).
8. **`CLAUDE.md` §10 está desactualizado:** el middleware, el rate limiting, la dependencia de Supabase y la visibilidad de entregables en el dashboard ya están resueltos.
