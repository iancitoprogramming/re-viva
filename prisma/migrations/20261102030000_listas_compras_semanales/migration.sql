-- Listas de compras semanales (internas, solo admin).
-- Antes: ShoppingList colgaba de MealPlan (motor de comidas de la web, que se
-- elimina en la migración siguiente). Ahora: una lista por cliente por semana.
-- Las tablas estaban vacías en producción (0 filas al 2026-11-02); el DELETE es
-- por si el plan builder viejo llegó a generar alguna antes del deploy.

DELETE FROM "ShoppingListItem";
DELETE FROM "ShoppingList";

ALTER TABLE "ShoppingList" DROP CONSTRAINT IF EXISTS "ShoppingList_mealPlanId_fkey";
DROP INDEX IF EXISTS "ShoppingList_mealPlanId_key";

ALTER TABLE "ShoppingList"
  DROP COLUMN IF EXISTS "mealPlanId",
  DROP COLUMN IF EXISTS "diasCubiertos",
  ADD COLUMN "userId" TEXT NOT NULL,
  ADD COLUMN "semana" INTEGER NOT NULL,
  ADD COLUMN "enviadoEn" TIMESTAMP(3);

CREATE UNIQUE INDEX "ShoppingList_userId_semana_key" ON "ShoppingList"("userId", "semana");

ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- La categoría deja de depender del catálogo Food: se renombra el enum y se
-- suma ALMACEN (aceites, condimentos, enlatados, etc.).
ALTER TYPE "FoodCategoria" RENAME TO "CategoriaCompra";
ALTER TYPE "CategoriaCompra" ADD VALUE IF NOT EXISTS 'ALMACEN';
