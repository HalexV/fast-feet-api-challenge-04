import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'
import { State } from '@/core/types/state'
import { Status } from '@/core/types/status'

export interface PackageWithRecipientProps {
  packageId: UniqueEntityId
  description: string
  status: Status
  postedAt: Date
  withdrewAt?: Date | null
  deliveredAt?: Date | null
  deliveryPersonId?: UniqueEntityId | null
  updatedAt?: Date | null
  recipientId: UniqueEntityId
  recipient: string
  address: string
  district: string
  city: string
  state: State
  zipcode: string
}

export class PackageWithRecipient extends ValueObject<PackageWithRecipientProps> {
  get packageId() {
    return this.props.packageId
  }

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

  get updatedAt() {
    return this.props.updatedAt
  }

  get recipientId() {
    return this.props.recipientId
  }

  get recipient() {
    return this.props.recipient
  }

  get address() {
    return this.props.address
  }

  get district() {
    return this.props.district
  }

  get city() {
    return this.props.city
  }

  get state() {
    return this.props.state
  }

  get zipcode() {
    return this.props.zipcode
  }

  static create(props: PackageWithRecipientProps) {
    return new PackageWithRecipient(props)
  }
}
