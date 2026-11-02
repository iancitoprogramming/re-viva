-- Permite que el cliente complete onboarding sin aceptar los 4 consentimientos.
-- En ese caso queda en estado "pendiente de revisión personal" para que el
-- trainer hable en persona o por videollamada antes de habilitar el plan.

-- NOTA (2026-11-02): aplicada a mano en producción, nunca registrada. El
-- backfill solo corre si las columnas no existían (ver migración anterior).
DO $$
BEGIN
  PERFORM set_config('reviva.backfill_revision', (NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'NutritionalProfile' AND column_name = 'consentimientosRevisionPersonal'
  ))::text, false);
END $$;

ALTER TABLE "NutritionalProfile"
  ADD COLUMN IF NOT EXISTS "consentimientosRevisionPersonal" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "consentimientosRevisadoPorTrainerEn" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "notasRevisionConsentimientos" TEXT;

-- Para los 19 clientes pre-existentes ya marcados con consentimientos = TRUE,
-- damos por revisado el ítem (los conocés en persona, ya está hablado).
DO $$
BEGIN
  IF current_setting('reviva.backfill_revision', true) = 'true' THEN
    UPDATE "NutritionalProfile"
    SET "consentimientosRevisionPersonal" = TRUE,
        "consentimientosRevisadoPorTrainerEn" = "creadoEn"
    WHERE "aceptaTerminosYCondiciones" = TRUE
      AND "aceptaPoliticaPrivacidad" = TRUE
      AND "aceptaDescargoMedicoYResponsabilidad" = TRUE
      AND "confirmaVeracidadDatos" = TRUE;
  END IF;
END $$;
