import { ASSESSMENT_TYPE } from '../generated/client/client'
import { db } from '../db/db.server'
import { screeningQueue } from '../queues/screening/screeningQueue'
import ApplicationCycleService from './applicationCycle.service'

const applicationCycleService = new ApplicationCycleService()

class ScreeningService {
  async startProcess(): Promise<string> {
    const { applicationCycle } = await applicationCycleService.getLatest()
    // fetch all applications with no screening
    const applications = await db.application.findMany({
      where: {
        applicationCycleId: applicationCycle?.id,
        assessments: {
          none: {
            assessmentType: ASSESSMENT_TYPE.AI_SCREENING,
          },
        },
        applicationCode: {
          contains: 'A-', // only online applications
        },
      },
      take: 100, // for testing, limit to 100
    })

    if (applications.length === 0) {
      return 'No applications pending screening.'
    }

    // enqueue each application
    for (const app of applications) {
      await screeningQueue.add('screeningQueue', {
        applicationId: app.id,
      })
    }

    return 'Screening process started.'
  }

  async enqueueApplicationById(id: string): Promise<any> {
    // enqueue application for screening
    await screeningQueue.add('screeningQueue', {
      applicationId: id,
    })

    return 'Application Queued for screening.'
  }

  async getSummary(): Promise<any> {
    const { applicationCycle } = await applicationCycleService.getLatest()

    const totalApplications = await db.application.count({
      where: {
        applicationCycleId: applicationCycle?.id,
      },
    })

    const screenedApplications = await db.assessment.count({
      where: {
        assessmentType: ASSESSMENT_TYPE.AI_SCREENING,
        application: {
          applicationCycleId: applicationCycle?.id,
        },
      },
    })

    const pendingScreenings = totalApplications - screenedApplications

    // Check if screening process is started or not
    const { waiting, active, completed, failed, delayed } =
      await screeningQueue.getJobCounts()
    const totalQueueJobs = waiting + active + completed + failed + delayed
    if (screenedApplications === 0 && totalQueueJobs === 0) {
      return null
    }

    // get the status of the queue
    const isQueuePaused = await screeningQueue.isPaused()
    const isQueueCompleted = waiting + active === 0

    return {
      totalApplications,
      screenedApplications,
      pendingScreenings,
      waiting,
      isQueuePaused,
      isQueueCompleted,
    }
  }

  async pauseQueue(): Promise<any> {
    await screeningQueue.pause()
    return 'Screening queue paused.'
  }

  async resumeQueue(): Promise<any> {
    await screeningQueue.resume()
    return 'Screening queue resumed.'
  }

  async clearQueue(): Promise<any> {
    await screeningQueue.pause() // Safety
    // obliterate all jobs
    await screeningQueue.obliterate({ force: true })
    await screeningQueue.clean(0, 0, 'delayed')
    return 'Screening queue cleared.'
  }
}

export default ScreeningService
