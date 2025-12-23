import { db } from '../db/db.server'

class ReportService {
  async getReport(): Promise<any> {
    const sectorList = await db.startupSector.findMany({
      select: {
        id: true,
        name: true,
        nameNp: true,
      },
    })

    const sectorApplication = await Promise.all(
      sectorList.map(async (sector) => {
        const applicationCount = await db.application.count({
          where: {
            projectIntroduction: {
              startupSectorId: sector.id,
            },
          },
        })
        return {
          name: sector.name,
          nameNp: sector.nameNp,
          value: applicationCount,
        }
      })
    )

    return {
      sectorApplication,
    }
  }
}

export default ReportService
