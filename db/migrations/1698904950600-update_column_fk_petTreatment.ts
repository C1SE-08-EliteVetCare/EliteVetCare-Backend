import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnFkPetTreatment1698904950600 implements MigrationInterface {
    name = 'UpdateColumnFkPetTreatment1698904950600'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pet_treatment" ("id" SERIAL NOT NULL, "pet_id" integer NOT NULL, "vet_id" integer NOT NULL, "clinic_id" integer NOT NULL, "date_accepted" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_dbf4bb86757518d761ee1f61cc" UNIQUE ("pet_id"), CONSTRAINT "PK_28589e34b950effce218f470cf2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" ADD CONSTRAINT "FK_5d24885b26b741fe6b0f10fe7d6" FOREIGN KEY ("vet_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" ADD CONSTRAINT "FK_dbf4bb86757518d761ee1f61cc5" FOREIGN KEY ("pet_id") REFERENCES "pet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" ADD CONSTRAINT "FK_aaa734bdf86447629327b70d334" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_treatment" DROP CONSTRAINT "FK_aaa734bdf86447629327b70d334"`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" DROP CONSTRAINT "FK_dbf4bb86757518d761ee1f61cc5"`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" DROP CONSTRAINT "FK_5d24885b26b741fe6b0f10fe7d6"`);
        await queryRunner.query(`DROP TABLE "pet_treatment"`);
    }

}
