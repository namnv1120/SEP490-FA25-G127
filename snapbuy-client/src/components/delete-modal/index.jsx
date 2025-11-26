import { Modal, message } from "antd";

const DeleteModal = ({ open, itemId, itemName, onDelete, onCancel, loading }) => {
  const handleDelete = async () => {
    if (onDelete && itemId) {
      try {
        await onDelete(itemId);
      } catch {
        message.error("Lỗi khi xoá mục. Vui lòng thử lại.");
      }
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handleDelete}
      okText="Đồng ý xoá"
      cancelText="Huỷ"
      okButtonProps={{ danger: true, loading }}
      cancelButtonProps={{ disabled: loading }}
      centered
      closable={!loading}
      maskClosable={!loading}
    >
      <div className="text-center py-3">
        <span className="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
          <i className="ti ti-trash fs-24 text-danger" />
        </span>
        <h4 className="mb-0 delete-account-font">
          Bạn có chắc chắn muốn xoá?
        </h4>
        {itemName && (
          <p className="text-muted mt-2">
            Bạn muốn xoá: <strong>{itemName}</strong>
          </p>
        )}
      </div>
    </Modal>
  );
};

export default DeleteModal;
