import { db } from '../db/db.server'
import { withSkipAudit } from '../middleware/context'
import { entrepreneurshipActivityData } from './miscellaneousData'

// Global flag to indicate if seeding is in progress
async function seedMiscellaneous() {
  try {
    await withSkipAudit(async () => {
      //
      await db.entrepreneurshipActivity.deleteMany({})
      for (const data of entrepreneurshipActivityData) {
        await db.entrepreneurshipActivity.create({
          data: {
            name: data.name,
            nameNp: data.nameNp,
            code: data.code,
          },
        })
      }
    })

    console.log(`Miscellaneous seeded successfully 🌱`)
  } catch (error) {
    console.log(`Failed to seed miscellaneous 💣`)
    console.error(error)
  }
}

const args = process.argv[2]
if (!args) {
  console.error('Please provide an argument')
  process.exit(1)
}

if (args === 'seed') {
  void seedMiscellaneous()
  // void seedSubSector()
} else {
  console.error('Invalid argument')
  process.exit(1)
}
