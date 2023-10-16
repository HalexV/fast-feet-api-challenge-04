import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { EditRecipientUseCase } from './edit-recipient'
import { makeRecipient } from 'test/factories/make-recipient'
import { RecipientAlreadyExistsError } from './errors/recipient-already-exists-error'

let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let sut: EditRecipientUseCase

describe('Edit delivery person', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    sut = new EditRecipientUseCase(inMemoryRecipientsRepository)
  })

  it('should be able to edit a recipient', async () => {
    const recipient = makeRecipient()

    inMemoryRecipientsRepository.items.push(recipient)

    const result = await sut.execute({
      id: recipient.id.toString(),
      name: 'John Doe',
      email: 'johndoe@example.com',
      address: 'john doe street',
      district: 'center',
      city: 'John Doe City',
      state: 'AC',
      zipcode: '00111222',
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryRecipientsRepository.items[0]).toMatchObject({
        name: 'John Doe',
        email: 'johndoe@example.com',
        address: 'john doe street',
        district: 'center',
        city: 'John Doe City',
        state: 'AC',
        zipcode: '00111222',
      })
    }
  })

  it('should not be able to edit an email to another that already exists', async () => {
    const recipient1 = makeRecipient({
      email: 'johndoe@example.com',
    })

    const recipient2 = makeRecipient()

    inMemoryRecipientsRepository.items.push(recipient1)
    inMemoryRecipientsRepository.items.push(recipient2)

    const result = await sut.execute({
      id: recipient2.id.toString(),
      name: 'John Doe',
      email: 'johndoe@example.com',
      address: 'john doe street',
      district: 'center',
      city: 'John Doe City',
      state: 'AC',
      zipcode: '00111222',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(RecipientAlreadyExistsError)
    }
  })

  it('should not be able to edit a recipient that does not exist', async () => {
    const recipient = makeRecipient()

    inMemoryRecipientsRepository.items.push(recipient)

    const result = await sut.execute({
      id: 'non-existent-id',
      name: 'John Doe',
      email: 'johndoe@example.com',
      address: 'john doe street',
      district: 'center',
      city: 'John Doe City',
      state: 'AC',
      zipcode: '00111222',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
