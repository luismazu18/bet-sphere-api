-- AlterTable
ALTER TABLE "users" ADD COLUMN     "id_user_subs" UUID;

-- CreateTable
CREATE TABLE "suscription_types" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "by_user" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suscription_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_suscriptions" (
    "id" UUID NOT NULL,
    "id_user" UUID NOT NULL,
    "id_suscription" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "by_user" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_suscriptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_suscriptions" ADD CONSTRAINT "user_suscriptions_id_suscription_fkey" FOREIGN KEY ("id_suscription") REFERENCES "suscription_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_suscriptions" ADD CONSTRAINT "user_suscriptions_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
