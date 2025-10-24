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
  title = "Import Data from Excel",
}) => {
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const mapped = jsonData.map((row, i) => mapExcelRow(row, i));
        setFileData(mapped);
        message.success(`Loaded ${mapped.length} rows`);
      } catch (err) {
        console.error(err);
        message.error("Error reading Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleImport = async () => {
    if (fileData.length === 0) return message.warning("No data to import");
    setLoading(true);
    try {
      await onImport(fileData);
      message.success("Import successful!");
      onClose();
      setFileData([]);
    } catch (err) {
      console.error(err);
      message.error("Import failed!");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${title.replace(/\s+/g, "_").toLowerCase()}_template.xlsx`);
    message.success("Template downloaded!");
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="template" icon={<DownloadOutlined />} onClick={downloadTemplate}>
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
          Import ({fileData.length})
        </Button>,
      ]}
    >
      <Upload
        accept=".xlsx,.xls,.csv"
        beforeUpload={handleFileUpload}
        maxCount={1}
        onRemove={() => setFileData([])}
      >
        <Button icon={<UploadOutlined />}>Select Excel File</Button>
      </Upload>

      {fileData.length > 0 ? (
        <Table
          columns={columns}
          dataSource={fileData}
          pagination={{ pageSize: 10 }}
          size="small"
          style={{ marginTop: 20 }}
        />
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
          <p style={{ color: "#666" }}>Upload an Excel file to preview data</p>
        </div>
      )}
    </Modal>
  );
};

export default ImportExcelModal;
