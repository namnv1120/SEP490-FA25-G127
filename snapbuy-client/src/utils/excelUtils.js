import * as XLSX from "xlsx";

export const exportToExcel = (data, filename = "export", sheetName = "Sheet1") => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn("⚠️ No data provided for export");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);

  const colWidths = Object.keys(data[0]).map((key) => ({
    wch: Math.max(
      key.length,
      ...data.map((row) => (row[key] ? row[key].toString().length : 0))
    ) + 4,
  }));
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const downloadExcelTemplate = (
  headers,
  sampleData = [],
  filename = "template",
  sheetName = "Sheet1"
) => {
  const headerObj = headers.reduce((acc, h) => ({ ...acc, [h]: "" }), {});
  const data = sampleData.length > 0 ? sampleData : [headerObj];

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet["!cols"] = headers.map((h) => ({ wch: h.length + 5 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
