import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../routes/all_routes";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import SearchFromApi from "../../components/data-table/search";
import { message } from "antd";
import { exportToExcel } from "../../utils/excelUtils";
// Import services - bạn cần tạo ProductPriceService
import { getAllProductPrices } from "../../services/ProductPriceService";

const ProductPriceList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [productPrices, setProductPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const route = all_routes;

  useEffect(() => {
    fetchProductPrices();
  }, []);

  const fetchProductPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProductPrices();

      // Map API data to match table structure
      const mappedPrices = data.map((price) => ({
        priceId: price.priceId,
        productId: price.productId,
        productName: price.productName || "N/A",
        unitPrice: `${price.unitPrice?.toLocaleString() || "0.00"} đ`,
        costPrice: `${price.costPrice?.toLocaleString() || "0.00"} đ`,
        taxRate: price.taxRate ? `${(price.taxRate * 100).toFixed(2)}%` : "0%",
        validFrom: price.validFrom
          ? new Date(price.validFrom).toLocaleDateString("vi-VN")
          : "N/A",
        validTo: price.validTo
          ? new Date(price.validTo).toLocaleDateString("vi-VN")
          : "N/A",
        createdDate: price.createdDate
          ? new Date(price.createdDate).toLocaleString("vi-VN")
          : "N/A",
        status: getStatus(price.validFrom, price.validTo),
        // Raw values for filtering/sorting
        rawUnitPrice: price.unitPrice,
        rawCostPrice: price.costPrice,
        rawTaxRate: price.taxRate,
        rawValidFrom: price.validFrom,
        rawValidTo: price.validTo,
      }));

      setProductPrices(mappedPrices);
      setTotalRecords(mappedPrices.length);
    } catch (err) {
      console.error("❌ Error fetching product prices:", err);
      setError("Failed to load product prices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Determine price status based on validity period
  const getStatus = (validFrom, validTo) => {
    if (!validFrom) return "draft";

    const now = new Date();
    const from = new Date(validFrom);
    const to = validTo ? new Date(validTo) : null;

    if (from > now) return "upcoming";
    if (to && to < now) return "expired";
    return "active";
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: <span className="badge badge-linesuccess">Active</span>,
      expired: <span className="badge badge-linedanger">Expired</span>,
      upcoming: <span className="badge badge-linewarning">Upcoming</span>,
      draft: <span className="badge badge-linesecondary">Draft</span>,
    };
    return badges[status] || badges.draft;
  };

  const handleExportExcel = () => {
    if (!productPrices || productPrices.length === 0) {
      message.warning("No price data to export!");
      return;
    }

    const exportData = productPrices.map((p) => ({
      "Product Name": p.productName,
      "Unit Price": p.unitPrice,
      "Cost Price": p.costPrice,
      "Tax Rate": p.taxRate,
      "Valid From": p.validFrom,
      "Valid To": p.validTo,
      "Status": p.status,
      "Created Date": p.createdDate,
    }));

    exportToExcel(exportData, "Product_Price_List");
  };

  const handleRefresh = () => {
    fetchProductPrices();
    message.success("Product price list refreshed!");
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const columns = [
    {
      header: (
        <label className="checkboxs">
          <input type="checkbox" id="select-all" />
          <span className="checkmarks" />
        </label>
      ),
      body: () => (
        <label className="checkboxs">
          <input type="checkbox" />
          <span className="checkmarks" />
        </label>
      ),
      sortable: false,
      key: "checked",
    },
    {
      header: "Product Name",
      field: "productName",
      key: "productName",
      sortable: true,
      body: (data) => (
        <Link to={`${route.productdetails}/${data.productId}`}>
          {data.productName}
        </Link>
      ),
    },
    {
      header: "Unit Price",
      field: "unitPrice",
      key: "unitPrice",
      sortable: true,
    },
    {
      header: "Cost Price",
      field: "costPrice",
      key: "costPrice",
      sortable: true,
    },
    {
      header: "Tax Rate",
      field: "taxRate",
      key: "taxRate",
      sortable: true,
    },
    {
      header: "Valid From",
      field: "validFrom",
      key: "validFrom",
      sortable: true,
    },
    {
      header: "Valid To",
      field: "validTo",
      key: "validTo",
      sortable: true,
    },
    {
      header: "Status",
      field: "status",
      key: "status",
      sortable: true,
      body: (data) => getStatusBadge(data.status),
    },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (row) => (
        <div className="edit-delete-action d-flex align-items-center">
          <Link
            className="me-2 p-2 d-flex align-items-center border rounded"
            to={route.editproductprice.replace(":id", row.priceId)}
          >
            <i className="feather icon-edit"></i>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Product Price List</h4>
                <h6>Manage product pricing</h6>
              </div>
            </div>
            <TableTopHead
              onExportExcel={handleExportExcel}
              onRefresh={handleRefresh}
            />
            <div className="page-btn">
              <Link to={route.addproductprice} className="btn btn-primary">
                <i className="ti ti-circle-plus me-1"></i>
                Add New Price
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* Product Price List Table */}
          {!loading && (
            <div className="card table-list-card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <SearchFromApi
                  callback={handleSearch}
                  rows={rows}
                  setRows={setRows}
                />
                <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                  <div className="dropdown me-2">
                    <Link
                      to="#"
                      className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                      data-bs-toggle="dropdown"
                    >
                      Status
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Active
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Expired
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Upcoming
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Draft
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                      data-bs-toggle="dropdown"
                    >
                      Sort By : Latest
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Recently Added
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Price: Low to High
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Price: High to Low
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Expiring Soon
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <PrimeDataTable
                    column={columns}
                    data={productPrices}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={totalRecords}
                    dataKey="priceId"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <CommonFooter />
      </div>
    </>
  );
};

export default ProductPriceList;