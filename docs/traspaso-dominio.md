# Traspaso del dominio `revivabyigz.com`

Ejecución del `HANDOFF.md` que mandó el dev (Drive, 13/11/2026). Estado al 13 de noviembre de 2026.

## Qué se decidió

El HANDOFF tiene dos partes: (1) deployar el sitio viejo del dev (`re-viva-site`, landing estática) en una cuenta propia y (2) mover el dominio.

**La parte 1 no se ejecuta.** Ese sitio quedó reemplazado por este repo (`docs/unificacion.md`): lo que el dev llama "trabajo nuevo sin publicar" (SEO, links de MP, `/ads`) ya está acá. El dominio va directo al proyecto `re-viva` de Vercel, como dice el roadmap (Fase 0, tarea 2). Las fotos y el QR (`public/ian.jpg`, `public/qr-pago.png.png`) y los datos de contacto (`src/lib/constants.ts`) también ya están en este repo.

## Hecho

En Vercel, proyecto `re-viva` (team `iancitoprogramming's projects`):

| Dominio | Configuración | Estado |
|---|---|---|
| `www.revivabyigz.com` | Principal | Agregado, **sin verificar** |
| `revivabyigz.com` | Redirect 308 → `www.revivabyigz.com` | Agregado, **sin verificar** |

Mientras no se verifiquen, el sitio sigue sirviéndose desde el proyecto del dev. No cambió nada para los visitantes.

## Bloqueante: la base está pausada

El proyecto `re-viva` de Supabase figura **INACTIVE** (pausado). Hoy `POST /api/auth/login` en `re-viva.vercel.app` devuelve 500. Si el dominio se pasa así, la landing carga pero el registro, el login y el cobro fallan.

Antes de verificar el dominio:

1. Reactivar el proyecto en Supabase (Dashboard → proyecto `re-viva` → Restore).
2. Correr las migraciones pendientes (`docs/unificacion.md` §5, con backup antes).
3. Confirmar que el login de `re-viva.vercel.app` responde 401 con credenciales malas, no 500.

## Pasos del cambio (hacerlos en una sola sentada)

Los registros A de `revivabyigz.com` y `www` ya apuntan a Vercel (`76.76.21.21`). **El registro TXT es el interruptor:** apenas Vercel lo verifica, el tráfico pasa a este proyecto.

1. **Namecheap, cuenta.** El dev hace el "push" del dominio a la cuenta de Namecheap de Ian, e Ian lo acepta. Los registros DNS viajan con el dominio.
2. **Namecheap → Domain List → Manage → Advanced DNS.** Agregar dos registros TXT con el mismo host (pueden convivir):

   | Tipo | Host | Valor |
   |---|---|---|
   | TXT | `_vercel` | `vc-domain-verify=www.revivabyigz.com,9b6a0340ad6bc0ee7e41` |
   | TXT | `_vercel` | `vc-domain-verify=revivabyigz.com,5628ab6b3d511ceeb7d4` |

   No borrar los registros A, ni los de Resend si ya están.
3. **Vercel → re-viva → Settings → Domains.** Apretar "Refresh" o "Verify" en los dos dominios hasta que diga **Valid Configuration**.
4. **Vercel → Environment Variables (Production).** Cambiar y redeployar (las `NEXT_PUBLIC_*` se fijan en el build):
   - `NEXT_PUBLIC_BASE_URL=https://www.revivabyigz.com`
   - `NEXT_PUBLIC_SITE_URL=https://www.revivabyigz.com`
   - `WEBAUTHN_RPID=revivabyigz.com`
   - `WEBAUTHN_ORIGIN=https://www.revivabyigz.com`

   Ojo: las passkeys creadas en `re-viva.vercel.app` dejan de servir. Esos clientes entran con contraseña y registran la passkey de nuevo.
5. **Mercado Pago → Webhooks.** URL `https://www.revivabyigz.com/api/payments/webhook`, eventos **Pagos** y **Planes y suscripciones**.
6. **Chequear:**
   - `https://revivabyigz.com` → 308 a `https://www.revivabyigz.com`
   - `https://www.revivabyigz.com` carga con candado
   - `/ads` carga; `/entrenadores` redirige a `/curso-rentable`
   - `/login` con credenciales malas devuelve "credenciales inválidas", no error interno
7. Con todo andando, el dev puede borrar su proyecto de Vercel.

## Pendientes del HANDOFF que siguen abiertos

- **Plan de Vercel:** el Hobby es solo para uso personal y no comercial. Este sitio cobra, así que corresponde Pro.
- **Resend:** los 4 registros DNS del dominio de envío se cargan en el mismo Advanced DNS de Namecheap. Con el dominio en la cuenta de Ian ya no depende del dev.
