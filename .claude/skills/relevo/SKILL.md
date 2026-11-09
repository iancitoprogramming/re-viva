---
name: relevo
description: Arma el relevo (handoff) de Re-Viva para que otra sesión o persona siga el trabajo sin perder contexto — estado del repo, PRs abiertos, producción (deploy, migraciones pendientes en Supabase, variables faltantes en Vercel), pendientes y próximo paso. Usar cuando Ian o Lucas escriben /relevo, piden "pasame el relevo", "dejá todo listo para seguir en otra sesión" o antes de cerrar una sesión larga.
---

# /relevo — handoff de Re-Viva

Objetivo: que quien abra la próxima sesión sepa en 2 minutos **qué está hecho, qué está en el aire y qué hacer primero**, con datos verificados, no de memoria.

## Reglas

- **Solo lectura.** Este skill no mergea, no corre migraciones, no cambia variables ni hace deploy. Si detecta algo roto, lo anota como primer paso del relevo.
- **El relevo no se commitea.** Va a `HANDOFF.md` en la raíz, que está en `.gitignore`: el repo es público y el relevo lleva precios internos e identificadores de infra.
- **Nunca mostrar secretos.** De Vercel, solo nombres de variables (sin `decrypt`). De Supabase, solo conteos y nombres de migraciones/tablas; nada de datos personales de clientes.
- **Verificar, no suponer.** Cada dato sale de un comando o herramienta. Si una fuente no responde (MCP caído, sin acceso), poné `no verificado` y seguí.
- Tono: argentino, directo, corto. Sin relleno.

## Dónde buscar

El repo es **público**: este archivo no lleva IDs de infraestructura. Resolvelos en el momento:
- GitHub: `iancitoprogramming/re-viva`, base `main`.
- Supabase: `list_projects` → el proyecto llamado `re-viva` (no confundir con otros proyectos de la cuenta).
- Vercel: `list_teams` / `list_projects` → el proyecto `re-viva`.

## Pasos

### 1. Repo (git)

```bash
git fetch -q origin
git status -sb                                  # rama, cambios sin commitear
git log --oneline origin/main -5                # últimos merges
git log --oneline @{u}..HEAD 2>/dev/null        # commits sin pushear
git branch -r --no-merged origin/main           # ramas vivas sin mergear
```

Si hay cambios sin commitear o commits sin pushear, eso va arriba de todo en el relevo.

### 2. PRs abiertos (GitHub)

Con las herramientas de GitHub (`list_pull_requests` state `open`, después `pull_request_read` `get` / `get_status` / `get_review_comments` por cada uno):

- número, título, base → head
- Vercel/CI en el head actual (`success` / `failure` / `pending`)
- `mergeable_state` (conflictos)
- comentarios de revisión sin resolver
- si un PR va apilado sobre otro, decirlo

### 3. Producción

**Deploy (Vercel):** `list_deployments` con `target: production`, `limit: 1` → commit desplegado. Compararlo con `git rev-parse --short origin/main`. Si difieren, decir cuál está atrás.

**Migraciones (Supabase, solo lectura):** con `execute_sql`:

```sql
select migration_name
from "_prisma_migrations"
where finished_at is not null and rolled_back_at is null
order by migration_name;
```

Compararlo con `ls prisma/migrations | grep '^20'`. Listar:
- **pendientes en prod** (están en el repo y no en la tabla) → si el código de `main` ya está desplegado y hay pendientes, es urgente: el código nuevo puede romper (columnas que faltan).
- **registradas sin ejecutar** (`applied_steps_count = 0`): se marcaron con `migrate resolve`; anotarlo, no es error.

**Variables (Vercel):** `filter_project_envs` (sin `decrypt`) → nombres en `production`. Compararlos con la lista de la sección 3 de `CLAUDE.md` y listar las que faltan. Hoy las críticas son `RESEND_FROM_EMAIL`, `CRON_SECRET` y `NEXT_PUBLIC_SITE_URL`.

### 4. Pendientes

Juntá lo abierto, sin inventar:
- decisiones que esperan a Ian o a Lucas (de la conversación y de los PRs);
- `docs/unificacion.md` (secciones de deploy y "qué quedó afuera");
- `CLAUDE.md` §10 (issues pendientes) solo si cambió algo;
- placeholders sin completar: `grep -rn "\[N\]\|\[razón social\|\[mail de contacto\]" docs src/lib/legal`.

### 5. Escribir el relevo

Guardalo en `HANDOFF.md` (raíz, ignorado por git; reemplaza al anterior) con esta estructura exacta:

```markdown
# Relevo — AAAA-MM-DD HH:MM (UTC)

## Primero hacé esto
1. <la acción más urgente, con el comando o el lugar exacto>

## Estado
| | |
|---|---|
| `main` | <sha> — <último merge> |
| Producción | <sha desplegado> (<al día / atrás de main>) |
| Migraciones pendientes en prod | <ninguna / lista> |
| Variables faltantes en Vercel | <ninguna / lista> |

## PRs abiertos
- [#N](url) <título> — Vercel <estado>, <mergeable / conflictos>, <qué falta>

## En el aire
- <decisión o tarea abierta> — <quién la tiene>

## Ojo con
- <trampas vigentes, solo las que siguen siendo ciertas>
```

Después:
1. **No lo commitees.** Confirmá con `git check-ignore HANDOFF.md` que sigue ignorado; si no lo está, avisá y no sigas.
2. En el chat, pegá el relevo completo: en una sesión en la nube el contenedor se borra y `HANDOFF.md` se pierde con él, así que el chat es la copia que queda.
