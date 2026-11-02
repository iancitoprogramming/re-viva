-- Baseline: CursoProgreso, WebAuthnCredential y WebAuthnChallenge existen en el
-- schema.prisma y en producción (creadas con `db push`), pero nunca tuvieron
-- migración. Esta migración las formaliza. Es idempotente: sobre producción no
-- cambia nada; sobre una base nueva las crea.

CREATE TABLE IF NOT EXISTS "CursoProgreso" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ultimoCapitulo" TEXT NOT NULL,
    "completados" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CursoProgreso_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CursoProgreso_userId_slug_key" ON "CursoProgreso"("userId", "slug");
CREATE INDEX IF NOT EXISTS "CursoProgreso_userId_idx" ON "CursoProgreso"("userId");

CREATE TABLE IF NOT EXISTS "WebAuthnCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "deviceType" TEXT,
    "backedUp" BOOLEAN NOT NULL DEFAULT false,
    "transports" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimoUsoEn" TIMESTAMP(3),
    CONSTRAINT "WebAuthnCredential_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "WebAuthnCredential_credentialId_key" ON "WebAuthnCredential"("credentialId");
CREATE INDEX IF NOT EXISTS "WebAuthnCredential_userId_idx" ON "WebAuthnCredential"("userId");

CREATE TABLE IF NOT EXISTS "WebAuthnChallenge" (
    "id" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "email" TEXT,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebAuthnChallenge_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CursoProgreso_userId_fkey') THEN
    ALTER TABLE "CursoProgreso" ADD CONSTRAINT "CursoProgreso_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WebAuthnCredential_userId_fkey') THEN
    ALTER TABLE "WebAuthnCredential" ADD CONSTRAINT "WebAuthnCredential_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
