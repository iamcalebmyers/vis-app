import type { Report } from './types'

export const SAMPLE_REPORT: Report = {
  address: '2847 Riverside Drive',
  city: 'Austin',
  state: 'TX',
  zip: '78741',
  format: 'card',
  agentName: 'Sarah Mitchell',
  agentBrokerage: 'Keller Williams Realty',
  agentEmail: 'sarah@kwaustin.com',
  agentPhone: '(512) 408-7731',
  blocks: [
    { id: 'agent-header',       type: 'agentHeader',       visible: true, order: 0 },
    { id: 'market-score',       type: 'marketScore',       visible: true, order: 1 },
    { id: 'market-conditions',  type: 'marketConditions',  visible: true, order: 2 },
    { id: 'property-detail',    type: 'propertyDetail',    visible: true, order: 3 },
    { id: 'comps',              type: 'comps',             visible: true, order: 4 },
    { id: 'ai-summary',         type: 'aiSummary',         visible: true, order: 5 },
  ],
  generatedAt: '2026-05-28',
}
