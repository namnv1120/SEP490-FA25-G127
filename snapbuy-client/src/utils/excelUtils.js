import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportToExcel = async (data, filename = "export", sheetName = "Sheet1") => {
  if (!Array.isArray(data) || data.length === 0) {
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Thêm headers
  const headers = Object.keys(data[0]);
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "left", vertical: "middle" };

  // Thêm dữ liệu
  data.forEach((row) => {
    const values = headers.map(key => row[key] || "");
    const dataRow = worksheet.addRow(values);
    dataRow.eachCell((cell) => {
      cell.alignment = { horizontal: "left", vertical: "middle" };
    });
  });

  // Set độ rộng cột
  worksheet.columns = headers.map((key) => {
    const maxLength = Math.max(
      key.length,
      ...data.map((row) => (row[key] ? row[key].toString().length : 0))
    );
    return { width: maxLength + 4, alignment: { horizontal: "left", vertical: "middle" } };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
};

export const downloadExcelTemplate = async (
  headers,
  sampleData = [],
  filename = "template",
  sheetName = "Sheet1"
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Thêm headers
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "left", vertical: "middle" };

  // Thêm dữ liệu mẫu nếu có
  if (sampleData.length > 0) {
    sampleData.forEach((row) => {
      const values = headers.map(key => row[key] || "");
      const dataRow = worksheet.addRow(values);
      dataRow.eachCell((cell) => {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      });
    });
  }

  // Set độ rộng cột
  worksheet.columns = headers.map((h) => ({
    width: h.length + 5,
    alignment: { horizontal: "left", vertical: "middle" }
  }));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
};
