import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { RegisterRecipientUseCase } from './register-recipient'

let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let sut: RegisterRecipientUseCase

describe('Register recipient', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
    sut = new RegisterRecipientUseCase(inMemoryRecipientsRepository)
  })

  it('should be able to register a recipient', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      address: 'john doe street, 450',
      district: 'center',
      city: 'example city',
      state: 'RO',
      zipcode: '11222000',
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryRecipientsRepository.items[0]).toEqual(
        result.value.recipient,
      )
    }
  })
})
