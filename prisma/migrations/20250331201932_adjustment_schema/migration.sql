/*
  Warnings:

  - Added the required column `end_date` to the `user_suscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_info` to the `user_suscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `user_suscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_suscriptions" ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "payment_info" JSONB NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "user_suscriptions_id_user_idx" ON "user_suscriptions"("id_user");

-- CreateIndex
CREATE INDEX "user_suscriptions_id_suscription_idx" ON "user_suscriptions"("id_suscription");

-- CreateIndex
CREATE INDEX "user_suscriptions_isEnabled_idx" ON "user_suscriptions"("isEnabled");
