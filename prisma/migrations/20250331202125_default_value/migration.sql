-- AlterTable
ALTER TABLE "user_suscriptions" ALTER COLUMN "payment_info" SET DEFAULT '{}',
ALTER COLUMN "payment_info" SET DATA TYPE JSON;
