/*
  Warnings:

  - You are about to drop the `suscription_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_suscriptions" DROP CONSTRAINT "user_suscriptions_id_suscription_fkey";

-- DropTable
DROP TABLE "suscription_types";

-- CreateTable
CREATE TABLE "subscription_types" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "by_user" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_suscriptions" ADD CONSTRAINT "user_suscriptions_id_suscription_fkey" FOREIGN KEY ("id_suscription") REFERENCES "subscription_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
