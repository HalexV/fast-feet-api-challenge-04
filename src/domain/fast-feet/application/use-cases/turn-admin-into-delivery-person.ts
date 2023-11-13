import { Either, left, right } from '@/core/types/either'
import { DeliveryPerson } from '../../enterprise/entities/DeliveryPerson'
import { DeliveryPeopleRepository } from '../repositories/delivery-people-repository'
import { AdminsRepository } from '../repositories/admins-repository'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

interface TurnAdminIntoDeliveryPersonUseCaseRequest {
  adminId: string
}

type TurnAdminIntoDeliveryPersonUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    deliveryPerson: DeliveryPerson
  }
>

export class TurnAdminIntoDeliveryPersonUseCase {
  constructor(
    private readonly adminsRepository: AdminsRepository,
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
  ) {}

  async execute({
    adminId,
  }: TurnAdminIntoDeliveryPersonUseCaseRequest): Promise<TurnAdminIntoDeliveryPersonUseCaseResponse> {
    const admin = await this.adminsRepository.findById(adminId)

    if (!admin) {
      return left(new ResourceNotFoundError())
    }

    const deliveryPerson = DeliveryPerson.create({
      name: admin.name,
      email: admin.email,
      cpf: admin.cpf,
      password: admin.password,
      address: admin.address,
      district: admin.district,
      city: admin.city,
      state: admin.state,
    })

    await this.deliveryPeopleRepository.create(deliveryPerson)

    return right({
      deliveryPerson,
    })
  }
}
