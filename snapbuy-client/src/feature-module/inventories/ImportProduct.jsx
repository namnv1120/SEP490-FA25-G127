import { useState, useEffect, useMemo } from "react";
import ImportExcelModal from "../../components/modals/ImportExcelModal";
import { getAllCategories } from "../../services/CategoryService";
import { getAllSuppliers } from "../../services/SupplierService";
import { getAllProducts } from "../../services/ProductService";

const ImportProduct = ({ visible, onClose, onImport }) => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [suppliersData, setSuppliersData] = useState([]);
  const [productsData, setProductsData] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchCategories();
      fetchSuppliers();
      fetchProducts();
    }
  }, [visible]);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      // Map để có parentCategoryName
      const mapped = data.map((cat) => {
        const parent = data.find((p) => p.categoryId === cat.parentCategoryId);
        return {
          ...cat,
          parentCategoryName: parent ? parent.categoryName : "",
        };
      });
      setCategoriesData(mapped);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await getAllSuppliers();
      setSuppliersData(data);
    } catch (error) {
      console.error("Lỗi khi lấy nhà cung cấp:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProductsData(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    }
  };

  const productCodeMap = useMemo(() => {
    const map = new Map();
    productsData.forEach((product) => {
      const code = product.productCode?.trim().toLowerCase();
      if (code) {
        map.set(code, product);
      }
    });
    return map;
  }, [productsData]);

  const productNameMap = useMemo(() => {
    const map = new Map();
    productsData.forEach((product) => {
      const name = product.productName?.trim().toLowerCase();
      if (name) {
        map.set(name, product);
      }
    });
    return map;
  }, [productsData]);
  // Hàm validate dữ liệu đầy đủ
  const validateSupplierData = (data) => {
    const errors = new Array(data.length).fill(null);

    const codeCount = {};
    const nameCount = {};
    // Map để kiểm tra supplier code trùng với tên khác nhau
    const supplierCodeToNameMap = new Map();

    data.forEach((row) => {
      const code = (row.productCode || "").trim().toLowerCase();
      const name = (row.productName || "").trim().toLowerCase();
      if (code) codeCount[code] = (codeCount[code] || 0) + 1;
      if (name) nameCount[name] = (nameCount[name] || 0) + 1;

      // Track supplier code và name mapping
      const supplierCode = (row.supplierCode || "").trim().toLowerCase();
      const supplierName = (row.supplierName || "").trim().toLowerCase();
      if (supplierCode && supplierName) {
        if (!supplierCodeToNameMap.has(supplierCode)) {
          supplierCodeToNameMap.set(supplierCode, new Set());
        }
        supplierCodeToNameMap.get(supplierCode).add(supplierName);
      }
    });

    data.forEach((row, index) => {
      const rowErrors = [];
      const rowNum = index + 1;

      // Validate Product Code
      const productCode = (row.productCode || "").trim();
      if (!productCode) {
        rowErrors.push("Mã sản phẩm không được để trống");
      } else {
        if (productCode.length < 3 || productCode.length > 10) {
          rowErrors.push("Mã sản phẩm phải từ 3 đến 10 ký tự");
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(productCode)) {
          rowErrors.push(
            "Mã sản phẩm chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang"
          );
        }

        const normalizedCode = productCode.toLowerCase();
        const existingProductByCode = productCodeMap.get(normalizedCode);
        const normalizedName = (row.productName || "").trim().toLowerCase();

        if (existingProductByCode) {
          if (
            normalizedName &&
            existingProductByCode.productName &&
            existingProductByCode.productName.trim().toLowerCase() !==
            normalizedName
          ) {
            rowErrors.push(
              `Mã sản phẩm '${productCode}' đã tồn tại và thuộc về sản phẩm '${existingProductByCode.productName}'. ` +
              `Tên bạn nhập '${row.productName || ""}' không khớp`
            );
          } else {
            rowErrors.push(
              `Mã sản phẩm '${productCode}' đã tồn tại trong hệ thống`
            );
          }
        }
        if (codeCount[normalizedCode] > 1) {
          rowErrors.push(`Mã sản phẩm '${productCode}' bị trùng trong file`);
        }
      }

      const productName = (row.productName || "").trim();
      if (!productName) {
        rowErrors.push("Tên sản phẩm không được để trống");
      } else if (productName.length < 3 || productName.length > 100) {
        rowErrors.push("Tên sản phẩm phải từ 3 đến 100 ký tự");
      } else {
        const normalizedName = productName.toLowerCase();
        const existingProductByName = productNameMap.get(normalizedName);
        const normalizedCode = (row.productCode || "").trim().toLowerCase();
        const existingProductByCode = normalizedCode
          ? productCodeMap.get(normalizedCode)
          : null;
        const isSameProduct =
          existingProductByCode &&
          existingProductByName &&
          existingProductByCode.productId === existingProductByName.productId;

        if (existingProductByName) {
          if (
            normalizedCode &&
            existingProductByName.productCode &&
            existingProductByName.productCode.trim().toLowerCase() !==
            normalizedCode
          ) {
            rowErrors.push(
              `Tên sản phẩm '${productName}' đã tồn tại với mã '${existingProductByName.productCode}', ` +
              `nhưng bạn nhập mã '${row.productCode || ""}'`
            );
          } else if (!isSameProduct) {
            rowErrors.push(
              `Tên sản phẩm '${productName}' đã tồn tại trong hệ thống`
            );
          }
        }
        if (nameCount[normalizedName] > 1) {
          rowErrors.push(`Tên sản phẩm '${productName}' bị trùng trong file`);
        }
      }

      // Validate Category Name
      const categoryName = (row.categoryName || "").trim();
      if (!categoryName) {
        rowErrors.push("Tên danh mục không được để trống");
      }

      // Validate Supplier Code
      const supplierCode = (row.supplierCode || "").trim();
      if (!supplierCode) {
        rowErrors.push("Mã nhà cung cấp không được để trống");
      } else {
        if (supplierCode.length < 3 || supplierCode.length > 10) {
          rowErrors.push("Mã nhà cung cấp phải từ 3 đến 10 ký tự");
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(supplierCode)) {
          rowErrors.push(
            "Mã nhà cung cấp chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang"
          );
        }

        // Kiểm tra trùng mã nhà cung cấp với tên khác nhau trong file
        const normalizedSupplierCode = supplierCode.toLowerCase();
        const supplierNamesForCode = supplierCodeToNameMap.get(normalizedSupplierCode);
        if (supplierNamesForCode && supplierNamesForCode.size > 1) {
          rowErrors.push(
            `Mã nhà cung cấp '${supplierCode}' được sử dụng với nhiều tên khác nhau trong file.`
          );
        }
      }

      // Validate Supplier Name
      const supplierName = (row.supplierName || "").trim();
      if (!supplierName) {
        rowErrors.push("Tên nhà cung cấp không được để trống");
      } else if (supplierName.length < 3 || supplierName.length > 100) {
        rowErrors.push("Tên nhà cung cấp phải từ 3 đến 100 ký tự");
      }

      // Validate Unit
      const unit = (row.unit || "").trim();
      if (unit && unit.length > 10) {
        rowErrors.push("Đơn vị không được quá 10 ký tự");
      }

      // Validate Dimensions
      const dimensions = (row.dimensions || "").trim();
      if (dimensions && dimensions.length > 30) {
        rowErrors.push("Kích thước không được quá 30 ký tự");
      }

      // Validate Barcode
      const barcode = (row.barcode || "").trim();
      if (barcode) {
        if (barcode.length > 50) {
          rowErrors.push("Barcode không được quá 50 ký tự");
        }
        if (!/^[a-zA-Z0-9]*$/.test(barcode)) {
          rowErrors.push("Barcode chỉ được chứa chữ và số");
        }
      }

      // Validate Supplier matching
      if (supplierCode && supplierName) {
        const supplierByCode = suppliersData.find(
          (s) =>
            s.supplierCode &&
            s.supplierCode.trim().toLowerCase() === supplierCode.toLowerCase()
        );
        const supplierByName = suppliersData.find(
          (s) =>
            s.supplierName &&
            s.supplierName.trim().toLowerCase() === supplierName.toLowerCase()
        );

        const codeExists = supplierByCode != null;
        const nameExists = supplierByName != null;

        if (codeExists && nameExists) {
          if (supplierByCode.supplierId !== supplierByName.supplierId) {
            rowErrors.push(
              `Mã nhà cung cấp '${supplierCode}' và tên nhà cung cấp '${supplierName}' không khớp`
            );
          }
        } else if (codeExists && !nameExists) {
          rowErrors.push(
            `Mã nhà cung cấp '${supplierCode}' đã tồn tại nhưng tên '${supplierName}' không khớp`
          );
        } else if (!codeExists && nameExists) {
          rowErrors.push(
            `Tên nhà cung cấp '${supplierName}' đã tồn tại nhưng mã '${supplierCode}' không khớp`
          );
        }
      }

      // Validate Category - kiểm tra category có con hay không
      if (categoryName) {
        const category = categoriesData.find(
          (c) =>
            c.categoryName &&
            c.categoryName.trim().toLowerCase() === categoryName.toLowerCase()
        );
        if (category) {
          // Kiểm tra category có con hay không
          const hasChildren = categoriesData.some(
            (c) => c.parentCategoryId === category.categoryId
          );

          if (hasChildren) {
            // Category có con, bắt buộc phải nhập subCategoryName
            const subCategoryName = (row.subCategoryName || "").trim();
            if (!subCategoryName) {
              rowErrors.push(
                `Danh mục '${categoryName}' đã có danh mục con. Bắt buộc phải nhập danh mục con`
              );
            } else {
              // Kiểm tra subCategory có thuộc về category này không
              const subCategory = categoriesData.find(
                (c) =>
                  c.categoryName &&
                  c.categoryName.trim().toLowerCase() ===
                  subCategoryName.toLowerCase()
              );
              if (subCategory) {
                if (subCategory.parentCategoryId !== category.categoryId) {
                  rowErrors.push(
                    `Danh mục con '${subCategoryName}' không thuộc về danh mục '${categoryName}'`
                  );
                }
              }
            }
          }
        }
      }

      if (rowErrors.length > 0) {
        errors[index] = `Dòng ${rowNum}: ${rowErrors.join("; ")}`;
      }
    });

    return { errors, validatedData: data };
  };

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "productCode",
      key: "productCode",
      width: 120,
      fixed: "left",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: 200,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 150,
    },
    {
      title: "Danh mục con(Tuỳ chọn)",
      dataIndex: "subCategoryName",
      key: "subCategoryName",
      width: 150,
    },
    {
      title: "Mã nhà cung cấp",
      dataIndex: "supplierCode",
      key: "supplierCode",
      width: 120,
    },
    {
      title: "Tên nhà cung cấp",
      dataIndex: "supplierName",
      key: "supplierName",
      width: 200,
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 100,
    },
    {
      title: "Kích thước",
      dataIndex: "dimensions",
      key: "dimensions",
      width: 150,
    },
    {
      title: "Barcode",
      dataIndex: "barcode",
      key: "barcode",
      width: 150,
    },
    {
      title: "Lỗi",
      dataIndex: "error",
      key: "error",
      width: 400,
      render: (text) => {
        if (!text) return null;
        return (
          <span style={{ color: "#ff4d4f", fontSize: "12px" }}>{text}</span>
        );
      },
    },
  ];

  const mapExcelRow = (row, index) => {
    return {
      key: index,
      productCode: row["Mã sản phẩm"] || "",
      productName: row["Tên sản phẩm"] || "",
      description: row["Mô tả"] || "",
      categoryName: row["Danh mục"] || "",
      subCategoryName: row["Danh mục con"] || "",
      supplierCode: row["Mã nhà cung cấp"] || "",
      supplierName: row["Tên nhà cung cấp"] || "",
      unit: row["Đơn vị"] || "",
      dimensions: row["Kích thước"] || "",
      barcode: row["Barcode"] || "",
    };
  };

  const templateData = [
    {
      "Mã sản phẩm": "PRD001",
      "Tên sản phẩm": "Samsung Galaxy S23",
      "Mô tả": "Latest Samsung flagship phone",
      "Danh mục": "Electronics",
      "Danh mục con": "",
      "Mã nhà cung cấp": "SUP001",
      "Tên nhà cung cấp": "Samsung Vietnam",
      "Đơn vị": "Cái",
      "Kích thước": "15x7x0.8",
      Barcode: "1234567890123",
    },
    {
      "Mã sản phẩm": "PRD002",
      "Tên sản phẩm": "Apple iPhone 14",
      "Mô tả": "Newest iPhone model",
      "Danh mục": "Electronics",
      "Danh mục con": "",
      "Mã nhà cung cấp": "SUP002",
      "Tên nhà cung cấp": "Apple",
      "Đơn vị": "Cái",
      "Kích thước": "15x7x0.8",
      Barcode: "9876543210987",
    },
  ];

  const guideData = [
    {
      Cột: "Mã sản phẩm",
      "Quy tắc":
        "BẮT BUỘC. Từ 3-10 ký tự. Chỉ chứa chữ, số, gạch dưới (_) hoặc gạch ngang (-). Không được trùng với mã đã có trong hệ thống.",
    },
    {
      Cột: "Tên sản phẩm",
      "Quy tắc":
        "BẮT BUỘC. Từ 3-100 ký tự. Không được trùng với tên đã có trong hệ thống.",
    },
    { Cột: "Mô tả", "Quy tắc": "Tùy chọn. Mô tả về sản phẩm." },
    {
      Cột: "Danh mục",
      "Quy tắc":
        "BẮT BUỘC. Tên danh mục chính. Nếu danh mục đã có danh mục con, BẮT BUỘC phải nhập 'Danh mục con'.",
    },
    {
      Cột: "Danh mục con",
      "Quy tắc":
        "Tùy chọn. BẮT BUỘC nếu 'Danh mục' đã có danh mục con. Phải thuộc về 'Danh mục' đã nhập.",
    },
    {
      Cột: "Mã nhà cung cấp",
      "Quy tắc":
        "BẮT BUỘC. Từ 3-10 ký tự. Chỉ chứa chữ, số, gạch dưới (_) hoặc gạch ngang (-). Mỗi mã chỉ được dùng với 1 tên duy nhất trong file.",
    },
    {
      Cột: "Tên nhà cung cấp",
      "Quy tắc":
        "BẮT BUỘC. Từ 3-100 ký tự. Phải khớp với 'Mã nhà cung cấp' (nếu mã đã có trong hệ thống).",
    },
    {
      Cột: "Đơn vị",
      "Quy tắc": "Tùy chọn. Tối đa 10 ký tự. Ví dụ: Cái, Chiếc, Kg, Lít...",
    },
    {
      Cột: "Kích thước",
      "Quy tắc": "Tùy chọn. Tối đa 30 ký tự. Ví dụ: 15x7x0.8",
    },
    {
      Cột: "Barcode",
      "Quy tắc":
        "Tùy chọn. Tối đa 50 ký tự. Chỉ chứa chữ và số. Không được trùng với barcode đã có trong hệ thống.",
    },
    { Cột: "", "Quy tắc": "" },
    {
      Cột: "LƯU Ý:",
      "Quy tắc":
        "1. Không được trùng mã sản phẩm hoặc tên sản phẩm trong cùng file Excel.",
    },
    {
      Cột: "",
      "Quy tắc":
        "2. Mã nhà cung cấp và tên nhà cung cấp phải khớp với nhau (nếu đã có trong hệ thống).",
    },
    {
      Cột: "",
      "Quy tắc":
        "3. Mỗi mã nhà cung cấp chỉ được dùng với 1 tên duy nhất trong file.",
    },
    {
      Cột: "",
      "Quy tắc":
        "4. Nếu danh mục đã có danh mục con, bắt buộc phải nhập danh mục con, không được dùng danh mục cha.",
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
      categoriesData={categoriesData}
      suppliersData={suppliersData}
      guideData={guideData}
      validateData={validateSupplierData}
      title="Thêm sản phẩm từ Excel"
    />
  );
};

export default ImportProduct;
