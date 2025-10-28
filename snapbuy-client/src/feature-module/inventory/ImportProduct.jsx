import ImportExcelModal from "../../components/ImportExcelModal";

const ImportProduct = ({ visible, onClose, onImport }) => {
  const columns = [
    { 
      title: "Mã sản phẩm", 
      dataIndex: "productCode", 
      key: "productCode", 
      width: 120,
      fixed: 'left'
    },
    { 
      title: "Tên sản phẩm", 
      dataIndex: "productName", 
      key: "productName", 
      width: 200 
    },
    { 
      title: "Danh mục", 
      dataIndex: "categoryName", 
      key: "categoryName", 
      width: 150 
    },
    { 
      title: "Nhà cung cấp", 
      dataIndex: "supplierName", 
      key: "supplierName", 
      width: 200 
    },
    { 
      title: "Đơn vị", 
      dataIndex: "unit", 
      key: "unit", 
      width: 100 
    },
    { 
      title: "Kích thước", 
      dataIndex: "dimensions", 
      key: "dimensions", 
      width: 150 
    },
    { 
      title: "Mô tả", 
      dataIndex: "description", 
      key: "description", 
      width: 250 
    },
  ];

  const mapExcelRow = (row, index) => {
    console.log("🔄 Mapping row:", row); // Debug log
    
    return {
      key: index,
      productCode: row["Mã sản phẩm"] || "",
      productName: row["Tên sản phẩm"] || "",
      description: row["Mô tả"] || "",
      categoryName: row["Danh mục"] || "",
      supplierName: row["Nhà cung cấp"] || "",
      unit: row["Đơn vị"] || "",
      dimensions: row["Kích thước"] || "",
      imageUrl: row["Ảnh"] || "",
    };
  };

  const templateData = [
    {
      "Mã sản phẩm": "PRD1",
      "Tên sản phẩm": "Samsung Galaxy S23",
      "Mô tả": "Latest Samsung flagship phone",
      "Danh mục": "Electronics",
      "Nhà cung cấp": "Samsung Vietnam",
      "Đơn vị": "Cái",
      "Kích thước": "15x7x0.8",
      "Ảnh": ""
    },
    {
      "Mã sản phẩm": "PRD2",
      "Tên sản phẩm": "Apple iPhone 14",
      "Mô tả": "Newest iPhone model",
      "Danh mục": "Electronics",
      "Nhà cung cấp": "Apple",
      "Đơn vị": "Cái",
      "Kích thước": "15x7x0.8",
      "Ảnh": ""
    }
  ];

  return (
    <ImportExcelModal
      visible={visible}
      onClose={onClose}
      onImport={onImport}
      columns={columns}
      mapExcelRow={mapExcelRow}
      templateData={templateData}
      title="Thêm sản phẩm từ Excel"
    />
  );
};

export default ImportProduct;
