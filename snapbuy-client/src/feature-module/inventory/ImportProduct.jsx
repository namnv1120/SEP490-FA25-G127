import ImportExcelModal from "../../components/ImportExcelModal";

const ImportProduct = ({ visible, onClose, onImport }) => {
  const columns = [
    { title: "Mã sản phẩm", dataIndex: "Mã sản phẩm", key: "productCode", width: 120 },
    { title: "Tên sản phẩm", dataIndex: "Tên sản phẩm", key: "productName", width: 200 },
    { title: "Danh mục", dataIndex: "Danh mục", key: "categoryName", width: 150 },
    { title: "Nhà cung cấp", dataIndex: "Nhà cung cấp", key: "supplierName", width: 200 },
    { title: "Đơn vị", dataIndex: "Đơn vị", key: "unit", width: 100 },
    { title: "Kích thước", dataIndex: "Kích thước", key: "dimensions", width: 150 },
    { title: "Mô tả", dataIndex: "Mô tả", key: "description", width: 250 },
  ];

  const mapExcelRow = (row, index) => ({
    key: index,
    productCode: row.productCode || row.code || "",
    productName: row.productName || row.name || "",
    description: row.description || "",
    categoryName: row.categoryName || row.category || "",
    supplierName: row.supplierName || row.supplier || "",
    unit: row.unit || "",
    dimensions: row.dimensions || "",
    imageUrl: row.imageUrl || row.image || "",
  });

  const templateData = [
    {
      productCode: "PROD001",
      productName: "Samsung Galaxy S23",
      description: "Latest Samsung flagship phone",
      categoryName: "Electronics",
      supplierName: "Samsung Vietnam",
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
