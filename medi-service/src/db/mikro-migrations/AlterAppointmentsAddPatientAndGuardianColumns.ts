import { Migration } from '@mikro-orm/migrations';

export class AlterAppointmentsAddPatientAndGuardianColumns extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "appointments" add column if not exists "patient_full_name" varchar(255) not null default '';`);
    
    this.addSql(`alter table if exists "appointments" add column if not exists "patient_phone" varchar(20) not null default '';`);
    this.addSql(`alter table if exists "appointments" add column if not exists "patient_age" integer not null;`);
    this.addSql(`alter table if exists "appointments" add column if not exists "patient_gender" varchar(10) not null default '';`);
    this.addSql(`alter table if exists "appointments" add column if not exists "guardian_name" varchar(255) null;`);
    this.addSql(`alter table if exists "appointments" add column if not exists "guardian_phone" varchar(20) null;`);
    this.addSql(`alter table if exists "appointments" add column if not exists "guardian_relation" varchar(30) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "appointments" drop column if exists "patient_full_name";`);
    this.addSql(`alter table if exists "appointments" drop column if exists "patient_phone";`);
    this.addSql(`alter table if exists "appointments" drop column if exists "patient_age";`);
    this.addSql(`alter table if exists "appointments" drop column if exists "patient_gender";`);
    this.addSql(`alter table if exists "appointments" drop column if exists "guardian_name";`);
    this.addSql(`alter table if exists "appointments" drop column if exists "guardian_phone";`);
    this.addSql(`alter table if exists "appointments" drop column if exists "guardian_relation";`);
  }

}
