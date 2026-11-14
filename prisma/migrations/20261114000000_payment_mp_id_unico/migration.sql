-- Un pago de Mercado Pago no puede quedar registrado dos veces. MP avisa cada
-- cobro de un débito automático por dos eventos que pueden llegar en paralelo;
-- este índice hace que solo uno cree la fila (el otro recibe P2002).
-- Idempotente, porque en producción varias migraciones se aplicaron a mano.
-- Chequeado el 14/11/2026: en producción no hay paymentId repetidos.

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_paymentId_key" ON "Payment"("paymentId");
