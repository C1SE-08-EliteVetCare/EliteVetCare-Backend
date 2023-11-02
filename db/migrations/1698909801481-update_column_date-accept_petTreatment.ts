import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnDateAcceptPetTreatment1698909801481 implements MigrationInterface {
    name = 'UpdateColumnDateAcceptPetTreatment1698909801481'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_treatment" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" DROP COLUMN "date_accepted"`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" ADD "date_accepted" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_treatment" DROP COLUMN "date_accepted"`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" ADD "date_accepted" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" DROP COLUMN "created_at"`);
    }

}
