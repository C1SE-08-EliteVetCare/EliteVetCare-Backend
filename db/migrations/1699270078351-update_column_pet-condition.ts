import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnPetCondition1699270078351 implements MigrationInterface {
    name = 'UpdateColumnPetCondition1699270078351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_condition" DROP COLUMN "date_update"`);
        await queryRunner.query(`ALTER TABLE "pet_condition" ADD "date_update" date NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_condition" DROP COLUMN "date_update"`);
        await queryRunner.query(`ALTER TABLE "pet_condition" ADD "date_update" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
