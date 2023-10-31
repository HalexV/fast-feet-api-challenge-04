import { PackagesRepository } from '@/domain/fast-feet/application/repositories/packages-repository'
import { Package } from '@/domain/fast-feet/enterprise/entities/Package'
import { InMemoryPhotosRepository } from './in-memory-photos-repository'
import { DomainEvents } from '@/core/events/domain-events'

export class InMemoryPackagesRepository implements PackagesRepository {
  constructor(private readonly photosRepository: InMemoryPhotosRepository) {}

  public items: Package[] = []

  async findSomeNotDelivered(): Promise<Package | null> {
    const pkg = this.items.find(
      (pkg) => pkg.status !== 'delivered' && pkg.deliveredAt == null,
    )

    if (!pkg) {
      return null
    }

    return pkg
  }

  async create(pkg: Package): Promise<void> {
    this.items.push(pkg)

    DomainEvents.dispatchEventsForAggregate(pkg.id)
  }

  async save(pkg: Package): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id.toString() === pkg.id.toString(),
    )

    this.items[itemIndex] = pkg
  }

  async deleteManyByRecipientId(recipientId: string): Promise<void> {
    const pkgs: Package[] = []

    for (const pkg of this.items) {
      if (pkg.recipientId.toString() === recipientId) {
        await this.photosRepository.deleteByPackageId(pkg.id.toString())
      } else {
        pkgs.push(pkg)
      }
    }

    this.items = pkgs
  }
}
