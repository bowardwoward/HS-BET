import { Injectable } from '@nestjs/common';
import { EnvService } from '@/env/env.service';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private readonly configService: EnvService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('PG_HOST'),
      port: this.configService.get('PG_PORT'),
      username: this.configService.get('PG_USER'),
      password: this.configService.get('PG_PASSWORD'),
      database: this.configService.get('PG_DB'),
      autoLoadEntities: true,
      synchronize: this.configService.get('NODE_ENV') === 'local',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    };
  }
}
