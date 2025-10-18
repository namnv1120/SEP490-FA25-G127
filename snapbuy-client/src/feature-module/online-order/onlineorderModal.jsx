import { useState } from "react";
import { Link } from "react-router-dom";
import {
  pdf,
  printer,
  qrCodeImage,
  scanners,
  stockImg02,
  stockImg03,
  stockImg05,
} from "../../../utils/imagepath";
import { Editor } from "primereact/editor";
import CommonDatePicker from "../../../components/date-picker/common-date-picker";
import CommonSelect from "../../../components/select/common-select";

const OnlineorderModal = () => {
  const [quantity, setQuantity] = useState(4);
  const [text, setText] = useState("");
  const [date1, setDate1] = useState(new Date());
  const [date2, setDate2] = useState(new Date());
  const [date3, setDate3] = useState(new Date());
  const [selectedCustomerName, setSelectedCustomerName] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  // 🔹 Data mẫu — sau này thay bằng API thật
  const CustomerName = [{ label: "Customer Name", value: "1" }];
  const OrderStatus = [
    { label: "Completed", value: "1" },
    { label: "Inprogress", value: "2" },
  ];
  const PaymentType = [
    { label: "Cash", value: "1" },
    { label: "Online", value: "2" },
  ];
  const Supplier = [{ label: "Supplier Name", value: "1" }];

  // 🔹 Placeholder gọi API thật
  // useEffect(() => {
  //   axios.get("/api/customers").then((res) => setCustomerList(res.data));
  // }, []);

  return (
    <>
      {/* ------------------- ADD SALES MODAL ------------------- */}
      <div className="modal fade" id="add-sales-new">
        <div className="modal-dialog add-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="page-title">
                <h4>Add Sales</h4>
              </div>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <form>
              <div className="card border-0">
                <div className="card-body pb-0">
                  <div className="table-responsive no-pagination mb-3">
                    <table className="table datanew">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Purchase Price($)</th>
                          <th>Discount($)</th>
                          <th>Tax(%)</th>
                          <th>Tax Amount($)</th>
                          <th>Unit Cost($)</th>
                          <th>Total Cost(%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td />
                          <td />
                          <td />
                          <td />
                          <td />
                          <td />
                          <td />
                          <td />
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="row">
                    {/* Customer Name */}
                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="mb-3">
                        <label className="form-label">
                          Customer Name <span className="text-danger">*</span>
                        </label>
                        <div className="row">
                          <div className="col-lg-10 col-sm-10 col-10">
                            <CommonSelect
                              options={CustomerName}
                              value={selectedCustomerName}
                              onChange={(e) => setSelectedCustomerName(e.value)}
                              placeholder="Choose"
                            />
                          </div>
                          <div className="col-lg-2 col-sm-2 col-2 ps-0">
                            <div className="add-icon">
                              <Link
                                to="#"
                                className="bg-dark text-white p-2 rounded"
                              >
                                <i className="feather icon-plus-circle" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="mb-3">
                        <label className="form-label">
                          Date<span className="text-danger">*</span>
                        </label>
                        <div className="input-groupicon calender-input">
                          <CommonDatePicker
                            value={date1}
                            onChange={setDate1}
                            className="w-100"
                          />
                          <i className="feather icon-calendar info-img" />
                        </div>
                      </div>
                    </div>

                    {/* Supplier */}
                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="mb-3">
                        <label className="form-label">
                          Supplier<span className="text-danger">*</span>
                        </label>
                        <CommonSelect
                          options={Supplier}
                          value={selectedSupplier}
                          onChange={(e) => setSelectedSupplier(e.value)}
                          placeholder="Choose"
                        />
                      </div>
                    </div>

                    {/* Product */}
                    <div className="col-lg-12 col-sm-6 col-12">
                      <div className="mb-3">
                        <label className="form-label">
                          Product<span className="text-danger">*</span>
                        </label>
                        <div className="input-groupicon select-code">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Please type product code and select"
                          />
                          <div className="addonset">
                            <img src={qrCodeImage} alt="qr" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="row">
                    <div className="col-lg-6 ms-auto">
                      <div className="total-order w-100 max-widthauto m-auto mb-4">
                        <ul className="border-1 rounded-2">
                          <li className="border-bottom">
                            <h4 className="border-end">Order Tax</h4>
                            <h5>$ 0.00</h5>
                          </li>
                          <li className="border-bottom">
                            <h4 className="border-end">Discount</h4>
                            <h5>$ 0.00</h5>
                          </li>
                          <li className="border-bottom">
                            <h4 className="border-end">Shipping</h4>
                            <h5>$ 0.00</h5>
                          </li>
                          <li className="border-bottom">
                            <h4 className="border-end">Grand Total</h4>
                            <h5>$ 0.00</h5>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="row">
                    <div className="col-lg-3 col-sm-6 col-12">
                      <label className="form-label">Order Tax</label>
                      <input type="text" defaultValue={0} className="form-control" />
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <label className="form-label">Discount</label>
                      <input type="text" defaultValue={0} className="form-control" />
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <label className="form-label">Shipping</label>
                      <input type="text" defaultValue={0} className="form-control" />
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <label className="form-label">Status</label>
                      <CommonSelect
                        options={OrderStatus}
                        value={selectedOrderStatus}
                        onChange={(e) => setSelectedOrderStatus(e.value)}
                        placeholder="Choose"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary me-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <Link
                  to="#"
                  className="btn btn-primary"
                  data-bs-dismiss="modal"
                >
                  Submit
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* ------------------- /ADD SALES MODAL ------------------- */}
    </>
  );
};

export default OnlineorderModal;
