import { Admin } from '../../enterprise/entities/Admin'

export abstract class AdminsRepository {
  abstract findByCPF(cpf: string): Promise<Admin | null>
  abstract create(admin: Admin): Promise<void>
}
