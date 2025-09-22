import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function AddEditCustomerModal({
  show,
  onHide,
  editing,
  onAdd,
  onUpdate,
}) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    country: "",
    status: "Active",
  });

  useEffect(() => {
    if (editing) {
      setForm({
        code: editing.code || "",
        name: editing.name || "",
        email: editing.email || "",
        phone: editing.phone || "",
        country: editing.country || "",
        status: editing.status || "Active",
      });
    } else {
      setForm({
        code: "",
        name: "",
        email: "",
        phone: "",
        country: "",
        status: "Active",
      });
    }
  }, [editing, show]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Vui lòng nhập tên và email");
      return;
    }
    if (editing && editing.id) onUpdate && onUpdate(editing.id, form);
    else onAdd && onAdd(form);
    onHide();
  };

  const isView = !!editing && !onUpdate; // fallback (normally edit/view use same modal)
  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? "View / Edit Customer" : "Add Customer"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Code</Form.Label>
            <Form.Control
              name="code"
              value={form.code}
              onChange={handleChange}
              readOnly={isView}
              placeholder="CU001"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={form.name}
              onChange={handleChange}
              readOnly={isView}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              readOnly={isView}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              name="phone"
              value={form.phone}
              onChange={handleChange}
              readOnly={isView}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Country</Form.Label>
            <Form.Control
              name="country"
              value={form.country}
              onChange={handleChange}
              readOnly={isView}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={isView}
            >
              <option>Active</option>
              <option>Inactive</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {editing ? "Save changes" : "Add Customer"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
