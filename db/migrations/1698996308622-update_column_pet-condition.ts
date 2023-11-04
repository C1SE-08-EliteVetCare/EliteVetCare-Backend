import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnPetCondition1698996308622 implements MigrationInterface {
    name = 'UpdateColumnPetCondition1698996308622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_condition" ADD "recommended_medicines" text`);
        await queryRunner.query(`ALTER TABLE "pet_condition" ADD "recommended_meal" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_condition" DROP COLUMN "recommended_meal"`);
        await queryRunner.query(`ALTER TABLE "pet_condition" DROP COLUMN "recommended_medicines"`);
    }

}
