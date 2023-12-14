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

@Module({
  imports: [CryptographyModule],
  controllers: [
    AuthenticateAdminController,
    AuthenticateDeliveryPersonController,
    RegisterAdminController,
    RegisterDeliveryPersonController,
  ],
  providers: [
    AuthenticateAdminUseCase,
    AuthenticateDeliveryPersonUseCase,
    RegisterAdminUseCase,
    RegisterDeliveryPersonUseCase,
  ],
})
export class HttpModule {}
