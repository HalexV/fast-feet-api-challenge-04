import { Either, left, right } from '@/core/types/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { RecipientsRepository } from '../repositories/recipients-repository'
import { PackagesRepository } from '../repositories/packages-repository'
import { RemoveRecipientNotAllowedError } from './errors/remove-recipient-not-allowed-error'

interface RemoveRecipientUseCaseRequest {
  id: string
}

type RemoveRecipientUseCaseResponse = Either<ResourceNotFoundError, null>

export class RemoveRecipientUseCase {
  constructor(
    private readonly recipientsRepository: RecipientsRepository,
    private readonly packagesRepository: PackagesRepository,
  ) {}

  async execute({
    id,
  }: RemoveRecipientUseCaseRequest): Promise<RemoveRecipientUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(id)

    if (!recipient) {
      return left(new ResourceNotFoundError())
    }

    const pkg = await this.packagesRepository.findSomeNotDelivered()

    if (pkg) {
      return left(
        new RemoveRecipientNotAllowedError(
          `Not allowed. Package ${pkg.id.toString()} not delivered yet!`,
        ),
      )
    }

    await this.recipientsRepository.delete(recipient)

    return right(null)
  }
}
