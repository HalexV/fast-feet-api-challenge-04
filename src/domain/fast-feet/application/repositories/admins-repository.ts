import { Admin } from '../../enterprise/entities/Admin'

export abstract class AdminsRepository {
  abstract findById(id: string): Promise<Admin | null>
  abstract findByCPF(cpf: string): Promise<Admin | null>
  abstract create(admin: Admin): Promise<void>
  abstract save(admin: Admin): Promise<void>
}
