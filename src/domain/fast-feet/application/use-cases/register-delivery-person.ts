import { State } from '@/core/types/state'
import { Either, left, right } from '@/core/types/either'
import { DeliveryPerson } from '../../enterprise/entities/DeliveryPerson'
import { HashGenerator } from '../cryptography/hash-generator'
import { DeliveryPersonAlreadyExistsError } from './errors/delivery-person-already-exists-error'
import { DeliveryPeopleRepository } from '../repositories/delivery-people-repository'

interface RegisterDeliveryPersonUseCaseRequest {
  name: string
  email: string
  cpf: string
  password: string
  address: string
  district: string
  city: string
  state: State
}

type RegisterDeliveryPersonUseCaseResponse = Either<
  DeliveryPersonAlreadyExistsError,
  {
    deliveryPerson: DeliveryPerson
  }
>

export class RegisterDeliveryPersonUseCase {
  constructor(
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    email,
    cpf,
    password,
    address,
    district,
    city,
    state,
  }: RegisterDeliveryPersonUseCaseRequest): Promise<RegisterDeliveryPersonUseCaseResponse> {
    const deliveryPersonWithSameCPF =
      await this.deliveryPeopleRepository.findByCPF(cpf)

    if (deliveryPersonWithSameCPF) {
      return left(new DeliveryPersonAlreadyExistsError(cpf))
    }

    const hashedPassword = await this.hashGenerator.hash(password)

    const deliveryPerson = DeliveryPerson.create({
      name,
      email,
      cpf,
      password: hashedPassword,
      address,
      district,
      city,
      state,
    })

    await this.deliveryPeopleRepository.create(deliveryPerson)

    return right({
      deliveryPerson,
    })
  }
}
