// Monthly cron at 06:30 UTC on the 2nd. Scrapes the Fed's FOMC calendar page,
// stores the full meeting list + the next 6 upcoming meetings in KV.
//
// The Fed typically publishes the upcoming year's schedule mid-year, so
// monthly is more than enough. Daily refresh would just waste API calls.
//
// Run manually:
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//     https://vis-app-seven.vercel.app/api/cron/fomc

import { fetchFomcMeetings, upcomingMeetings } from '../_lib/fomc.js'
import { kvSet, isKvAvailable } from '../_lib/kv.js'

const KEY_ALL  = 'fomc:meetings'
const KEY_NEXT = 'fomc:upcoming'
const KEY_META = 'fomc:meta'

function authorized(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return (req.headers?.authorization || '') === `Bearer ${secret}`
}

export default async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: 'unauthorized' })
  if (!isKvAvailable()) return res.status(500).json({ error: 'KV not provisioned' })

  const startedAt = new Date().toISOString()

  try {
    const all = await fetchFomcMeetings()
    if (all.length === 0) throw new Error('parsed 0 meetings — page structure may have changed')

    const upcoming = upcomingMeetings(all, 6)
    await kvSet(KEY_ALL,  all)
    await kvSet(KEY_NEXT, upcoming)
    await kvSet(KEY_META, {
      lastRunAt:   startedAt,
      completedAt: new Date().toISOString(),
      totalMeetings: all.length,
      upcomingCount: upcoming.length,
      source: 'federalreserve.gov',
    })

    res.status(200).json({ ok: true, totalMeetings: all.length, upcoming })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}
