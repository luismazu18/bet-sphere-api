/*
  Warnings:

  - You are about to drop the column `enabled` on the `suscription_types` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `user_suscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `users` table. All the data in the column will be lost.
  - Added the required column `price` to the `suscription_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "suscription_types" DROP COLUMN "enabled",
ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "user_suscriptions" DROP COLUMN "enabled",
ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "enabled",
ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true;
