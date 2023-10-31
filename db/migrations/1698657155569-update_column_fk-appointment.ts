import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnFkAppointment1698657155569 implements MigrationInterface {
    name = 'UpdateColumnFkAppointment1698657155569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vet_appointment" ("id" SERIAL NOT NULL, "vet_id" integer NOT NULL, "date_accepted" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5029d3a84033c5e24b32934e4fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointment" ("id" SERIAL NOT NULL, "owner_id" integer NOT NULL, "appointment_date" date NOT NULL, "appointment_time" character varying NOT NULL, "service_package" character varying(30) NOT NULL, "clinic_id" integer NOT NULL, "status" character varying(20) NOT NULL, "accepted_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_0f9b8ab95be3757da88c09376c" UNIQUE ("accepted_id"), CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vet_appointment" ADD CONSTRAINT "FK_ef5494e001467b09968ee7a9f8c" FOREIGN KEY ("vet_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_d27bd8005e78e5a74bb85dc73ce" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_0f9b8ab95be3757da88c09376ce" FOREIGN KEY ("accepted_id") REFERENCES "vet_appointment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_3c6b7a09cbc0d0aca9d8febdf38" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_3c6b7a09cbc0d0aca9d8febdf38"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_0f9b8ab95be3757da88c09376ce"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_d27bd8005e78e5a74bb85dc73ce"`);
        await queryRunner.query(`ALTER TABLE "vet_appointment" DROP CONSTRAINT "FK_ef5494e001467b09968ee7a9f8c"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP TABLE "vet_appointment"`);
    }

}
