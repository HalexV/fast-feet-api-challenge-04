import { Either, left, right } from '@/core/types/either'
import { Recipient } from '../../enterprise/entities/Recipient'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { RecipientsRepository } from '../repositories/recipients-repository'
import { Injectable } from '@nestjs/common'

interface GetRecipientUseCaseRequest {
  id: string
}

type GetRecipientUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    recipient: Recipient
  }
>
@Injectable()
export class GetRecipientUseCase {
  constructor(private readonly recipientsRepository: RecipientsRepository) {}

  async execute({
    id,
  }: GetRecipientUseCaseRequest): Promise<GetRecipientUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(id)

    if (!recipient) {
      return left(new ResourceNotFoundError())
    }

    return right({
      recipient,
    })
  }
}
