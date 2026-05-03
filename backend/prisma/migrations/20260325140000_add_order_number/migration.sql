-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "Order_orderNumber_seq";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "orderNumber" INTEGER NOT NULL DEFAULT nextval('"Order_orderNumber_seq"');

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
