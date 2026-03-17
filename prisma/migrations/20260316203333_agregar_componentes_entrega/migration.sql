-- CreateEnum
CREATE TYPE "EstadoEntrega" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'ENTREGADO');

-- AlterTable
ALTER TABLE "NutritionalPlan" ADD COLUMN     "estadoAlimentacion" "EstadoEntrega" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "estadoEntrenamiento" "EstadoEntrega" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "estadoListaCompras" "EstadoEntrega" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "estadoMealPrep" "EstadoEntrega" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "estadoSuplementacion" "EstadoEntrega" NOT NULL DEFAULT 'PENDIENTE';
