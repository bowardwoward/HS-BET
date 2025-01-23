/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    this.$extends({
      query: {
        user: {
          $allOperations({ operation, args, query }) {
            if (
              ['create', 'update'].includes(String(operation)) &&
              // @ts-expect-error shallow types
              args.data['password']
            ) {
              // @ts-expect-error shallow types
              args.data['password'] = bcrypt.hashSync(
                // @ts-expect-error shallow types
                args.data?.['password'],
                10,
              );
            }
            return query(args);
          },
        },
      },
    });
  }
}
