import { Migration } from '@mikro-orm/migrations';

export class Migration20260301130907 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "doctors" add column if not exists "qualifications" varchar(255) not null default '';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "doctors" drop column if exists "qualifications";`);
  }

}
