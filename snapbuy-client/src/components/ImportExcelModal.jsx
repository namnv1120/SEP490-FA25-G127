import { useState } from "react";
import { Modal, Upload, Button, message, Table } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

const ImportExcelModal = ({
  visible,
  onClose,
  onImport,
  columns,
  mapExcelRow,
  templateData,
  categoriesData = [],
  suppliersData = [],
  validateData = null, // Hàm validate dữ liệu, trả về { errors: [], validatedData: [] }
  title = "Thêm dữ liệu từ excel",
}) => {
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [validationErrors, setValidationErrors] = useState({}); // { rowIndex: "error message" }

  const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          raw: false,  // Format dữ liệu
          defval: ""   // Giá trị mặc định cho ô trống
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

      } catch (err) {
        message.error("Lỗi khi đọc dữ liệu Excel. Vui lòng kiểm tra file!");
        setFileData([]);
        setFileList([]);
      }
    };

    reader.onerror = () => {
      message.error("Không thể đọc file!");
    };

    reader.readAsArrayBuffer(file);
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

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Trang 1: Products template
    const wsProducts = XLSX.utils.json_to_sheet(templateData);
    // Set độ rộng cột cho sheet Sản phẩm
    wsProducts["!cols"] = [
      { wch: 15 }, // Mã sản phẩm
      { wch: 30 }, // Tên sản phẩm
      { wch: 40 }, // Mô tả
      { wch: 20 }, // Danh mục
      { wch: 25 }, // Danh mục con
      { wch: 18 }, // Mã nhà cung cấp
      { wch: 30 }, // Tên nhà cung cấp
      { wch: 12 }, // Đơn vị
      { wch: 18 }, // Kích thước
      { wch: 20 }, // Barcode
    ];
    XLSX.utils.book_append_sheet(wb, wsProducts, "Sản phẩm");

    // Trang 2: Categories (nếu có)
    if (categoriesData && categoriesData.length > 0) {
      const categoriesSheet = categoriesData.map(cat => ({
        "Tên danh mục": cat.categoryName || "",
        "Mô tả": cat.description || "",
        "Danh mục cha": cat.parentCategoryName || "",
      }));
      const wsCategories = XLSX.utils.json_to_sheet(categoriesSheet);
      // Set độ rộng cột cho sheet Danh mục
      wsCategories["!cols"] = [
        { wch: 25 }, // Tên danh mục
        { wch: 40 }, // Mô tả
        { wch: 25 }, // Danh mục cha
      ];
      XLSX.utils.book_append_sheet(wb, wsCategories, "Danh mục");
    }

    // Trang 3: Suppliers (nếu có)
    if (suppliersData && suppliersData.length > 0) {
      const suppliersSheet = suppliersData.map(sup => ({
        "Mã nhà cung cấp": sup.supplierCode || "",
        "Tên nhà cung cấp": sup.supplierName || "",
        "Số điện thoại": sup.phone || "",
        "Email": sup.email || "",
        "Địa chỉ": sup.address || "",
        "Thành phố": sup.city || "",
        "Phường/Xã": sup.ward || "",
      }));
      const wsSuppliers = XLSX.utils.json_to_sheet(suppliersSheet);
      // Set độ rộng cột cho sheet Nhà cung cấp
      wsSuppliers["!cols"] = [
        { wch: 18 }, // Mã nhà cung cấp
        { wch: 30 }, // Tên nhà cung cấp
        { wch: 15 }, // Số điện thoại
        { wch: 30 }, // Email
        { wch: 40 }, // Địa chỉ
        { wch: 20 }, // Thành phố
        { wch: 20 }, // Phường/Xã
      ];
      XLSX.utils.book_append_sheet(wb, wsSuppliers, "Nhà cung cấp");
    }

    XLSX.writeFile(wb, `${title.replace(/\s+/g, "_").toLowerCase()}_template.xlsx`);
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
