import { NextRequest, NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { prisma } from '@/lib/prisma'

const rpId = process.env.WEBAUTHN_RPID ?? 'localhost'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { email },
    include: { webAuthnCredentials: true },
  })

  if (!user || user.webAuthnCredentials.length === 0) {
    return NextResponse.json({ error: 'No hay credenciales biométricas para este usuario' }, { status: 404 })
  }

  const options = await generateAuthenticationOptions({
    rpID: rpId,
    allowCredentials: user.webAuthnCredentials.map(c => ({
      id: c.credentialId,
      transports: c.transports as AuthenticatorTransport[],
    })),
    userVerification: 'required',
  })

  await prisma.webAuthnChallenge.deleteMany({
    where: { email, tipo: 'login' },
  })
  await prisma.webAuthnChallenge.create({
    data: {
      challenge: options.challenge,
      tipo: 'login',
      email,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    },
  })

  return NextResponse.json(options)
}
