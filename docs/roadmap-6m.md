# Roadmap Re-Viva: de $2,4M a $6M por mes

Auditoría del 9 de noviembre de 2026. Los números salen de la base de producción, de Vercel y del sitio en vivo, no de estimaciones.

## 1. Dónde estamos

**La web hoy factura $0. Los $2,4M los genera Ian a mano, por WhatsApp y en el gimnasio.**

| Qué se midió | Resultado |
|---|---|
| `www.revivabyigz.com` | Sirve el sitio viejo del dev. Todos los botones van a WhatsApp. No tiene registro, cuestionario ni pago. |
| La app (`re-viva.vercel.app`) | Está deployada y al día, pero nadie llega: no tiene dominio propio y su canonical apunta al otro sitio. |
| Registros por mes | Marzo 19 · abril 11 · mayo 2 · junio 2 · **julio a noviembre 0** |
| Formulario `/ingreso` | 0 altas |
| Pagos aprobados registrados | **0 en toda la historia** (4 intentos, todos quedaron en "pendiente") |
| Check-ins de clientes | 4 en total, 0 en los últimos 30 días |
| Planes "activos" | 29. De esos, 24 no tienen tipo de plan ni vencimiento y 5 vencieron entre abril y junio y siguen figurando activos |
| Mails | No sale ninguno: el dominio no está verificado en Resend y falta `RESEND_FROM_EMAIL` |
| Avisos automáticos (vencimiento, cumpleaños) | Apagados: falta `CRON_SECRET` en Vercel |
| Generación de planes con IA | No corre: falta `ANTHROPIC_API_KEY` (hay una `GEMINI_API_KEY` que el código no usa) |
| Catálogo de suplementos | 0 productos publicados, 0 clics |
| Migraciones | El workflow de GitHub sigue fallando; la base se viene tocando a mano |

Lo que sí está construido y sirve: landing, cuestionario, checkout de Mercado Pago, panel de admin, ficha de alta con prompt de armado, plantillas DOCX, listas de compras por mail, catálogo de afiliados, lector de cursos. Build y 78 tests pasan.

**Conclusión:** no falta producto. Falta conectarlo. El sistema existe y está desenchufado en tres puntos: dominio, mails y cobro.

## 2. Qué se arregló en esta rama

| Problema | Efecto | Arreglo |
|---|---|---|
| El pago con tarjeta nunca se asociaba al registro en la base | Todo pago quedaba "pendiente" para siempre; Ian no se enteraba | El pago se vincula por `external_reference`; se registra al instante y también por webhook |
| El monto a cobrar lo mandaba el navegador | Se podía pagar cualquier monto y figurar aprobado | El monto sale del servidor |
| El webhook aceptaba avisos sin firma y respondía 200 aunque fallara | Avisos falsos posibles; si la base fallaba, MP no reintentaba | Firma obligatoria; ante error responde 500 y MP reintenta |
| `/pendiente` no decía cuánto transferir y mostraba un QR roto | El cliente tenía que volver a preguntar el precio | Muestra plan, precio y precio por transferencia; el mensaje de WhatsApp lleva plan y monto |
| El aviso de vencimiento salía una vez y sin link de pago | Renovar dependía de escribirle a Ian | Dos avisos (7 días y 1 día) con botón "Renovar ahora" al checkout del mismo plan |
| Al aprobarse un pago no quedaba anotado qué plan era | Ian lo cargaba a mano al activar | Se anota solo en el plan pendiente |
| Dependencia `@supabase/supabase-js` sin uso; `npm test` no corría | Peso muerto | Removida; `tsx` agregado |

**No verificado:** el circuito de pago contra Mercado Pago real. Acá no hay credenciales. Hay que hacer un pago de prueba después del deploy (paso 5 de la Fase 0).

## 3. La cuenta para llegar a $6M

Faltan $3,6M por mes. Precios vigentes del sitio:

| Palanca | Cuenta | Aporte posible |
|---|---|---|
| Online con seguimiento ($88.000) | 20 clientes | $1,76M |
| Misma hora de gimnasio, más gente | Un turno 3x individual rinde $312.000. En dúo, $436.800. En trío, $561.600 | +$125.000 a +$250.000 por turno convertido |
| On Demand ($33.000) | 15 por mes | $0,5M |
| Trimestral pago por adelantado | Baja la rotación, adelanta caja | Retención |
| Ebooks, curso y afiliados | Volumen bajo hasta que haya audiencia | $0,2M a $0,3M |

Hipótesis de mezcla a 4 meses: presencial $3,0M (hoy $2,4M, con 3 turnos pasados a dúo o trío) + online $1,8M + On Demand $0,5M + digitales $0,3M = **$5,6M a $6M**.

El presencial tiene techo de horas. El salto sale del online, y el online solo escala si la enseñanza es asincrónica. Por eso los videos son el paso correcto.

**Dato que falta para afinar esto:** cuántos clientes hay hoy de cada tipo y cuántas horas por semana están ocupadas.

## 4. Roadmap

### Fase 0 · Enchufar (9 al 15 de noviembre)

| # | Tarea | Quién |
|---|---|---|
| 1 | Mergear esta rama | Ian |
| 2 | Apuntar `www.revivabyigz.com` al proyecto `re-viva` de Vercel. Cambiar `NEXT_PUBLIC_BASE_URL`, `WEBAUTHN_RPID` y `WEBAUTHN_ORIGIN` al dominio | Ian + dev (DNS en Namecheap) |
| 3 | Resend: cargar los 4 registros DNS y `RESEND_FROM_EMAIL` | Ian + dev |
| 4 | Vercel: cargar `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ANTHROPIC_API_KEY`, `ALTA_NOTIFICACION_EMAIL` | Ian |
| 5 | Mercado Pago: URL de webhook al dominio nuevo (evento "Pagos") y un pago real de prueba con un ebook | Ian |
| 6 | Correr `prisma migrate deploy` (pasos en `docs/unificacion.md` §5) y arreglar el workflow | Claude, con el backup hecho |
| 7 | Sanear la base: tipo de plan y vencimiento de cada cliente real; archivar los que ya no están | Ian pasa la lista, Claude la carga |
| 8 | Grabar los ejercicios | Ian |

**Para la grabación, así el mismo material sirve para la plantilla y para redes:** vertical 9:16, dos tomas por ejercicio (frente y perfil), 20 a 40 segundos, sin música, una clave técnica dicha en voz alta, y el nombre del archivo igual al nombre del ejercicio.

### Fase 1 · Enseñar sin estar (16 al 30 de noviembre)

1. **Biblioteca de ejercicios (hecha, falta migrar y cargar videos):** 131 ejercicios en 17 estaciones (`src/lib/ejercicios/catalogo.ts`). Guía de grabación en `docs/Guia-Grabacion-Ejercicios.docx`, carga de links en `/admin/ejercicios`, página por ejercicio en `/ejercicios/<slug>` para linkear desde el documento de entrenamiento. Requiere la migración `20261110000000_ejercicio_video`.
2. **Dashboard del cliente:** sus documentos, el estado de cada entregable y sus videos. Hoy solo ve los macros.
3. **Check-in semanal de 2 minutos** con recordatorio automático. Es lo que justifica los $88.000 por mes y lo que sostiene la garantía.
4. **Un solo formulario de entrada.** Hoy hay dos (`/onboarding` y `/ingreso`) que piden casi lo mismo. Queda `/ingreso` como puerta, y la cuenta se crea al pagar.
5. Protección de rutas y límite de intentos en login (hecho, ver `docs/pendientes.md`).

### Fase 2 · Instagram y TikTok (diciembre)

El plan de implementación se arma cuando estén los videos, porque el contenido sale de ahí. Estructura:

1. Tres líneas de contenido: técnica (los videos ya grabados), cocina resuelta (meal prep y lista de compras) y casos reales.
2. Un solo llamado a la acción por pieza: palabra clave por mensaje o link a `/ingreso`.
3. Cada link con origen marcado, para saber qué pieza trae clientes.
4. Respuesta automática al primer mensaje; Ian entra solo con leads calificados.
5. Cupos reales por mes para el online, publicados.

### Fase 3 · Retener y subir el ticket (enero y febrero)

1. Débito automático registrado en el sistema (hecho en código; falta la prueba real con Mercado Pago, ver `docs/pendientes.md`).
2. Paso de On Demand a Online al terminar las 10 semanas, con el pago del On Demand a cuenta.
3. Oferta de dúo y trío a los individuales, con lista de espera por horario.
4. Referidos: un mes bonificado por cliente traído.
5. Revisar el precio del On Demand: $33.000 por dos documentos personalizados es bajo.

## 5. Qué mirar cada lunes

| Métrica | Hoy | Meta a febrero |
|---|---|---|
| Altas de `/ingreso` por semana | 0 | 15 |
| Altas que pagan | sin dato | 25% |
| Clientes online activos | sin dato | 20 |
| Check-ins semanales enviados | 0 | 80% de los activos |
| Renovaciones al vencimiento | sin dato | 75% |
| Facturación mensual | $2,4M | $6M |
