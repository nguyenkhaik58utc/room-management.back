-- CreateTable
CREATE TABLE "public"."apartments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(45) NOT NULL,
    "province_id" VARCHAR(256) NOT NULL,
    "district_id" VARCHAR(256) NOT NULL,
    "ward_id" VARCHAR(256) NOT NULL,
    "address" VARCHAR(256) NOT NULL,

    CONSTRAINT "apartments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyToken" TEXT,
    "resetTokenExp" TIMESTAMP(3),
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."apartment_rooms" (
    "id" SERIAL NOT NULL,
    "apartment_id" INTEGER NOT NULL,
    "room_num_bar" VARCHAR(45) NOT NULL,
    "default_price" BIGINT NOT NULL,
    "max_tenant" INTEGER NOT NULL,

    CONSTRAINT "apartment_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."water_usages" (
    "id" SERIAL NOT NULL,
    "apartment_room_id" INTEGER NOT NULL,
    "usage_number" INTEGER NOT NULL,
    "input_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "water_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."electricity_usages" (
    "id" SERIAL NOT NULL,
    "apartment_room_id" INTEGER NOT NULL,
    "usage_number" INTEGER NOT NULL,
    "input_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "electricity_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(45) NOT NULL,
    "tel" VARCHAR(45) NOT NULL,
    "identity_card_number" VARCHAR(45) NOT NULL,
    "email" VARCHAR(256) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tenant_contracts" (
    "id" SERIAL NOT NULL,
    "apartment_room_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "pay_period" INTEGER NOT NULL,
    "price" BIGINT NOT NULL,
    "electricity_pay_type" INTEGER NOT NULL,
    "electricity_price" BIGINT NOT NULL,
    "electricity_number_start" INTEGER NOT NULL,
    "water_pay_type" INTEGER NOT NULL,
    "water_price" BIGINT NOT NULL,
    "water_number_start" INTEGER NOT NULL,
    "num_of_tenant_current" INTEGER NOT NULL,
    "note" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."room_fee_collections" (
    "id" SERIAL NOT NULL,
    "tenant_contract_id" INTEGER NOT NULL,
    "apartment_room_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "electricity_num_before" INTEGER NOT NULL,
    "electricity_num_after" INTEGER NOT NULL,
    "water_number_before" INTEGER NOT NULL,
    "water_number_after" INTEGER NOT NULL,
    "charge_date" TIMESTAMP(3) NOT NULL,
    "total_debt" BIGINT NOT NULL,
    "total_price" BIGINT NOT NULL,
    "total_paid" BIGINT NOT NULL,
    "fee_collection_uuid" VARCHAR(64) NOT NULL,

    CONSTRAINT "room_fee_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."room_fee_collection_histories" (
    "id" SERIAL NOT NULL,
    "room_fee_collection_id" INTEGER NOT NULL,
    "paid_date" TIMESTAMP(3) NOT NULL,
    "price" BIGINT NOT NULL,

    CONSTRAINT "room_fee_collection_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contract_monthly_costs" (
    "id" SERIAL NOT NULL,
    "tenant_contract_id" INTEGER NOT NULL,
    "monthly_cost_id" INTEGER NOT NULL,
    "pay_type" INTEGER NOT NULL,
    "price" BIGINT NOT NULL,

    CONSTRAINT "contract_monthly_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."monthly_costs" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(45) NOT NULL,

    CONSTRAINT "monthly_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prefectures" (
    "id" SERIAL NOT NULL,
    "ward_id" VARCHAR(256) NOT NULL,
    "ward_name" VARCHAR(256) NOT NULL,
    "ward_level" VARCHAR(256) NOT NULL,
    "district_id" VARCHAR(256) NOT NULL,
    "district_name" VARCHAR(256) NOT NULL,
    "province_id" VARCHAR(256) NOT NULL,
    "province_name" VARCHAR(256) NOT NULL,

    CONSTRAINT "prefectures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" SERIAL NOT NULL,
    "admin_uuid" VARCHAR(64) NOT NULL,
    "admin_login_id" VARCHAR(64) NOT NULL,
    "email" VARCHAR(256) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."apartments" ADD CONSTRAINT "apartments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."apartment_rooms" ADD CONSTRAINT "apartment_rooms_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."water_usages" ADD CONSTRAINT "water_usages_apartment_room_id_fkey" FOREIGN KEY ("apartment_room_id") REFERENCES "public"."apartment_rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."electricity_usages" ADD CONSTRAINT "electricity_usages_apartment_room_id_fkey" FOREIGN KEY ("apartment_room_id") REFERENCES "public"."apartment_rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tenant_contracts" ADD CONSTRAINT "tenant_contracts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tenant_contracts" ADD CONSTRAINT "tenant_contracts_apartment_room_id_fkey" FOREIGN KEY ("apartment_room_id") REFERENCES "public"."apartment_rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."room_fee_collections" ADD CONSTRAINT "room_fee_collections_tenant_contract_id_fkey" FOREIGN KEY ("tenant_contract_id") REFERENCES "public"."tenant_contracts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."room_fee_collections" ADD CONSTRAINT "room_fee_collections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."room_fee_collections" ADD CONSTRAINT "room_fee_collections_apartment_room_id_fkey" FOREIGN KEY ("apartment_room_id") REFERENCES "public"."apartment_rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."room_fee_collection_histories" ADD CONSTRAINT "room_fee_collection_histories_room_fee_collection_id_fkey" FOREIGN KEY ("room_fee_collection_id") REFERENCES "public"."room_fee_collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."contract_monthly_costs" ADD CONSTRAINT "contract_monthly_costs_tenant_contract_id_fkey" FOREIGN KEY ("tenant_contract_id") REFERENCES "public"."tenant_contracts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."contract_monthly_costs" ADD CONSTRAINT "contract_monthly_costs_monthly_cost_id_fkey" FOREIGN KEY ("monthly_cost_id") REFERENCES "public"."monthly_costs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
