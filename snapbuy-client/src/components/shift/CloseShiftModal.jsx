import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Modal, Button, Row, Col, Tag, Typography, Input } from "antd";
import CashDenominationInput from "../cash-denomination/CashDenominationInput";

const { Text } = Typography;
const { TextArea } = Input;

const CloseShiftModal = forwardRef(({
  visible,
  onCancel,
  onConfirm,
  loading,
  currentShift,
  expectedDrawer,
  closingNote,
  setClosingNote,
  cashDenominations,
  setCashDenominations,
  formatDateTime,
  formatCurrency
}, ref) => {
  const cashDenominationRef = useRef(null);

  // Expose validate function to parent
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (cashDenominationRef.current) {
        return cashDenominationRef.current.validate();
      }
      return true;
    }
  }));
  return (
    <Modal
      title="Đóng ca làm việc"
      open={visible}
      onCancel={onCancel}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onCancel}>
            Hủy bỏ
          </Button>
          <Button
            type="primary"
            danger
            loading={loading}
            onClick={onConfirm}
          >
            Xác nhận đóng ca
          </Button>
        </div>
      }
      width={700}
      centered
    >
      {/* Shift Info */}
      <div style={{
        background: '#f5f5f5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16
      }}>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>Trạng thái</Text>
            <div><Tag color="green">Đang mở</Tag></div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>Bắt đầu</Text>
            <div><Text strong style={{ fontSize: 13 }}>{formatDateTime(currentShift?.openedAt)}</Text></div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tiền ban đầu</Text>
            <div><Text strong style={{ fontSize: 13, color: '#1890ff' }}>{formatCurrency(currentShift?.initialCash)}</Text></div>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tiền dự kiến</Text>
            <div><Text strong style={{ fontSize: 13, color: '#52c41a' }}>{formatCurrency(expectedDrawer)}</Text></div>
          </Col>
        </Row>
      </div>

      {/* Cash Denomination Input */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>
          <i className="ti ti-coins" style={{ marginRight: 8 }}></i>
          Chi tiết mệnh giá tiền trong két
        </Text>
        <Text type="secondary" style={{ fontSize: 12, marginBottom: 12, display: 'block' }}>
          Nhập số lượng từng loại tờ tiền hiện có trong két
        </Text>
        <CashDenominationInput
          ref={cashDenominationRef}
          value={cashDenominations}
          onChange={setCashDenominations}
          expectedTotal={expectedDrawer}
        />
      </div>

      {/* Note */}
      <div style={{ marginTop: 16 }}>
        <Text strong style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>
          Ghi chú
        </Text>
        <TextArea
          rows={2}
          value={closingNote}
          onChange={(e) => setClosingNote(e.target.value)}
          placeholder="Nhập ghi chú (nếu có)..."
        />
      </div>
    </Modal>
  );
});

CloseShiftModal.displayName = 'CloseShiftModal';

export default CloseShiftModal;

