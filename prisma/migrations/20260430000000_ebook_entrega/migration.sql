-- Tracking de entregas pendientes de ebook/curso digital.
-- Se inserta automáticamente desde el webhook de Mercado Pago cuando se
-- aprueba un pago de planTipo en ES_EBOOK. El trainer entrega el PDF
-- por WhatsApp y marca como ENTREGADO desde el panel admin.

CREATE TABLE IF NOT EXISTS "EbookEntrega" (
  "id"            TEXT          NOT NULL,
  "userId"        TEXT          NOT NULL,
  "paymentId"     TEXT          NOT NULL,
  "planTipo"      TEXT          NOT NULL,
  "estado"        TEXT          NOT NULL DEFAULT 'PENDIENTE',
  "entregadoEn"   TIMESTAMP(3),
  "notas"         TEXT,
  "creadoEn"      TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizadoEn" TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "EbookEntrega_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EbookEntrega_paymentId_key" ON "EbookEntrega"("paymentId");
CREATE INDEX IF NOT EXISTS "EbookEntrega_estado_creadoEn_idx" ON "EbookEntrega"("estado", "creadoEn");

ALTER TABLE "EbookEntrega"
  ADD CONSTRAINT "EbookEntrega_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EbookEntrega"
  ADD CONSTRAINT "EbookEntrega_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Trigger para updatedAt
CREATE OR REPLACE FUNCTION update_ebook_entrega_actualizado()
RETURNS TRIGGER AS $$
BEGIN
  NEW."actualizadoEn" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_ebook_entrega_updated_at ON "EbookEntrega";
CREATE TRIGGER update_ebook_entrega_updated_at
  BEFORE UPDATE ON "EbookEntrega"
  FOR EACH ROW
  EXECUTE FUNCTION update_ebook_entrega_actualizado();
