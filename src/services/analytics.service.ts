import {
  getDashboardDateWiseAnalytics,
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
}

export default AnalyticsService
