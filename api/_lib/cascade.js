// Geo cascade: given a geo_id, returns housing_snapshots rows for the
// requested geo or, if empty, the nearest ancestor with data.
//
// Walk order: requested geo → county → metro → state.
// National is not stored in housing_snapshots (it's always mock).

import { getEntryById } from './geoIndex.js'

const CASCADE_ORDER = ['county', 'metro', 'state']

async function getRows(sql, geoId, metrics) {
  return sql`
    SELECT metric, current, year_ago, history
    FROM housing_snapshots
    WHERE geo_id = ${geoId}
      AND metric = ANY(${metrics})
  `
}

// Returns { rows, sourceGeoId, cascaded }
// rows is an empty array if no data found at any level.
export async function cascadeGet(sql, geoId, metrics) {
  const rows = await getRows(sql, geoId, metrics)
  if (rows.length > 0) return { rows, sourceGeoId: geoId, cascaded: false }

  const entry = getEntryById(geoId)
  if (!entry?.parents) return { rows: [], sourceGeoId: geoId, cascaded: false }

  for (const key of CASCADE_ORDER) {
    const parentId = entry.parents[key]
    if (!parentId) continue
    const parentRows = await getRows(sql, parentId, metrics)
    if (parentRows.length > 0) return { rows: parentRows, sourceGeoId: parentId, cascaded: true }
  }

  return { rows: [], sourceGeoId: geoId, cascaded: false }
}
