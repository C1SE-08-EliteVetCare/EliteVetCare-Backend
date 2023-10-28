import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTable1698339042866 implements MigrationInterface {
    name = 'CreateTable1698339042866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying(20) NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "clinic" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "city" character varying(50) NOT NULL, "district" character varying(100) NOT NULL, "ward" character varying(100) NOT NULL, "street_address" character varying(100) NOT NULL, "logo" character varying NOT NULL, CONSTRAINT "PK_8e97c18debc9c7f7606e311d763" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pet_treatment" ("id" SERIAL NOT NULL, "pet_id" integer NOT NULL, "vet_id" integer NOT NULL, "date_accepted" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_dbf4bb86757518d761ee1f61cc" UNIQUE ("pet_id"), CONSTRAINT "PK_28589e34b950effce218f470cf2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pet_condition" ("id" SERIAL NOT NULL, "pet_id" integer NOT NULL, "meal" text, "manifestation" text, "condition_of_defecation" text, "actual_img" character varying, "vet_advice" text, "date_update" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fa91c0b4cf6a09e7d5fd3d0e54a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pet" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "species" character varying(100) NOT NULL, "breed" character varying(100) NOT NULL, "gender" boolean NOT NULL, "age" integer NOT NULL, "weight" integer NOT NULL, "fur_color" character varying(100) NOT NULL, "owner_id" integer NOT NULL, CONSTRAINT "PK_b1ac2e88e89b9480e0c5b53fa60" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vet_appointment" ("id" SERIAL NOT NULL, "vet_id" integer NOT NULL, "date_accepted" TIMESTAMP NOT NULL DEFAULT now(), "owner_id" integer, CONSTRAINT "REL_ef5494e001467b09968ee7a9f8" UNIQUE ("vet_id"), CONSTRAINT "PK_5029d3a84033c5e24b32934e4fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointment" ("id" SERIAL NOT NULL, "owner_id" integer NOT NULL, "appointment_date" integer NOT NULL, "appointment_time" integer NOT NULL, "service_package" character varying NOT NULL, "clinic_id" integer NOT NULL, "status" character varying(20) NOT NULL, "accepted_id" integer NOT NULL, CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feedback" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "subject" character varying(100) NOT NULL, "content" text NOT NULL, "rating" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inbox" ("id" SERIAL NOT NULL, "vet_id" integer NOT NULL, "conversation_name" character varying(50) NOT NULL, CONSTRAINT "PK_ab7abc299fab4bb4f965549c819" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "conversation_id" integer NOT NULL, "content" text NOT NULL, "date_send" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "full_name" character varying(50) NOT NULL, "email" character varying(100) NOT NULL, "password" character varying NOT NULL, "gender" boolean DEFAULT true, "city" character varying(100), "district" character varying(150), "ward" character varying(100), "street_address" character varying(100), "birth_year" integer, "avatar" character varying, "phone" character varying(200) NOT NULL, "operating_status" boolean NOT NULL DEFAULT false, "hashed_rt" character varying, "role_id" integer NOT NULL DEFAULT '2', "clinic_id" integer, "created_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" ADD CONSTRAINT "FK_d4dcba54eab49dc3bf252fa2e3c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" ADD CONSTRAINT "FK_dbf4bb86757518d761ee1f61cc5" FOREIGN KEY ("pet_id") REFERENCES "pet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pet_condition" ADD CONSTRAINT "FK_340688be3c83c57137d94bc471f" FOREIGN KEY ("pet_id") REFERENCES "pet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pet" ADD CONSTRAINT "FK_5116a00f46dd9097ed6bd8dd6a5" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vet_appointment" ADD CONSTRAINT "FK_ef5494e001467b09968ee7a9f8c" FOREIGN KEY ("vet_id") REFERENCES "appointment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vet_appointment" ADD CONSTRAINT "FK_f574d15da97cc692d74705b7316" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_d27bd8005e78e5a74bb85dc73ce" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_121c67d42dd543cca0809f59901" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inbox" ADD CONSTRAINT "FK_ec2cc60c20705b38b9660ff6f63" FOREIGN KEY ("vet_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_54ce30caeb3f33d68398ea10376" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7fe3e887d78498d9c9813375ce2" FOREIGN KEY ("conversation_id") REFERENCES "inbox"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_89ef5c4a4d2f7959c9368610ed2" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_89ef5c4a4d2f7959c9368610ed2"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_7fe3e887d78498d9c9813375ce2"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_54ce30caeb3f33d68398ea10376"`);
        await queryRunner.query(`ALTER TABLE "inbox" DROP CONSTRAINT "FK_ec2cc60c20705b38b9660ff6f63"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_121c67d42dd543cca0809f59901"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_d27bd8005e78e5a74bb85dc73ce"`);
        await queryRunner.query(`ALTER TABLE "vet_appointment" DROP CONSTRAINT "FK_f574d15da97cc692d74705b7316"`);
        await queryRunner.query(`ALTER TABLE "vet_appointment" DROP CONSTRAINT "FK_ef5494e001467b09968ee7a9f8c"`);
        await queryRunner.query(`ALTER TABLE "pet" DROP CONSTRAINT "FK_5116a00f46dd9097ed6bd8dd6a5"`);
        await queryRunner.query(`ALTER TABLE "pet_condition" DROP CONSTRAINT "FK_340688be3c83c57137d94bc471f"`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" DROP CONSTRAINT "FK_dbf4bb86757518d761ee1f61cc5"`);
        await queryRunner.query(`ALTER TABLE "pet_treatment" DROP CONSTRAINT "FK_d4dcba54eab49dc3bf252fa2e3c"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TABLE "inbox"`);
        await queryRunner.query(`DROP TABLE "feedback"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP TABLE "vet_appointment"`);
        await queryRunner.query(`DROP TABLE "pet"`);
        await queryRunner.query(`DROP TABLE "pet_condition"`);
        await queryRunner.query(`DROP TABLE "pet_treatment"`);
        await queryRunner.query(`DROP TABLE "clinic"`);
        await queryRunner.query(`DROP TABLE "role"`);
    }

}
