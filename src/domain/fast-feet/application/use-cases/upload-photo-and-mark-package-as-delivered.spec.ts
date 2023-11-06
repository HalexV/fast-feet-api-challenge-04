import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { makePackage } from 'test/factories/make-package'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'
import { UploadPhotoAndMarkPackageAsDeliveredUseCase } from './upload-photo-and-mark-package-as-delivered'
import { FakeUploader } from 'test/storage/fake-uploader'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let fakeUploader: FakeUploader
let sut: UploadPhotoAndMarkPackageAsDeliveredUseCase

describe('Upload photo and mark package as delivered', () => {
  beforeEach(() => {
    inMemoryPhotosRepository = new InMemoryPhotosRepository()
    inMemoryPackagesRepository = new InMemoryPackagesRepository(
      inMemoryPhotosRepository,
    )
    inMemoryDeliveryPeopleRepository = new InMemoryDeliveryPeopleRepository()
    fakeUploader = new FakeUploader()

    sut = new UploadPhotoAndMarkPackageAsDeliveredUseCase(
      inMemoryPackagesRepository,
      inMemoryPhotosRepository,
      fakeUploader,
    )
  })

  it('should be able to upload a photo and mark package as delivered', async () => {
    const deliveryPerson = makeDeliveryPerson()

    const pkg = makePackage({
      status: 'withdrew',
      deliveryPersonId: deliveryPerson.id,
    })

    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)
    await inMemoryPackagesRepository.create(pkg)

    const result = await sut.execute({
      id: pkg.id.toString(),
      deliveryPersonId: deliveryPerson.id.toString(),
      filename: 'delivered.png',
      fileType: 'image/png',
      body: Buffer.from(''),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryPackagesRepository.items[0]).toEqual(
        expect.objectContaining({
          status: 'delivered',
          deliveryPersonId: deliveryPerson.id,
          deliveredAt: expect.any(Date),
        }),
      )
      expect(inMemoryPhotosRepository.items[0]).toEqual(
        expect.objectContaining({
          filename: 'randomId-delivered.png',
          packageId: pkg.id,
        }),
      )
    }
  })
})
