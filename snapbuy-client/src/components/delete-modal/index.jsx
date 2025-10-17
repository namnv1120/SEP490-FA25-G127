const DeleteModal = ({ title = "this item", onConfirm }) => {
  const handleConfirm = async () => {
    try {
      if (onConfirm) await onConfirm();

      // ✅ Đóng modal thủ công
      const modalElement = document.getElementById("delete-modal");
      if (modalElement) {
        modalElement.classList.remove("show");
        modalElement.style.display = "none";
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) backdrop.remove();
      }

    } catch (err) {
      console.error("❌ Error while deleting:", err);
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
                Are you sure you want to delete {title}?
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
                  onClick={handleConfirm}
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
