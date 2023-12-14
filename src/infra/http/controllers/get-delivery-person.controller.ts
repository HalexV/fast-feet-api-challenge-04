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
import { GetDeliveryPersonUseCase } from '@/domain/fast-feet/application/use-cases/get-delivery-person'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { DeliveryPersonPresenter } from '../presenters/delivery-person-presenter'
import { DeliveryPersonResponseModel } from './models/responses/delivery-person-response-model'

@Controller('/delivery-people/:id')
@Roles(Role.Admin)
export class GetDeliveryPersonController {
  constructor(private readonly getDeliveryPerson: GetDeliveryPersonUseCase) {}

  @Get()
  @HttpCode(200)
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: DeliveryPersonResponseModel })
  async handle(@Param('id') id: string) {
    const result = await this.getDeliveryPerson.execute({
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
      deliveryPerson: DeliveryPersonPresenter.toHTTP(
        result.value.deliveryPerson,
      ),
    }
  }
}
