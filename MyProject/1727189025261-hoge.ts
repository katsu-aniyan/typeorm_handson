import { MigrationInterface, QueryRunner } from "typeorm";

export class Hoge1727189025261 implements MigrationInterface {
    name = 'Hoge1727189025261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personal_info" ADD "fuga" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personal_info" DROP COLUMN "fuga"`);
    }

}
