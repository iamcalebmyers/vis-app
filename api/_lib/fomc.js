// Scrapes upcoming FOMC meeting dates from the Federal Reserve calendar page.
//
// Source: https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm
// The page lists 5-7 years of meetings. Each meeting has a month label and a
// day-range cell (e.g. "27-28"). For 2-day meetings we use the END day (the
// rate decision is announced on the last day).
//
// HTML structure is stable but unofficial — if scraping breaks, the cron will
// return an error and the widget falls back to the last cached KV value.

const URL = 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm'

const MONTH = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
}

function pad(n) { return String(n).padStart(2, '0') }

export async function fetchFomcMeetings() {
  const r = await fetch(URL, { headers: { 'User-Agent': 'vis-app/1.0' } })
  if (!r.ok) throw new Error(`Fed FOMC page returned ${r.status}`)
  const html = await r.text()

  const yearRe = /(\d{4})\s*FOMC\s*Meeting/g
  const mtgRe  = /fomc-meeting__month[^>]*>(.*?)<\/div>\s*<div[^>]*fomc-meeting__date[^>]*>(.*?)<\/div>/gs

  // Walk through the page sequentially, tracking the most-recent year heading
  const events = []
  for (const m of html.matchAll(yearRe))  events.push({ pos: m.index, type: 'year', year: parseInt(m[1], 10) })
  for (const m of html.matchAll(mtgRe))   events.push({ pos: m.index, type: 'meeting', monthHtml: m[1], dateHtml: m[2] })
  events.sort((a, b) => a.pos - b.pos)

  const meetings = []
  let currentYear = null

  for (const e of events) {
    if (e.type === 'year') {
      currentYear = e.year
      continue
    }
    if (!currentYear) continue

    const monthNames = e.monthHtml.match(/January|February|March|April|May|June|July|August|September|October|November|December/g)
    if (!monthNames || monthNames.length === 0) continue
    const startMonth = MONTH[monthNames[0]]
    const endMonth   = MONTH[monthNames[monthNames.length - 1]]

    const dateText = e.dateHtml.replace(/<[^>]+>/g, '').trim()
    const nums = dateText.match(/\d+/g)
    if (!nums || nums.length === 0) continue
    const endDay = parseInt(nums[nums.length - 1], 10)

    // Dec→Jan crossing rolls into the next calendar year
    const endYear = endMonth < startMonth ? currentYear + 1 : currentYear

    meetings.push({
      year: endYear,
      month: endMonth,
      day: endDay,
      date: `${endYear}-${pad(endMonth)}-${pad(endDay)}`,
    })
  }

  return meetings
}

// Returns the next N upcoming meetings (today inclusive), oldest first.
export function upcomingMeetings(meetings, n = 6, today = new Date()) {
  const todayStr = `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`
  return meetings
    .filter(m => m.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, n)
}
