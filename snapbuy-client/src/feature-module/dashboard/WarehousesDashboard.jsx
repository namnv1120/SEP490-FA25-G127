import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getAllInventories } from "../../services/InventoryService";
import { getAllProducts } from "../../services/ProductService";
import { getTransactions } from "../../services/InventoryTransactionsService";
import { getAllPurchaseOrders } from "../../services/PurchaseOrderService";
import { getMyInfo } from "../../services/AccountService";
import PageLoader from "../../components/loading/PageLoader.jsx";
import CommonFooter from "../../components/footer/CommonFooter";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const WarehousesOwnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ fullName: "" });
  const [inventories, setInventories] = useState([]);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [_purchaseOrders, setPurchaseOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        console.log("=== Loading Warehouse Dashboard Data ===");

        const [
          inventoriesData,
          productsData,
          transactionsData,
          purchaseOrdersData,
          userInfoData,
        ] = await Promise.all([
          getAllInventories().catch((err) => {
            console.error("Failed to load inventories:", err);
            return [];
          }),
          getAllProducts().catch((err) => {
            console.error("Failed to load products:", err);
            return [];
          }),
          getTransactions({ page: 0, size: 50 }).catch((err) => {
            console.error("Failed to load transactions:", err);
            return { content: [] };
          }),
          getAllPurchaseOrders().catch((err) => {
            console.error("Failed to load purchase orders:", err);
            return [];
          }),
          getMyInfo().catch((err) => {
            console.error("Failed to load user info:", err);
            return { fullName: "" };
          }),
        ]);

        console.log("Inventories loaded:", inventoriesData);
        console.log("Products loaded:", productsData);
        console.log("Transactions loaded:", transactionsData);
        console.log("Purchase orders loaded:", purchaseOrdersData);

        setInventories(Array.isArray(inventoriesData) ? inventoriesData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setTransactions(
          Array.isArray(transactionsData?.content)
            ? transactionsData.content
            : Array.isArray(transactionsData)
              ? transactionsData
              : []
        );
        setPurchaseOrders(
          Array.isArray(purchaseOrdersData) ? purchaseOrdersData : []
        );

        const userData = userInfoData.result || userInfoData;
        setUserInfo({ fullName: userData.fullName || "" });

        console.log("=== Warehouse Dashboard Data Loaded Successfully ===");
      } catch (error) {
        console.error("Error fetching warehouse data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate inventory statistics (với logic cảnh báo hợp lý)
  const inventoryStats = useMemo(() => {
    let totalValue = 0;
    let criticalStock = 0; // Dưới tồn kho tối thiểu
    let lowStock = 0; // Đến điểm đặt hàng lại
    let outOfStock = 0;
    let overStock = 0; // Vượt tồn kho tối đa
    let totalSKUs = inventories.length;
    let totalCategories = new Set();

    console.log("=== Calculating Inventory Stats ===");

    inventories.forEach((inv, index) => {
      if (index === 0) {
        console.log("Sample inventory item:", inv);
      }

      const qty = Number(inv.quantityInStock || inv.stockQuantity || 0);
      const minStock = Number(inv.minimumStock || 0);
      const maxStock = Number(inv.maximumStock || Infinity);
      const reorderPoint = Number(inv.reorderPoint || minStock || 10);

      // ✅ Join với products array để lấy giá và category
      const product = products.find(p => p.productId === inv.productId);
      const price = Number(
        product?.unitPrice ||
        product?.costPrice ||
        inv.unitPrice ||
        inv.costPrice ||
        0
      );

      // Đếm số danh mục
      const categoryName = product?.categoryName || inv.categoryName || "Khác";
      totalCategories.add(categoryName);

      if (index < 3) {
        console.log(`--- Inventory ${index} ---`);
        console.log("Quantity:", qty);
        console.log("Min Stock:", minStock);
        console.log("Reorder Point:", reorderPoint);
        console.log("Max Stock:", maxStock);
        console.log("Price:", price);
        console.log("Value:", qty * price);
      }

      totalValue += qty * price;

      // Phân loại trạng thái tồn kho
      if (qty === 0) {
        outOfStock++;
      } else if (minStock > 0 && qty < minStock) {
        criticalStock++; // Dưới mức tối thiểu - rất nguy hiểm
      } else if (reorderPoint > 0 && qty <= reorderPoint) {
        lowStock++; // Đến điểm đặt hàng lại
      } else if (maxStock < Infinity && qty > maxStock) {
        overStock++; // Tồn kho quá cao
      }
    });

    console.log("Total Value:", totalValue);
    console.log("Total Categories:", totalCategories.size);
    console.log("Critical Stock:", criticalStock);
    console.log("Low Stock (Reorder):", lowStock);
    console.log("Out of Stock:", outOfStock);
    console.log("Over Stock:", overStock);
    console.log("Total SKUs:", totalSKUs);

    return {
      totalValue,
      totalCategories: totalCategories.size,
      criticalStock,
      lowStock,
      outOfStock,
      overStock,
      totalSKUs,
    };
  }, [inventories, products]);

  // Stock level distribution (dựa trên minimumStock, reorderPoint, maximumStock)
  const stockDistribution = useMemo(() => {
    const ranges = {
      "Hết hàng": 0,
      "Cấp bách": 0, // < minimumStock
      "Cần đặt hàng": 0, // <= reorderPoint
      "Bình thường": 0,
      "Dư thừa": 0, // > maximumStock
    };

    inventories.forEach((inv) => {
      const qty = Number(inv.quantityInStock || inv.stockQuantity || 0);
      const minStock = Number(inv.minimumStock || 0);
      const maxStock = Number(inv.maximumStock || Infinity);
      const reorderPoint = Number(inv.reorderPoint || minStock || 10);

      if (qty === 0) {
        ranges["Hết hàng"]++;
      } else if (minStock > 0 && qty < minStock) {
        ranges["Cấp bách"]++;
      } else if (reorderPoint > 0 && qty <= reorderPoint) {
        ranges["Cần đặt hàng"]++;
      } else if (maxStock < Infinity && qty > maxStock) {
        ranges["Dư thừa"]++;
      } else {
        ranges["Bình thường"]++;
      }
    });

    return {
      labels: Object.keys(ranges),
      data: Object.values(ranges),
    };
  }, [inventories]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateA = new Date(a.transactionDate || a.createdDate || 0);
        const dateB = new Date(b.transactionDate || b.createdDate || 0);
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [transactions]);

  // Stock alerts (với logic cảnh báo chi tiết)
  const stockAlerts = useMemo(() => {
    const alerts = [];

    inventories.forEach((inv) => {
      const qty = Number(inv.quantityInStock || inv.stockQuantity || 0);
      const minStock = Number(inv.minimumStock || 0);
      const maxStock = Number(inv.maximumStock || Infinity);
      const reorderPoint = Number(inv.reorderPoint || minStock || 10);
      const productName = inv.productName || "Sản phẩm không xác định";

      if (qty === 0) {
        alerts.push({
          type: "danger",
          priority: 1,
          productName,
          quantity: qty,
          threshold: minStock,
          message: "Hết hàng",
          icon: "ti-x",
        });
      } else if (minStock > 0 && qty < minStock) {
        alerts.push({
          type: "danger",
          priority: 2,
          productName,
          quantity: qty,
          threshold: minStock,
          message: `Dưới mức tối thiểu (${minStock})`,
          icon: "ti-alert-triangle",
        });
      } else if (reorderPoint > 0 && qty <= reorderPoint) {
        alerts.push({
          type: "warning",
          priority: 3,
          productName,
          quantity: qty,
          threshold: reorderPoint,
          message: `Cần đặt hàng (≤${reorderPoint})`,
          icon: "ti-shopping-cart",
        });
      } else if (maxStock < Infinity && qty > maxStock) {
        alerts.push({
          type: "info",
          priority: 4,
          productName,
          quantity: qty,
          threshold: maxStock,
          message: `Dư thừa (>${maxStock})`,
          icon: "ti-package",
        });
      }
    });

    // Sắp xếp theo priority, sau đó theo số lượng
    return alerts
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.quantity - b.quantity;
      })
      .slice(0, 15);
  }, [inventories]);

  // Inventory by category (with details like SalesOwnerDashboard)
  const inventoryByCategory = useMemo(() => {
    const categoryStock = {};
    const categoryDetails = {};

    console.log("=== Calculating Inventory by Category ===");

    inventories.forEach((inv, index) => {
      if (index === 0) {
        console.log("Sample inventory for category:", inv);
      }

      // ✅ SỬA: Join với products array để lấy category
      const product = products.find(p => p.productId === inv.productId);
      const category =
        product?.category?.categoryName ||
        product?.category?.name ||
        product?.categoryName ||
        inv.categoryName ||
        "Khác";

      // ✅ SỬA: quantityInStock thay vì stockQuantity
      const qty = Number(inv.quantityInStock || inv.stockQuantity || 0);

      if (index === 0) {
        console.log("Found product:", product);
        console.log("Category name:", category);
        console.log("Quantity:", qty);
      }

      if (qty > 0) {
        categoryStock[category] = (categoryStock[category] || 0) + qty;

        if (!categoryDetails[category]) {
          categoryDetails[category] = {
            quantity: 0,
            products: new Set(),
          };
        }
        categoryDetails[category].quantity += qty;
        categoryDetails[category].products.add(inv.productId);
      }
    });

    console.log("Category stock map:", categoryStock);

    // Chuyển đổi sang mảng và sắp xếp
    const sorted = Object.entries(categoryStock)
      .sort(([, a], [, b]) => b - a);

    const totalQuantity = sorted.reduce((sum, [, qty]) => sum + qty, 0);

    const categoriesWithDetails = sorted.map(([name, quantity]) => ({
      name,
      quantity,
      percentage: totalQuantity > 0 ? (quantity / totalQuantity) * 100 : 0,
      productCount: categoryDetails[name]?.products.size || 0,
    }));

    return {
      labels: sorted.map(([name]) => name),
      data: sorted.map(([, qty]) => qty),
      details: categoriesWithDetails,
      total: totalQuantity,
    };
  }, [inventories, products]);

  // Transaction trends (last 30 days)
  const transactionTrends = useMemo(() => {
    const last30Days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      last30Days.push({ date: dateStr, in: 0, out: 0 });
    }

    console.log("=== Processing Transactions ===");
    console.log("Total transactions:", transactions.length);

    // Đếm các loại transaction
    const typeCount = {};
    transactions.forEach((txn) => {
      const type = (txn.transactionType || "").toString();
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    console.log("Transaction types breakdown:", typeCount);

    transactions.forEach((txn, index) => {
      if (index < 3) {
        console.log(`--- Transaction ${index} ---`);
        console.log("Full transaction:", txn);
        console.log("Type:", txn.transactionType);
      }

      const txnDate = new Date(txn.transactionDate || txn.createdDate);
      const dateStr = txnDate.toISOString().split("T")[0];
      const dayData = last30Days.find((d) => d.date === dateStr);

      if (dayData) {
        const qty = Number(txn.quantity || 0);
        const type = (txn.transactionType || "").toString().toUpperCase();

        // ✅ SỬA: Backend trả về "Nhập kho" (IN) và "Bán ra" (OUT)
        if (type.includes("NHẬP") || type === "IN") {
          dayData.in += qty;
          if (index < 5) console.log(`✅ Added ${qty} to IN for ${dateStr} (type: ${type})`);
        } else if (type.includes("XUẤT") || type === "OUT" || type.includes("BÁN")) {
          // "Bán ra" = xuất kho
          dayData.out += qty;
          if (index < 5) console.log(`❌ Added ${qty} to OUT for ${dateStr} (type: ${type})`);
        } else {
          // Fallback: nếu không match, log để debug
          if (index < 5) console.warn(`⚠️ Unknown transaction type: "${type}" (original: "${txn.transactionType}")`);
        }
      }
    });

    return {
      categories: last30Days.map((d) => {
        const [_y, m, day] = d.date.split("-");
        return `${day}/${m}`;
      }),
      inData: last30Days.map((d) => d.in),
      outData: last30Days.map((d) => d.out),
    };
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("vi-VN");
  };

  // Chart configurations
  const stockDistributionChartOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    colors: ["#DC2626", "#F59E0B", "#FCD34D", "#10B981", "#0E9384"],
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: false,
        columnWidth: "60%",
      },
    },
    xaxis: {
      categories: stockDistribution.labels,
      labels: {
        style: { colors: "#6B7280", fontSize: "11px" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#6B7280", fontSize: "12px" },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
    },
    dataLabels: { enabled: false },
  };

  // Top 10 categories for chart
  const topCategoriesChart = useMemo(() => {
    const top10 = inventoryByCategory.details.slice(0, 10);
    return {
      labels: top10.map((cat) => cat.name),
      data: top10.map((cat) => cat.quantity),
    };
  }, [inventoryByCategory]);

  const categoryChartOptions = {
    chart: {
      type: "bar",
      height: 400,
      toolbar: { show: false },
    },
    colors: ["#0E9384"],
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: true,
        barHeight: "70%",
        dataLabels: {
          position: "right",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toLocaleString("vi-VN"),
      style: {
        fontSize: "11px",
        colors: ["#fff"],
      },
      offsetX: -5,
    },
    xaxis: {
      categories: topCategoriesChart.labels,
      labels: {
        formatter: (val) => val.toLocaleString("vi-VN"),
        style: {
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString("vi-VN")} sản phẩm`,
      },
    },
    noData: {
      text: "Chưa có dữ liệu tồn kho",
      align: "center",
      verticalAlign: "middle",
    },
  };

  const transactionTrendChartOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: { show: false },
    },
    colors: ["#10B981", "#EF4444"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: transactionTrends.categories,
      labels: {
        style: { colors: "#6B7280", fontSize: "11px" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#6B7280", fontSize: "12px" },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
    },
    dataLabels: { enabled: false },
    legend: {
      position: "top",
    },
  };

  return loading ? (
    <PageLoader />
  ) : (
    <div className="page-wrapper">
      <div className="content">
        {/* Header */}
        <div className="page-header">
          <div className="add-item d-flex justify-content-between align-items-center">
            <div className="page-title">
              <h1 className="mb-1">Chào mừng, {userInfo.fullName}</h1>
              <p className="fw-medium text-muted">
                Theo dõi tồn kho và các hoạt động xuất nhập kho
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards - 3 cards layout */}
        <div className="row">
          <div className="col-lg-4 col-md-6">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-2">Giá trị tồn kho</h6>
                    <h3 className="text-white mb-0">
                      {formatCurrency(inventoryStats.totalValue)}
                    </h3>
                  </div>
                  <div
                    className="avatar-lg"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="avatar-title bg-light text-primary rounded-circle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <i
                        className="ti ti-wallet fs-2"
                        style={{ fontSize: "2rem", lineHeight: "1" }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-2">Tổng số danh mục</h6>
                    <h3 className="text-white mb-0">
                      {inventoryStats.totalCategories}
                    </h3>
                  </div>
                  <div
                    className="avatar-lg"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="avatar-title bg-light text-info rounded-circle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <i
                        className="ti ti-category fs-2"
                        style={{ fontSize: "2rem", lineHeight: "1" }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-2">Tổng số sản phẩm</h6>
                    <h3 className="text-white mb-0">
                      {inventoryStats.totalSKUs}
                    </h3>
                  </div>
                  <div
                    className="avatar-lg"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="avatar-title bg-light text-success rounded-circle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <i
                        className="ti ti-package fs-2"
                        style={{ fontSize: "2rem", lineHeight: "1" }}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert if any stock issues */}
        {/* {(inventoryStats.outOfStock > 0 || inventoryStats.criticalStock > 0 || inventoryStats.lowStock > 0) && (
          <div className={`alert ${inventoryStats.outOfStock > 0 || inventoryStats.criticalStock > 0 ? 'alert-danger' : 'alert-warning'} alert-dismissible fade show mb-4`}>
            <div>
              <i className="ti ti-alert-circle me-2" />
              <span className="fw-semibold">Cảnh báo kho hàng:</span>{" "}
              {inventoryStats.outOfStock > 0 && (
                <>
                  <span className="fw-bold">{inventoryStats.outOfStock}</span>{" "}
                  sản phẩm <span className="fw-semibold">hết hàng</span>
                </>
              )}
              {inventoryStats.outOfStock > 0 && inventoryStats.criticalStock > 0 && ", "}
              {inventoryStats.criticalStock > 0 && (
                <>
                  <span className="fw-bold">{inventoryStats.criticalStock}</span>{" "}
                  <span className="fw-semibold">dưới mức tối thiểu</span>
                </>
              )}
              {(inventoryStats.outOfStock > 0 || inventoryStats.criticalStock > 0) && inventoryStats.lowStock > 0 && ", "}
              {inventoryStats.lowStock > 0 && (
                <>
                  <span className="fw-bold">{inventoryStats.lowStock}</span>{" "}
                  <span className="fw-semibold">cần đặt hàng lại</span>
                </>
              )}
              .{" "}
              <Link
                to="/purchase-orders/add"
                className="text-decoration-underline fw-semibold text-white"
              >
                Tạo đơn đặt hàng
              </Link>
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            />
          </div>
        )} */}

        {/* Info alert for overstock */}
        {inventoryStats.overStock > 0 && (
          <div className="alert alert-info alert-dismissible fade show mb-4">
            <div>
              <i className="ti ti-info-circle me-2" />
              <span className="fw-semibold">Thông báo:</span>{" "}
              <span className="fw-bold">{inventoryStats.overStock}</span>{" "}
              sản phẩm <span className="fw-semibold">vượt mức tồn kho tối đa</span>.
              Cân nhắc chạy chương trình khuyến mãi.
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            />
          </div>
        )}

        {/* Charts Row 1 - Phân bố mức tồn kho và Cảnh báo */}
        <div className="row">
          {/* Stock Distribution */}
          <div className="col-lg-6 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-inline-flex align-items-center">
                  <span className="text-primary fs-16 me-2">
                    <i className="ti ti-chart-bar" />
                  </span>
                  <h5 className="card-title mb-0">Phân bố mức tồn kho</h5>
                </div>
              </div>
              <div className="card-body">
                <Chart
                  options={stockDistributionChartOptions}
                  series={[
                    { name: "Số sản phẩm", data: stockDistribution.data },
                  ]}
                  type="bar"
                  height={350}
                />
              </div>
            </div>
          </div>

          {/* Stock Alerts - Cảnh báo tồn kho */}
          <div className="col-lg-6 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-inline-flex align-items-center">
                    <span className="text-danger fs-16 me-2">
                      <i className="ti ti-alert-octagon" />
                    </span>
                    <h5 className="card-title mb-0">Cảnh báo tồn kho</h5>
                  </div>
                  <Link
                    to="/inventories"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive" style={{ maxHeight: "350px", overflowY: "auto" }}>
                  <table className="table table-borderless table-sm">
                    <thead className="sticky-top bg-white">
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-center">Tồn kho</th>
                        <th className="text-end">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockAlerts.length > 0 ? (
                        stockAlerts.map((alert, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className={`ti ${alert.icon} me-2 text-${alert.type}`}></i>
                                <span>{alert.productName}</span>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className="fw-semibold">{alert.quantity}</span>
                              {alert.threshold > 0 && (
                                <small className="text-muted d-block">
                                  Ngưỡng: {alert.threshold}
                                </small>
                              )}
                            </td>
                            <td className="text-end">
                              <span
                                className={`badge badge-${alert.type}`}
                                style={{ fontSize: '0.75rem' }}
                              >
                                {alert.message}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center text-muted py-3">
                            <i className="ti ti-check-circle me-2"></i>
                            Tất cả sản phẩm đều ở mức tồn kho tốt
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 - Tồn kho theo danh mục */}
        <div className="row">
          {/* Inventory by Category - Horizontal Bar Chart */}
          <div className="col-xl-7 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-inline-flex align-items-center">
                    <span className="text-teal fs-16 me-2">
                      <i className="ti ti-category" />
                    </span>
                    <h5 className="card-title mb-0">
                      Tồn kho theo danh mục (Top 10)
                    </h5>
                  </div>
                  <span className="badge badge-soft-primary fs-13">
                    {inventoryByCategory.details.length} danh mục
                  </span>
                </div>
              </div>
              <div className="card-body">
                {inventoryByCategory.data.length > 0 ? (
                  <Chart
                    options={categoryChartOptions}
                    series={[{ name: "Số lượng", data: topCategoriesChart.data }]}
                    type="bar"
                    height={400}
                  />
                ) : (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
                    <p className="text-muted">Chưa có dữ liệu tồn kho</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Summary Table */}
          <div className="col-xl-5 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-inline-flex align-items-center">
                  <span className="text-success fs-16 me-2">
                    <i className="ti ti-list-details" />
                  </span>
                  <h5 className="card-title mb-0">Thống kê chi tiết</h5>
                </div>
              </div>
              <div className="card-body">
                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="table table-hover table-sm">
                    <thead className="sticky-top bg-white">
                      <tr>
                        <th>#</th>
                        <th>Danh mục</th>
                        <th className="text-end">Số lượng</th>
                        <th className="text-end">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryByCategory.details.length > 0 ? (
                        inventoryByCategory.details.map((category, index) => (
                          <tr key={index}>
                            <td>
                              <span
                                className={`badge ${index < 3
                                  ? "badge-soft-success"
                                  : "badge-soft-secondary"
                                  }`}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{category.name}</div>
                                <small className="text-muted">
                                  {category.productCount} sản phẩm
                                </small>
                              </div>
                            </td>
                            <td className="text-end fw-semibold">
                              {category.quantity.toLocaleString("vi-VN")}
                            </td>
                            <td className="text-end">
                              <span className="badge badge-soft-primary">
                                {category.percentage.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-4">
                            Chưa có dữ liệu danh mục
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Trends */}
        <div className="row">
          <div className="col-xl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-inline-flex align-items-center">
                  <span className="text-secondary fs-16 me-2">
                    <i className="ti ti-arrows-exchange" />
                  </span>
                  <h5 className="card-title mb-0">
                    Xu hướng xuất nhập kho (30 ngày gần đây)
                  </h5>
                </div>
              </div>
              <div className="card-body">
                <Chart
                  options={transactionTrendChartOptions}
                  series={[
                    { name: "Nhập kho", data: transactionTrends.inData },
                    { name: "Xuất kho", data: transactionTrends.outData },
                  ]}
                  type="line"
                  height={350}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="row">
          <div className="col-xl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-inline-flex align-items-center">
                    <span className="text-info fs-16 me-2">
                      <i className="ti ti-history" />
                    </span>
                    <h5 className="card-title mb-0">Giao dịch gần đây</h5>
                  </div>
                  <Link
                    to="/inventories"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-end">Loại</th>
                        <th className="text-end">Số lượng</th>
                        <th className="text-end">Ngày</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.length > 0 ? (
                        recentTransactions.map((txn, index) => {
                          const type = (txn.transactionType || "").toString().toUpperCase();
                          // ✅ SỬA: Backend trả về "Nhập kho" (IN) và "Bán ra" (OUT)
                          const isIn = type.includes("NHẬP") || type === "IN";
                          const isOut = type.includes("XUẤT") || type === "OUT" || type.includes("BÁN");
                          // ✅ SỬA: Transaction có productName trực tiếp
                          const productName = txn.productName || "Không xác định";
                          return (
                            <tr key={index}>
                              <td>{productName}</td>
                              <td className="text-end">
                                <span
                                  className={`badge badge-${isIn ? "success" : isOut ? "danger" : "secondary"
                                    }`}
                                >
                                  {isIn ? "Nhập" : isOut ? "Xuất" : txn.transactionType}
                                </span>
                              </td>
                              <td className="text-end fw-semibold">
                                {txn.quantity || 0}
                              </td>
                              <td className="text-end text-muted">
                                {formatDate(
                                  txn.transactionDate || txn.createdDate
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            Chưa có giao dịch
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CommonFooter />
    </div>
  );
};

export default WarehousesOwnerDashboard;
