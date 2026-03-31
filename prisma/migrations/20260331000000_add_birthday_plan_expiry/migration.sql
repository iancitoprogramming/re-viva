-- Agregar fecha de nacimiento al perfil nutricional
ALTER TABLE "NutritionalProfile" ADD COLUMN IF NOT EXISTS "fechaNacimiento" TIMESTAMP(3);

-- Agregar tipo de plan y fecha de vencimiento al plan nutricional
ALTER TABLE "NutritionalPlan" ADD COLUMN IF NOT EXISTS "tipoPlan" TEXT;
ALTER TABLE "NutritionalPlan" ADD COLUMN IF NOT EXISTS "fechaVencimiento" TIMESTAMP(3);
