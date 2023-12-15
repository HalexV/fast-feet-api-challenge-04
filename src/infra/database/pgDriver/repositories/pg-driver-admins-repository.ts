import { AdminsRepository } from '@/domain/fast-feet/application/repositories/admins-repository'
import { Admin } from '@/domain/fast-feet/enterprise/entities/Admin'
import { PgDriverService } from '../pgDriver.service'
import { PgDriverAdminMapper } from '../mappers/pg-driver-admin-mapper'
import { Injectable } from '@nestjs/common'
import { EnvService } from '@/infra/env/env.service'

@Injectable()
export class PgDriverAdminsRepository implements AdminsRepository {
  private readonly schema: string

  constructor(
    private readonly pgDriver: PgDriverService,
    private readonly envService: EnvService,
  ) {
    this.schema = this.envService.get('DATABASE_SCHEMA')
  }

  async findById(id: string): Promise<Admin | null> {
    const result = await this.pgDriver.runQuery(
      `
    SELECT * FROM "${this.schema}"."users" WHERE id=$1 LIMIT 1;
    `,
      [id],
    )

    const data = result.rows[0]

    if (!data) return null

    return PgDriverAdminMapper.toDomain(data)
  }

  async findByCPF(cpf: string): Promise<Admin | null> {
    const result = await this.pgDriver.runQuery(
      `
    SELECT * FROM "${this.schema}"."users" WHERE cpf=$1 LIMIT 1;
    `,
      [cpf],
    )

    const data = result.rows[0]

    if (!data) return null

    return PgDriverAdminMapper.toDomain(data)
  }

  async findOne(): Promise<Admin | null> {
    const result = await this.pgDriver.runQuery(`
    SELECT * FROM "${this.schema}"."users" LIMIT 1;
    `)

    const data = result.rows[0]

    if (!data) return null

    return PgDriverAdminMapper.toDomain(data)
  }

  async create(admin: Admin): Promise<void> {
    const data = PgDriverAdminMapper.toPgDriver(admin)

    await this.pgDriver.runQuery(
      `
    INSERT INTO "${this.schema}"."users" (
      id,
      name,
      email,
      cpf,
      password,
      address,
      district,
      state,
      city,
      created_at,
      updated_at,
      roles
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12
    );
    `,
      [
        data.id,
        data.name,
        data.email,
        data.cpf,
        data.password,
        data.address,
        data.district,
        data.state,
        data.city,
        data.created_at,
        data.updated_at,
        data.roles,
      ],
    )
  }

  async save(admin: Admin): Promise<void> {
    const data = PgDriverAdminMapper.toPgDriver(admin)

    await this.pgDriver.runQuery(
      `
    UPDATE "${this.schema}"."users" SET 
      name = $2,
      email = $3,
      cpf = $4,
      password = $5,
      address = $6,
      district = $7,
      state = $8,
      city = $9,
      created_at = $10,
      updated_at = $11,
      roles = $12
      
    WHERE id=$1;
    `,
      [
        data.id,
        data.name,
        data.email,
        data.cpf,
        data.password,
        data.address,
        data.district,
        data.state,
        data.city,
        data.created_at,
        data.updated_at,
        data.roles,
      ],
    )
  }
}
