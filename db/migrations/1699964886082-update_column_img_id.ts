import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnImgId1699964886082 implements MigrationInterface {
    name = 'UpdateColumnImgId1699964886082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_condition" ADD "actual_img_id" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "pet" ADD "avatar_id" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar_id" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar_id"`);
        await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "avatar_id"`);
        await queryRunner.query(`ALTER TABLE "pet_condition" DROP COLUMN "actual_img_id"`);
    }

}
