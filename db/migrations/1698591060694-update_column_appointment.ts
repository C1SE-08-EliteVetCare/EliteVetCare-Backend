import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnAppointment1698591060694 implements MigrationInterface {
    name = 'UpdateColumnAppointment1698591060694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "appointment_date"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "appointment_date" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "appointment_time"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "appointment_time" character varying(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "service_package"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "service_package" character varying(30) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "service_package"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "service_package" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "appointment_time"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "appointment_time" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "appointment_date"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "appointment_date" integer NOT NULL`);
    }

}
