function GenerateReportButton({ onClick, label = "Generate Full Report" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        background: "var(--accent)",
        color: "var(--white)",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: 700,
        border: "none",
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
        cursor: "pointer",
        opacity: 1,
        transition: "opacity 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.85";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
    >
      {label}
    </button>
  );
}

export default GenerateReportButton;
