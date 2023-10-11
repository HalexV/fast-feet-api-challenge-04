import { Either, right } from '@/core/types/either'
import { DeliveryPerson } from '../../enterprise/entities/DeliveryPerson'
import { DeliveryPeopleRepository } from '../repositories/delivery-people-repository'

interface FetchDeliveryPeopleUseCaseRequest {
  page: number
}

type FetchDeliveryPeopleUseCaseResponse = Either<
  null,
  {
    deliveryPeople: DeliveryPerson[]
  }
>

export class FetchDeliveryPeopleUseCase {
  constructor(
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
  ) {}

  async execute({
    page,
  }: FetchDeliveryPeopleUseCaseRequest): Promise<FetchDeliveryPeopleUseCaseResponse> {
    const deliveryPeople = await this.deliveryPeopleRepository.findMany({
      page,
    })

    return right({
      deliveryPeople,
    })
  }
}
