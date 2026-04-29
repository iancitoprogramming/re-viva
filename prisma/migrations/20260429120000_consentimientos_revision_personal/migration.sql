-- Permite que el cliente complete onboarding sin aceptar los 4 consentimientos.
-- En ese caso queda en estado "pendiente de revisión personal" para que el
-- trainer hable en persona o por videollamada antes de habilitar el plan.

ALTER TABLE "NutritionalProfile"
  ADD COLUMN IF NOT EXISTS "consentimientosRevisionPersonal" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "consentimientosRevisadoPorTrainerEn" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "notasRevisionConsentimientos" TEXT;

-- Para los 19 clientes pre-existentes ya marcados con consentimientos = TRUE,
-- damos por revisado el ítem (los conocés en persona, ya está hablado).
UPDATE "NutritionalProfile"
SET "consentimientosRevisionPersonal" = TRUE,
    "consentimientosRevisadoPorTrainerEn" = "creadoEn"
WHERE "aceptaTerminosYCondiciones" = TRUE
  AND "aceptaPoliticaPrivacidad" = TRUE
  AND "aceptaDescargoMedicoYResponsabilidad" = TRUE
  AND "confirmaVeracidadDatos" = TRUE;
