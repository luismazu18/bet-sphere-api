-- AlterTable
ALTER TABLE "subscription_types" ADD COLUMN     "configuration" JSON NOT NULL DEFAULT '{}';
