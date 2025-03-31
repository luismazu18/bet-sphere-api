-- CreateEnum
CREATE TYPE "UserHouseType" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "betting_type" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "by_user" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "betting_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "house" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key_name" TEXT NOT NULL,
    "configuration" JSON NOT NULL DEFAULT '{}',
    "id_betting_type" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "by_user" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "house_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_house" (
    "id" UUID NOT NULL,
    "id_user" UUID NOT NULL,
    "id_house" UUID NOT NULL,
    "type" "UserHouseType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "by_user" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_house_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_house_id_user_idx" ON "user_house"("id_user");

-- CreateIndex
CREATE INDEX "user_house_id_house_idx" ON "user_house"("id_house");

-- CreateIndex
CREATE INDEX "user_house_isEnabled_idx" ON "user_house"("isEnabled");

-- AddForeignKey
ALTER TABLE "house" ADD CONSTRAINT "house_id_betting_type_fkey" FOREIGN KEY ("id_betting_type") REFERENCES "betting_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_house" ADD CONSTRAINT "user_house_id_house_fkey" FOREIGN KEY ("id_house") REFERENCES "house"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_house" ADD CONSTRAINT "user_house_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
