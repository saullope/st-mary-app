import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Creating Filtered Unique Indexes in SQL Server...')

  // 1. Firebase UID Index
  try {
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX [IX_LUDI_USERS_firebaseUid] 
      ON [dbo].[LUDI_USERS]([firebase_uid]) 
      WHERE [firebase_uid] IS NOT NULL;
    `)
    console.log('✅ Index IX_LUDI_USERS_firebaseUid created.')
  } catch (e: any) {
    if (e.message.includes('already exists')) {
        console.log('⚠️ Index IX_LUDI_USERS_firebaseUid already exists.')
    } else {
        console.error('❌ Error creating IX_LUDI_USERS_firebaseUid:', e)
    }
  }

  // 2. Email Index
  try {
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX [IX_LUDI_USERS_email] 
      ON [dbo].[LUDI_USERS]([email]) 
      WHERE [email] IS NOT NULL;
    `)
    console.log('✅ Index IX_LUDI_USERS_email created.')
  } catch (e: any) {
    if (e.message.includes('already exists')) {
        console.log('⚠️ Index IX_LUDI_USERS_email already exists.')
    } else {
        console.error('❌ Error creating IX_LUDI_USERS_email:', e)
    }
  }

  // 3. Username Index
  try {
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX [IX_LUDI_USERS_username] 
      ON [dbo].[LUDI_USERS]([username]) 
      WHERE [username] IS NOT NULL;
    `)
    console.log('✅ Index IX_LUDI_USERS_username created.')
  } catch (e: any) {
    if (e.message.includes('already exists')) {
        console.log('⚠️ Index IX_LUDI_USERS_username already exists.')
    } else {
        console.error('❌ Error creating IX_LUDI_USERS_username:', e)
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
