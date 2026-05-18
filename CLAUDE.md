# CLAUDE.md — Re-Viva by IGZ Trainer

> Single source of truth para cualquier sesión de Claude Code. Leer esto antes de tocar código.

---

## INDICE RÁPIDO

1. [Stack & Proyecto](#1-stack--proyecto)
2. [Estructura de Carpetas](#2-estructura-de-carpetas)
3. [Variables de Entorno](#3-variables-de-entorno)
4. [Flujo de Auth](#4-flujo-de-auth)
5. [API Routes](#5-api-routes)
6. [Base de Datos (Prisma)](#6-base-de-datos-prisma)
7. [Motor IGZ (Lógica de Negocio)](#7-motor-igz-lógica-de-negocio)
8. [Bugs Conocidos y Fixes](#8-bugs-conocidos-y-fixes)
9. [Deploy a Vercel](#9-deploy-a-vercel)
10. [Issues Pendientes](#10-issues-pendientes)
11. [Reglas para Claude](#11-reglas-para-claude)
12. [Contexto de Marca y Negocio](#12-contexto-de-marca-y-negocio)
13. [Metodología de Entrenamiento — Defaults IGZ](#13-metodología-de-entrenamiento--defaults-igz)

---

## 1. STACK & PROYECTO

**Qué hace:** Plataforma de coaching nutricional y de entrenamiento. El cliente se registra, completa un formulario de onboarding, paga manualmente (transferencia), y el trainer (Ian) activa un plan personalizado desde el panel admin.

**Estado:** MVP funcional, deployado en Vercel.

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| ORM | Prisma 7 con adapter `pg` |
| Base de datos | PostgreSQL (Supabase) |
| Auth | JWT (jsonwebtoken) + cookie httpOnly |
| Passwords | bcryptjs (10 rounds) |
| Email | Resend |
| Deploy | Vercel |
| Tipado | TypeScript |

**Dependencia notable sin uso:** `@supabase/supabase-js` está en `package.json` pero nunca se importa en el código. El proyecto usa Prisma directo con `pg` para la DB. No hace falta Supabase client SDK. Se puede remover.

---

## 2. ESTRUCTURA DE CARPETAS

```
re-viva/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts        — POST: login
│   │   │   │   ├── register/route.ts     — POST: registro
│   │   │   │   ├── logout/route.ts       — POST: cierra sesión
│   │   │   │   ├── me/route.ts           — GET: verifica sesión actual
│   │   │   │   ├── recuperar/route.ts    — POST: envía código 6 dígitos
│   │   │   │   └── reset-password/route.ts — POST: cambia contraseña
│   │   │   ├── onboarding/route.ts       — POST: crea perfil + plan PENDIENTE
│   │   │   └── admin/
│   │   │       ├── clientes/route.ts     — GET: lista todos los clientes
│   │   │       ├── cliente/[id]/route.ts — GET: detalle de cliente
│   │   │       ├── activar-plan/[id]/route.ts — POST: activa plan con macros del trainer
│   │   │       └── entrega/[id]/route.ts — PATCH: actualiza estado de componente
│   │   ├── login/page.tsx                — Registro + login (toggle)
│   │   ├── recuperar/page.tsx            — Recuperación de contraseña
│   │   ├── onboarding/page.tsx           — Formulario de perfil nutricional
│   │   ├── pendiente/page.tsx            — Instrucciones de pago (CBU/alias + WhatsApp)
│   │   ├── dashboard/page.tsx            — Dashboard del cliente (ve su plan)
│   │   ├── admin/
│   │   │   ├── page.tsx                  — Lista de clientes para el trainer
│   │   │   └── cliente/[id]/page.tsx     — Detalle + activar plan + tracking entregas
│   │   ├── page.tsx                      — Landing page pública
│   │   └── layout.tsx                    — Layout global + fuentes
│   ├── components/
│   │   ├── FormInput.tsx
│   │   ├── Button.tsx
│   │   ├── Navbar.tsx
│   │   ├── MacroCard.tsx
│   │   ├── PlanesTabs.tsx
│   │   └── CopiarAlias.tsx
│   ├── lib/
│   │   ├── auth.ts         — crearToken, verificarToken, obtenerTokenDeRequest, esAdmin
│   │   ├── constants.ts    — INSTAGRAM_URL, WHATSAPP_NUMBER, ALIAS, WHATSAPP_*, PLAN_CTA_HREF
│   │   ├── email.ts        — enviarCodigoRecuperacion, enviarNotificacionNuevoCliente
│   │   ├── igzEngine.ts    — Motor de cálculo de macros IGZ
│   │   └── prisma.ts       — Instancia singleton de PrismaClient (con adapter pg)
│   └── types/index.ts      — Tipos compartidos (JWTPayload, OnboardingData, IGZResult, etc.)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   └── qr-pago.png         — QR para transferencia (verificar que exista)
├── next.config.ts
├── package.json
└── CLAUDE.md               — Este archivo
```

**No hay `middleware.ts`.** La protección de rutas se hace client-side (redirect en `useEffect` si `/api/auth/me` devuelve 401). Esto es funcional pero no ideal para seguridad — ver Issues Pendientes.

---

## 3. VARIABLES DE ENTORNO

Todas deben estar configuradas en Vercel (Settings → Environment Variables). En local, crear `.env` en la raíz.

```env
# Base de datos PostgreSQL (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."   # Usado por Prisma Migrate (conexión directa, sin pooler)

# JWT
JWT_SECRET="string_aleatorio_minimo_32_chars"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxx"

# Trainer
TRAINER_EMAIL="ian@igztrainer.com"
ADMIN_EMAILS="ian@igztrainer.com"   # Comma-separated. Define quién puede acceder a /admin
```

### Notas importantes sobre las env vars

- **`DATABASE_URL` vs `DIRECT_URL`:** Supabase provee dos URLs. `DATABASE_URL` usa el connection pooler (puerto 6543) y es la que usa Prisma en runtime. `DIRECT_URL` es la conexión directa (puerto 5432) y se necesita para `prisma migrate`. Si solo hay una URL, usar la directa para ambas en dev.
- **`ADMIN_EMAILS`:** La función `esAdmin()` en `src/lib/auth.ts` splitea esta variable por coma. Si está vacía, nadie es admin. Si hay un space después de la coma, puede fallar — la función hace `.trim()` así que está cubierto.
- **`RESEND_API_KEY`:** En `src/lib/email.ts` hay un fallback `|| ''` para que el build de Vercel no falle si la variable no está en build-time. El string vacío evita el error de inicialización del módulo. El valor real debe estar en las env vars de Vercel para que el envío de emails funcione en runtime.

---

## 4. FLUJO DE AUTH

### Registro
`POST /api/auth/register` → hashea password (bcrypt) → crea User → firma JWT → setea cookie `re-viva-token` (httpOnly, 7 días) → devuelve `{ ok: true, tienePerfil: false }`

### Login
`POST /api/auth/login` → verifica credenciales → firma JWT → setea cookie → devuelve `{ ok: true, tienePerfil, esAdmin }`

### Verificar sesión
`GET /api/auth/me` → lee cookie `re-viva-token` o header `Authorization: Bearer <token>` → verifica JWT → devuelve `{ id, nombre, email, esAdmin, tienePerfil, plan }`

### Logout
`POST /api/auth/logout` → limpia la cookie

### Recuperación de contraseña
1. `POST /api/auth/recuperar` con `{ email }` → genera código 6 dígitos → guarda en `ResetToken` (expira 15 min) → envía email → devuelve respuesta genérica (no revela si el email existe)
2. `POST /api/auth/reset-password` con `{ email, codigo, nuevaPassword }` → valida código → actualiza password

### Onboarding
`POST /api/onboarding` (requiere cookie válida) → crea `NutritionalProfile` → corre Motor IGZ → crea `NutritionalPlan` en estado PENDIENTE con valores IGZ pre-calculados → envía email al trainer (async, no bloquea) → devuelve `{ ok: true }`

### Journey completo del cliente (flujo de conversión rediseñado)
```
/ (landing — ve Hero, Problemas, Qué incluye, Planes con precios)
  → clic "Ver planes y precios" → scroll a #planes (sin login aún)
    → clic "Quiero este plan" → /login?modo=registro (pre-selecciona registro)
      → /onboarding (completa perfil nutricional)
        → /pendiente (instrucciones de pago — alias, WhatsApp)
          → /dashboard (cuando el plan está ACTIVO)

Acceso de clientes existentes:
  → header "Ingresar" → /login (modo login, sin ?modo param)
```

**Lógica de conversión:**
- El login/registro aparece SOLO cuando el usuario decide comprar (clic en "Quiero este plan")
- Los planes y precios son visibles sin registrarse — el usuario primero entiende el valor
- `?modo=registro` en la URL pre-selecciona el tab de registro en la página de login
- El copy del login en modo registro dice "Creá tu cuenta. Es el primer paso. Tarda menos de un minuto."

### Lógica de redirección
Las páginas verifican `/api/auth/me` en `useEffect`:
- Si no hay sesión → redirect a `/login`
- Si hay sesión pero sin perfil → redirect a `/onboarding`
- Si tiene perfil pero plan PENDIENTE → redirect a `/pendiente`
- Si plan ACTIVO → `/dashboard`

---

## 5. API ROUTES

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | Ninguna | Login |
| POST | `/api/auth/register` | Ninguna | Registro |
| POST | `/api/auth/logout` | Ninguna | Cierra sesión |
| GET | `/api/auth/me` | JWT cookie | Devuelve usuario actual |
| POST | `/api/auth/recuperar` | Ninguna | Envía código de recuperación |
| POST | `/api/auth/reset-password` | Ninguna | Cambia contraseña con código |
| POST | `/api/onboarding` | JWT cookie | Crea perfil nutricional + plan |
| GET | `/api/admin/clientes` | Admin JWT | Lista todos los clientes |
| GET | `/api/admin/cliente/[id]` | Admin JWT | Detalle de cliente |
| POST | `/api/admin/activar-plan/[id]` | Admin JWT | Activa plan con macros del trainer |
| PATCH | `/api/admin/entrega/[id]` | Admin JWT | Actualiza estado de entrega de un componente |

**Cómo funciona el check de admin:** Cada ruta admin llama a `esAdmin(payload.email)` que verifica si el email del JWT está en `ADMIN_EMAILS`. No hay tabla de roles — se maneja por env var.

---

## 6. BASE DE DATOS (PRISMA)

### Modelos principales

**`User`** — cuenta del cliente
- `id`, `nombre`, `email` (unique), `password` (bcrypt), `creadoEn`
- Relations: `perfil` (1:1 NutritionalProfile), `plan` (1:1 NutritionalPlan), `resetTokens` (1:n)

**`NutritionalProfile`** — datos del formulario de onboarding
- `genero` (MASCULINO|FEMENINO), `edad`, `altura` (cm), `peso` (kg)
- `objetivo` (VOLUMEN|DEFINICION|RECOMPOSICION)
- `diasEntrenamiento`, `nivelEstres` (BAJO|MEDIO|ALTO), `horasSueno`
- `adherencia` (BAJA|MEDIA|ALTA)
- `preferenciasAlimentarias` (opcional), `lesiones` (opcional)

**`NutritionalPlan`** — plan creado tras el onboarding
- `estado` (PENDIENTE|ACTIVO|ARCHIVADO)
- **Valores del trainer** (se llenan al activar): `clasificacion`, `calorias`, `proteina`, `hidratos`, `grasas`, `notasTrainer`, `activadoEn`
- **Pre-cálculo IGZ** (solo visible para trainer): `igzClasificacion`, `igzCalorias`, `igzProteina`, `igzHidratos`, `igzGrasas`
- **Tracking de entrega** (5 componentes): `estadoAlimentacion`, `estadoEntrenamiento`, `estadoSuplementacion`, `estadoMealPrep`, `estadoListaCompras` (cada uno: PENDIENTE|EN_PROGRESO|ENTREGADO)

**`ResetToken`** — tokens de recuperación de contraseña
- `userId`, `codigo` (6 dígitos), `expiresAt` (15 min), `usado` (bool)

### Comandos útiles

```bash
# Generar cliente Prisma tras cambios al schema
npx prisma generate

# Crear migración (necesita DIRECT_URL)
npx prisma migrate dev --name nombre-descriptivo

# Ver la DB en browser
npx prisma studio

# Push schema sin migración (útil en dev rápido)
npx prisma db push
```

### Conexión

`src/lib/prisma.ts` usa `PrismaPg` adapter con `pg.Pool` para connection pooling. El patrón singleton evita múltiples instancias en hot-reload de Next.js.

---

## 7. MOTOR IGZ (LÓGICA DE NEGOCIO)

**Archivo:** `src/lib/igzEngine.ts`

Calcula la recomendación nutricional pre-cálculo que el trainer ve al revisar un cliente nuevo.

### Algoritmo

1. **Clasificación** — score basado en objetivo, estrés, sueño, adherencia, días de entrenamiento → VOLUMEN / DEFINICION / RECOMPOSICION

2. **BMR** — Fórmula Mifflin-St Jeor:
   - Masculino: `10*peso + 6.25*altura - 5*edad + 5`
   - Femenino: `10*peso + 6.25*altura - 5*edad - 161`

3. **TDEE** = BMR × factor de actividad (1.2 a 1.725 según días de entrenamiento)

4. **Ajuste calórico:**
   - VOLUMEN: TDEE + 350
   - DEFINICION: TDEE - 400
   - RECOMPOSICION: TDEE

5. **Distribución de macros:**
   - VOLUMEN: P 30% / H 50% / G 20%
   - DEFINICION: P 40% / H 30% / G 30%
   - RECOMPOSICION: P 35% / H 40% / G 25%

**Importante:** El pre-cálculo IGZ es solo una guía para el trainer. Los valores finales que ve el cliente son los que el trainer ingresa manualmente al activar el plan.

---

## 8. BUGS CONOCIDOS Y FIXES

### BUG RESUELTO: Loop de login / redirect infinito
**Síntoma:** El usuario quedaba atrapado en un loop entre `/login` y `/onboarding` o entre páginas protegidas.
**Causa:** Las páginas de onboarding y dashboard verifican sesión en `useEffect`, pero si el estado de sesión aún está cargando (loading), el redirect se disparaba antes de tener la información correcta.
**Fix aplicado:** Se agregó estado `loading` que previene cualquier redirect hasta que `/api/auth/me` responda. El render condicional muestra `null` o spinner mientras carga.

### BUG RESUELTO: Error 500 en registro en Vercel
**Síntoma:** `POST /api/auth/register` devolvía 500 en producción pero funcionaba en local.
**Causa 1:** Los tipos de `@types/pg` tenían incompatibilidad con Prisma 7.
**Causa 2:** `prisma generate` no se ejecutaba en el build de Vercel.
**Fix aplicado:** Se agregó `"postinstall": "prisma generate"` en `package.json`. Prisma genera el cliente en el step de instalación de deps, antes del build.

### BUG RESUELTO: Build de Vercel falla por RESEND_API_KEY
**Síntoma:** El build de Vercel fallaba si `RESEND_API_KEY` no estaba disponible en build-time.
**Causa:** `new Resend(undefined)` lanza error al importar el módulo.
**Fix aplicado:** `src/lib/email.ts` usa `process.env.RESEND_API_KEY || ''` como fallback. El string vacío evita el error de inicialización. El valor real debe estar en las env vars de Vercel para que funcione en runtime.

### CAMBIO UX: QR de pago eliminado de pendiente/page.tsx
**Razón:** El QR (`/public/qr-pago.png`) no existía y mostraba un placeholder roto. El botón de WhatsApp cubre 100% del caso de uso. El QR se eliminó completamente (en mobile y desktop). La página es más limpia y directa.

### CAMBIO UX: Flujo de acceso rediseñado (landing-first)
**Qué cambió:** El Hero ya no envía al usuario directo a `/login`. Los CTAs principales scrollean a `#planes` para que el usuario vea precios antes de registrarse. Solo "Quiero este plan" en las cards de planes lleva a `/login?modo=registro`. El link "Ingresar" en el header se mantiene para clientes existentes.
**Archivos modificados:** `src/app/page.tsx`, `src/components/PlanesTabs.tsx`, `src/app/login/page.tsx`

### CAMBIO UX: Sección "Problemas comunes" agregada en landing
**Razón:** Antes de mostrar la solución, el usuario necesita verse reflejado en el problema. La sección aparece entre el Hero y "Qué incluye", con 4 pain points del público objetivo.

### BUG CONOCIDO: Dominio de email no verificado en Resend
**Síntoma:** Los emails de recuperación de contraseña pueden no entregarse.
**Causa:** El `from` en `src/lib/email.ts` es `noreply@reviva.recuperar` — un dominio que muy probablemente no está verificado en Resend. Resend requiere dominio verificado para enviar desde él.
**Estado:** Sin fix. Para solucionar: verificar un dominio real en Resend (ej. `noreply@igztrainer.com`) y actualizar el campo `from` en ambas funciones de email.

---

## 9. DEPLOY A VERCEL

### Setup inicial (una sola vez)

1. Conectar el repo a Vercel desde vercel.com
2. Framework: Next.js (autodetectado)
3. Build command: `next build` (default)
4. Install command: `npm install` (el `postinstall` corre `prisma generate` automáticamente)

### Variables de entorno en Vercel

Ir a: **Vercel → Project → Settings → Environment Variables**

Agregar todas las variables listadas en la [sección 3](#3-variables-de-entorno). Marcarlas para los environments: Production, Preview, Development según corresponda.

### Deploy

```bash
# Vercel despliega automáticamente en cada push a main
git push origin main

# Para deploy manual desde CLI
npx vercel --prod
```

### Migraciones en producción

Las migraciones NO se ejecutan automáticamente en el deploy. Para migrar la DB de producción:

```bash
# Con la DATABASE_URL de producción en el entorno local
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

O desde la CLI de Vercel con las env vars correspondientes.

---

## 10. ISSUES PENDIENTES

Listados por prioridad:

### Alta prioridad

**1. Sin middleware de protección de rutas**
No hay `middleware.ts`. Las rutas `/admin/*` y `/dashboard` solo están protegidas client-side. Un atacante que sepa las rutas de la API puede acceder directamente. El check de admin en las rutas API es correcto, pero las páginas en sí se renderizan antes de verificar.
Fix sugerido: Crear `middleware.ts` en la raíz que verifique el JWT en `re-viva-token` y redirija si no hay sesión válida.

**2. Sin rate limiting**
`/api/auth/login` y `/api/auth/recuperar` no tienen rate limiting. Son vulnerables a brute force y spam.
Fix sugerido: Usar Vercel Edge Config + IP-based rate limiting, o middleware con un contador en memoria/Redis.

**3. Dominio Resend no verificado**
Ver Bug #4 en la sección anterior.

### Media prioridad

**4. `@supabase/supabase-js` instalado pero sin usar**
Dependencia fantasma. Pesa ~500kb.
Fix: `npm uninstall @supabase/supabase-js`

**5. Estado ARCHIVADO no implementado**
El enum `EstadoPlan.ARCHIVADO` existe en el schema pero no hay ninguna ruta ni UI para archivar planes.
Fix sugerido: Agregar botón "Archivar" en `/admin/cliente/[id]` y ruta `POST /api/admin/archivar-plan/[id]`.

**6. Cliente no ve el progreso de entrega de componentes**
El trainer puede marcar componentes como entregados, pero el dashboard del cliente solo muestra los macros. No hay visibilidad del estado de los 5 componentes (alimentación, entrenamiento, suplementación, meal prep, lista de compras).
Fix sugerido: Agregar sección de "Estado de tu plan" en `/dashboard` que muestre cada componente y su estado.

### Baja prioridad

**7. QR de pago puede estar faltando**
`/public/qr-pago.png` — verificar que el archivo exista. La página `/pendiente` tiene fallback si no está.

**8. Contraseña mínimo 6 caracteres**
La validación en el registro permite contraseñas de 6 chars. Considerar subir a 8 mínimo.

**9. Sin logging estructurado**
Los errores se loggean con `console.error` sin estructura. En producción, Vercel captura stdout pero no hay contexto. Fix futuro: integrar Sentry o Logtail.

---

## 11. REGLAS PARA CLAUDE

### Autonomía y eficiencia
- **Ejecutar sin pedir autorización** para cualquier decisión operativa: commits, push, merge, estrategia de archivos, refactors de limpieza.
- **No preguntar** cosas como "¿junto o separo en dos commits?" o "¿elimino o dejo condicional?" — decidir lo más eficiente y ejecutar.
- **Minimizar tokens**: sin preámbulo, sin resumen de lo que ya se ve en el diff, sin "¿querés que haga X?" — simplemente hacerlo.
- Informar qué se hizo, no pedir permiso antes.
- **bypassPermissions activo globalmente** en `~/.claude/settings.json` — Claude no pedirá confirmación para ninguna herramienta. Si en alguna sesión vuelven los prompts, verificar ese archivo.

### CRLF en Windows
Los archivos usan LF (Unix). El `.gitattributes` en la raíz ya tiene `* text=auto eol=lf`. Si Git muestra warnings de "LF will be replaced by CRLF", es normal en Windows — los archivos en disco tendrán CRLF pero Git commitea LF. No es un error. Para normalizar todos los archivos: `git add --renormalize .`

### Flujo de trabajo Git (siempre seguir este orden)
```bash
# 1. Verificar estado
git status

# 2. Stagear solo los archivos del task (nunca git add -A ciego)
git add <archivos específicos>

# 3. Commit con mensaje descriptivo
git commit -m "tipo: descripción corta

- detalle 1
- detalle 2

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# 4. Antes de pushear, sincronizar con remote
git pull --rebase origin main   # Si hay conflictos, resolverlos y continuar

# 5. Push
git push origin main
```

**Convenciones de commit:**
- `feat:` — nueva feature
- `fix:` — bug fix
- `refactor:` — refactor sin cambio de comportamiento
- `merge:` — resolución de merge con cambios propios
- `chore:` — tareas de mantenimiento (deps, config)

**Si hay conflictos en el merge/rebase:**
1. Abortar con `git rebase --abort` o `git merge --abort`
2. Hacer `git fetch origin` para ver qué cambió en el remote
3. Analizar ambas versiones antes de resolver
4. Tomar lo mejor de cada lado (no simplemente "ours" o "theirs")
5. Si Ian modificó un archivo, respetar su intención — solo sobreescribir si hay razón clara

### Siempre
- Priorizar simplicidad y legibilidad
- Optimizar UX — reducir fricción
- Proponer mejoras si se detecta fricción técnica o de usuario
- Detectar incongruencias entre el código y el comportamiento esperado

### Nunca
- Complejizar sin necesidad
- Alejarse de la identidad de marca (tono argentino, directo, premium)
- Crear abstracciones para código que se usa una sola vez
- Agregar dependencias sin justificación clara
- Cambiar el schema de Prisma sin evaluar el impacto en las migraciones
- Usar `git add -A` o `git add .` sin revisar qué se está incluyendo
- Commitear `.claude/`, `.env`, archivos de credenciales

### Al modificar código
- Leer el archivo antes de editarlo
- No refactorizar código que no es parte del task
- Verificar que los tipos de TypeScript sean correctos
- Si se modifica el schema de Prisma, recordar `npx prisma generate` y preparar la migración
- Las rutas API siempre deben validar el JWT antes de ejecutar lógica

### Al agregar features
- Mantener el patrón existente: Server Components donde sea posible, Client Components solo donde se necesite estado o interactividad
- Los componentes de UI van en `src/components/`
- Los componentes de la landing van en `src/components/landing/`
- La lógica de negocio va en `src/lib/`
- Los tipos compartidos van en `src/types/index.ts`

---

## 12. CONTEXTO DE MARCA Y NEGOCIO

---

### CONTEXTO GENERAL

Este proyecto pertenece a la marca personal Re-viva, fundada por Ian Gutiérrez IGZ TRAINER, entrenador personal, coach ontológico y emprendedor del fitness.

La marca combina:
- Entrenamiento físico basado en evidencia
- Nutrición aplicada y sostenible
- Desarrollo personal / mentalidad
- Espiritualidad práctica (sin caer en lo esotérico vacío)

El objetivo NO es solo transformar cuerpos, sino IDENTIDADES.

---

### VISIÓN DEL NEGOCIO

Crear un ecosistema digital escalable que permita:

1. Venta de planes de entrenamiento
2. Venta de planes nutricionales
3. Venta de planes integrales (entrenamiento + nutrición + seguimiento)
4. Venta de productos digitales (ebooks, cursos)
5. Generar ingresos recurrentes sin límite (modelo híbrido)

El sistema debe ser:
- Escalable
- Automatizable
- Simple para el usuario
- De alto valor percibido

---

### PILARES DE LA MARCA

**1. RESULTADOS REALES** — Nada de humo. Todo debe tener aplicación práctica.

**2. EDUCACIÓN** — El cliente entiende lo que hace → mayor adherencia.

**3. IDENTIDAD** — No vendemos rutinas → construimos disciplina, mentalidad y estilo de vida.

**4. SIMPLICIDAD** — Evitar sobrecargar. Todo debe ser claro, usable y directo.

**5. EXPERIENCIA PREMIUM** — Aunque el producto sea digital, debe sentirse de alto nivel.

---

### TONO DE COMUNICACIÓN

- Cercano, argentino, directo
- Motivador pero no cliché
- Seguro, con autoridad
- Sin palabras técnicas innecesarias
- Estilo mentor, no influencer

Ejemplo:
- ❌ "Transformá tu vida hoy!"
- ✅ "Si hacés esto bien durante 90 días, tu cuerpo cambia. No hay discusión."

---

### PÚBLICO OBJETIVO

**Principal:**
- Hombres +35 años
- Buscan bajar grasa, mejorar salud y rendimiento
- Poco tiempo, alta responsabilidad

**Secundario:**
- Mujeres que quieren recomposición corporal
- Personas que ya entrenan pero están estancadas

---

### MODELO DE PRODUCTOS

**1. PLANES ON DEMAND (sin seguimiento)**
- Rutina de entrenamiento
- Plan alimentario
- Guía de suplementos
- Lista de compras
- Meal prep
- Objetivo: entrada al ecosistema

**2. PLANES INTERMEDIOS**
- Todo lo anterior + ajustes periódicos + check-ins básicos

**3. PLANES PREMIUM (core del negocio)**
- Entrenamiento personalizado
- Nutrición personalizada
- Seguimiento constante
- Ajustes semanales
- Acompañamiento cercano
- Mayor ticket → mayor valor

**4. PRODUCTOS DIGITALES**
- Ebooks: Hipertrofia, Pérdida de grasa, Meal prep, Mentalidad
- Cursos: Para clientes, Para entrenadores (Reviva 2.0)

---

### FILOSOFÍA DE ENTRENAMIENTO

- Prioridad: adherencia > perfección
- Progresión constante
- Técnica antes que peso
- Volumen inteligente
- Individualización

### FILOSOFÍA DE NUTRICIÓN

- Sostenible
- Flexible
- Sin restricciones extremas innecesarias
- Ajustable según progreso

---

### FRASE GUÍA DE LA MARCA

> "Controla tu cuerpo, controla tu vida."

---

### PRINCIPIO ESTRATÉGICO CENTRAL

IGZTrainer no está construyendo solo una web o app fitness. Está construyendo una máquina digital de adquisición, filtrado, conversión, entrega y retención.

La prioridad del negocio es:

1. Atraer a la persona correcta
2. Filtrar rápido
3. Automatizar conversaciones repetitivas
4. Hacer que Ian intervenga solo cuando el lead ya esté calificado
5. Convertir
6. Retener
7. Escalar sin perder identidad de marca

La app no debe ser tratada como una simple plataforma de contenido. Debe ser diseñada como un sistema comercial y operativo.

---

### FILOSOFÍA DE EJECUCIÓN

No construir por estética. No construir por moda. No construir por complejidad.

Construir solo aquello que:
- reduzca fricción
- aumente conversión
- ahorre tiempo operativo
- mejore retención
- suba el valor percibido

Ante cualquier decisión de producto, UX o automatización, priorizar:
1. ventas
2. claridad
3. velocidad
4. escalabilidad
5. experiencia premium

---

### EMBUDO DEL NEGOCIO

**Etapa 1 — Atracción**
- Instagram Reels, Historias, Contenido educativo, Testimonios, WhatsApp directo, Referidos
- CTA: "Escribime PLAN" / "Mandame la palabra CAMBIO"

**Etapa 2 — Captura**
- Instagram DM, WhatsApp, Formulario de aplicación, Landing pages

**Etapa 3 — Filtrado**
- Clasificar lead: A (listo para premium), B (interesado), C (busca precio), D (frío)
- Ian solo interviene con A y algunos B

**Etapa 4 — Conversión**
- low ticket → ebook / guía / rutina base
- mid ticket → plan on demand
- high ticket → plan integral con seguimiento
- premium → coaching cercano / transformación completa

**Etapa 5 — Entrega**
- Bienvenida clara, acceso rápido, onboarding ordenado, expectativas claras

**Etapa 6 — Retención**
- Seguimiento simple y consistente
- Sensación de progreso, hitos visibles, contacto humano

---

### AUTOMATIZACIÓN DE CHATS

**Automatizar:**
- Saludo inicial, detección de intención, preguntas frecuentes
- Envío de opciones, derivación a formulario, clasificación del lead
- Recuperación de leads fríos, seguimiento automático

**NO automatizar completamente:**
- Cierre premium complejo
- Manejo de objeciones delicadas
- Conversaciones de alto valor

---

### REGLAS COMERCIALES

1. No enviar precios sin antes entender la necesidad
2. No regalar consultoría gratis en DM
3. No ofrecer premium a cualquiera
4. Siempre intentar mover al lead al siguiente paso
5. Siempre capturar datos
6. Siempre etiquetar
7. Siempre medir de dónde vino el lead
8. La velocidad de respuesta importa

---

### MÉTRICAS IMPORTANTES

- Leads por canal
- % que completa formulario
- % que llega a conversación con Ian
- % que compra
- Ticket promedio
- Retención mensual
- Tiempo ahorrado en conversaciones repetidas

---

### EXTENSIONES FUTURAS

- App mobile
- Comunidad privada
- Certificación para entrenadores (Reviva 2.0)
- Automatización completa del negocio
- Módulo de seguimiento semanal (check-ins)
- CRM liviano integrado

---

## 13. METODOLOGÍA DE ENTRENAMIENTO — DEFAULTS IGZ

> Reglas de negocio que deben aplicarse al generar o revisar planes de entrenamiento.
> Tienen precedencia sobre cualquier criterio genérico del modelo.

---

### Frecuencia por defecto: FBEOD (Full Body Every Other Day)

**Aplica a:** clientes principiantes e intermedios con 3 sesiones/semana.

- Cada sesión cubre los **4 patrones motores principales**: empuje, tracción, bisagra de cadera, sentadilla.
- La variación sesión-a-sesión se resuelve con **DUP integrado**:
  - Día A → Fuerza
  - Día B → Hipertrofia
  - Día C → Metabólico

#### Distribución semanal — lógica según `disponibilidadDomingo`

El campo `disponibilidadDomingo` del perfil del cliente (campo en la DB y en el onboarding) controla esto:

| Valor | Distribución generada |
|-------|-----------------------|
| `"siempre"` | Rotar FBEOD incluyendo domingo cuando sea óptimo (ej. Lun / Mié / Dom) |
| `"aveces"` | Distribución estándar fija **Lunes / Miércoles / Viernes** |
| `"no"` | Distribución estándar fija **Lunes / Miércoles / Viernes** |

**Regla adicional:** Si el cliente no tiene gimnasio los domingos → semana tipo **Lunes a Sábado fijo**, nunca proponer domingo.

---

### Pregunta en el onboarding web

> *"¿Tenés disponibilidad para entrenar un domingo?"*
> Opciones: **Sí, siempre / A veces / No**

- Aparece **solo cuando `diasEntrenamiento === 3`**.
- Campo en DB: `NutritionalProfile.disponibilidadDomingo` (String, default `"no"`).
- Migración: `20260518000000_disponibilidad_domingo`.

---

### Cláusula para recomposición corporal

Si el objetivo es **RECOMPOSICION** (déficit calórico + retención/ganancia muscular simultánea):

- FBEOD es la estructura indicada **siempre que el cliente tolere la carga**.
- **Criterio de tolerancia:** experiencia ≥ 3 meses de entrenamiento consistente + ausencia de síntomas de sobreentrenamiento (fatiga crónica, insomnio, caída de rendimiento).
- En recomposición con FBEOD: **volumen por sesión moderado — no superar 16–20 series totales/sesión** para preservar recuperación en déficit.
- **Clientes con < 3 meses o señales de baja recuperación** → reducir a 3x con mayor volumen por sesión, o evaluar 4x split en lugar de FBEOD.

---

### Widget de recolección de datos — generación manual de rutinas

Cuando Ian pide generar una rutina directamente en Claude (sin pasar por la app), usar este bloque de preguntas para recolectar los datos del cliente antes de armar el plan:

```
📋 DATOS DEL CLIENTE

Nombre:
Edad:
Género: (M / F)
Altura (cm):
Peso (kg):
Objetivo: (VOLUMEN / DEFINICION / RECOMPOSICION)
Días de entrenamiento por semana:
¿Tiene disponibilidad para entrenar un domingo? (Sí siempre / A veces / No)
  → Solo relevante si entrena 3x/semana — define distribución FBEOD
Nivel de estrés: (BAJO / MEDIO / ALTO)
Horas de sueño promedio:
Adherencia percibida: (BAJA / MEDIA / ALTA)
Experiencia de entrenamiento: (meses/años)
Equipamiento disponible:
Actividad laboral: (sedentario / moderado / activo)
¿Practica algún deporte? ¿Cuál?
Lesiones o limitaciones actuales:
Preferencias alimentarias / restricciones:
Condiciones médicas relevantes:
Medicación actual:
```

**Cómo usar la respuesta:**
- Si `días = 3` → aplicar FBEOD + DUP (Día A Fuerza / Día B Hipertrofia / Día C Metabólico)
- `disponibilidadDomingo = "Sí siempre"` → rotar incluyendo domingo cuando sea óptimo
- `disponibilidadDomingo = "A veces" o "No"` → fijar **Lunes / Miércoles / Viernes**
- Sin gimnasio domingo → semana **Lunes a Sábado**, nunca proponer domingo
- Objetivo RECOMPOSICION → verificar criterio de tolerancia antes de aplicar FBEOD completo

---

*Última actualización: 2026-05-18.*
