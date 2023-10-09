import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { Entity } from 'src/core/entities/entity'

export interface PhotoProps {
  filename: string
  createdAt: Date
}

export class Photo extends Entity<PhotoProps> {
  get filename() {
    return this.props.filename
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<PhotoProps, 'createdAt'>, id?: UniqueEntityId) {
    const newPhoto = new Photo(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return newPhoto
  }
}
