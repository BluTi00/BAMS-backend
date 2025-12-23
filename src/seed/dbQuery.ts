import { withSkipAudit } from '../middleware/context'

/* */
// const pdfEnqueue = async () => {
//   console.log('Enqueuing PDF generation jobs... 🌱')

//   const { applicationCycle } = await applicationCycleService.getLatest()

//   if (!applicationCycle) {
//     throw new BadRequestError('No application cycle found')
//   }

//   const batchSize = 2000
//   const batchNumber = 3

//   // obliterate existing jobs in the queue for a fresh start
//   await pdfGenerationQueue.obliterate({ force: true })
//   // return

//   const applications = await db.application.findMany({
//     where: {
//       applicationCycleId: applicationCycle.id,
//     },
//     select: {
//       id: true,
//       applicationCode: true,
//     },
//     orderBy: {
//       applicationCode: 'asc',
//     },
//     take: 2500,
//     skip: batchNumber * batchSize,
//   })

//   // enqueue jobs
//   for (const application of applications) {
//     await pdfGenerationQueue.add(
//       'pdfGenerationQueue',
//       {
//         applicationId: application.id,
//         applicationCode: application.applicationCode,
//       },
//       { attempts: 3 } // optional retry
//     )
//   }

//   console.log(
//     `✨ Enqueued PDF generation jobs for ${applications.length} applications.`
//   )

//   return
// }

const dbQuery = async () => {
  try {
    await withSkipAudit(async () => {
      //
    })

    console.log(`Successfully 🌱`)
    // exit process
    process.exit(0)
  } catch (error) {
    console.log(`Failed 💣`)
    console.error(error)
  }
}

dbQuery()
