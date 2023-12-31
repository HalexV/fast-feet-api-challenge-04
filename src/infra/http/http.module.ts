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
import { EditDeliveryPersonController } from './controllers/edit-delivery-person.controller'
import { EditDeliveryPersonUseCase } from '@/domain/fast-feet/application/use-cases/edit-delivery-person'
import { EditAdminController } from './controllers/edit-admin.controller'
import { EditAdminUseCase } from '@/domain/fast-feet/application/use-cases/edit-admin'
import { RegisterRecipientController } from './controllers/register-recipient.controller'
import { RegisterRecipientUseCase } from '@/domain/fast-feet/application/use-cases/register-recipient'
import { GetRecipientController } from './controllers/get-recipient.controller'
import { GetRecipientUseCase } from '@/domain/fast-feet/application/use-cases/get-recipient'
import { FetchRecipientsController } from './controllers/fetch-recipients.controller'
import { FetchRecipientsUseCase } from '@/domain/fast-feet/application/use-cases/fetch-recipients'
import { EditRecipientController } from './controllers/edit-recipient.controller'
import { EditRecipientUseCase } from '@/domain/fast-feet/application/use-cases/edit-recipient'
import { RemoveRecipientController } from './controllers/remove-recipient.controller'
import { RemoveRecipientUseCase } from '@/domain/fast-feet/application/use-cases/remove-recipient'
import { PostPackageController } from './controllers/post-package.controller'
import { PostPackageUseCase } from '@/domain/fast-feet/application/use-cases/post-package'
import { GetPackageController } from './controllers/get-package.controller'
import { GetPackageUseCase } from '@/domain/fast-feet/application/use-cases/get-package'
import { FetchPackagesController } from './controllers/fetch-packages.controller'
import { FetchPackagesUseCase } from '@/domain/fast-feet/application/use-cases/fetch-packages'
import { EditPackageController } from './controllers/edit-package.controller'
import { EditPackageUseCase } from '@/domain/fast-feet/application/use-cases/edit-package'
import { DeletePackageController } from './controllers/delete-package.controller'
import { DeletePackageUseCase } from '@/domain/fast-feet/application/use-cases/delete-package'
import { MarkPackageAsWaitingController } from './controllers/mark-package-as-waiting.controller'
import { MarkPackageAsWaitingUseCase } from '@/domain/fast-feet/application/use-cases/mark-package-as-waiting'
import { WithdrawPackageController } from './controllers/withdraw-package.controller'
import { WithdrawPackageUseCase } from '@/domain/fast-feet/application/use-cases/withdraw-package'
import { ReturnPackageController } from './controllers/return-package.controller'
import { ReturnPackageUseCase } from '@/domain/fast-feet/application/use-cases/return-package'
import { FetchDeliveredPackagesByDeliveryPersonIdController } from './controllers/fetch-delivered-packages-by-delivery-person-id.controller'
import { FetchDeliveredPackagesByDeliveryPersonIdUseCase } from '@/domain/fast-feet/application/use-cases/fetch-delivered-packages-by-delivery-person-id'
import { FetchPackagesPendingNearDeliveryPersonController } from './controllers/fetch-packages-pending-near-delivery-person.controller'
import { FetchPackagesPendingNearDeliveryPersonUseCase } from '@/domain/fast-feet/application/use-cases/fetch-packages-pending-near-delivery-person'
import { StorageModule } from '../storage/storage.module'
import { UploadPhotoAndMarkPackageAsDeliveredController } from './controllers/upload-photo-and-mark-package-as-delivered.controller'
import { UploadPhotoAndMarkPackageAsDeliveredUseCase } from '@/domain/fast-feet/application/use-cases/upload-photo-and-mark-package-as-delivered'

@Module({
  imports: [CryptographyModule, StorageModule],
  controllers: [
    AuthenticateAdminController,
    AuthenticateDeliveryPersonController,
    RegisterAdminController,
    RegisterDeliveryPersonController,
    GetDeliveryPersonController,
    FetchDeliveryPeopleController,
    EditDeliveryPersonController,
    EditAdminController,
    RegisterRecipientController,
    GetRecipientController,
    FetchRecipientsController,
    EditRecipientController,
    RemoveRecipientController,
    PostPackageController,
    FetchDeliveredPackagesByDeliveryPersonIdController,
    FetchPackagesPendingNearDeliveryPersonController,
    GetPackageController,
    FetchPackagesController,
    EditPackageController,
    DeletePackageController,
    MarkPackageAsWaitingController,
    WithdrawPackageController,
    ReturnPackageController,
    UploadPhotoAndMarkPackageAsDeliveredController,
  ],
  providers: [
    AuthenticateAdminUseCase,
    AuthenticateDeliveryPersonUseCase,
    RegisterAdminUseCase,
    RegisterDeliveryPersonUseCase,
    GetDeliveryPersonUseCase,
    FetchDeliveryPeopleUseCase,
    EditDeliveryPersonUseCase,
    EditAdminUseCase,
    RegisterRecipientUseCase,
    GetRecipientUseCase,
    FetchRecipientsUseCase,
    EditRecipientUseCase,
    RemoveRecipientUseCase,
    PostPackageUseCase,
    GetPackageUseCase,
    FetchPackagesUseCase,
    EditPackageUseCase,
    DeletePackageUseCase,
    MarkPackageAsWaitingUseCase,
    WithdrawPackageUseCase,
    ReturnPackageUseCase,
    FetchDeliveredPackagesByDeliveryPersonIdUseCase,
    FetchPackagesPendingNearDeliveryPersonUseCase,
    UploadPhotoAndMarkPackageAsDeliveredUseCase,
  ],
})
export class HttpModule {}
