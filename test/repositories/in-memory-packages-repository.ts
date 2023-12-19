import {
  FindManyByAddressAndDeliveryPersonIdParams,
  FindManyDeliveredByDeliveryPersonIdParams,
  PackagesRepository,
} from '@/domain/fast-feet/application/repositories/packages-repository'
import { Package } from '@/domain/fast-feet/enterprise/entities/Package'
import { InMemoryPhotosRepository } from './in-memory-photos-repository'
import { DomainEvents } from '@/core/events/domain-events'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { InMemoryRecipientsRepository } from './in-memory-recipients-repository'
import { PackageWithRecipient } from '@/domain/fast-feet/enterprise/entities/value-objects/package-with-recipient'

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

  async findByIdWithRecipient(
    id: string,
  ): Promise<PackageWithRecipient | null> {
    const pkg = this.items.find((pkg) => pkg.id.toString() === id)

    if (!pkg) return null

    const recipient = this.recipientsRepository.items.find(
      (recipient) => recipient.id === pkg.recipientId,
    )

    if (!recipient) {
      throw new Error(
        `Recipient with ID ${pkg.recipientId.toString()} does not exist.`,
      )
    }

    return PackageWithRecipient.create({
      packageId: pkg.id,
      description: pkg.description,
      postedAt: pkg.postedAt,
      recipientId: pkg.recipientId,
      status: pkg.status,
      deliveredAt: pkg.deliveredAt,
      deliveryPersonId: pkg.deliveryPersonId,
      withdrewAt: pkg.withdrewAt,
      updatedAt: pkg.updatedAt,
      recipient: recipient.name,
      address: recipient.address,
      city: recipient.city,
      district: recipient.district,
      state: recipient.state,
      zipcode: recipient.zipcode,
    })
  }

  async findMany({ page }: PaginationParams): Promise<Package[]> {
    return this.items
      .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
      .slice((page - 1) * 20, page * 20)
  }

  async findManyDeliveredByDeliveryPersonId({
    page,
    deliveryPersonId,
  }: FindManyDeliveredByDeliveryPersonIdParams): Promise<Package[]> {
    return this.items
      .filter((pkg) => {
        if (pkg.status === 'delivered') {
          if (pkg.deliveryPersonId) {
            if (pkg.deliveryPersonId.toString() === deliveryPersonId) {
              return true
            }
          }
        }

        return false
      })
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

  async findSomeNotDeliveredByRecipientId(
    recipientId: string,
  ): Promise<Package | null> {
    const pkg = this.items.find(
      (pkg) =>
        pkg.status !== 'delivered' &&
        pkg.deliveredAt == null &&
        pkg.recipientId.toString() === recipientId,
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
