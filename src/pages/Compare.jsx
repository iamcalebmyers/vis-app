import { useRef, useState } from "react";
import ComparisonCard from "../components/ComparisonCard.jsx";
import { fetchComparisonProperty } from "../utils/claudeApi.js";
import { computePropertyMetrics } from "../utils/investorMath.js";
import { exportReportPDF } from "../utils/pdfExport.js";
import { MOCK_COMPARISON } from "../data/mockData.js";

const MAX_PROPERTIES = 4;

export default function Compare() {
  const [address, setAddress] = useState("");
  const [properties, setProperties] = useState([]); // computed metric objects
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef(null);

  const atCap = properties.length >= MAX_PROPERTIES;

  async function handleAdd() {
    const query = address.trim();
    if (!query || loading || atCap) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchComparisonProperty(query);
      setProperties((prev) => [...prev, computePropertyMetrics(raw)]);
      setAddress("");
    } catch (err) {
      setError(err.message || "Couldn't add that property.");
    } finally {
      setLoading(false);
    }
  }

  function handleRemove(i) {
    setProperties((prev) => prev.filter((_, idx) => idx !== i));
  }

  function loadExample() {
    setError(null);
    setProperties(MOCK_COMPARISON.slice(0, MAX_PROPERTIES).map((r) => computePropertyMetrics(r)));
  }

  async function handleExport() {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      await exportReportPDF(cardRef.current, "property-comparison.pdf");
    } catch (err) {
      setError(err.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  const inputSt = {
    flex: 1, height: 40, padding: "0 14px", background: "var(--border-soft)",
    border: "1px solid var(--border)", borderRadius: 8, fontFamily: "var(--font-sans)",
    fontSize: 14, color: "var(--white)", outline: "none", minWidth: 0,
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "28px 32px 40px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 800, color: "var(--white)", margin: 0 }}>
              Compare properties
            </h1>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", margin: "6px 0 0" }}>
              Add up to {MAX_PROPERTIES} addresses. Vis pulls the facts; the returns are computed for you.
            </p>
          </div>
          {properties.length > 0 && (
            <button type="button" onClick={handleExport} disabled={exporting}
              style={{ height: 36, padding: "0 14px", background: "var(--border-soft)", border: "1px solid var(--border)", borderRadius: 7, fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: exporting ? "default" : "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
              {exporting ? "Exporting…" : "Export PDF"}
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={atCap ? `Maximum of ${MAX_PROPERTIES} properties` : "Property address, city, state"}
            disabled={atCap || loading}
            style={{ ...inputSt, opacity: atCap ? 0.5 : 1 }}
          />
          <button type="button" onClick={handleAdd} disabled={atCap || loading || !address.trim()}
            style={{ height: 40, padding: "0 18px", background: "var(--accent)", border: "none", borderRadius: 8, fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "#fff", cursor: atCap || loading || !address.trim() ? "not-allowed" : "pointer", opacity: atCap || !address.trim() ? 0.5 : 1, flexShrink: 0 }}>
            {loading ? "Adding…" : "Add"}
          </button>
        </div>

        {error && (
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#dc2626", background: "rgba(220,38,38,0.08)", borderRadius: 6, padding: "8px 12px" }}>
            {error}
          </div>
        )}

        {properties.length > 0 ? (
          <div ref={cardRef}>
            <ComparisonCard properties={properties} onRemove={handleRemove} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 24px", border: "1px dashed var(--border)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted)" }}>
              No properties yet. Add an address above to start comparing.
            </div>
            <button type="button" onClick={loadExample}
              style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--muted-faint)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: "4px 8px" }}>
              Load example comparison
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
