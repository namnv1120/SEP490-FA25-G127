import axios from "axios";

const DeleteModal = ({ productId }) => {
  const handleDelete = async () => {
    if (!productId) {
      alert(" No product selected");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/products/${productId}`);
      alert(" Product deleted successfully");
      window.location.reload(); // hoặc gọi hàm refresh danh sách nếu muốn tối ưu hơn
    } catch (error) {
      console.error("Delete failed:", error);
      alert(" Failed to delete product");
    }
  };

  return (
    <div className="modal fade" id="delete-modal">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="page-wrapper-new p-0">
            <div className="content p-5 px-3 text-center">
              <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
                <i className="ti ti-trash fs-24 text-danger" />
              </span>
              <h4 className="mb-0 delete-account-font">
                Are you sure you want to delete this?
              </h4>
              <div className="modal-footer-btn mt-3 d-flex justify-content-center">
                <button
                  type="button"
                  className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary fs-13 fw-medium p-2 px-3"
                  onClick={handleDelete}
                  data-bs-dismiss="modal"
                >
                  Yes Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;