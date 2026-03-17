// Helpers de autenticación: crear y verificar sesiones JWT

import jwt from 'jsonwebtoken'
import type { JWTPayload } from '@/types'

const SECRET = process.env.JWT_SECRET!

// Crea un token de sesión que dura 7 días
export function crearToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

// Verifica y decodifica el token. Devuelve null si es inválido o expiró.
export function verificarToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload
  } catch {
    return null
  }
}

// Extrae el token del header Authorization o de la cookie de la request
export function obtenerTokenDeRequest(request: Request): string | null {
  // Intentar desde cookie
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(/re-viva-token=([^;]+)/)
  if (match) return match[1]

  // Intentar desde header Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization') ?? ''
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7)

  return null
}

// Verifica si el usuario autenticado es admin
export function esAdmin(email: string): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  return admins.includes(email)
}
