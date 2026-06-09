export async function exportReportPDF(element, filename = "vis-report.pdf") {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const ptW = canvas.width * 0.5;
  const ptH = canvas.height * 0.5;

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: [ptW, ptH] });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, ptW, ptH);
  pdf.save(filename);
}
