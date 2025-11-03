import { useState, useEffect } from "react";
import { Modal, InputNumber, Form, message } from "antd";
import { updateInventory } from "../../../services/InventoryService";

const EditInventory = ({ visible, onClose, inventory, onUpdated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inventory) {
      form.setFieldsValue({
        minimumStock: inventory.minimumStock,
        maximumStock: inventory.maximumStock,
        reorderPoint: inventory.reorderPoint,
      });
    }
  }, [inventory, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await updateInventory(inventory.inventoryId, values);
      message.success("Cập nhật tồn kho thành công!");
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Cập nhật thất bại:", err);
      message.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      confirmLoading={loading}
      title={`Cập nhật tồn kho: ${inventory?.productName || ""}`}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tồn kho tối thiểu"
          name="minimumStock"
          rules={[{ required: true, message: "Vui lòng nhập tồn kho tối thiểu" }]}
        >
          <InputNumber min={0} className="w-100" />
        </Form.Item>
        <Form.Item
          label="Tồn kho tối đa"
          name="maximumStock"
          rules={[{ required: true, message: "Vui lòng nhập tồn kho tối đa" }]}
        >
          <InputNumber min={0} className="w-100" />
        </Form.Item>
        <Form.Item
          label="Điểm đặt hàng lại"
          name="reorderPoint"
          rules={[{ required: true, message: "Vui lòng nhập điểm đặt hàng lại" }]}
        >
          <InputNumber min={0} className="w-100" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditInventory;
