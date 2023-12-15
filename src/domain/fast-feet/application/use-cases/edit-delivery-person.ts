import { State } from '@/core/types/state'
import { Either, left, right } from '@/core/types/either'
import { DeliveryPerson } from '../../enterprise/entities/DeliveryPerson'
import { HashGenerator } from '../cryptography/hash-generator'
import { DeliveryPeopleRepository } from '../repositories/delivery-people-repository'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { DeliveryPersonAlreadyExistsError } from './errors/delivery-person-already-exists-error'
import { Injectable } from '@nestjs/common'

interface EditDeliveryPersonUseCaseRequest {
  id: string
  name: string
  email: string
  cpf: string
  password: string
  address: string
  district: string
  city: string
  state: State
  isActive: boolean
}

type EditDeliveryPersonUseCaseResponse = Either<
  ResourceNotFoundError | DeliveryPersonAlreadyExistsError,
  {
    deliveryPerson: DeliveryPerson
  }
>
@Injectable()
export class EditDeliveryPersonUseCase {
  constructor(
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({
    id,
    name,
    email,
    cpf,
    password,
    address,
    district,
    city,
    state,
    isActive,
  }: EditDeliveryPersonUseCaseRequest): Promise<EditDeliveryPersonUseCaseResponse> {
    const deliveryPerson = await this.deliveryPeopleRepository.findById(id)

    if (!deliveryPerson) {
      return left(new ResourceNotFoundError())
    }

    if (deliveryPerson.cpf !== cpf) {
      const deliveryPersonWithSameCPF =
        await this.deliveryPeopleRepository.findByCPF(cpf)

      if (deliveryPersonWithSameCPF) {
        return left(new DeliveryPersonAlreadyExistsError(cpf))
      }
    }

    deliveryPerson.name = name
    deliveryPerson.email = email
    deliveryPerson.cpf = cpf
    deliveryPerson.password = await this.hashGenerator.hash(password)
    deliveryPerson.address = address
    deliveryPerson.district = district
    deliveryPerson.city = city
    deliveryPerson.state = state
    deliveryPerson.isActive = isActive

    await this.deliveryPeopleRepository.save(deliveryPerson)

    return right({
      deliveryPerson,
    })
  }
}
