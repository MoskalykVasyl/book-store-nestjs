-- CreateTable
CREATE TABLE "wish_list" (
    "id" TEXT NOT NULL,
    "book_list" TEXT[],
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wish_list_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wish_list_user_id_key" ON "wish_list"("user_id");

-- AddForeignKey
ALTER TABLE "wish_list" ADD CONSTRAINT "wish_list_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
