# Unificación de versiones de Re-Viva

**Resultado:** queda una sola versión: `iancitoprogramming/re-viva` (la de Lucas). Le sumé lo que valía de `Valen330/re-viva-site` (la del dev).

**Hallazgo clave:** `re-viva-site` no es una app completa. Es una copia solo de la landing de re-viva (copiada alrededor de julio 2026), sin base de datos, login, admin, checkout ni mails. El checkout de MercadoPago, el login, el panel de admin y los mails que el pedido ubicaba en la versión del dev **están en la versión de Lucas**. Del dev se rescató SEO, `/ads`, un fix de scroll y los links/precios de suscripción que mandó Ian en agosto.

---

## 1. Inventario

| | re-viva (Lucas) | re-viva-site (dev) |
|---|---|---|
| Último commit | `73f6f8b` · jun 2026 | `4b7bdae` · ago 2026 (8 commits, Valentin) |
| Dependencias | 34 (Prisma, pg, JWT, bcrypt, MercadoPago, nodemailer, docx, WebAuthn, Anthropic…) | 8 (Next, React, three, GSAP, Lenis, shadergradient) |
| Rutas | ~25 páginas + ~50 rutas API | `/`, `/ads`, `/entrenadores`, robots, sitemap, imagen OG |
| Prisma | 24 modelos, 13 migraciones | — |
| Dominio | re-viva.vercel.app | www.revivabyigz.com (metadataBase) |

## 2. Comparación por módulo

| Módulo | Lucas | Dev | Se conserva |
|---|---|---|---|
| Landing (secciones) | 17 componentes | Las mismas 13, menos Resultados/Pagos/curso | **Lucas** |
| Planes presenciales | 3x/4x/5x mensual/trim/sem (precios jun) → checkout | Individual / Dúo / Tríos con **links de suscripción MP** (precios ago, de Ian) | **Dev** (datos más nuevos y reales) |
| Planes online / On Demand / ebooks | Registro → cuestionario → checkout propio | Link MP directo / WhatsApp | **Lucas** + débito automático MP ofrecido en `/pendiente` |
| Checkout MercadoPago | Checkout Pro + Payment Brick + webhook + tabla Payment | Solo links `mpago.la` | **Lucas** |
| Login / registro | JWT + bcrypt + recuperación + biometría | — | **Lucas** |
| Panel admin | Clientes, activación, entregas, revisiones IA, ebooks, consentimientos | — | **Lucas** (menos alimentos/plantillas, ver §5) |
| Mails | nodemailer + Gmail SMTP en `main` (nunca funcionó en prod) | — | **Lucas**; pasan a Resend en #31 (rama de Ian) |
| SEO | Título y descripción | metadataBase, OG/Twitter, robots, sitemap, canonicals, ícono, imagen OG | **Dev** |
| Scroll a `#planes` | Bug: con Lenis el link no scrollea + leak del ticker | Arreglado | **Dev** |
| `/ads` (tráfico pago) | — | Landing standalone, noindex | **Dev** |
| Curso para entrenadores | `/curso-rentable` completo + checkout | `/entrenadores` (sección + WhatsApp) | **Lucas**; `/entrenadores` → 308 a `/curso-rentable` |
| Generación de documentos (IA + docx) | Sí | — | **Lucas**, sin cambios |

Criterio aplicado: gana el código más completo y mantenible. Lucas gana en todo lo que es sistema. El dev gana en SEO, en el fix de scroll y en precios (son datos más nuevos de Ian, no código).

## 3. Base de datos: lo real vs. el repo

Auditado contra Supabase (`re-viva`, sa-east-1) el 2026-11-02.

- **Migraciones desfasadas.** `_prisma_migrations` registra 9 migraciones (10 filas, una es un rollback). El repo tiene 13. Las 4 últimas (`20260429000000`, `20260429120000`, `20260430000000`, `20260518000000`) **están aplicadas a mano** (las columnas existen) pero no registradas.
- **Tablas sin migración.** `CursoProgreso`, `WebAuthnCredential` y `WebAuthnChallenge` existen en la DB y en el schema, pero se crearon con `db push`.
- **El workflow `Prisma Migrate Deploy` falla** en cada push a `main` desde hace meses (las últimas 5 corridas fallaron; los logs ya expiraron). Por eso nada se aplicó solo.
- **Riesgo que tenía:** si el workflow hubiera funcionado, `20260429000000` re-ejecutaba `UPDATE … SET aceptaTerminos… = TRUE WHERE creadoEn < NOW()`. Eso marcaba **a todos** como que aceptaron los consentimientos, incluidos los que no aceptaron. Ahora el backfill solo corre si las columnas no existían antes.
- Datos al día de hoy: 34 usuarios, 31 perfiles, 29 planes activos, 4 pagos (todos `pending`), ShoppingList vacía.

## 4. Orden de merge (primero schema, después código)

1. Hacer idempotentes las 4 migraciones no registradas (backfills condicionados, FKs con `IF NOT EXISTS`).
2. `20261102000000_baseline_cursos_webauthn`: formaliza las 3 tablas creadas con `db push`. En prod no cambia nada.
3. `20261102010000_cuestionario_v2`: agrega columnas del cuestionario nuevo, todas con default.
4. `20261102020000_catalogo_suplementos`: crea `Suplemento` + `SuplementoClick` y carga 10 productos **inactivos**.
5. `20261102030000_listas_compras_semanales`: `ShoppingList` pasa de colgar de `MealPlan` a `userId + semana`. `FoodCategoria` pasa a llamarse `CategoriaCompra` y suma `ALMACEN`.
6. `20261102040000_eliminar_alimentos_plantillas`: **destructiva**. Borra Food, plantillas y MealPlan.
7. Código: landing del dev → planes → cuestionario → admin.

**Probado en Postgres 16 local:**
- (A) Base vacía: aplican las 18 migraciones y no hay drift con el schema, salvo 2 defaults de `actualizadoEn` que ya venían de abril.
- (B) Réplica del estado de prod (9 registradas + 4 a mano + tablas sin migración + datos): `migrate deploy` aplica las 9 pendientes sin error. Un perfil que no aceptó consentimientos **sigue en false**.

## 5. Deploy (pasos)

1. **Si querés conservar los 2 `MealPlan` de clientes, exportalos antes.** La migración 6 los borra (2 planes, 8 comidas, 33 ítems). Los 50 alimentos y las 6 plantillas ya quedaron en `docs/respaldo/`.
2. Hacer un backup de Supabase (Database → Backups).
3. Correr `DATABASE_URL="<conexión directa 5432>" npx prisma migrate deploy` y después `npx prisma migrate status`. Otra opción es arreglar los secrets del workflow y mergear.
4. En Vercel, apuntar `www.revivabyigz.com` al proyecto de este repo (hoy lo sirve re-viva-site). Setear `NEXT_PUBLIC_BASE_URL=https://www.revivabyigz.com`.
5. Cargar los links de afiliado en `/admin/suplementos` y activar los productos.

## 6. Qué quedó afuera y por qué

| Qué | Por qué |
|---|---|
| Ebooks y curso por WhatsApp (dev) | El checkout propio registra el pago y crea la entrega pendiente en el admin. WhatsApp no deja rastro. |
| Header sin "Ingresar" (dev) | Los clientes activos lo necesitan. |
| Sacar Resultados / Pagos / curso del home (dev) | Es una decisión de contenido, no de código. Resultados ya no tiene reseñas inventadas. |
| `/entrenadores` como página propia | Duplicaba `/curso-rentable`. Queda como redirect 308 para no perder SEO. |
| Presencial semestral y 4x/5x trimestral | Ian no mandó link ni precio nuevo. No se muestran, pero siguen en `PLANES_MP` por los clientes que ya los tienen. |
| Motor de comidas en la web (Food, plantillas, plan builder, generación IA de plantillas) | Pedido explícito: los gramajes se calculan fuera de la web. Respaldo en `docs/respaldo/`. |
| Gmail SMTP | `GMAIL_APP_PASSWORD` nunca estuvo en Vercel, así que ningún mail salía. En #31 todo pasa a Resend (`RESEND_API_KEY` + `RESEND_FROM_EMAIL`, dominio a verificar). |
| `@supabase/supabase-js` | Sigue sin uso; no se tocó. |
| `tsx` en devDependencies | `npm test` lo usa pero no está instalado; por ahora se corre con `npx tsx --test tests/*.test.ts`. |

## 7. Segunda rama: `claude/reviva-handoff-e48fd9` (PR #31)

Ian había hecho en octubre otra rama con parte del mismo trabajo, sin mergear. #30 queda como está; lo que esa rama tenía y #30 no, entra en #31 (apilado sobre #30), junto con el PR #29:

| Viene de | Qué | Cómo quedó |
|---|---|---|
| Ian | Mails por Resend con un solo `enviarMail()` | Adoptado. La lista de compras de #30 también usa `enviarMail()`. |
| Ian | Crons fail-closed, webhook sin cliente de Resend propio | Adoptado tal cual. |
| Ian | Presencial por checkout propio (individual/dúo/trío, trimestral 4x y 5x, precio por transferencia) | Adoptado. Reemplaza los links `mpago.la` directos de #30 en las cards; el débito automático se ofrece en `/pendiente` para todos los planes que lo tienen. |
| Ian | `src/lib/site.ts`, robots con disallow de la app | Adoptado + `/suplementos` y `/terminos` en el sitemap. |
| Ian | Research de evidencia, catálogo tipado y checklist de links (`content/suplementos/`) | Base del catálogo de la web: ver `docs/entregables.md` §4. |
| #29 | Bloque de transparencia de afiliados (CLAUDE.md §14) | En catálogo, documento de nutrición y mail de compras, en letra normal. |
| — | Los 2 MealPlan de clientes | Decisión: no se conservan (los planes de comida se arman en los chats de Claude). La migración de borrado sigue como está. |
