-- CreateEnum
CREATE TYPE "HistoryBalanceType" AS ENUM ('DEPOSIT', 'WITHDRAW');

-- CreateTable
CREATE TABLE "history_balance" (
    "id" UUID NOT NULL,
    "id_user" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "HistoryBalanceType" NOT NULL,
    "by_user" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "history_balance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "history_balance" ADD CONSTRAINT "history_balance_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
