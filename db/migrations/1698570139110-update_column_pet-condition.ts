import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnPetCondition1698570139110 implements MigrationInterface {
    name = 'UpdateColumnPetCondition1698570139110'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_condition" ADD "portion" integer`);
        await queryRunner.query(`ALTER TABLE "pet_condition" ADD "weight" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_condition" DROP COLUMN "weight"`);
        await queryRunner.query(`ALTER TABLE "pet_condition" DROP COLUMN "portion"`);
    }

}
