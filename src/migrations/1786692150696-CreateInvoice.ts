import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoice1786692150696 implements MigrationInterface {
  name = 'CreateInvoice1786692150696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."invoices_source_enum" AS ENUM('created', 'parsed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "number" character varying NOT NULL, "profile" character varying NOT NULL DEFAULT 'EN 16931', "source" "public"."invoices_source_enum" NOT NULL DEFAULT 'created', "payload" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TYPE "public"."invoices_source_enum"`);
  }
}
