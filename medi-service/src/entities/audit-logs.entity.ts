import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({ tableName: 'audit_logs' })
export class AuditLogs {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ length: 50, nullable: true, fieldName: 'entity_type' })
  entityType?: string;

  @Property({ type: 'uuid', nullable: true, fieldName: 'entity_id' })
  entityId?: string;

  @Property({ length: 50, nullable: true })
  action?: string;

  @Property({ type: 'uuid', nullable: true, fieldName: 'performed_by' })
  performedBy?: string;

  @Property({ type: 'json', nullable: true })
  meta?: any;

  @Property({ type: 'timestamptz', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt?: Date;
}
