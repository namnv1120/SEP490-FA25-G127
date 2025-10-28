import { useState } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import TableTopHead from "../../components/table-top-head";
import PrimeDataTable from "../../components/data-table";
import SearchFromApi from "../../components/data-table/search";

const PurchaseOrder = () => {
  const [listData, _setListData] = useState([
    {
      supplier_id: "SUP-1001",
      account_id: "ACC-2001",
      order_date: "2025-10-25",
      received_date: "2025-10-28",
      status: "PENDING",
      total_amount: 12000.5,
    },
    {
      supplier_id: "SUP-1002",
      account_id: "ACC-2002",
      order_date: "2025-10-20",
      received_date: "2025-10-23",
      status: "APPROVED",
      total_amount: 8000.0,
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, _setTotalRecords] = useState(5);
  const [rows, setRows] = useState(10);
  const [_searchQuery, setSearchQuery] = useState(undefined);

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
      key: "select",
    },
    { header: "Supplier ID", field: "supplier_id", key: "supplier_id" },
    { header: "Account ID", field: "account_id", key: "account_id" },
    { header: "Order Date", field: "order_date", key: "order_date" },
    { header: "Received Date", field: "received_date", key: "received_date" },
    { header: "Status", field: "status", key: "status" },
    { header: "Total Amount", field: "total_amount", key: "total_amount" },
  ];

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="page-title">
                <h4>Purchase Order</h4>
                <h6>Manage Your Purchase Orders</h6>
              </div>
            </div>
            <TableTopHead />
          </div>

          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              />
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Sort By : Last 7 Days
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Recently Added
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Ascending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Descending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Last Month
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Last 7 Days
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <PrimeDataTable
                  column={columns}
                  data={listData}
                  rows={rows}
                  setRows={setRows}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalRecords={totalRecords}
                />
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>
    </div>
  );
};

export default PurchaseOrder;
