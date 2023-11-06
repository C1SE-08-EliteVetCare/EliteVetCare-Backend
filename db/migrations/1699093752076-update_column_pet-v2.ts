import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnPetV21699093752076 implements MigrationInterface {
    name = 'UpdateColumnPetV21699093752076'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "age"`);
        await queryRunner.query(`ALTER TABLE "pet" ADD "age" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "age"`);
        await queryRunner.query(`ALTER TABLE "pet" ADD "age" character varying(20) NOT NULL`);
    }

}
