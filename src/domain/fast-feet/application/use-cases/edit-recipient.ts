import { State } from '@/core/types/state'
import { Either, left, right } from '@/core/types/either'
import { Recipient } from '../../enterprise/entities/Recipient'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { RecipientAlreadyExistsError } from './errors/recipient-already-exists-error'
import { RecipientsRepository } from '../repositories/recipients-repository'
import { Injectable } from '@nestjs/common'

interface EditRecipientUseCaseRequest {
  id: string
  name: string
  email: string
  address: string
  district: string
  city: string
  state: State
  zipcode: string
}

type EditRecipientUseCaseResponse = Either<
  ResourceNotFoundError | RecipientAlreadyExistsError,
  {
    recipient: Recipient
  }
>
@Injectable()
export class EditRecipientUseCase {
  constructor(private readonly recipientsRepository: RecipientsRepository) {}

  async execute({
    id,
    name,
    email,
    address,
    district,
    city,
    state,
    zipcode,
  }: EditRecipientUseCaseRequest): Promise<EditRecipientUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(id)

    if (!recipient) {
      return left(new ResourceNotFoundError())
    }

    if (recipient.email !== email) {
      const recipientWithSameEmail =
        await this.recipientsRepository.findByEmail(email)

      if (recipientWithSameEmail) {
        return left(new RecipientAlreadyExistsError(email))
      }
    }

    recipient.name = name
    recipient.email = email
    recipient.address = address
    recipient.district = district
    recipient.city = city
    recipient.state = state
    recipient.zipcode = zipcode

    await this.recipientsRepository.save(recipient)

    return right({
      recipient,
    })
  }
}
