-- AlterTable: agrega campo disponibilidadDomingo a NutritionalProfile
-- Aplica a planes de 3x/semana FBEOD — valores: "siempre" | "aveces" | "no"

ALTER TABLE "NutritionalProfile"
ADD COLUMN IF NOT EXISTS "disponibilidadDomingo" TEXT NOT NULL DEFAULT 'no';
