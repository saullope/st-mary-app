// Siembra solo el catálogo de logros, sin tocar el resto de datos semilla:
// npx ts-node --compiler-options {"module":"CommonJS"} prisma/seeds/runAchievementCatalog.ts
import { PrismaClient } from '@prisma/client'
import { seedAchievementCatalog } from './achievementCatalog'

const prisma = new PrismaClient()

seedAchievementCatalog(prisma)
  .then(async () => {
    console.log(`Achievement catalog: ${await prisma.ludiInsignia.count()} badges, ${await prisma.ludiMision.count()} missions.`)
  })
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
