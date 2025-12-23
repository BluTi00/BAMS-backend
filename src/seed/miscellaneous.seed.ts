import { withSkipAudit } from '../middleware/context'

// Global flag to indicate if seeding is in progress
async function seedMiscellaneous() {
  try {
    await withSkipAudit(async () => {
      //
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
