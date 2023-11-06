import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnUser1699171665396 implements MigrationInterface {
    name = 'UpdateColumnUser1699171665396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "token_google" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "token_google"`);
    }

}
