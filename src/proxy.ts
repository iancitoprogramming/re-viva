// Protección de rutas en el servidor (en Next 16 el middleware se llama proxy).
//
// Antes las páginas privadas se servían a cualquiera y recién el navegador
// redirigía si /api/auth/me daba 401. Ahora sin sesión válida no se sirve la
// página. Las rutas /api siguen validando el JWT por su cuenta: esto es una
// capa más, no un reemplazo.

import { NextResponse, type NextRequest } from 'next/server'
import { verificarToken, esAdmin } from '@/lib/auth'

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const token = request.cookies.get('re-viva-token')?.value
  const sesion = token ? verificarToken(token) : null

  if (!sesion) {
    const login = new URL('/login', request.url)
    login.searchParams.set('redirect', pathname + search)
    const respuesta = NextResponse.redirect(login)
    if (token) respuesta.cookies.delete('re-viva-token') // vencido o inválido
    return respuesta
  }

  if (pathname.startsWith('/admin') && !esAdmin(sesion.email)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// /onboarding, /pendiente y /checkout quedan afuera a propósito: son parte del
// embudo de compra y manejan su propio redirect a registro.
export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/mis-cursos/:path*', '/curso/:path*', '/leaderboard/:path*'],
}
