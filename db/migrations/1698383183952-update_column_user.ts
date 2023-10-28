import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnUser1698383183952 implements MigrationInterface {
    name = 'UpdateColumnUser1698383183952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "gender"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "gender" character(3)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "gender"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "gender" boolean DEFAULT true`);
    }

}
