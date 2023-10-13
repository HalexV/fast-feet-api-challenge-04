import { State } from '@/core/types/state'
import { Either, left, right } from '@/core/types/either'
import { Recipient } from '../../enterprise/entities/Recipient'
import { RecipientsRepository } from '../repositories/recipients-repository'
import { RecipientAlreadyExistsError } from './errors/recipient-already-exists-error'

interface RegisterRecipientUseCaseRequest {
  name: string
  email: string
  address: string
  district: string
  city: string
  state: State
  zipcode: string
}

type RegisterRecipientUseCaseResponse = Either<
  RecipientAlreadyExistsError,
  {
    recipient: Recipient
  }
>

export class RegisterRecipientUseCase {
  constructor(private readonly recipientsRepository: RecipientsRepository) {}

  async execute({
    name,
    email,
    address,
    district,
    city,
    state,
    zipcode,
  }: RegisterRecipientUseCaseRequest): Promise<RegisterRecipientUseCaseResponse> {
    const recipientWithSameEmail =
      await this.recipientsRepository.findByEmail(email)

    if (recipientWithSameEmail) {
      return left(new RecipientAlreadyExistsError(email))
    }

    const recipient = Recipient.create({
      name,
      email,
      address,
      district,
      city,
      state,
      zipcode,
    })

    await this.recipientsRepository.create(recipient)

    return right({
      recipient,
    })
  }
}
