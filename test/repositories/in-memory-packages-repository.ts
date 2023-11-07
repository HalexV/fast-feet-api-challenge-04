import {
  FindManyByAddressAndDeliveryPersonIdParams,
  PackagesRepository,
} from '@/domain/fast-feet/application/repositories/packages-repository'
import { Package } from '@/domain/fast-feet/enterprise/entities/Package'
import { InMemoryPhotosRepository } from './in-memory-photos-repository'
import { DomainEvents } from '@/core/events/domain-events'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { InMemoryRecipientsRepository } from './in-memory-recipients-repository'

export class InMemoryPackagesRepository implements PackagesRepository {
  constructor(
    private readonly photosRepository: InMemoryPhotosRepository,
    private readonly recipientsRepository: InMemoryRecipientsRepository,
  ) {}

  public items: Package[] = []

  async findById(id: string): Promise<Package | null> {
    const pkg = this.items.find((pkg) => pkg.id.toString() === id)

    if (!pkg) return null

    return pkg
  }

  async findMany({ page }: PaginationParams): Promise<Package[]> {
    return this.items
      .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
      .slice((page - 1) * 20, page * 20)
  }

  async findManyPendingByAddressAndDeliveryPersonId({
    city,
    deliveryPersonId,
    page,
    state,
    district,
  }: FindManyByAddressAndDeliveryPersonIdParams): Promise<Package[]> {
    const pkgs: Package[] = []

    for (const pkg of this.items) {
      const recipient = await this.recipientsRepository.findById(
        pkg.recipientId.toString(),
      )

      if (!recipient) return []

      if (
        recipient.city.toLocaleLowerCase() === city.toLocaleLowerCase() &&
        recipient.state.toLocaleLowerCase() === state.toLocaleLowerCase()
      ) {
        if (
          pkg.status === 'withdrew' &&
          pkg.deliveryPersonId?.toString() === deliveryPersonId
        ) {
          if (district) {
            if (
              district.toLocaleLowerCase() ===
              recipient.district.toLocaleLowerCase()
            ) {
              pkgs.push(pkg)
            } else {
              continue
            }
          } else {
            pkgs.push(pkg)
          }
        } else {
          if (pkg.status === 'waiting') {
            if (district) {
              if (
                district.toLocaleLowerCase() ===
                recipient.district.toLocaleLowerCase()
              ) {
                pkgs.push(pkg)
              } else {
                continue
              }
            } else {
              pkgs.push(pkg)
            }
          }
        }
      }
    }

    return pkgs
      .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
      .slice((page - 1) * 20, page * 20)
  }

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

    DomainEvents.dispatchEventsForAggregate(pkg.id)
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

  async delete(pkg: Package): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id.toString() === pkg.id.toString(),
    )

    this.items.splice(itemIndex, 1)

    await this.photosRepository.deleteByPackageId(pkg.id.toString())
  }
}
