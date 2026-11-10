-- Suscripciones (débito automático de Mercado Pago) y límite de intentos de auth.
-- Idempotente, porque en producción varias migraciones se aplicaron a mano.

CREATE TABLE IF NOT EXISTS "Suscripcion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planTipo" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "payerEmail" TEXT NOT NULL,
    "preapprovalId" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pending',
    "ultimoCobroEn" TIMESTAMP(3),
    "proximoCobro" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Suscripcion_preapprovalId_key" ON "Suscripcion"("preapprovalId");
CREATE INDEX IF NOT EXISTS "Suscripcion_userId_idx" ON "Suscripcion"("userId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Suscripcion_userId_fkey') THEN
    ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "RateLimitHit" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitHit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RateLimitHit_clave_creadoEn_idx" ON "RateLimitHit"("clave", "creadoEn");

-- Sin políticas: el rol anónimo de Supabase no lee ni escribe. Todo va por el servidor.
ALTER TABLE "Suscripcion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateLimitHit" ENABLE ROW LEVEL SECURITY;
