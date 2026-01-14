import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'webhook_events' })
@Index({ properties: ['provider', 'eventId'], name: 'webhook_events_provider_event_id_unique', options: { unique: true } })
export class WebhookEvents {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property({ length: 50 })
  provider!: string;

  @Property({ length: 255, fieldName: 'event_id' })
  eventId!: string;

  @Property({ length: 100, fieldName: 'event_type' })
  eventType!: string;

  @Property({ type: 'jsonb' })
  payload!: any;

  @Property({ type: 'boolean', default: false })
  processed?: boolean;

  @Property({ type: 'timestamptz', nullable: true, fieldName: 'processed_at' })
  processedAt?: Date;

  @Property({ type: 'timestamptz', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt?: Date;
}
