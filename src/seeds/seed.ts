import { Role } from '../entities';
import { initRoles, initClinics } from './data';
import { DataSource, MigrationInterface, QueryRunner } from "typeorm";
import { Seeder } from "typeorm-extension";

export class SeedMain implements Seeder{
  public async run(
    dataSource: DataSource,
  ): Promise<any> {
    const repository =  dataSource.getRepository(Role);
    await repository.insert(initRoles);
  }
}