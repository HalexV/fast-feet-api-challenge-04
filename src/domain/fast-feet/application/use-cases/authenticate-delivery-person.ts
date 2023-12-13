import { Either, left, right } from '@/core/types/either'
import { HashComparer } from '../cryptography/hash-comparer'
import { Encrypter } from '../cryptography/encrypter'
import { WrongCredentialsError } from './errors/wrong-credentials-error'
import { DeliveryPeopleRepository } from '../repositories/delivery-people-repository'
import { Role } from '@/core/types/role.enum'
import { Injectable } from '@nestjs/common'

interface AuthenticateDeliveryPersonUseCaseRequest {
  cpf: string
  password: string
}

type AuthenticateDeliveryPersonUseCaseResponse = Either<
  WrongCredentialsError,
  {
    accessToken: string
  }
>
@Injectable()
export class AuthenticateDeliveryPersonUseCase {
  constructor(
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
  ) {}

  async execute({
    cpf,
    password,
  }: AuthenticateDeliveryPersonUseCaseRequest): Promise<AuthenticateDeliveryPersonUseCaseResponse> {
    const deliveryPerson = await this.deliveryPeopleRepository.findByCPF(cpf)

    if (!deliveryPerson) {
      return left(new WrongCredentialsError())
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      deliveryPerson.password,
    )

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: deliveryPerson.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    return right({
      accessToken,
    })
  }
}
