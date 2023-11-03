import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Status, StatusOptions } from '@/core/types/status'
import { Optional } from '@/core/types/optional'
import { AggregateRoot } from '@/core/entities/aggregate-root'
import { PackagePostedEvent } from '../events/package-posted-event'
import { PackageWaitingEvent } from '../events/package-waiting-event'
import { PackageWithdrewEvent } from '../events/package-withdrew-event'
import { PackageDeliveredEvent } from '../events/package-delivered-event'
import { PackageReturnedEvent } from '../events/package-returned-event'

export interface PackageProps {
  description: string
  status: Status
  postedAt: Date
  withdrewAt?: Date | null
  deliveredAt?: Date | null
  deliveryPersonId?: UniqueEntityId | null
  recipientId: UniqueEntityId
  updatedAt?: Date | null
}

export class Package extends AggregateRoot<PackageProps> {
  get description() {
    return this.props.description
  }

  set description(description: string) {
    this.props.description = description
    this.touch()
  }

  get status() {
    return this.props.status
  }

  set status(status: Status) {
    if (status !== this.props.status) {
      switch (status) {
        case StatusOptions.waiting:
          this.addDomainEvent(new PackageWaitingEvent(this))
          break
        case StatusOptions.withdrew:
          this.addDomainEvent(new PackageWithdrewEvent(this))
          break
        case StatusOptions.delivered:
          this.addDomainEvent(new PackageDeliveredEvent(this))
          break
        case StatusOptions.returned:
          this.addDomainEvent(new PackageReturnedEvent(this))
          break
      }
    }

    this.props.status = status
    this.touch()
  }

  get postedAt() {
    return this.props.postedAt
  }

  set postedAt(postedAt: Date) {
    this.props.postedAt = postedAt
    this.touch()
  }

  get withdrewAt() {
    return this.props.withdrewAt
  }

  set withdrewAt(withdrewAt: Date | undefined | null) {
    this.props.withdrewAt = withdrewAt
    this.touch()
  }

  get deliveredAt() {
    return this.props.deliveredAt
  }

  set deliveredAt(deliveredAt: Date | undefined | null) {
    this.props.deliveredAt = deliveredAt
    this.touch()
  }

  get deliveryPersonId() {
    return this.props.deliveryPersonId
  }

  set deliveryPersonId(deliveryPersonId: UniqueEntityId | undefined | null) {
    this.props.deliveryPersonId = deliveryPersonId
    this.touch()
  }

  get recipientId() {
    return this.props.recipientId
  }

  set recipientId(recipientId: UniqueEntityId) {
    this.props.recipientId = recipientId
    this.touch()
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<PackageProps, 'status' | 'postedAt'>,
    id?: UniqueEntityId,
  ) {
    const newPackage = new Package(
      {
        ...props,
        status: props.status ?? 'posted',
        postedAt: props.postedAt ?? new Date(),
      },
      id,
    )

    const isNewPackage = !id

    if (isNewPackage && newPackage.status === 'posted') {
      newPackage.addDomainEvent(new PackagePostedEvent(newPackage))
    }

    return newPackage
  }
}
