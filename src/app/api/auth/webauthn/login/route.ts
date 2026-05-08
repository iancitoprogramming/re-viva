import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { crearToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const rpId = process.env.WEBAUTHN_RPID ?? 'localhost'
const origin = process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  const { email, response: authResponse } = await req.json()
  if (!email || !authResponse) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      webAuthnCredentials: true,
      perfil: true,
      plan: true,
    },
  })
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const challengeRecord = await prisma.webAuthnChallenge.findFirst({
    where: { email, tipo: 'login', expiresAt: { gt: new Date() } },
    orderBy: { creadoEn: 'desc' },
  })
  if (!challengeRecord) return NextResponse.json({ error: 'Challenge expirado' }, { status: 400 })

  const credential = user.webAuthnCredentials.find(c => c.credentialId === authResponse.id)
  if (!credential) return NextResponse.json({ error: 'Credencial no encontrada' }, { status: 404 })

  let verification
  try {
    verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
      credential: {
        id: credential.credentialId,
        publicKey: Buffer.from(credential.publicKey, 'base64url'),
        counter: Number(credential.counter),
        transports: credential.transports as AuthenticatorTransport[],
      },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }

  await prisma.webAuthnChallenge.delete({ where: { id: challengeRecord.id } })

  if (!verification.verified) {
    return NextResponse.json({ error: 'Verificación fallida' }, { status: 400 })
  }

  await prisma.webAuthnCredential.update({
    where: { id: credential.id },
    data: {
      counter: verification.authenticationInfo.newCounter,
      ultimoUsoEn: new Date(),
    },
  })

  const token = crearToken({ userId: user.id, email: user.email, nombre: user.nombre })
  const esAdmin = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).includes(user.email)
  const tienePerfil = !!user.perfil
  const planEstado = user.plan?.estado ?? null

  const res = NextResponse.json({ ok: true, esAdmin, tienePerfil, planEstado, nombre: user.nombre })
  res.cookies.set('re-viva-token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
