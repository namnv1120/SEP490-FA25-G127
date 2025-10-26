import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AddAccount from "../../core/modals/usermanagement/addaccount";
import EditAccount from "../../core/modals/usermanagement/editaccount";

import TooltipIcons from "../../components/tooltip-content/tooltipIcons";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import Table from "../../core/pagination/datatable";

import { listAccounts, deleteAccount } from "../../services/accountService";

const Accounts = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const accountsData = await listAccounts();
      setDataSource(accountsData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tài khoản:", error);
      alert("Không thể tải danh sách tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccountId) return;
    try {
      await deleteAccount(selectedAccountId);
      await fetchAccounts();
      alert("Xóa tài khoản thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
      alert("Không thể xóa tài khoản!");
    }
  };

  const columns = [
    {
      title: "Tên tài khoản",
      dataIndex: "username",
      width: "20%",
      render: (text, record) => (
        <span className="userimgname d-flex align-items-center">
          <Link to="#" className="avatar avatar-md me-2">
            <img alt="" src={record.img || "/default-avatar.png"} />
          </Link>
          <div>
            <Link to="#" className="fw-medium">{text}</Link>
          </div>
        </span>
      ),
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      width: "15%",
      align: "center",
      sorter: (a, b) => a.phone.localeCompare(b.phone),
    },
    {
      title: "Email",
      dataIndex: "email",
      width: "20%",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      width: "15%",
      align: "center",
      sorter: (a, b) => a.role.localeCompare(b.role),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdon",
      width: "15%",
      align: "center",
      sorter: (a, b) => a.createdon.localeCompare(b.createdon),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: "10%",
      align: "center",
      render: (text) => (
        <div>
          {text === "Active" ? (
            <span className="d-inline-flex align-items-center p-1 pe-2 rounded-1 text-white bg-success fs-10">
              <i className="ti ti-point-filled me-1 fs-11"></i>
              Hoạt động
            </span>
          ) : (
            <span className="d-inline-flex align-items-center p-1 pe-2 rounded-1 text-white bg-danger fs-10">
              <i className="ti ti-point-filled me-1 fs-11"></i>
              Ngừng hoạt động
            </span>
          )}
        </div>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "", // Ẩn chữ "Thao tác"
      dataIndex: "actions",
      key: "actions",
      width: "5%",
      align: "center",
      render: (text, record) => (
        <div className="action-table-data text-center">
          <div className="edit-delete-action d-flex justify-content-center">
            <Link className="me-2 p-2" to="#">
              <i data-feather="eye" className="feather feather-eye action-eye"></i>
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
              data-bs-toggle="modal"
              data-bs-target="#delete-modal"
            >
              <i data-feather="trash-2" className="feather-trash-2"></i>
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
                <h4>Danh sách tài khoản</h4>
                <h6>Quản lý tất cả tài khoản người dùng</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <TooltipIcons />
              <RefreshIcon onClick={fetchAccounts} />
              <CollapesIcon />
            </ul>
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-added"
                data-bs-toggle="modal"
                data-bs-target="#add-account"
              >
                <i className="ti ti-circle-plus me-1"></i>
                Thêm tài khoản mới
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
                    Trạng thái
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Hoạt động
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Ngừng hoạt động
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center p-4">Đang tải danh sách tài khoản...</div>
              ) : (
                <div className="table-responsive">
                  <Table columns={columns} dataSource={dataSource} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal thêm và chỉnh sửa */}
      <AddAccount id="add-account" onCreated={fetchAccounts} />
      <EditAccount
        id="edit-account"
        accountId={selectedAccount?.id}
        onUpdated={fetchAccounts}
        onClose={() => setSelectedAccount(null)}
      />

      {/* Modal xác nhận xóa */}
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content p-5 px-3 text-center">
                <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
                  <i className="ti ti-trash fs-24 text-danger" />
                </span>
                <h4 className="fs-20 fw-bold mb-2 mt-1">Xóa tài khoản</h4>
                <p className="mb-0 fs-16">
                  Bạn có chắc chắn muốn xóa tài khoản này không?
                </p>
                <div className="modal-footer-btn mt-3 d-flex justify-content-center">
                  <button
                    type="button"
                    className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                    data-bs-dismiss="modal"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary fs-13 fw-medium p-2 px-3"
                    onClick={handleDeleteAccount}
                    data-bs-dismiss="modal"
                  >
                    Đồng ý xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounts;