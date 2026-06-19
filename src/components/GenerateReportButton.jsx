function GenerateReportButton({ onClick, label = "Generate Full Report" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-primary"
      style={{ width: "100%", marginTop: 10, height: 40, fontSize: 13, letterSpacing: "0.01em" }}
    >
      {label}
    </button>
  );
}

export default GenerateReportButton;
