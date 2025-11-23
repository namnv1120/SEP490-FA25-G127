import { useState } from "react";
import { Modal, Upload, Button, message, Table } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const normalizeBarcode = (input) => {
  if (input == null) return "";
  let raw = String(input).trim();
  if (raw === "") return "";
  const sci = /^\s*([+-])?(\d+)(?:[.,](\d+))?e([+-]?\d+)\s*$/i;
  const m = raw.match(sci);
  if (m) {
    const sign = m[1] || "";
    const intPart = m[2] || "";
    const fracPart = m[3] || "";
    const exp = parseInt(m[4], 10) || 0;
    let digits = intPart + fracPart;
    if (exp >= 0) {
      const move = exp - fracPart.length;
      if (move > 0) digits = digits + "0".repeat(move);
    } else {
      const moveLeft = -exp;
      digits = digits.padStart(digits.length + moveLeft, "0");
    }
    raw = (sign === "-" ? "-" : "") + digits;
  }
  // Chỉ giữ chữ số để tránh giữ ký tự 'E', '+', ','...
  raw = raw.replace(/[^0-9]/g, "");
  return raw;
};

const ImportExcelModal = ({
  visible,
  onClose,
  onImport,
  columns,
  mapExcelRow,
  templateData,
  categoriesData = [],
  suppliersData = [],
  guideData = null, // Custom guide data, nếu null thì dùng default
  validateData = null, // Hàm validate dữ liệu, trả về { errors: [], validatedData: [] }
  title = "Thêm dữ liệu từ excel",
}) => {
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [validationErrors, setValidationErrors] = useState({}); // { rowIndex: "error message" }

  const handleFileUpload = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      // Tìm sheet "Sản phẩm" hoặc sheet đầu tiên không phải "Hướng dẫn"
      let worksheet = workbook.worksheets.find(ws =>
        ws.name === "Sản phẩm" || ws.name === "Giá sản phẩm" || ws.name.toLowerCase().includes("sản phẩm")
      );

      // Nếu không tìm thấy, tìm sheet đầu tiên không phải "Hướng dẫn"
      if (!worksheet) {
        worksheet = workbook.worksheets.find(ws =>
          ws.name !== "Hướng dẫn" && !ws.name.toLowerCase().includes("hướng dẫn")
        ) || workbook.worksheets[0];
      }

      if (!worksheet) {
        message.warning("File Excel không có sheet dữ liệu!");
        return;
      }

      // Đọc headers từ row đầu tiên
      const headerRow = worksheet.getRow(1);
      const headers = [];
      headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        headers[colNumber - 1] = cell.value ? String(cell.value).trim() : "";
      });

      // Đọc dữ liệu từ row 2 trở đi, bỏ qua header row
      const jsonData = [];
      worksheet.eachRow({ includeEmpty: false, firstRow: 2 }, (row) => {
        // Kiểm tra xem row này có phải là header row không (so sánh với headers)
        const rowValues = [];
        row.eachCell({ includeEmpty: true }, (cell) => {
          rowValues.push(cell.value ? String(cell.value).trim() : "");
        });

        // Bỏ qua nếu row này giống với header row
        const isHeaderRow = rowValues.length === headers.length &&
          rowValues.every((val, idx) => val === headers[idx] || (val === "" && headers[idx] === ""));
        if (isHeaderRow) {
          return; // Bỏ qua header row nếu bị lặp lại
        }

        const rowData = {};
        let hasData = false;
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const headerName = headers[colNumber - 1];
          if (headerName && headerName !== "") {
            if (headerName === "Barcode") {
              const preferred = typeof cell.text === "string" ? cell.text : cell.value;
              const value = normalizeBarcode(preferred);
              rowData[headerName] = value;
              if (value !== "") {
                hasData = true;
              }
            } else if (cell.value === null || cell.value === undefined) {
              rowData[headerName] = "";
            } else if (cell.type === ExcelJS.ValueType.Number) {
              rowData[headerName] = cell.value;
              hasData = true;
            } else {
              const value = String(cell.value).trim();
              rowData[headerName] = value;
              if (value !== "") {
                hasData = true;
              }
            }
          }
        });

        // Chỉ thêm row nếu có ít nhất một giá trị không rỗng
        if (hasData && Object.keys(rowData).length > 0) {
          jsonData.push(rowData);
        }
      });

      if (jsonData.length === 0) {
        message.warning("File Excel không có dữ liệu!");
        return;
      }

      const mapped = jsonData.map((row, i) => mapExcelRow(row, i));

      setFileList([{
        uid: file.uid,
        name: file.name,
        status: 'done',
      }]);

      // Validate dữ liệu nếu có hàm validate
      if (validateData) {
        const validationResult = validateData(mapped);
        if (validationResult && validationResult.errors) {
          const errorMap = {};
          validationResult.errors.forEach((error, index) => {
            if (error) {
              errorMap[index] = error;
            }
          });
          setValidationErrors(errorMap);
          const errorCount = Object.keys(errorMap).length;
          if (errorCount > 0) {
            message.warning(`Đã tải ${mapped.length} dòng dữ liệu. Có ${errorCount} dòng có lỗi.`);
          } else {
            message.success(`Đã tải ${mapped.length} dòng dữ liệu`);
          }
        } else {
          setValidationErrors({});
          message.success(`Đã tải ${mapped.length} dòng dữ liệu`);
        }
      } else {
        setValidationErrors({});
        message.success(`Đã tải ${mapped.length} dòng dữ liệu`);
      }

      setFileData(mapped);
    } catch {
      message.error("Lỗi khi đọc dữ liệu Excel. Vui lòng kiểm tra file!");
      setFileData([]);
      setFileList([]);
    }
    return false; // Ngăn auto upload
  };

  const handleImport = async () => {
    if (fileData.length === 0) {
      return message.warning("Không có dữ liệu để nhập");
    }

    // Kiểm tra lỗi validation trước khi import
    const errorCount = Object.keys(validationErrors).length;
    if (errorCount > 0) {
      return message.error(`Có ${errorCount} dòng có lỗi. Vui lòng sửa lỗi trước khi nhập dữ liệu.`);
    }

    setLoading(true);
    try {
      await onImport(fileData);
      message.success("Nhập dữ liệu thành công!");
      handleClose();
    } catch (err) {
      message.error(err.message || "Nhập dữ liệu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFileData([]);
    setFileList([]);
    setValidationErrors({});
    onClose();
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();

    // Trang 0: Hướng dẫn (đặt đầu tiên)
    if (guideData) {
      const wsGuide = workbook.addWorksheet("Hướng dẫn");
      const guideHeaders = Object.keys(guideData[0] || {});
      const guideHeaderRow = wsGuide.addRow(guideHeaders);
      guideHeaderRow.font = { bold: true };
      guideHeaderRow.alignment = { horizontal: "left", vertical: "middle" };
      guideHeaderRow.eachCell((cell) => {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      });

      guideData.forEach(row => {
        const values = guideHeaders.map(key => row[key] || "");
        const dataRow = wsGuide.addRow(values);
        dataRow.eachCell((cell) => {
          cell.alignment = { horizontal: "left", vertical: "middle" };
        });
      });

      wsGuide.columns = guideHeaders.map(() => ({
        width: 25,
        alignment: { horizontal: "left", vertical: "middle" }
      }));
      // Set cột thứ 2 (Quy tắc) rộng hơn
      if (guideHeaders.length >= 2) {
        wsGuide.getColumn(2).width = 80;
      }
    }

    // Trang 1: Products template
      const headers = Object.keys(templateData[0] || {});
      const isProductPriceTemplate = headers.includes("Giá bán") && headers.includes("Giá nhập");

    const wsProducts = workbook.addWorksheet(isProductPriceTemplate ? "Giá sản phẩm" : "Sản phẩm");
    const headerRow = wsProducts.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "left", vertical: "middle" };
    headerRow.eachCell((cell) => {
      cell.alignment = { horizontal: "left", vertical: "middle" };
    });

    // Thêm dữ liệu
    templateData.forEach((row) => {
      const values = headers.map(key => {
        let value = row[key] || "";
        // Format Barcode thành text nếu có
        if (key === "Barcode" && value !== "") {
          value = String(value);
        }
        return value;
      });
      const dataRow = wsProducts.addRow(values);
      dataRow.eachCell((cell) => {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      });
    });

    // Set độ rộng cột và alignment - tất cả căn trái
    if (isProductPriceTemplate) {
      wsProducts.columns = [
        { width: 18, alignment: { horizontal: "left", vertical: "middle" } }, // Mã sản phẩm
        { width: 40, alignment: { horizontal: "left", vertical: "middle" } }, // Tên sản phẩm
        { width: 12, alignment: { horizontal: "left", vertical: "middle" } }, // Giá bán
        { width: 12, alignment: { horizontal: "left", vertical: "middle" } }, // Giá nhập
      ];
    } else {
      wsProducts.columns = [
        { width: 18, alignment: { horizontal: "left", vertical: "middle" } }, // Mã
        { width: 40, alignment: { horizontal: "left", vertical: "middle" } }, // Tên sản phẩm
        { width: 40, alignment: { horizontal: "left", vertical: "middle" } }, // Mô tả
        { width: 20, alignment: { horizontal: "left", vertical: "middle" } }, // Danh mục
        { width: 25, alignment: { horizontal: "left", vertical: "middle" } }, // Danh mục con
        { width: 18, alignment: { horizontal: "left", vertical: "middle" } }, // Mã ncc
        { width: 40, alignment: { horizontal: "left", vertical: "middle" } }, // Tên ncc
        { width: 10, alignment: { horizontal: "left", vertical: "middle" } }, // Đơn vị
        { width: 15, alignment: { horizontal: "left", vertical: "middle" } }, // Kích thước
        { width: 20, alignment: { horizontal: "left", vertical: "middle" } }, // Barcode
      ];
    }

    // Trang 2: Categories (nếu có)
    if (categoriesData && categoriesData.length > 0) {
      const wsCategories = workbook.addWorksheet("Danh mục");
      const categoryHeaders = ["Tên danh mục", "Mô tả", "Danh mục cha"];
      const categoryHeaderRow = wsCategories.addRow(categoryHeaders);
      categoryHeaderRow.font = { bold: true };
      categoryHeaderRow.alignment = { horizontal: "left", vertical: "middle" };
      categoryHeaderRow.eachCell((cell) => {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      });

      categoriesData.forEach(cat => {
        const row = wsCategories.addRow([
          cat.categoryName || "",
          cat.description || "",
          cat.parentCategoryName || "",
        ]);
        row.eachCell((cell) => {
          cell.alignment = { horizontal: "left", vertical: "middle" };
        });
      });

      wsCategories.columns = [
        { width: 25, alignment: { horizontal: "left", vertical: "middle" } },
        { width: 40, alignment: { horizontal: "left", vertical: "middle" } },
        { width: 25, alignment: { horizontal: "left", vertical: "middle" } },
      ];
    }

    // Trang 3: Suppliers (nếu có)
    if (suppliersData && suppliersData.length > 0) {
      const wsSuppliers = workbook.addWorksheet("Nhà cung cấp");
      const supplierHeaders = ["Mã nhà cung cấp", "Tên nhà cung cấp", "Số điện thoại", "Email", "Địa chỉ", "Thành phố", "Phường/Xã"];
      const supplierHeaderRow = wsSuppliers.addRow(supplierHeaders);
      supplierHeaderRow.font = { bold: true };
      supplierHeaderRow.alignment = { horizontal: "left", vertical: "middle" };
      supplierHeaderRow.eachCell((cell) => {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      });

      suppliersData.forEach(sup => {
        const row = wsSuppliers.addRow([
          sup.supplierCode || "",
          sup.supplierName || "",
          sup.phone || "",
          sup.email || "",
          sup.address || "",
          sup.city || "",
          sup.ward || "",
        ]);
        row.eachCell((cell) => {
          cell.alignment = { horizontal: "left", vertical: "middle" };
        });
      });

      wsSuppliers.columns = [
        { width: 18, alignment: { horizontal: "left", vertical: "middle" } },
        { width: 40, alignment: { horizontal: "left", vertical: "middle" } },
        { width: 15, alignment: { horizontal: "left", vertical: "middle" } },
        { width: 30, alignment: { horizontal: "left", vertical: "middle" } },
        { width: 40, alignment: { horizontal: "left", vertical: "middle" } },
        { width: 20, alignment: { horizontal: "left", vertical: "middle" } },
        { width: 20, alignment: { horizontal: "left", vertical: "middle" } },
      ];
    }

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${title.replace(/\s+/g, "_").toLowerCase()}_template.xlsx`);
    message.success("Tải về mẫu thành công!");
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleClose}
      width={1200}
      destroyOnHidden={true}
      footer={[
        <Button
          key="template"
          icon={<DownloadOutlined />}
          onClick={downloadTemplate}
        >
          Tải về mẫu
        </Button>,
        <Button key="cancel" onClick={handleClose}>
          Huỷ
        </Button>,
        <Button
          key="import"
          type="primary"
          loading={loading}
          onClick={handleImport}
          disabled={fileData.length === 0}
        >
          Nhập dữ liệu ({fileData.length})
        </Button>,
      ]}
    >
      <Upload
        accept=".xlsx,.xls"
        beforeUpload={handleFileUpload}
        maxCount={1}
        fileList={fileList}
        onRemove={() => {
          setFileData([]);
          setFileList([]);
        }}
        showUploadList={true}
      >
        <Button icon={<UploadOutlined />}>Chọn tệp Excel</Button>
      </Upload>

      {fileData.length > 0 ? (
        <div style={{ marginTop: 20 }}>
          <p style={{ marginBottom: 10, fontWeight: 500 }}>
            Tìm thấy {fileData.length} dòng dữ liệu
            {Object.keys(validationErrors).length > 0 && (
              <span style={{ color: '#ff4d4f', marginLeft: 10 }}>
                (Có {Object.keys(validationErrors).length} dòng có lỗi)
              </span>
            )}
          </p>
          <style>
            {`
              .ant-table-tbody > tr.error-row > td {
                background-color: #fff2f0 !important;
              }
              .ant-table-tbody > tr.error-row:hover > td {
                background-color: #ffece8 !important;
              }
            `}
          </style>
          <Table
            columns={columns}
            dataSource={fileData.map((row, index) => ({
              ...row,
              error: validationErrors[index] || null,
            }))}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng ${total} dòng`
            }}
            size="small"
            scroll={{ x: 'max-content' }}
            bordered
            rowClassName={(record) => {
              return record.error ? 'error-row' : '';
            }}
          />
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            background: "#fafafa",
            padding: "40px",
            borderRadius: 8,
            marginTop: 20,
          }}
        >
          <UploadOutlined style={{ fontSize: 48, color: "#bbb" }} />
          <p style={{ color: "#666", margin: "10px 0 0 0" }}>
            Tải lên tệp Excel để xem trước dữ liệu
          </p>
        </div>
      )}
    </Modal>
  );
};

export default ImportExcelModal;
