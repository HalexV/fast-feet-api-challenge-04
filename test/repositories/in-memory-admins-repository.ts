import { AdminsRepository } from '@/domain/fast-feet/application/repositories/admins-repository'
import { Admin } from '@/domain/fast-feet/enterprise/entities/Admin'

export class InMemoryAdminsRepository implements AdminsRepository {
  public items: Admin[] = []

  async findById(id: string): Promise<Admin | null> {
    const admin = this.items.find((admin) => admin.id.toString() === id)

    if (!admin) {
      return null
    }

    return admin
  }

  async findByCPF(cpf: string): Promise<Admin | null> {
    const admin = this.items.find((admin) => admin.cpf === cpf)

    if (!admin) {
      return null
    }

    return admin
  }

  async findOne(): Promise<Admin | null> {
    const admin = this.items[0]

    if (!admin) {
      return null
    }

    return admin
  }

  async create(admin: Admin): Promise<void> {
    this.items.push(admin)
  }

  async save(admin: Admin): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id.toString() === admin.id.toString(),
    )

    this.items[itemIndex] = admin
  }
}
