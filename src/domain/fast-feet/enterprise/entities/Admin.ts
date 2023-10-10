import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { Entity } from 'src/core/entities/entity'
import { State } from 'src/core/types/state'

export interface AdminProps {
  name: string
  email: string
  cpf: string
  password: string
  address: string
  district: string
  city: string
  state: State
  createdAt: Date
  updatedAt?: Date | null
}

export class Admin extends Entity<AdminProps> {
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get cpf() {
    return this.props.cpf
  }

  get password() {
    return this.props.password
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

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(props: Optional<AdminProps, 'createdAt'>, id?: UniqueEntityId) {
    const admin = new Admin(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return admin
  }
}
