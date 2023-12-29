import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  ForbiddenException,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PackageStatusNotAllowedError } from '@/domain/fast-feet/application/use-cases/errors/package-status-not-allowed-error'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { UploadPhotoAndMarkPackageAsDeliveredUseCase } from '@/domain/fast-feet/application/use-cases/upload-photo-and-mark-package-as-delivered'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { InvalidPhotoTypeError } from '@/domain/fast-feet/application/use-cases/errors/invalid-photo-type-error'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploadPhotoAndMarkPackageAsDeliveredDto } from './dtos/upload-photo-and-mark-package-as-delivered.dto'

@Controller('/packages/:id/mark-package-as-delivered')
@Roles(Role.DeliveryPerson)
export class UploadPhotoAndMarkPackageAsDeliveredController {
  constructor(
    private readonly uploadPhotoAndMarkPackageAsDelivered: UploadPhotoAndMarkPackageAsDeliveredUseCase,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadPhotoAndMarkPackageAsDeliveredDto })
  @ApiParam({ name: 'id', type: 'string' })
  async handle(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 2, // 2mb
          }),
          new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const deliveryPersonId = user.sub

    const result = await this.uploadPhotoAndMarkPackageAsDelivered.execute({
      id,
      deliveryPersonId,
      filename: file.originalname,
      fileType: file.mimetype,
      body: file.buffer,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case PackageStatusNotAllowedError:
          throw new BadRequestException(error.message)
        case InvalidPhotoTypeError:
          throw new BadRequestException(error.message)
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
