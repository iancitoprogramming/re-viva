-- CreateTable: registro de cada llamada al motor IA
CREATE TABLE "PlanGeneration" (
    "id"           TEXT NOT NULL,
    "clientId"     TEXT NOT NULL,
    "promptHash"   TEXT NOT NULL,
    "modelUsed"    TEXT NOT NULL,
    "tokensInput"  INTEGER NOT NULL DEFAULT 0,
    "tokensOutput" INTEGER NOT NULL DEFAULT 0,
    "costUSD"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status"       TEXT NOT NULL,
    "errorMsg"     TEXT,
    "creadoEn"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable: cola de revisión del trainer
CREATE TABLE "PendingTrainerReview" (
    "id"                     TEXT NOT NULL,
    "clientId"               TEXT NOT NULL,
    "planGenerationId"       TEXT NOT NULL,
    "planJson"               JSONB NOT NULL,
    "proofreaderReportJson"  JSONB,
    "proofreaderStatus"      TEXT,
    "prioridad"              TEXT NOT NULL,
    "estado"                 TEXT NOT NULL DEFAULT 'PENDIENTE',
    "requiereRevisionManual" BOOLEAN NOT NULL DEFAULT false,
    "flagsDetectados"        TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aprobadoPorTrainerId"   TEXT,
    "aprobadoAt"             TIMESTAMP(3),
    "entregadoAt"            TIMESTAMP(3),
    "observacionesResueltas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modificacionesJson"     JSONB,
    "creadoEn"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingTrainerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable: planes rechazados en espera de regeneración
CREATE TABLE "PlanToRegenerate" (
    "id"             TEXT NOT NULL,
    "clientId"       TEXT NOT NULL,
    "originalPlanId" TEXT,
    "motivoRechazo"  TEXT NOT NULL,
    "intentosCount"  INTEGER NOT NULL DEFAULT 0,
    "maxIntentos"    INT NOT NULL DEFAULT 2,
    "estado"         TEXT NOT NULL DEFAULT 'PENDIENTE',
    "creadoEn"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanToRegenerate_pkey" PRIMARY KEY ("id")
);

-- Unique constraint
CREATE UNIQUE INDEX "PendingTrainerReview_planGenerationId_key"
    ON "PendingTrainerReview"("planGenerationId");

-- Indexes
CREATE INDEX "PlanGeneration_clientId_idx" ON "PlanGeneration"("clientId");
CREATE INDEX "PlanGeneration_creadoEn_idx" ON "PlanGeneration"("creadoEn");
CREATE INDEX "PendingTrainerReview_clientId_estado_idx" ON "PendingTrainerReview"("clientId", "estado");
CREATE INDEX "PendingTrainerReview_prioridad_estado_idx" ON "PendingTrainerReview"("prioridad", "estado");
CREATE INDEX "PlanToRegenerate_clientId_estado_idx" ON "PlanToRegenerate"("clientId", "estado");

-- Foreign Keys
ALTER TABLE "PlanGeneration"
    ADD CONSTRAINT "PlanGeneration_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PendingTrainerReview"
    ADD CONSTRAINT "PendingTrainerReview_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PendingTrainerReview"
    ADD CONSTRAINT "PendingTrainerReview_planGenerationId_fkey"
    FOREIGN KEY ("planGenerationId") REFERENCES "PlanGeneration"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PlanToRegenerate"
    ADD CONSTRAINT "PlanToRegenerate_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Agregar flagsEspeciales a NutritionalProfile
ALTER TABLE "NutritionalProfile"
    ADD COLUMN IF NOT EXISTS "flagsEspeciales" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Trigger para actualizar actualizadoEn automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."actualizadoEn" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pending_trainer_review_updated_at
    BEFORE UPDATE ON "PendingTrainerReview"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_to_regenerate_updated_at
    BEFORE UPDATE ON "PlanToRegenerate"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
