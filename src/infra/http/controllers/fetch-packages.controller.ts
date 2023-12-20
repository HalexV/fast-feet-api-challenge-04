import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { FetchPackagesUseCase } from '@/domain/fast-feet/application/use-cases/fetch-packages'
import { PackageWithRecipientPresenter } from '../presenters/package-with-recipient-presenter'
import { FetchPackagesResponseModel } from './models/responses/fetch-packages-response-model'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/packages')
@Roles(Role.Admin)
export class FetchPackagesController {
  constructor(private readonly fetchPackages: FetchPackagesUseCase) {}

  @Get()
  @ApiQuery({ name: 'page', type: 'string' })
  @ApiOkResponse({ type: FetchPackagesResponseModel })
  async handle(@Query('page', queryValidationPipe) page: PageQueryParamSchema) {
    const result = await this.fetchPackages.execute({
      page,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const pkgs = result.value.pkgs

    return {
      packages: pkgs.map(PackageWithRecipientPresenter.toHTTP),
    }
  }
}
