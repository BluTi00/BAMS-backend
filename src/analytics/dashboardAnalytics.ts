import {
  APPLICATION_STATUS,
  ASSESSMENT_TYPE,
  ROLE,
} from '../generated/client/client'
import { db } from '../db/db.server'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import ApplicationCycleService from '../services/applicationCycle.service'
import { convertText } from '../utils/digitConverter'
import { ADToBS } from '../utils/dateFunction'

const applicationCycleService = new ApplicationCycleService()

// Extend dayjs with the required plugins
dayjs.extend(utc)
dayjs.extend(timezone)
// Define Nepali time zone
export const NEPAL_TIMEZONE = 'Asia/Kathmandu'

// =====================================================================
// -------- DASHBOARD STAT SUMMARY ---------
// =====================================================================
export const getDashboardStatSummary = async (
  applicationCycleId?: string
): Promise<any> => {
  // ------ USERS -------
  const applicationCycle = applicationCycleId
    ? await db.applicationCycle.findFirst({
        where: {
          id: applicationCycleId,
        },
      })
    : null

  const totalUsers = await db.user.count({
    where: {
      isBlocked: false,
      isDeactivated: false,
      role: ROLE.USER,
      ...(applicationCycle && {
        createdAt: {
          gte: applicationCycle?.startDate || undefined,
          lte: applicationCycle?.endDate || undefined,
        },
      }),
    },
  })

  // Get today's date in Nepali time zone
  const todayNepal = dayjs().tz(NEPAL_TIMEZONE).startOf('day')
  const startOfTodayNepal = todayNepal.utc().toDate() // Convert to UTC start of the day
  const endOfTodayNepal = todayNepal.endOf('day').utc().toDate() // Convert to UTC end of the day

  const usersToday = await db.user.count({
    where: {
      isBlocked: false,
      isDeactivated: false,
      role: ROLE.USER,
      createdAt: {
        gte: startOfTodayNepal,
        lt: endOfTodayNepal,
      },
    },
  })

  // total application
  const totalApplications = await db.application.count({
    where: {
      applicationCycleId: applicationCycle ? applicationCycle.id : undefined,
      deletedAt: null,
    },
  })

  const todayApplications = await db.application.count({
    where: {
      applicationCycleId: applicationCycle ? applicationCycle.id : undefined,
      createdAt: {
        gte: startOfTodayNepal,
        lt: endOfTodayNepal,
      },
      deletedAt: null,
    },
  })

  // registration completed applications
  const totalCompleted = await db.application.count({
    where: {
      applicationCycleId: applicationCycle ? applicationCycle.id : undefined,
      status: APPLICATION_STATUS.REGISTERED,
      deletedAt: null,
    },
  })

  const todayCompleted = await db.application.count({
    where: {
      applicationCycleId: applicationCycle ? applicationCycle.id : undefined,
      status: APPLICATION_STATUS.REGISTERED,
      createdAt: {
        gte: startOfTodayNepal,
        lt: endOfTodayNepal,
      },
      deletedAt: null,
    },
  })

  // in progress applications
  const totalInProgress = await db.application.count({
    where: {
      applicationCycleId: applicationCycle ? applicationCycle.id : undefined,
      status: APPLICATION_STATUS.INCOMPLETE,
      deletedAt: null,
    },
  })

  const todayInProgress = await db.application.count({
    where: {
      applicationCycleId: applicationCycle ? applicationCycle.id : undefined,
      status: APPLICATION_STATUS.INCOMPLETE,
      createdAt: {
        gte: startOfTodayNepal,
        lt: endOfTodayNepal,
      },
      deletedAt: null,
    },
  })

  return {
    user: {
      total: totalUsers,
      today: usersToday,
    },
    application: {
      total: totalApplications,
      today: todayApplications,
    },
    completedApplication: {
      total: totalCompleted,
      today: todayCompleted,
    },
    inProgressApplication: {
      total: totalInProgress,
      today: todayInProgress,
    },
  }
}

// =====================================================================
// -------- DATE WISE ANALYTICS ---------
// =====================================================================
export const getDashboardDateWiseAnalytics = async (
  filters: any
): Promise<any> => {
  const { date, applicationCycleId } = filters || {}
  if (date) {
    return await getHourlyData(date, applicationCycleId)
  }
  return await getDailyData(applicationCycleId)
}

const getDailyData = async (applicationCycleId: string): Promise<any> => {
  const applicationCycle =
    await applicationCycleService.getById(applicationCycleId)

  if (!applicationCycle) {
    return null
  }

  const dateWiseData = []
  if (applicationCycle) {
    const startDate = new Date(applicationCycle?.startDate)
    // subtract 1 day from start date to include the start date
    startDate.setDate(startDate.getDate() - 1)
    const endDate = new Date(applicationCycle.endDate)

    // Calculate totalDays between startDate and endDate
    // let today = new Date()
    // // if today is greater than end date, then set today as end date
    // if (today > endDate) {
    //   today = endDate
    // }

    // // Calculate totalDays
    // const totalDays = Math.floor(
    //   (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1 // Add 1 to include today
    // )

    const totalDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    )

    for (let i = 0; i <= totalDays; i++) {
      const date = dayjs(startDate).add(i, 'day').toDate()
      // Convert the date to Nepali time zone and get start and end of the day
      const startOfDayNepal = dayjs(date)
        .tz(NEPAL_TIMEZONE)
        .startOf('day')
        .utc()
        .toDate()
      const endOfDayNepal = dayjs(date)
        .tz(NEPAL_TIMEZONE)
        .endOf('day')
        .utc()
        .toDate()

      const totalUsers = await db.user.count({
        where: {
          isBlocked: false,
          isDeactivated: false,
          role: ROLE.USER,
          // createdAt date should be between 00:00:00 and 23:59:59 nepali time
          createdAt: {
            gte: startOfDayNepal,
            lt: endOfDayNepal,
          },
        },
      })

      const totalApplications = await db.application.count({
        where: {
          applicationCycleId: applicationCycle?.id,
          createdAt: {
            gte: startOfDayNepal,
            lt: endOfDayNepal,
          },
          deletedAt: null,
        },
      })

      const totalCompleted = await db.application.count({
        where: {
          applicationCycleId: applicationCycle?.id,
          status: APPLICATION_STATUS.REGISTERED,
          createdAt: {
            gte: startOfDayNepal,
            lt: endOfDayNepal,
          },
          deletedAt: null,
        },
      })

      const dateInBs = ADToBS(dayjs(date).format('YYYY-MM-DD')).slice(5, 10)

      dateWiseData.push({
        name: dateInBs,
        nameNp: convertText(dateInBs, 'ne'),
        totalUsers,
        totalApplications,
        totalCompleted,
      })
    }
  }

  return dateWiseData.length > 0 ? dateWiseData : null
}

const getHourlyData = async (
  date: string,
  applicationCycleId: string
): Promise<any> => {
  const applicationCycle =
    await applicationCycleService.getById(applicationCycleId)

  if (!applicationCycle) {
    return null
  }

  if (!date || !dayjs(date).isValid()) {
    return null
  }

  if (
    dayjs(date).isBefore(
      dayjs(applicationCycle.startDate).subtract(1, 'day') // Subtract 1 day to include the start date
    ) ||
    dayjs(date).isAfter(dayjs(applicationCycle.endDate))
  ) {
    return null
  }

  const hourlyData = []

  // Parse the provided date, and set it to the start of the day in Nepali time
  const startDateNepal = dayjs(date).tz(NEPAL_TIMEZONE).startOf('day')

  for (let hour = 0; hour < 24; hour++) {
    // Define the time range for each hour
    // Define the time range for each hour
    const startHour = startDateNepal.add(hour, 'hour').utc().toDate() // Start of the hour in UTC
    const endHour = startDateNepal
      .add(hour, 'hour')
      .endOf('hour')
      .utc()
      .toDate() // End of the hour in UTC

    // Fetch data for users created within this hour
    const totalUsers = await db.user.count({
      where: {
        isBlocked: false,
        isDeactivated: false,
        role: ROLE.USER,
        createdAt: {
          gte: startHour,
          lt: endHour,
        },
      },
    })

    // Fetch applications created within this hour
    const totalApplications = await db.application.count({
      where: {
        applicationCycleId: applicationCycle?.id,
        createdAt: {
          gte: startHour,
          lt: endHour,
        },
        deletedAt: null,
      },
    })

    // Fetch applications under review within this hour
    const totalCompleted = await db.application.count({
      where: {
        applicationCycleId: applicationCycle?.id,
        status: APPLICATION_STATUS.REGISTERED,
        createdAt: {
          gte: startHour,
          lt: endHour,
        },
        deletedAt: null,
      },
    })

    // Format the time as HH:00 - HH:59 for display purposes
    const timeLabel = `${String(hour).padStart(2, '0')}`

    hourlyData.push({
      name: timeLabel,
      nameNp: convertText(timeLabel, 'ne'),
      totalUsers,
      totalApplications,
      totalCompleted,
    })
  }

  return hourlyData.length > 0 ? hourlyData : null
}

// =====================================================================
// -------- STAGE PROGRESS STATS ---------
// =====================================================================

export const getDashboardStageProgressStats = async (
  applicationCycleId?: string
): Promise<any> => {
  // --------- APPLICATION INTAKE STAGE ---------
  // total application
  const totalApplications = await db.application.count({
    where: {
      applicationCycleId,
      deletedAt: null,
    },
  })

  // registration completed applications
  const totalCompletedApplications = await db.application.count({
    where: {
      applicationCycleId,
      status: APPLICATION_STATUS.REGISTERED,
      deletedAt: null,
    },
  })

  // in progress applications
  const totalInProgressApplication = await db.application.count({
    where: {
      applicationCycleId,
      status: APPLICATION_STATUS.INCOMPLETE,
      deletedAt: null,
    },
  })

  const totalOfflineApplications = await db.application.count({
    where: {
      applicationCycleId,
      status: APPLICATION_STATUS.INCOMPLETE,
      applicationCode: {
        contains: 'M',
      },
      deletedAt: null,
    },
  })

  // -------- AI SCREENING STAGE ---------
  const screeningCompleted = await db.application.count({
    where: {
      applicationCycleId,
      assessments: {
        some: {
          assessmentType: ASSESSMENT_TYPE.AI_SCREENING,
        },
      },
    },
  })

  const screeningPending = totalCompletedApplications - screeningCompleted

  return [
    {
      stageName: 'Application Intake Stage',
      isCompleted: true,
      data: [
        { label: 'Reg. Completed', value: totalCompletedApplications },
        { label: 'Reg. Incomplete', value: totalInProgressApplication },
        { label: 'Reg. Offline', value: totalOfflineApplications },
        {
          label: 'Total Applicants',
          value: totalApplications,
        },
      ],
    },
    {
      stageName: 'AI Screening Stage',
      isCurrent: true,
      data: [
        { label: 'Screening Completed', value: screeningCompleted },
        { label: 'Screening Pending', value: screeningPending },
        { label: 'Total Screening', value: totalApplications },
      ],
    },

    {
      stageName: 'Expert Evaluation Stage',
      data: [
        { label: 'Pending', value: '' },
        { label: 'Completed', value: '' },
        { label: 'Total Evaluation', value: '' },
      ],
    },

    {
      stageName: 'Business Proposal Stage',
      data: [
        { label: 'Pending', value: '' },
        { label: 'Completed', value: '' },
        { label: 'Total Interview', value: '' },
      ],
    },
  ]
}
