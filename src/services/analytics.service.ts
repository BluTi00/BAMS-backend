import {
  getDashboardDateWiseAnalytics,
  getDashboardStageProgressStats,
  getDashboardStatSummary,
} from '../analytics/dashboardAnalytics'

class AnalyticsService {
  async getStatSummary(applicationCycleId?: string): Promise<any> {
    const result = await getDashboardStatSummary(applicationCycleId)
    return result
  }

  async getDateWise(filters: any): Promise<any> {
    const result = await getDashboardDateWiseAnalytics(filters)
    return result
  }

  async getStageProgress(applicationCycleId?: string): Promise<any> {
    const result = await getDashboardStageProgressStats(applicationCycleId)
    return result
  }
}

export default AnalyticsService
