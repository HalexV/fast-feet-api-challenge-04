import { State } from '@/core/types/state'
import { Either, left, right } from '@/core/types/either'
import { Admin } from '../../enterprise/entities/Admin'
import { AdminsRepository } from '../repositories/admins-repository'
import { HashGenerator } from '../cryptography/hash-generator'
import { AdminAlreadyExistsError } from './errors/admin-already-exists-error'
import { Injectable } from '@nestjs/common'

interface RegisterAdminUseCaseRequest {
  name: string
  email: string
  cpf: string
  password: string
  address: string
  district: string
  city: string
  state: State
}

type RegisterAdminUseCaseResponse = Either<
  AdminAlreadyExistsError,
  {
    admin: Admin
  }
>
@Injectable()
export class RegisterAdminUseCase {
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
  }: RegisterAdminUseCaseRequest): Promise<RegisterAdminUseCaseResponse> {
    const adminWithSameCPF = await this.adminsRepository.findByCPF(cpf)

    if (adminWithSameCPF) {
      return left(new AdminAlreadyExistsError(cpf))
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
