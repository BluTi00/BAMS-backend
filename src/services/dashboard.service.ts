import { db } from '../db/db.server'
import ApplicationCycleService from './applicationCycle.service'

const applicationCycleService = new ApplicationCycleService()

class DashboardService {
  async getApplicationByUserId(userId: string): Promise<any> {
    const { applicationCycle } = await applicationCycleService.getLatest()

    if (!applicationCycle) {
      return null
    }

    const application = await db.application.findFirst({
      where: {
        userId,
        applicationCycleId: applicationCycle.id,
        deletedAt: null,
      },
    })

    if (!application) {
      return null
    }

    return application
  }
}

export default DashboardService
