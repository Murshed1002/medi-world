import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { AuthUsers } from './auth-users.entity';

@Entity({ tableName: 'refresh_tokens' })
export class RefreshTokens {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => AuthUsers, { fieldName: 'user_id' })
  user!: AuthUsers;

  @Property({ type: 'text', fieldName: 'token_hash' })
  tokenHash!: string;

  @Property({ type: 'timestamptz', fieldName: 'expires_at' })
  expiresAt!: Date;

  @Property({ type: 'boolean', default: false })
  revoked?: boolean;

  @Property({ type: 'timestamptz', nullable: true, fieldName: 'revoked_at' })
  revokedAt?: Date;

  @Property({ type: 'uuid', nullable: true, fieldName: 'replaced_by' })
  replacedBy?: string;

  @Property({ type: 'string', length: 45, nullable: true, fieldName: 'ip_address' })
  ipAddress?: string;

  @Property({ type: 'text', nullable: true, fieldName: 'user_agent' })
  userAgent?: string;

  @Property({ type: 'jsonb', nullable: true, fieldName: 'device_info' })
  deviceInfo?: any;

  @Property({ type: 'timestamptz', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ type: 'timestamptz', fieldName: 'updated_at', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date;
}
