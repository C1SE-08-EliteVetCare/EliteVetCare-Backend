import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnVetIdPetTreatment1698905808876 implements MigrationInterface {
    name = 'UpdateColumnVetIdPetTreatment1698905808876'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_treatment" DROP CONSTRAINT "FK_5d24885b26b741fe6b0f10fe7d6"`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" ALTER COLUMN "vet_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" ADD CONSTRAINT "FK_5d24885b26b741fe6b0f10fe7d6" FOREIGN KEY ("vet_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_treatment" DROP CONSTRAINT "FK_5d24885b26b741fe6b0f10fe7d6"`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" ALTER COLUMN "vet_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" ADD CONSTRAINT "FK_5d24885b26b741fe6b0f10fe7d6" FOREIGN KEY ("vet_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
