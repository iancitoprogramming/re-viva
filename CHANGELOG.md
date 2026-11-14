# Changelog

Versiones del sitio en producción (`https://www.revivabyigz.com`). Cómo se numeran: `CLAUDE.md` §11, "Versiones".

## 1.0.0 — 2026-11-13

Primera versión numerada: el sitio pasa a su dominio propio.

- `www.revivabyigz.com` sirve esta app (antes la servía la landing del dev); `revivabyigz.com` redirige con 308.
- Base de Supabase reactivada y migraciones al día: catálogo de suplementos del research (14 productos con link), biblioteca de ejercicios, débito automático y límite de intentos.
- Variables de producción apuntadas al dominio: `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `WEBAUTHN_RPID`, `WEBAUTHN_ORIGIN`. Las passkeys creadas en `re-viva.vercel.app` hay que registrarlas de nuevo.
- Regla de trabajo: todo cambio pasa por preview antes de producción.
