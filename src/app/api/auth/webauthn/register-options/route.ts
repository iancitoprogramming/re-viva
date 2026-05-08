import { NextRequest, NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { obtenerTokenDeRequest, verificarToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const rpName = 'Re-Viva by IGZ Trainer'
const rpId = process.env.WEBAUTHN_RPID ?? 'localhost'

export async function POST(req: NextRequest) {
  const token = obtenerTokenDeRequest(req)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const payload = verificarToken(token)
  if (!payload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { webAuthnCredentials: true },
  })
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const options = await generateRegistrationOptions({
    rpName,
    rpID: rpId,
    userName: user.email,
    userDisplayName: user.nombre,
    attestationType: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      requireResidentKey: false,
      userVerification: 'required',
    },
    excludeCredentials: user.webAuthnCredentials.map(c => ({
      id: c.credentialId,
      transports: c.transports as AuthenticatorTransport[],
    })),
  })

  await prisma.webAuthnChallenge.deleteMany({
    where: { userId: user.id, tipo: 'register' },
  })
  await prisma.webAuthnChallenge.create({
    data: {
      challenge: options.challenge,
      tipo: 'register',
      userId: user.id,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    },
  })

  return NextResponse.json(options)
}
