-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bet_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "photo" DROP NOT NULL;
