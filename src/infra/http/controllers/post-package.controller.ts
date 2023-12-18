import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { ApiBody, ApiCreatedResponse } from '@nestjs/swagger'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { PostPackageUseCase } from '@/domain/fast-feet/application/use-cases/post-package'
import { PostPackageDto } from './dtos/post-package.dto'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PackagePresenter } from '../presenters/package-presenter'
import { PostPackageResponseModel } from './models/responses/post-package-response-model'

const postPackageBodySchema = z.object({
  description: z.string(),
  recipientId: z.string().uuid(),
})

type PostPackageBodySchema = z.infer<typeof postPackageBodySchema>

@Controller('/packages')
@Roles(Role.Admin)
export class PostPackageController {
  constructor(private readonly postPackage: PostPackageUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(postPackageBodySchema))
  @ApiBody({ type: PostPackageDto })
  @ApiCreatedResponse({ type: PostPackageResponseModel })
  async handle(@Body() body: PostPackageBodySchema) {
    const { description, recipientId } = body

    const result = await this.postPackage.execute({
      description,
      recipientId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return {
      package: PackagePresenter.toHTTP(result.value.pkg),
    }
  }
}
