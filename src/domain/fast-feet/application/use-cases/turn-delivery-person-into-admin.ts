import { Either, left, right } from '@/core/types/either'
import { DeliveryPeopleRepository } from '../repositories/delivery-people-repository'
import { AdminsRepository } from '../repositories/admins-repository'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Admin } from '../../enterprise/entities/Admin'

interface TurnDeliveryPersonIntoAdminUseCaseRequest {
  deliveryPersonId: string
}

type TurnDeliveryPersonIntoAdminUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    admin: Admin
  }
>

export class TurnDeliveryPersonIntoAdminUseCase {
  constructor(
    private readonly adminsRepository: AdminsRepository,
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
  ) {}

  async execute({
    deliveryPersonId,
  }: TurnDeliveryPersonIntoAdminUseCaseRequest): Promise<TurnDeliveryPersonIntoAdminUseCaseResponse> {
    const deliveryPerson =
      await this.deliveryPeopleRepository.findById(deliveryPersonId)

    if (!deliveryPerson) {
      return left(new ResourceNotFoundError())
    }

    const admin = Admin.create({
      name: deliveryPerson.name,
      email: deliveryPerson.email,
      cpf: deliveryPerson.cpf,
      password: deliveryPerson.password,
      address: deliveryPerson.address,
      district: deliveryPerson.district,
      city: deliveryPerson.city,
      state: deliveryPerson.state,
    })

    await this.adminsRepository.create(admin)

    return right({
      admin,
    })
  }
}
