import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../utils/graphData.js";

function fmt(v, unit) {
  if (v == null) return "—";
  const n = Number(v);
  if (isNaN(n)) return String(v);
  if (unit === "dollars") {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
  }
  if (unit === "percent") return `${n.toFixed(1)}%`;
  if (unit === "days") return `${n}d`;
  return n.toLocaleString();
}

function Tip({ active, payload, label, unit, s }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: s.tooltip.bg, border: `1px solid ${s.grid}`, borderRadius: 6, padding: "8px 12px", fontFamily: "'Inter', sans-serif", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
      <div style={{ color: s.axis, marginBottom: 2 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: s.tooltip.text, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>{fmt(p.value, unit)}</div>)}
    </div>
  );
}

function buildWaterfallData(points) {
  let running = 0;
  return points.map(p => {
    const base = (p.type === "start" || p.type === "total") ? 0 : Math.min(running, running + Number(p.value));
    const val = Math.abs(Number(p.value));
    if (p.type !== "total") running += Number(p.value);
    return { label: p.label, base, value: val, positive: Number(p.value) >= 0 };
  });
}

export default function GraphChart({ type, scheme = "colorful", data = [], unit = "count", height = 260 }) {
  const s = CHART_COLORS[scheme] || CHART_COLORS.colorful;
  const xp = { dataKey: "label", tick: { fontFamily: "'Inter', sans-serif", fontSize: 10, fill: s.axis }, axisLine: { stroke: s.grid }, tickLine: false };
  const yp = { tick: { fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 10, fill: s.axis }, axisLine: false, tickLine: false, tickFormatter: v => fmt(v, unit), width: unit === "dollars" ? 58 : 38 };
  const grid = <CartesianGrid strokeDasharray="3 3" stroke={s.grid} vertical={false} />;
  const tip = <Tip unit={unit} s={s} />;
  const bg = { background: s.background, borderRadius: 4, padding: "12px 0 4px" };

  if (type === "sparkline") {
    return (
      <div style={{ ...bg, padding: "2px 0 0" }}>
        <ResponsiveContainer width="100%" height={56}>
          <LineChart data={data}><Line type="monotone" dataKey="value" stroke={s.line} strokeWidth={2} dot={false} /></LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "line") {
    return (
      <div style={bg}><ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>{grid}<XAxis {...xp} /><YAxis {...yp} /><Tooltip content={tip} />
          <Line type="monotone" dataKey="value" stroke={s.line} strokeWidth={2.5} dot={{ fill: s.line, r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer></div>
    );
  }

  if (type === "area") {
    return (
      <div style={bg}><ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>{grid}<XAxis {...xp} /><YAxis {...yp} /><Tooltip content={tip} />
          <Area type="monotone" dataKey="value" stroke={s.line} strokeWidth={2} fill={s.lineFill} />
        </AreaChart>
      </ResponsiveContainer></div>
    );
  }

  if (type === "bar") {
    return (
      <div style={bg}><ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barCategoryGap="8%">{grid}<XAxis {...xp} /><YAxis {...yp} /><Tooltip content={tip} />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>{data.map((_, i) => <Cell key={i} fill={s.bars[i % s.bars.length]} />)}</Bar>
        </BarChart>
      </ResponsiveContainer></div>
    );
  }

  if (type === "horizontal_bar") {
    return (
      <div style={bg}><ResponsiveContainer width="100%" height={Math.max(height, data.length * 36 + 20)}>
        <BarChart data={data} layout="horizontal" barCategoryGap="28%">
          {grid}
          <XAxis type="number" tick={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 10, fill: s.axis }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v, unit)} />
          <YAxis type="category" dataKey="label" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: s.axis }} axisLine={false} tickLine={false} width={90} />
          <Tooltip content={tip} />
          <Bar dataKey="value" radius={[0, 3, 3, 0]}>{data.map((_, i) => <Cell key={i} fill={s.bars[i % s.bars.length]} />)}</Bar>
        </BarChart>
      </ResponsiveContainer></div>
    );
  }

  if (type === "diverging_bar") {
    return (
      <div style={bg}><ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barCategoryGap="32%">{grid}<XAxis {...xp} /><YAxis {...yp} /><Tooltip content={tip} />
          <ReferenceLine y={0} stroke={s.axis} strokeWidth={1.5} />
          <Bar dataKey="value" radius={[2, 2, 0, 0]}>{data.map((d, i) => <Cell key={i} fill={Number(d.value) >= 0 ? s.bars[0] : s.bars[1]} />)}</Bar>
        </BarChart>
      </ResponsiveContainer></div>
    );
  }

  if (type === "lollipop") {
    return (
      <div style={bg}><ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barCategoryGap="50%">{grid}<XAxis {...xp} /><YAxis {...yp} /><Tooltip content={tip} />
          <Bar dataKey="value" barSize={3} radius={[2, 2, 0, 0]}>{data.map((_, i) => <Cell key={i} fill={s.bars[i % s.bars.length]} />)}</Bar>
        </BarChart>
      </ResponsiveContainer></div>
    );
  }

  if (type === "donut" || type === "pie") {
    const inner = type === "donut" ? "52%" : "0%";
    return (
      <div style={{ ...bg, display: "flex", justifyContent: "center" }}>
        <PieChart width={260} height={height}>
          <Pie data={data} cx="50%" cy="50%" outerRadius="70%" innerRadius={inner} dataKey="value" nameKey="label"
            label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={true} fontSize={10} fontFamily="'Inter', sans-serif">
            {data.map((_, i) => <Cell key={i} fill={s.bars[i % s.bars.length]} />)}
          </Pie>
          <Tooltip formatter={v => fmt(v, unit)} />
        </PieChart>
      </div>
    );
  }

  if (type === "scatter") {
    return (
      <div style={bg}><ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          {grid}
          <XAxis dataKey="x" name="Days on Market" tick={{ fontFamily: "Inter, sans-serif", fontSize: 10, fill: s.axis }} axisLine={{ stroke: s.grid }} tickLine={false} label={{ value: "Days on Market", position: "insideBottom", offset: -4, fontSize: 10, fill: s.axis }} />
          <YAxis dataKey="y" name="Price" tick={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 10, fill: s.axis }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v, unit)} width={58} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v, n) => n === "y" ? fmt(v, unit) : `${v}d`} labelFormatter={() => ""} />
          <Scatter data={data}>{data.map((_, i) => <Cell key={i} fill={s.bars[i % s.bars.length]} />)}</Scatter>
        </ScatterChart>
      </ResponsiveContainer></div>
    );
  }

  if (type === "waterfall") {
    const transformed = buildWaterfallData(data);
    return (
      <div style={bg}><ResponsiveContainer width="100%" height={height}>
        <BarChart data={transformed} barCategoryGap="24%">{grid}<XAxis {...xp} /><YAxis {...yp} /><Tooltip content={tip} />
          <Bar dataKey="base" stackId="w" fill="transparent" />
          <Bar dataKey="value" stackId="w" radius={[3, 3, 0, 0]}>{transformed.map((d, i) => <Cell key={i} fill={d.positive ? s.bars[0] : s.bars[1]} />)}</Bar>
        </BarChart>
      </ResponsiveContainer></div>
    );
  }

  // heatmap is handled by HeatMapCard — not rendered here

  if (type === "hero_stat") {
    return (
      <div style={{ ...bg, display: "flex", gap: 24, justifyContent: "center", padding: "32px 20px", flexWrap: "wrap" }}>
        {data.slice(0, 3).map((item, i) => (
          <div key={i} style={{ textAlign: "center", minWidth: 120 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: s.axis, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{item.label}</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 38, color: i === 0 ? s.bars[0] : s.strong, letterSpacing: "-0.02em", lineHeight: 1 }}>{fmt(item.value, unit)}</div>
            {item.context && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: s.axis, marginTop: 6 }}>{item.context}</div>}
          </div>
        ))}
      </div>
    );
  }

  return null;
}
