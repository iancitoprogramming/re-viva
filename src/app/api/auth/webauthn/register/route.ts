import { NextRequest, NextResponse } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { obtenerTokenDeRequest, verificarToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const rpId = process.env.WEBAUTHN_RPID ?? 'localhost'
const origin = process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  const token = obtenerTokenDeRequest(req)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const payload = verificarToken(token)
  if (!payload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  const body = await req.json()

  const challengeRecord = await prisma.webAuthnChallenge.findFirst({
    where: { userId: payload.userId, tipo: 'register', expiresAt: { gt: new Date() } },
    orderBy: { creadoEn: 'desc' },
  })

  if (!challengeRecord) {
    return NextResponse.json({ error: 'Challenge expirado o no encontrado' }, { status: 400 })
  }

  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }

  await prisma.webAuthnChallenge.delete({ where: { id: challengeRecord.id } })

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: 'Verificación fallida' }, { status: 400 })
  }

  const { credential } = verification.registrationInfo

  await prisma.webAuthnCredential.create({
    data: {
      userId: payload.userId,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
      deviceType: verification.registrationInfo.credentialDeviceType,
      backedUp: verification.registrationInfo.credentialBackedUp,
      transports: (body.response?.transports as string[]) ?? [],
    },
  })

  return NextResponse.json({ ok: true })
}
