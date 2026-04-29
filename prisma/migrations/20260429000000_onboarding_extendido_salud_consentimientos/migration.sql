-- Onboarding extendido: campos de salud / restricciones + consentimientos
-- requeridos por el pipeline de generación automática de planes.

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
UPDATE "NutritionalProfile"
SET "aceptaTerminosYCondiciones" = TRUE,
    "aceptaPoliticaPrivacidad" = TRUE,
    "aceptaDescargoMedicoYResponsabilidad" = TRUE,
    "confirmaVeracidadDatos" = TRUE
WHERE "creadoEn" < NOW();

-- Migrar el campo legacy "lesiones" (string libre) al nuevo "lesionesActuales"
-- como un único elemento, para no perder información de los clientes existentes.
UPDATE "NutritionalProfile"
SET "lesionesActuales" = ARRAY["lesiones"]
WHERE "lesiones" IS NOT NULL AND "lesiones" <> '' AND cardinality("lesionesActuales") = 0;
