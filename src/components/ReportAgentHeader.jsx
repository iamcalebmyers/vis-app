import { useAgent } from "../utils/AgentContext.jsx";

function Line({ value, onChange, placeholder, style }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        display: "block",
        width: "100%",
        background: "transparent",
        border: "none",
        outline: "none",
        padding: 0,
        margin: 0,
        textAlign: "right",
        cursor: "text",
        fontFamily: "Arial, sans-serif",
        ...style,
      }}
    />
  );
}

function ReportAgentHeader({ info, onChange }) {
  const { aiName } = useAgent();
  const set = (key) => (val) => onChange({ ...info, [key]: val });

  return (
    <div style={{ textAlign: "right" }}>
      <Line
        value={info.name}
        onChange={set("name")}
        placeholder="Agent name"
        style={{ fontSize: 13, fontWeight: 700, color: "var(--white)" }}
      />
      <Line
        value={info.brokerage}
        onChange={set("brokerage")}
        placeholder="Brokerage"
        style={{ fontSize: 11, color: "var(--white)" }}
      />
      <Line
        value={info.license}
        onChange={set("license")}
        placeholder="License #"
        style={{ fontSize: 11, color: "var(--white)" }}
      />
      <Line
        value={info.phone}
        onChange={set("phone")}
        placeholder="Phone"
        style={{ fontSize: 11, color: "var(--white)" }}
      />
      <Line
        value={info.email}
        onChange={set("email")}
        placeholder="Email"
        style={{ fontSize: 11, color: "var(--white)", marginTop: 2 }}
      />
    </div>
  );
}

export default ReportAgentHeader;
