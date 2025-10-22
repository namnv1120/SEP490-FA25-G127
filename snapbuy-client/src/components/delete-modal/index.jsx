import { message } from "antd";
import { Modal } from "bootstrap";

const DeleteModal = ({ itemId, itemName, onDelete, onCancel }) => {
  const handleDelete = async () => {
    if (onDelete && itemId) {
      try {
        await onDelete(itemId);
        // Close modal after successful deletion
        const modalElement = document.getElementById('delete-modal');
        const modal = Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      } catch (error) {
        console.error("Failed to delete item:", error);
        message.error("Failed to delete item. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <>
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
                {itemName && (
                  <p className="text-muted mt-2">
                    You are about to delete: <strong>{itemName}</strong>
                  </p>
                )}
                <div className="modal-footer-btn mt-3 d-flex justify-content-center">
                  <button
                    type="button"
                    className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                    data-bs-dismiss="modal"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary fs-13 fw-medium p-2 px-3"
                    onClick={handleDelete}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteModal;
