import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Status } from '@/core/types/status'
import { Optional } from '@/core/types/optional'
import { Entity } from 'src/core/entities/entity'

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

export class Package extends Entity<PackageProps> {
  get description() {
    return this.props.description
  }

  get status() {
    return this.props.status
  }

  get postedAt() {
    return this.props.postedAt
  }

  get withdrewAt() {
    return this.props.withdrewAt
  }

  get deliveredAt() {
    return this.props.deliveredAt
  }

  get deliveryPersonId() {
    return this.props.deliveryPersonId
  }

  get recipientId() {
    return this.props.recipientId
  }

  get updatedAt() {
    return this.props.updatedAt
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

    return newPackage
  }
}
