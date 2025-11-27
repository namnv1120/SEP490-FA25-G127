import { Modal } from 'antd';

const UnauthorizedModal = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      closable={true}
      width={500}
      maskClosable={true}
      zIndex={10000}
      style={{ zIndex: 10000 }}
      styles={{
        mask: {
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.75)'
        }
      }}
      wrapStyle={{ zIndex: 10000 }}
    >
      <div className="text-center p-4">
        <div className="mb-4">
          <i className="ti ti-shield-x" style={{ fontSize: '80px', color: '#dc3545' }}></i>
        </div>
        <h3 className="fw-bold mb-3" style={{ color: '#212529' }}>
          Bạn không có quyền
        </h3>
        <p className="text-muted mb-4">
          Tài khoản của bạn không có quyền truy cập trang này.
          <br />
          Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
        </p>
        <button
          className="btn btn-primary"
          onClick={onClose}
        >
          Đã hiểu
        </button>
      </div>
    </Modal>
  );
};

export default UnauthorizedModal;

