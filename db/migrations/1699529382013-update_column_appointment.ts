import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnAppointment1699529382013 implements MigrationInterface {
    name = 'UpdateColumnAppointment1699529382013'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "status" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "status" character varying(20) NOT NULL`);
    }

}
