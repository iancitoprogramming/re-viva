-- Se elimina de la web el motor de comidas (catálogo Food, plantillas y planes
-- de comida por cliente). Los gramajes se calculan fuera de la web.
--
-- ⚠ DESTRUCTIVA. Al 2026-11-02 borra: Food (50), MealPlanTemplate (6),
-- TemplateMeal (25), TemplateMealItem (95), MealPlan (2), PlanMeal (8),
-- PlanMealItem (33). Los alimentos y las plantillas quedan respaldados en
-- docs/respaldo/ (alimentos.csv, plantillas-comidas.json). Los 2 MealPlan son
-- de clientes: si se quieren conservar, exportarlos ANTES de correr esto.

DROP TABLE IF EXISTS "PlanMealItem";
DROP TABLE IF EXISTS "PlanMeal";
DROP TABLE IF EXISTS "MealPlan";
DROP TABLE IF EXISTS "TemplateMealItem";
DROP TABLE IF EXISTS "TemplateMeal";
DROP TABLE IF EXISTS "MealPlanTemplate";
DROP TABLE IF EXISTS "Food";

DROP TYPE IF EXISTS "EstadoMealPlan";
