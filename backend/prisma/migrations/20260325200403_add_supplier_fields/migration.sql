-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "supplierOrderId" TEXT,
ADD COLUMN     "supplierUrl" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "supplierUrl" TEXT;
