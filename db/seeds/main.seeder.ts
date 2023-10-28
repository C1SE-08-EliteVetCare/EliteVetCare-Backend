import { Clinic, Role } from '../../src/entities';
import { initRoles, initClinics } from './data';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export default class SeedMain implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    await Promise.all([
      dataSource
        .createQueryBuilder()
        .insert()
        .into(Role)
        .values(initRoles)
        .execute(),
      dataSource
        .createQueryBuilder()
        .insert()
        .into(Clinic)
        .values(initClinics)
        .execute(),
    ]);
  }
}
