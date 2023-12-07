import { State } from '@/core/types/state'
import { Either, right } from '@/core/types/either'
import { Admin } from '../../enterprise/entities/Admin'
import { AdminsRepository } from '../repositories/admins-repository'
import { HashGenerator } from '../cryptography/hash-generator'
import { AdminAlreadyExistsError } from './errors/admin-already-exists-error'
import { Injectable } from '@nestjs/common'

interface RegisterDefaultAdminUseCaseRequest {
  name: string
  email: string
  cpf: string
  password: string
  address: string
  district: string
  city: string
  state: State
}

type RegisterDefaultAdminUseCaseResponse = Either<
  AdminAlreadyExistsError,
  null | {
    admin: Admin
  }
>

@Injectable()
export class RegisterDefaultAdminUseCase {
  constructor(
    private readonly adminsRepository: AdminsRepository,
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
  }: RegisterDefaultAdminUseCaseRequest): Promise<RegisterDefaultAdminUseCaseResponse> {
    const someAdminExist = await this.adminsRepository.findOne()

    if (someAdminExist) {
      return right(null)
    }

    const hashedPassword = await this.hashGenerator.hash(password)

    const admin = Admin.create({
      name,
      email,
      cpf,
      password: hashedPassword,
      address,
      district,
      city,
      state,
    })

    await this.adminsRepository.create(admin)

    return right({
      admin,
    })
  }
}
