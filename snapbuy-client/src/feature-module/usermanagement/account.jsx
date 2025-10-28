import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AddAccount from "../../core/modals/usermanagement/addaccount";
import EditAccount from "../../core/modals/usermanagement/editaccount";
import TableTopHead from "../../components/table-top-head";
import Table from "../../core/pagination/datatable";
import { getAllAccounts } from "../../services/AccountService";

const Accounts = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Fetch accounts khi component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const accountsData = await getAllAccounts();
      setDataSource(accountsData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tài khoản:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      sorter: (a, b) => a.fullName.length - b.fullName.length,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      sorter: (a, b) => a.username.length - b.username.length,
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: (a, b) => a.email.length - b.email.length,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      sorter: (a, b) => a.phone.length - b.phone.length,
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      sorter: (a, b) => a.roles.length - b.roles.length,
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      render: (isActive) => {
        const active = isActive === true || isActive === 1 || isActive === "1";
        return (
          <span
            className={`d-inline-flex align-items-center p-1 pe-2 rounded-1 text-white fs-10 ${active ? "bg-success" : "bg-danger"}`}
          >
            <i className="ti ti-point-filled me-1 fs-11"></i>
            {active ? "Hoạt động" : "Không hoạt động"}
          </span>
        );
      },
      sorter: (a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1),
    },

    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      render: (text, record) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            <Link className="me-2 p-2" to="#">
              <i
                data-feather="eye"
                className="feather feather-eye action-eye"
              ></i>
            </Link>
            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-account"
              onClick={() => setSelectedAccount(record)}
            >
              <i data-feather="edit" className="feather-edit"></i>
            </Link>
            <Link
              className="confirm-text p-2"
              to="#"
              onClick={() => setSelectedAccountId(record.id)}
            >
              <i
                data-feather="trash-2"
                className="feather-trash-2"
                data-bs-toggle="modal"
                data-bs-target="#delete-modal"
              ></i>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Tài khoản</h4>
                <h6>Quản lý danh sách tài khoản</h6>
              </div>
            </div>
            <TableTopHead
            />
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-account"
              >
                <i className="ti ti-circle-plus me-1"></i>
                Thêm tài khoản
              </Link>
            </div>
          </div>

          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <div className="search-set"></div>
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
                        Inactive
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center p-4">Loading accounts...</div>
              ) : (
                <div className="table-responsive">
                  <Table columns={columns} dataSource={dataSource} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddAccount id="add-account" onCreated={fetchAccounts} />
      <EditAccount
        id="edit-account"
        accountId={selectedAccount?.id}
        onUpdated={fetchAccounts}
        onClose={() => setSelectedAccount(null)}
      />


    </div>
  );
};

export default Accounts;
