import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { RegisterNotificationUseCase } from './register-notification'

let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let sut: RegisterNotificationUseCase

describe('Register notification', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    sut = new RegisterNotificationUseCase(inMemoryNotificationsRepository)
  })

  it('should be able to register a notification', async () => {
    const result = await sut.execute({
      title: 'New notification',
      content: 'Notification content',
      recipientId: '1',
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryNotificationsRepository.items[0]).toEqual(
        result.value.notification,
      )
    }
  })
})
