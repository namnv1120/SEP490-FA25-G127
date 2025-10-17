import React, { useState } from "react";
import { Link } from "react-router-dom";

const QRcodeModelPopup = () => {
  const [hienThiQRModal, setHienThiQRModal] = useState(false);
  const [hienThiXoaModal, setHienThiXoaModal] = useState(false);

  return (
    <>
      {/* 🔘 Nút mở modal (demo) */}
      <div className="d-flex gap-3">
        <button
          className="btn btn-primary"
          onClick={() => setHienThiQRModal(true)}
        >
          Xem mã QR
        </button>
        <button
          className="btn btn-danger"
          onClick={() => setHienThiXoaModal(true)}
        >
          Xóa sản phẩm
        </button>
      </div>

      {/* 🧾 Modal hiển thị QR Code */}
      {hienThiQRModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered stock-adjust-modal">
            <div className="modal-content">
              <div className="page-wrapper-new p-0">
                <div className="content">
                  <div className="modal-header">
                    <div className="page-title">
                      <h4>Mã QR</h4>
                    </div>
                    <button
                      type="button"
                      className="close bg-danger text-white fs-16 shadow-none"
                      onClick={() => setHienThiQRModal(false)}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="d-flex justify-content-end">
                      <Link
                        to="#"
                        className="btn btn-cancel close-btn bg-danger text-white shadow-none"
                      >
                        <span>
                          <i className="fas fa-print me-2" />
                        </span>
                        In mã QR
                      </Link>
                    </div>

                    <div className="barcode-scan-header">
                      <h5>Nike Jordan</h5>
                    </div>

                    <div className="row justify-content-center">
                      <div className="col-sm-6">
                        <div className="barcode-scanner-link text-center">
                          <div className="barscaner-img">
                            <img
                              src="./assets/img/barcode/qr-code.png"
                              alt="Mã QR"
                              className="img-fluid"
                            />
                          </div>
                          <p className="fs-12">Mã tham chiếu: 32RRR554</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nền mờ */}
          <div
            className="modal-backdrop fade show"
            onClick={() => setHienThiQRModal(false)}
          ></div>
        </div>
      )}

      {/* 🗑 Modal xác nhận xóa */}
      {hienThiXoaModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="page-wrapper-new p-0">
                <div className="content p-5 px-3 text-center">
                  <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
                    <i className="ti ti-trash fs-24 text-danger" />
                  </span>
                  <h4 className="fs-20 fw-bold mb-2 mt-1">Xóa sản phẩm</h4>
                  <p className="mb-0 fs-16">
                    Bạn có chắc chắn muốn xóa sản phẩm này không?
                  </p>
                  <div className="modal-footer-btn mt-3 d-flex justify-content-center">
                    <button
                      type="button"
                      className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                      onClick={() => setHienThiXoaModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary fs-13 fw-medium p-2 px-3"
                      onClick={() => {
                        alert("✅ Sản phẩm đã được xóa thành công!");
                        setHienThiXoaModal(false);
                      }}
                    >
                      Đồng ý xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nền mờ */}
          <div
            className="modal-backdrop fade show"
            onClick={() => setHienThiXoaModal(false)}
          ></div>
        </div>
      )}
    </>
  );
};

export default QRcodeModelPopup;
