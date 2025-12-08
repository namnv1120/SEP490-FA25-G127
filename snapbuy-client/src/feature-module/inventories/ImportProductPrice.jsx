import { useState, useEffect, useCallback } from "react";
import ImportExcelModal from "../../components/modals/ImportExcelModal";
import { getAllProductPrices } from "../../services/ProductPriceService";
import { getAllProducts } from "../../services/ProductService";
import { importProductPrices } from "../../services/ProductPriceService";

const ImportProductPrice = ({ visible, onClose, onImportSuccess }) => {
  const [productsData, setProductsData] = useState([]);
  const [productPricesData, setProductPricesData] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchProducts();
      fetchProductPrices();
    }
  }, [visible]);

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProductsData(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    }
  };

  const fetchProductPrices = async () => {
    try {
      const data = await getAllProductPrices();
      setProductPricesData(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách giá sản phẩm:", error);
    }
  };

  // Hàm parse giá từ Excel (có thể có dấu phẩy, dấu chấm, ký tự tiền tệ)
  const parsePrice = (priceStr) => {
    if (!priceStr || priceStr === "") return null;

    // Loại bỏ ký tự tiền tệ và khoảng trắng
    let cleaned = String(priceStr).replace(/[₫đ,.\s]/g, "");

    // Nếu có dấu phẩy làm phân cách hàng nghìn, loại bỏ
    if (cleaned.includes(",") && cleaned.split(",").length > 2) {
      cleaned = cleaned.replace(/,/g, "");
    }

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  // Hàm validate dữ liệu
  const validatePriceData = useCallback(
    (data) => {
      const errors = new Array(data.length).fill(null);

      data.forEach((row, index) => {
        const rowErrors = [];
        const rowNum = index + 1;

        // Validate Product Code
        const productCode = (row.productCode || "").trim();
        if (!productCode) {
          rowErrors.push("Mã sản phẩm không được để trống");
        } else {
          // Kiểm tra sản phẩm có tồn tại không
          const productExists = productsData.some(
            (p) =>
              p.productCode &&
              p.productCode.trim().toLowerCase() === productCode.toLowerCase()
          );
          if (!productExists) {
            rowErrors.push(`Không tìm thấy sản phẩm với mã '${productCode}'`);
          }
        }

        // Validate Unit Price
        const unitPrice = parsePrice(row.unitPrice);
        if (unitPrice === null || unitPrice === undefined) {
          rowErrors.push("Giá bán không được để trống");
        } else if (unitPrice <= 0) {
          rowErrors.push("Giá bán phải lớn hơn 0");
        }

        // Validate Cost Price
        const costPrice = parsePrice(row.costPrice);
        if (costPrice === null || costPrice === undefined) {
          rowErrors.push("Giá nhập không được để trống");
        } else if (costPrice < 0) {
          rowErrors.push("Giá nhập không được âm");
        }

        if (rowErrors.length > 0) {
          errors[index] = `Dòng ${rowNum}: ${rowErrors.join("; ")}`;
        }
      });

      return { errors, validatedData: data };
    },
    [productsData]
  );

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "productCode",
      key: "productCode",
      width: 150,
      fixed: "left",
      render: (text) => <span style={{ color: "#666" }}>{text}</span>,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: 250,
      render: (text) => <span style={{ color: "#666" }}>{text}</span>,
    },
    {
      title: "Giá bán",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 150,
    },
    {
      title: "Giá nhập",
      dataIndex: "costPrice",
      key: "costPrice",
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
    const unitPrice = parsePrice(row["Giá bán"]);
    const costPrice = parsePrice(row["Giá nhập"]);

    // Tìm tên sản phẩm từ mã
    const product = productsData.find(
      (p) =>
        p.productCode &&
        p.productCode.trim().toLowerCase() ===
        (row["Mã sản phẩm"] || "").trim().toLowerCase()
    );

    return {
      key: index,
      productCode: row["Mã sản phẩm"] || "",
      productName: product ? product.productName : "",
      unitPrice: unitPrice !== null ? unitPrice : row["Giá bán"] || "",
      costPrice: costPrice !== null ? costPrice : row["Giá nhập"] || "",
    };
  };

  // Tạo template data với tất cả sản phẩm và giá hiện tại
  const getTemplateData = () => {
    return productsData.map((product) => {
      // Tìm giá hiện tại của sản phẩm
      const currentPrice = productPricesData.find(
        (pp) => pp.productId === product.productId
      );

      return {
        "Mã sản phẩm": product.productCode || "",
        "Tên sản phẩm": product.productName || "",
        "Giá bán": currentPrice?.unitPrice || 0,
        "Giá nhập": currentPrice?.costPrice || 0,
      };
    });
  };

  const handleImport = async (data) => {
    try {
      // Chuyển đổi dữ liệu sang format API
      const importData = data.map((row) => ({
        productCode: row.productCode,
        unitPrice:
          typeof row.unitPrice === "number"
            ? row.unitPrice
            : parsePrice(row.unitPrice),
        costPrice:
          typeof row.costPrice === "number"
            ? row.costPrice
            : parsePrice(row.costPrice),
      }));

      await importProductPrices(importData);

      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Nhập dữ liệu thất bại!";
      throw new Error(errorMessage);
    }
  };

  const guideData = [
    {
      Cột: "Mã sản phẩm",
      "Quy tắc":
        "BẮT BUỘC. Mã sản phẩm phải tồn tại trong hệ thống. Không được để trống.",
    },
    {
      Cột: "Tên sản phẩm",
      "Quy tắc":
        "CHỈ ĐỌC. Tên sản phẩm tự động hiển thị theo mã sản phẩm. Không được chỉnh sửa.",
    },
    {
      Cột: "Giá bán",
      "Quy tắc":
        "BẮT BUỘC. Phải lớn hơn 0. Có thể nhập số nguyên hoặc số thập phân.",
    },
    {
      Cột: "Giá nhập",
      "Quy tắc":
        "BẮT BUỘC. Phải lớn hơn hoặc bằng 0. Có thể nhập số nguyên hoặc số thập phân.",
    },
    { Cột: "", "Quy tắc": "" },
    {
      Cột: "LƯU Ý:",
      "Quy tắc":
        "1. Chức năng này là CẬP NHẬT giá, không phải tạo mới. Giá sẽ được cập nhật cho sản phẩm tương ứng.",
    },
    {
      Cột: "",
      "Quy tắc": "2. Nếu sản phẩm chưa có giá, hệ thống sẽ tạo giá mới.",
    },
    {
      Cột: "",
      "Quy tắc":
        "3. Nếu sản phẩm đã có giá, hệ thống sẽ cập nhật giá hiện tại.",
    },
    {
      Cột: "",
      "Quy tắc":
        "4. Có thể bỏ qua các dòng không cần cập nhật, chỉ cập nhật những sản phẩm cần thiết.",
    },
  ];

  return (
    <ImportExcelModal
      visible={visible}
      onClose={onClose}
      onImport={handleImport}
      columns={columns}
      mapExcelRow={mapExcelRow}
      templateData={getTemplateData()}
      guideData={guideData}
      validateData={validatePriceData}
      title="Nhập giá sản phẩm từ Excel"
    />
  );
};

export default ImportProductPrice;
