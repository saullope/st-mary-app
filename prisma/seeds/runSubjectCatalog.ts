// Siembra solo el catálogo de clases, sin tocar el resto de datos semilla:
// npx ts-node --compiler-options {"module":"CommonJS"} prisma/seeds/runSubjectCatalog.ts
import { PrismaClient } from '@prisma/client'
import { seedSubjectCatalog } from './subjectCatalog'

const prisma = new PrismaClient()

seedSubjectCatalog(prisma)
  .then(async () => {
    console.log(`Subject catalog: ${await prisma.ludiMateria.count()} subjects.`)
  })
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
