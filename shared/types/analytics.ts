// Analytics API payload types (DEV_PLAN M7, PRD §6.5) — response of
// GET /api/admin/analytics. Dates cross the wire as ISO 'YYYY-MM-DD' strings.

export interface AnalyticsDayViews {
  date: string
  views: number
}

export interface AnalyticsTopPages {
  path: string
  views: number
}

export interface AnalyticsTopReferrer {
  referrer: string
  views: number
}

export interface AnalyticsDeviceSplit {
  device: string
  views: number
}

export interface AnalyticsBrowserSplit {
  browser: string
  views: number
}

export interface AnalyticsSummary {
  range: number
  totalViews: number
  uniqueVisitors: number
  viewsOverTime: AnalyticsDayViews[]
  topPages: AnalyticsTopPages[]
  topReferrers: AnalyticsTopReferrer[]
  devices: AnalyticsDeviceSplit[]
  browsers: AnalyticsBrowserSplit[]
}
