-- AddTable: Payment (Mercado Pago)
CREATE TABLE "Payment" (
    "id"           TEXT NOT NULL,
    "userId"       TEXT NOT NULL,
    "planTipo"     TEXT NOT NULL,
    "preferenceId" TEXT NOT NULL,
    "paymentId"    TEXT,
    "status"       TEXT NOT NULL DEFAULT 'pending',
    "amount"       DOUBLE PRECISION NOT NULL,
    "currency"     TEXT NOT NULL DEFAULT 'ARS',
    "creadoEn"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
