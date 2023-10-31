import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnAppointment1698651955330 implements MigrationInterface {
    name = 'UpdateColumnAppointment1698651955330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_8fb4ae178c6bd844f42f69ae686"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "clinicId"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_3c6b7a09cbc0d0aca9d8febdf38" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_3c6b7a09cbc0d0aca9d8febdf38"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "clinicId" integer`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_8fb4ae178c6bd844f42f69ae686" FOREIGN KEY ("clinicId") REFERENCES "clinic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
