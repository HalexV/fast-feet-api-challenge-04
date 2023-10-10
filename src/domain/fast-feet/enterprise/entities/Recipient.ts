import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { Entity } from 'src/core/entities/entity'
import { State } from 'src/core/types/state'

export interface RecipientProps {
  name: string
  email: string
  address: string
  district: string
  city: string
  state: State
  zipcode: string
  createdAt: Date
  updatedAt?: Date | null
}

export class Recipient extends Entity<RecipientProps> {
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
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

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(
    props: Optional<RecipientProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    const recipient = new Recipient(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return recipient
  }
}
