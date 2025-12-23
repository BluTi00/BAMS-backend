import { adminSeedData } from './seedData/adminData'
import { db } from '../db/db.server'
import { hashPassword } from '../utils/helper'
import { withSkipAudit } from '../middleware/context'

async function seedAdmin() {
  try {
    await withSkipAudit(async () => {
      for (const admin of adminSeedData) {
        const { name, nameNp, email, password, role, phone } = admin

        const isAlreadySeeded = await db.user.findUnique({ where: { phone } })
        if (isAlreadySeeded) {
          await db.user.delete({ where: { phone } })
        }

        const hashedPassword = await hashPassword(password)

        await db.user.create({
          data: {
            name,
            nameNp,
            email,
            password: hashedPassword,
            role,
            phone,
          },
        })
      }
    })

    console.log(`Admin seeded successfully 🌱`)
  } catch (error) {
    console.log(`Failed to seed admin 💣`)
    console.error(error)
  }
}

const args = process.argv[2]
if (!args) {
  console.error('Please provide an argument')
  process.exit(1)
}

if (args === 'seed') {
  void seedAdmin()
} else {
  console.error('Invalid argument')
  process.exit(1)
}
