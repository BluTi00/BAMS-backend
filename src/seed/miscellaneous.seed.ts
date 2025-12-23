import { db } from '../db/db.server'
import { withSkipAudit } from '../middleware/context'
import { startupSectorData } from './seedData/miscellaneousData'

// Global flag to indicate if seeding is in progress
async function seedMiscellaneous() {
  try {
    await withSkipAudit(async () => {
      // Write your seeding logic here
      await db.startupSubSector.deleteMany({})
      await db.startupSector.deleteMany({})

      for (const sector of startupSectorData) {
        const newSector = await db.startupSector.create({
          data: {
            name: sector.name,
            nameNp: sector.nameNp,
          },
        })

        for (const subSector of sector.subSectors) {
          await db.startupSubSector.create({
            data: {
              name: subSector.name,
              nameNp: subSector.nameNp,
              startupSectorId: newSector.id,
            },
          })
        }
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
