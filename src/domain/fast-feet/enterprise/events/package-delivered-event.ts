import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { DomainEvent } from '@/core/events/domain-event'
import { Package } from '../entities/Package'

export class PackageDeliveredEvent implements DomainEvent {
  public ocurredAt: Date
  public pkg: Package

  constructor(pkg: Package) {
    this.pkg = pkg
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.pkg.id
  }
}
