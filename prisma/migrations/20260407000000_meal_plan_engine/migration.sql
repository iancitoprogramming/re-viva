-- Migration: meal_plan_engine
-- Agrega motor de planes alimentarios: catálogo de alimentos, templates,
-- planes asignados con versionado y listas de compras.

-- ─── Enums ────────────────────────────────────────────────────────────────
CREATE TYPE "FoodCategoria" AS ENUM (
  'PROTEINA_ANIMAL',
  'PROTEINA_VEGETAL',
  'LACTEO',
  'CARBOHIDRATO',
  'VEGETAL',
  'FRUTA',
  'GRASA',
  'BEBIDA',
  'CONDIMENTO',
  'SUPLEMENTO'
);

CREATE TYPE "EstadoMealPlan" AS ENUM ('BORRADOR', 'ACTIVO', 'ARCHIVADO');

-- ─── Food ─────────────────────────────────────────────────────────────────
CREATE TABLE "Food" (
  "id"            TEXT NOT NULL,
  "nombre"        TEXT NOT NULL,
  "categoria"     "FoodCategoria" NOT NULL,
  "unidad"        TEXT NOT NULL DEFAULT 'g',
  "kcal"          DOUBLE PRECISION NOT NULL,
  "proteina"      DOUBLE PRECISION NOT NULL,
  "hidratos"      DOUBLE PRECISION NOT NULL,
  "grasas"        DOUBLE PRECISION NOT NULL,
  "unidadCompra"  TEXT,
  "notas"         TEXT,
  "activo"        BOOLEAN NOT NULL DEFAULT true,
  "creadoEn"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizadoEn" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Food_nombre_key" ON "Food"("nombre");

-- ─── MealPlanTemplate ─────────────────────────────────────────────────────
CREATE TABLE "MealPlanTemplate" (
  "id"             TEXT NOT NULL,
  "nombre"         TEXT NOT NULL,
  "descripcion"    TEXT,
  "genero"         "Genero",
  "objetivo"       "Objetivo",
  "edadMin"        INTEGER,
  "edadMax"        INTEGER,
  "adherencia"     "Adherencia",
  "kcalTarget"     DOUBLE PRECISION NOT NULL,
  "proteinaTarget" DOUBLE PRECISION NOT NULL,
  "hidratosTarget" DOUBLE PRECISION NOT NULL,
  "grasasTarget"   DOUBLE PRECISION NOT NULL,
  "notas"          TEXT,
  "generadoConIA"  BOOLEAN NOT NULL DEFAULT false,
  "activo"         BOOLEAN NOT NULL DEFAULT true,
  "creadoEn"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizadoEn"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MealPlanTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TemplateMeal" (
  "id"           TEXT NOT NULL,
  "templateId"   TEXT NOT NULL,
  "nombre"       TEXT NOT NULL,
  "orden"        INTEGER NOT NULL,
  "horaSugerida" TEXT,
  CONSTRAINT "TemplateMeal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TemplateMealItem" (
  "id"     TEXT NOT NULL,
  "mealId" TEXT NOT NULL,
  "foodId" TEXT NOT NULL,
  "gramos" DOUBLE PRECISION NOT NULL,
  "notas"  TEXT,
  CONSTRAINT "TemplateMealItem_pkey" PRIMARY KEY ("id")
);

-- ─── MealPlan (instancia asignada a cliente, con versionado) ──────────────
CREATE TABLE "MealPlan" (
  "id"               TEXT NOT NULL,
  "userId"           TEXT NOT NULL,
  "version"          INTEGER NOT NULL DEFAULT 1,
  "estado"           "EstadoMealPlan" NOT NULL DEFAULT 'BORRADOR',
  "templateOrigenId" TEXT,
  "kcalTotal"        DOUBLE PRECISION NOT NULL,
  "proteinaTotal"    DOUBLE PRECISION NOT NULL,
  "hidratosTotal"    DOUBLE PRECISION NOT NULL,
  "grasasTotal"      DOUBLE PRECISION NOT NULL,
  "kcalTarget"       DOUBLE PRECISION,
  "proteinaTarget"   DOUBLE PRECISION,
  "hidratosTarget"   DOUBLE PRECISION,
  "grasasTarget"     DOUBLE PRECISION,
  "notas"            TEXT,
  "creadoEn"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizadoEn"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MealPlan_userId_version_idx" ON "MealPlan"("userId", "version");

CREATE TABLE "PlanMeal" (
  "id"           TEXT NOT NULL,
  "mealPlanId"   TEXT NOT NULL,
  "nombre"       TEXT NOT NULL,
  "orden"        INTEGER NOT NULL,
  "horaSugerida" TEXT,
  CONSTRAINT "PlanMeal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlanMealItem" (
  "id"     TEXT NOT NULL,
  "mealId" TEXT NOT NULL,
  "foodId" TEXT NOT NULL,
  "gramos" DOUBLE PRECISION NOT NULL,
  "notas"  TEXT,
  CONSTRAINT "PlanMealItem_pkey" PRIMARY KEY ("id")
);

-- ─── ShoppingList ─────────────────────────────────────────────────────────
CREATE TABLE "ShoppingList" (
  "id"            TEXT NOT NULL,
  "mealPlanId"    TEXT NOT NULL,
  "diasCubiertos" INTEGER NOT NULL DEFAULT 7,
  "notas"         TEXT,
  "creadoEn"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizadoEn" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ShoppingList_mealPlanId_key" ON "ShoppingList"("mealPlanId");

CREATE TABLE "ShoppingListItem" (
  "id"             TEXT NOT NULL,
  "shoppingListId" TEXT NOT NULL,
  "nombre"         TEXT NOT NULL,
  "categoria"      "FoodCategoria" NOT NULL,
  "cantidad"       DOUBLE PRECISION NOT NULL,
  "unidad"         TEXT NOT NULL,
  "comprado"       BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "ShoppingListItem_pkey" PRIMARY KEY ("id")
);

-- ─── Foreign keys ─────────────────────────────────────────────────────────
ALTER TABLE "TemplateMeal"
  ADD CONSTRAINT "TemplateMeal_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "MealPlanTemplate"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TemplateMealItem"
  ADD CONSTRAINT "TemplateMealItem_mealId_fkey"
  FOREIGN KEY ("mealId") REFERENCES "TemplateMeal"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TemplateMealItem"
  ADD CONSTRAINT "TemplateMealItem_foodId_fkey"
  FOREIGN KEY ("foodId") REFERENCES "Food"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MealPlan"
  ADD CONSTRAINT "MealPlan_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PlanMeal"
  ADD CONSTRAINT "PlanMeal_mealPlanId_fkey"
  FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlanMealItem"
  ADD CONSTRAINT "PlanMealItem_mealId_fkey"
  FOREIGN KEY ("mealId") REFERENCES "PlanMeal"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PlanMealItem"
  ADD CONSTRAINT "PlanMealItem_foodId_fkey"
  FOREIGN KEY ("foodId") REFERENCES "Food"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ShoppingList"
  ADD CONSTRAINT "ShoppingList_mealPlanId_fkey"
  FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShoppingListItem"
  ADD CONSTRAINT "ShoppingListItem_shoppingListId_fkey"
  FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
