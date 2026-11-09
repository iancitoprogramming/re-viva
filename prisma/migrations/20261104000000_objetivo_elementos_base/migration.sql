-- Solapa "Lo básico" del catálogo: balanza, cinta, shaker, botella. Según el
-- research de Ian (content/suplementos/research.md) van antes que cualquier
-- suplemento. Va en su propia migración: un valor nuevo de enum no se puede
-- usar en la misma transacción en la que se crea.
ALTER TYPE "ObjetivoSuplemento" ADD VALUE IF NOT EXISTS 'ELEMENTOS_BASE' BEFORE 'GANANCIA_MUSCULAR';
