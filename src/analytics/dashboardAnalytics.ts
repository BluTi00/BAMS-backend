import { PROGRAM_TYPE, ROLE } from '../generated/client/client'
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

  // total applications for program type: entrepreneurship development
  const totalEDApplications = await db.application.count({
    where: {
      applicationCycleId: applicationCycle ? applicationCycle.id : undefined,
      deletedAt: null,
      programType: PROGRAM_TYPE.ENTREPRENEURSHIP_DEVELOPMENT,
    },
  })

  const todayEDApplications = await db.application.count({
    where: {
      applicationCycleId: applicationCycle ? applicationCycle.id : undefined,
      createdAt: {
        gte: startOfTodayNepal,
        lt: endOfTodayNepal,
      },
      deletedAt: null,
      programType: PROGRAM_TYPE.ENTREPRENEURSHIP_DEVELOPMENT,
    },
  })
  // total applications for program type: technology upgradation
  const totalTUApplications = await db.application.count({
    where: {
      applicationCycleId: applicationCycle ? applicationCycle.id : undefined,
      deletedAt: null,
      programType: PROGRAM_TYPE.TECHNOLOGY_UPGRADATION,
    },
  })

  const todayTUApplications = await db.application.count({
    where: {
      applicationCycleId: applicationCycle ? applicationCycle.id : undefined,
      createdAt: {
        gte: startOfTodayNepal,
        lt: endOfTodayNepal,
      },
      deletedAt: null,
      programType: PROGRAM_TYPE.TECHNOLOGY_UPGRADATION,
    },
  })

  return {
    user: {
      total: totalUsers,
      today: usersToday,
    },
    applicationED: {
      total: totalEDApplications,
      today: todayEDApplications,
    },
    applicationTU: {
      total: totalTUApplications,
      today: todayTUApplications,
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

      const totalEDApplications = await db.application.count({
        where: {
          applicationCycleId: applicationCycle?.id,
          programType: PROGRAM_TYPE.ENTREPRENEURSHIP_DEVELOPMENT,
          createdAt: {
            gte: startOfDayNepal,
            lt: endOfDayNepal,
          },
          deletedAt: null,
        },
      })

      const totalTUApplications = await db.application.count({
        where: {
          applicationCycleId: applicationCycle?.id,
          programType: PROGRAM_TYPE.TECHNOLOGY_UPGRADATION,
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
        totalEDApplications,
        totalTUApplications,
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
    const totalEDApplications = await db.application.count({
      where: {
        applicationCycleId: applicationCycle?.id,
        programType: PROGRAM_TYPE.ENTREPRENEURSHIP_DEVELOPMENT,
        createdAt: {
          gte: startHour,
          lt: endHour,
        },
        deletedAt: null,
      },
    })

    // Fetch applications under review within this hour
    const totalTUApplications = await db.application.count({
      where: {
        applicationCycleId: applicationCycle?.id,
        programType: PROGRAM_TYPE.TECHNOLOGY_UPGRADATION,
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
      totalEDApplications,
      totalTUApplications,
    })
  }

  return hourlyData.length > 0 ? hourlyData : null
}

// =====================================================================
// -------- STAGE PROGRESS STATS ---------
// =====================================================================
