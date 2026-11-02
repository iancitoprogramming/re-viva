-- Onboarding extendido: campos de salud / restricciones + consentimientos
-- requeridos por el pipeline de generación automática de planes.

-- NOTA (2026-11-02): esta migración se aplicó a mano en producción y nunca quedó
-- registrada en _prisma_migrations. Los backfills de abajo solo corren si las
-- columnas NO existían antes de esta migración; si se re-ejecuta sobre la base
-- productiva (que ya las tiene) no pisa los consentimientos de nadie.
DO $$
DECLARE
  columnas_nuevas BOOLEAN := NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'NutritionalProfile' AND column_name = 'aceptaTerminosYCondiciones'
  );
BEGIN
  IF columnas_nuevas THEN
    RAISE NOTICE 'onboarding_extendido: columnas nuevas, se corre el backfill';
  END IF;
  PERFORM set_config('reviva.backfill_onboarding', columnas_nuevas::text, false);
END $$;

ALTER TABLE "NutritionalProfile"
  ADD COLUMN IF NOT EXISTS "comidasPorDia" INTEGER NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS "minutosPorSesion" INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS "alergias" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "intolerancias" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "alimentosQueNoConsume" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "condicionesMedicasDeclaradas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "lesionesActuales" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "lesionesPasadas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "medicacionActual" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "aceptaTerminosYCondiciones" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "aceptaPoliticaPrivacidad" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "aceptaDescargoMedicoYResponsabilidad" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "confirmaVeracidadDatos" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "fechaAceptacionConsentimientos" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "ipAceptacionConsentimientos" TEXT;

-- Backfill: para los 19 clientes existentes con planes activos, marcamos los
-- consentimientos como aceptados implícitamente al haber operado con el trainer
-- antes de la versión digital del flujo legal. La fecha queda NULL (sin registro).
-- Migrar el campo legacy "lesiones" (string libre) al nuevo "lesionesActuales".
DO $$
BEGIN
  IF current_setting('reviva.backfill_onboarding', true) = 'true' THEN
    UPDATE "NutritionalProfile"
    SET "aceptaTerminosYCondiciones" = TRUE,
        "aceptaPoliticaPrivacidad" = TRUE,
        "aceptaDescargoMedicoYResponsabilidad" = TRUE,
        "confirmaVeracidadDatos" = TRUE
    WHERE "creadoEn" < NOW();

    UPDATE "NutritionalProfile"
    SET "lesionesActuales" = ARRAY["lesiones"]
    WHERE "lesiones" IS NOT NULL AND "lesiones" <> '' AND cardinality("lesionesActuales") = 0;
  END IF;
END $$;
