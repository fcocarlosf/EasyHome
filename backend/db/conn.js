const PrismaClient = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // ... you will write your Prisma Client queries here
  console.log('Conectou ao prisma!')
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

module.exports =  prisma