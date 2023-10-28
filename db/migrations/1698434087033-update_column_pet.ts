import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnPet1698434087033 implements MigrationInterface {
    name = 'UpdateColumnPet1698434087033'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet" ADD "avatar" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "gender"`);
        await queryRunner.query(`ALTER TABLE "pet" ADD "gender" character(3) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "age"`);
        await queryRunner.query(`ALTER TABLE "pet" ADD "age" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "weight"`);
        await queryRunner.query(`ALTER TABLE "pet" ADD "weight" double precision NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "weight"`);
        await queryRunner.query(`ALTER TABLE "pet" ADD "weight" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "age"`);
        await queryRunner.query(`ALTER TABLE "pet" ADD "age" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "gender"`);
        await queryRunner.query(`ALTER TABLE "pet" ADD "gender" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "avatar"`);
    }

}
