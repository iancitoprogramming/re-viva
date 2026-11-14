# Pendientes: qué quedó hecho y qué falta

Estado al 9 de noviembre de 2026, rama `claude/project-audit-optimization-e22039` (PR #34). Contexto y números en `docs/roadmap-6m.md`.

**13/11:** `www.revivabyigz.com` ya sirve esta app (v1.0.0). Las migraciones están al día. Falta un registro A extra y el webhook de MP: ver `docs/traspaso-dominio.md`.

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
5. **Variables en Vercel** que siguen faltando: `ALTA_NOTIFICACION_EMAIL` (opcional: si falta, los avisos van a `TRAINER_EMAIL`). Las demás se cargaron el 13-14/11. La generación con IA se eliminó en v1.1.0, así que `ANTHROPIC_API_KEY` ya no hace falta.

## Segunda tanda (13 de noviembre)

| Hecho | Dónde |
|---|---|
| Recordatorio de check-in los lunes a clientes con seguimiento que no reportaron en 7 días | `src/app/api/cron/checkins/route.ts`, `vercel.json` |
| Archivar y reactivar planes desde la ficha del cliente | `src/app/api/admin/archivar-plan/[id]/route.ts` |
| El login vuelve a `/pendiente` con el plan elegido (se ve el monto) | `src/app/api/auth/login/route.ts`, `src/app/login/page.tsx` |
| Contraseña mínima de 8 en registro, reset y alta manual | rutas de auth |
| `/ingreso` termina con "Ver planes y precios"; el cuestionario se prellena con lo cargado en `/ingreso` (mismo mail) | `src/app/api/onboarding/prefill/route.ts`, `src/app/onboarding/page.tsx` |
| Plantilla de entrenamiento con campo propio para el link del video | `scripts/generar-plantillas-docx.ts` |
| Lint: de 12 errores a 6 | — |

**Decisión sobre los dos formularios.** No se saltea `/onboarding` para quien viene de `/ingreso`. En `/ingreso` el objetivo y el sueño son texto libre, no existe la adherencia y hay un solo consentimiento; el perfil pide categorías cerradas y cuatro consentimientos legales. Convertir uno en otro sería inventar datos de salud y aceptaciones que la persona no dio. Se prellena lo que coincide exacto (sexo, edad, altura, peso, días, estrés, domingo, objetivo en sus palabras) y el resto se pide.

**Sin probar contra la base** (acá no hay una): el cron de check-ins, el archivado y el prellenado. Sí se probó que rechazan pedidos sin permiso (503, 403 y 401).

## Lo que queda

1. **Las pruebas reales de arriba** (Mercado Pago y migraciones). Es lo único que bloquea cobrar.
2. **Lint:** quedan 6 errores, todos `setState` dentro de un efecto o cálculo impuro en render (`checkout`, `ThemeToggle`, `CursoLayout`, `admin/revisiones/[planId]`, `admin/cliente/[id]`). Cambian comportamiento: tocarlos con la app corriendo contra una base.
3. **Unificar de verdad los formularios:** requiere que `/ingreso` pida objetivo, adherencia y los cuatro consentimientos como opciones cerradas. Es una decisión de Ian sobre qué preguntar, no de código.
4. **Plan de Instagram y TikTok** (Fase 2 del roadmap), cuando estén los videos.
