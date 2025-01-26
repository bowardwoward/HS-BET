import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const testUser = await prisma.user.create({
    data: {
      email: 'abgaoe@gmail.com',
      password: '$2a$10$krb4Z.TDESUemfXdx5M/Iuaykj.yjP6JNRnBRpouKAKld18ETIobu',
      username: 'test',
      mobile: '09953875103',
      accountNumber: '000001012',
    },
  });

  console.log(testUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    // close Prisma Client at the end
    void prisma.$disconnect();
  });
