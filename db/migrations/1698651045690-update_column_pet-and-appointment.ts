import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnPetAndAppointment1698651045690 implements MigrationInterface {
    name = 'UpdateColumnPetAndAppointment1698651045690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "appointment_time"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "appointment_time" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "appointment_time"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "appointment_time" character varying(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "created_at"`);
    }

}
