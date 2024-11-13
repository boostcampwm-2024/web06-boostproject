import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class EntityTimestamp {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
