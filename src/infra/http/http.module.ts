import { Module } from '@nestjs/common'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { AuthenticateAdminController } from './controllers/authenticate-admin.controller'
import { AuthenticateAdminUseCase } from '@/domain/fast-feet/application/use-cases/authenticate-admin'
import { AuthenticateDeliveryPersonController } from './controllers/authenticate-delivery-person.controller'
import { AuthenticateDeliveryPersonUseCase } from '@/domain/fast-feet/application/use-cases/authenticate-delivery-person'
import { RegisterAdminController } from './controllers/register-admin.controller'
import { RegisterAdminUseCase } from '@/domain/fast-feet/application/use-cases/register-admin'
import { RegisterDeliveryPersonController } from './controllers/register-delivery-person.controller'
import { RegisterDeliveryPersonUseCase } from '@/domain/fast-feet/application/use-cases/register-delivery-person'
import { GetDeliveryPersonController } from './controllers/get-delivery-person.controller'
import { GetDeliveryPersonUseCase } from '@/domain/fast-feet/application/use-cases/get-delivery-person'
import { FetchDeliveryPeopleController } from './controllers/fetch-delivery-people.controller'
import { FetchDeliveryPeopleUseCase } from '@/domain/fast-feet/application/use-cases/fetch-delivery-people'

@Module({
  imports: [CryptographyModule],
  controllers: [
    AuthenticateAdminController,
    AuthenticateDeliveryPersonController,
    RegisterAdminController,
    RegisterDeliveryPersonController,
    GetDeliveryPersonController,
    FetchDeliveryPeopleController,
  ],
  providers: [
    AuthenticateAdminUseCase,
    AuthenticateDeliveryPersonUseCase,
    RegisterAdminUseCase,
    RegisterDeliveryPersonUseCase,
    GetDeliveryPersonUseCase,
    FetchDeliveryPeopleUseCase,
  ],
})
export class HttpModule {}
