import { Either, left, right } from '@/core/types/either'
import { DeliveryPerson } from '../../enterprise/entities/DeliveryPerson'
import { DeliveryPeopleRepository } from '../repositories/delivery-people-repository'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

interface GetDeliveryPersonUseCaseRequest {
  id: string
}

type GetDeliveryPersonUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    deliveryPerson: DeliveryPerson
  }
>

export class GetDeliveryPersonUseCase {
  constructor(
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
  ) {}

  async execute({
    id,
  }: GetDeliveryPersonUseCaseRequest): Promise<GetDeliveryPersonUseCaseResponse> {
    const deliveryPerson = await this.deliveryPeopleRepository.findById(id)

    if (!deliveryPerson) {
      return left(new ResourceNotFoundError())
    }

    return right({
      deliveryPerson,
    })
  }
}
