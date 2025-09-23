-- CreateTable
CREATE TABLE "public"."provinces" (
    "id" SERIAL NOT NULL,
    "province_id" VARCHAR(256) NOT NULL,
    "name" VARCHAR(256) NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."districts" (
    "id" SERIAL NOT NULL,
    "district_id" VARCHAR(256) NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "province_id" VARCHAR(256) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wards" (
    "id" SERIAL NOT NULL,
    "ward_id" VARCHAR(256) NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "district_id" VARCHAR(256) NOT NULL,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provinces_province_id_key" ON "public"."provinces"("province_id");

-- CreateIndex
CREATE UNIQUE INDEX "districts_district_id_key" ON "public"."districts"("district_id");

-- CreateIndex
CREATE UNIQUE INDEX "wards_ward_id_key" ON "public"."wards"("ward_id");

-- AddForeignKey
ALTER TABLE "public"."apartments" ADD CONSTRAINT "apartments_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("province_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."apartments" ADD CONSTRAINT "apartments_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("district_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."apartments" ADD CONSTRAINT "apartments_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("ward_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."districts" ADD CONSTRAINT "districts_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("province_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wards" ADD CONSTRAINT "wards_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("district_id") ON DELETE CASCADE ON UPDATE CASCADE;
