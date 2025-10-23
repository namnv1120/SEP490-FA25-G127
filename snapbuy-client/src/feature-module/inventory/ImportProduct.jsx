import { useState } from "react";
import { Modal, Upload, Button, message, Table } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

const ImportProductModal = ({ visible, onClose, onImport }) => {
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Xử lý khi chọn file Excel
  const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log("📊 Parsed Excel data:", jsonData);

        // Map data - chỉ cần map field names
        const mappedData = jsonData.map((row, index) => ({
          key: index,
          productCode: row.productCode || row.code || "",
          productName: row.productName || row.name || "",
          description: row.description || "",
          categoryName: row.categoryName || row.category || "", // 👈 Tên category
          supplierName: row.supplierName || row.supplier || "", // 👈 Tên supplier
          unit: row.unit || "",
          dimensions: row.dimensions || "",
          imageUrl: row.imageUrl || row.image || "",
        }));

        setFileData(mappedData);
        message.success(`File uploaded successfully! Found ${mappedData.length} rows.`);
      } catch (error) {
        message.error("Error reading file! Please check the file format.");
        console.error("❌ Error reading Excel:", error);
      }
    };

    reader.readAsArrayBuffer(file);
    return false;
  };

  // Xử lý import
  const handleImport = async () => {
    if (fileData.length === 0) {
      message.warning("Please upload a file first!");
      return;
    }

    setLoading(true);
    try {
      await onImport(fileData);
      setFileData([]);
      onClose();
    } catch (error) {
      message.error("Import failed! Please check the data and try again.");
      console.error("❌ Import error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Download template Excel
  const downloadTemplate = () => {
    const template = [
      {
        productCode: "PROD001",
        productName: "Samsung Galaxy S23",
        description: "Latest Samsung flagship phone",
        categoryName: "Electronics", // 👈 Chỉ cần tên
        supplierName: "Samsung Vietnam", // 👈 Chỉ cần tên
        unit: "piece",
        dimensions: "15x7x0.8",
        imageUrl: "https://example.com/galaxy-s23.jpg",
      },
      {
        productCode: "PROD002",
        productName: "iPhone 15 Pro",
        description: "Apple iPhone 15 Pro",
        categoryName: "Electronics",
        supplierName: "Apple Store",
        unit: "piece",
        dimensions: "14.7x7.1x0.8",
        imageUrl: "https://example.com/iphone-15.jpg",
      },
      {
        productCode: "PROD003",
        productName: "Dell XPS 15",
        description: "High performance laptop",
        categoryName: "Computers",
        supplierName: "Dell Vietnam",
        unit: "piece",
        dimensions: "34x23x1.8",
        imageUrl: "https://example.com/dell-xps15.jpg",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // productCode
      { wch: 30 }, // productName
      { wch: 40 }, // description
      { wch: 20 }, // categoryName
      { wch: 30 }, // supplierName
      { wch: 10 }, // unit
      { wch: 15 }, // dimensions
      { wch: 40 }, // imageUrl
    ];

    XLSX.writeFile(workbook, "product_import_template.xlsx");
    message.success("Template downloaded successfully!");
  };

  // Columns cho preview table
  const columns = [
    {
      title: "Code",
      dataIndex: "productCode",
      key: "productCode",
      width: 120,
    },
    {
      title: "Name",
      dataIndex: "productName",
      key: "productName",
      width: 200,
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 150,
    },
    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
      width: 250,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      width: 80,
    },
  ];

  return (
    <Modal
      title="Import Products from Excel"
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button
          key="download"
          icon={<DownloadOutlined />}
          onClick={downloadTemplate}
        >
          Download Template
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="import"
          type="primary"
          loading={loading}
          onClick={handleImport}
          disabled={fileData.length === 0}
        >
          Import {fileData.length > 0 && `(${fileData.length} products)`}
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Upload
          accept=".xlsx,.xls,.csv"
          beforeUpload={handleFileUpload}
          maxCount={1}
          onRemove={() => setFileData([])}
          showUploadList={true}
        >
          <Button icon={<UploadOutlined />} size="large">
            Select Excel File
          </Button>
        </Upload>
        <div style={{ marginTop: 8 }}>
          <p style={{ color: "#999", fontSize: 12, margin: 0 }}>
            Supported formats: .xlsx, .xls, .csv
          </p>
          <p style={{ color: "#1890ff", fontSize: 12, margin: "4px 0 0 0" }}>
            💡 Tip: Category and Supplier names must match exactly with existing data (case-insensitive)
          </p>
        </div>
      </div>

      {fileData.length > 0 && (
        <div>
          <h4 style={{ marginBottom: 12 }}>
            Preview Data ({fileData.length} rows)
          </h4>
          <Table
            columns={columns}
            dataSource={fileData}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            size="small"
            scroll={{ x: 900, y: 400 }}
          />
        </div>
      )}

      {fileData.length === 0 && (
        <div style={{
          padding: "40px 20px",
          textAlign: "center",
          background: "#f5f5f5",
          borderRadius: "8px",
          marginTop: "16px"
        }}>
          <UploadOutlined style={{ fontSize: 48, color: "#ccc" }} />
          <p style={{ marginTop: 16, color: "#666" }}>
            No file selected. Please upload an Excel file to preview data.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default ImportProductModal;
