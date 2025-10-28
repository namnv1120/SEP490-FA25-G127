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
  title = "Thêm dữ liệu từ excel",
}) => {
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // ✅ Đọc dữ liệu với header
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          raw: false,  // Format dữ liệu
          defval: ""   // Giá trị mặc định cho ô trống
        });

        console.log("📊 Raw Excel Data:", jsonData);

        if (jsonData.length === 0) {
          message.warning("File Excel không có dữ liệu!");
          return;
        }

        // ✅ Map dữ liệu
        const mapped = jsonData.map((row, i) => mapExcelRow(row, i));
        console.log("✅ Mapped Data:", mapped);

        // ✅ Update cả fileList và fileData cùng lúc
        setFileList([{
          uid: file.uid,
          name: file.name,
          status: 'done',
        }]);

        setFileData(mapped);
        message.success(`Đã tải ${mapped.length} dòng dữ liệu`);

      } catch (err) {
        console.error("❌ Lỗi đọc Excel:", err);
        message.error("Lỗi khi đọc dữ liệu Excel. Vui lòng kiểm tra file!");
        setFileData([]);
        setFileList([]);
      }
    };

    reader.onerror = (error) => {
      console.error("❌ FileReader Error:", error);
      message.error("Không thể đọc file!");
    };

    reader.readAsArrayBuffer(file);
    return false; // Ngăn auto upload
  };

  const handleImport = async () => {
    if (fileData.length === 0) {
      return message.warning("Không có dữ liệu để nhập");
    }

    setLoading(true);
    try {
      await onImport(fileData);
      message.success("Nhập dữ liệu thành công!");
      handleClose();
    } catch (err) {
      console.error("❌ Import Error:", err);
      message.error(err.message || "Nhập dữ liệu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFileData([]);
    setFileList([]);
    onClose();
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${title.replace(/\s+/g, "_").toLowerCase()}_template.xlsx`);
    message.success("Tải về mẫu thành công!");
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleClose}
      width={1200}
      destroyOnClose={true}
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
          </p>
          <Table
            columns={columns}
            dataSource={fileData}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng ${total} dòng`
            }}
            size="small"
            scroll={{ x: 'max-content' }}
            bordered
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
