/*
  Warnings:

  - You are about to drop the `wish_list` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "wish_list" DROP CONSTRAINT "wish_list_user_id_fkey";

-- DropTable
DROP TABLE "wish_list";

-- CreateTable
CREATE TABLE "wish_list_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wish_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wish_list_items_book_id_idx" ON "wish_list_items"("book_id");

-- CreateIndex
CREATE UNIQUE INDEX "wish_list_items_user_id_book_id_key" ON "wish_list_items"("user_id", "book_id");

-- CreateIndex
CREATE INDEX "books_authorId_idx" ON "books"("authorId");

-- AddForeignKey
ALTER TABLE "wish_list_items" ADD CONSTRAINT "wish_list_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wish_list_items" ADD CONSTRAINT "wish_list_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
