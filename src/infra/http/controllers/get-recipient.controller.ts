import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiOkResponse, ApiParam } from '@nestjs/swagger'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { GetRecipientUseCase } from '@/domain/fast-feet/application/use-cases/get-recipient'
import { RecipientPresenter } from '../presenters/recipient-presenter'
import { GetRecipientResponseModel } from './models/responses/get-recipient-response-model'

@Controller('/recipients/:id')
@Roles(Role.Admin)
export class GetRecipientController {
  constructor(private readonly getRecipient: GetRecipientUseCase) {}

  @Get()
  @HttpCode(200)
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: GetRecipientResponseModel })
  async handle(@Param('id') id: string) {
    const result = await this.getRecipient.execute({
      id,
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
      recipient: RecipientPresenter.toHTTP(result.value.recipient),
    }
  }
}
