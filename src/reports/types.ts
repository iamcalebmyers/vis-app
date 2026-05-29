export type ReportFormat = 'card' | 'print'

export type ReportBlock = {
  id: string
  type: 'agentHeader' | 'marketScore' | 'marketConditions' | 'propertyDetail' | 'comps' | 'aiSummary'
  visible: boolean
  order: number
}

export type Report = {
  address: string
  city: string
  state: string
  zip: string
  format: ReportFormat
  agentName: string
  agentBrokerage: string
  agentEmail: string
  agentPhone: string
  blocks: ReportBlock[]
  generatedAt: string
}
