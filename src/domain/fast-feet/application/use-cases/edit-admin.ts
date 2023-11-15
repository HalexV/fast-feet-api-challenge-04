import { State } from '@/core/types/state'
import { Either, left, right } from '@/core/types/either'
import { HashGenerator } from '../cryptography/hash-generator'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Admin } from '../../enterprise/entities/Admin'
import { AdminAlreadyExistsError } from './errors/admin-already-exists-error'
import { AdminsRepository } from '../repositories/admins-repository'

interface EditAdminUseCaseRequest {
  id: string
  name: string
  email: string
  cpf: string
  password: string
  address: string
  district: string
  city: string
  state: State
}

type EditAdminUseCaseResponse = Either<
  ResourceNotFoundError | AdminAlreadyExistsError,
  {
    admin: Admin
  }
>

export class EditAdminUseCase {
  constructor(
    private readonly adminsRepository: AdminsRepository,
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
  }: EditAdminUseCaseRequest): Promise<EditAdminUseCaseResponse> {
    const admin = await this.adminsRepository.findById(id)

    if (!admin) {
      return left(new ResourceNotFoundError())
    }

    if (admin.cpf !== cpf) {
      const adminWithSameCPF = await this.adminsRepository.findByCPF(cpf)

      if (adminWithSameCPF) {
        return left(new AdminAlreadyExistsError(cpf))
      }
    }

    admin.name = name
    admin.email = email
    admin.cpf = cpf
    admin.password = await this.hashGenerator.hash(password)
    admin.address = address
    admin.district = district
    admin.city = city
    admin.state = state

    await this.adminsRepository.save(admin)

    return right({
      admin,
    })
  }
}
