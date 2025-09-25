import React, { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import TopHeader from "../components/layout/TopHeader";
import CustomerTable from "../components/customers/CustomerTable";
import AddEditCustomerModal from "../components/customers/AddEditCustomerModal";
import MainMenu from "../components/layout/MainMenu";
import "../styles/Customers.css";

const initialCustomers = [
  {
    id: 1,
    code: "CU001",
    name: "Carl Evans",
    email: "carlevans@example.com",
    phone: "+12163547758",
    country: "Germany",
    status: "Active",
  },
  {
    id: 2,
    code: "CU002",
    name: "Minerva Rameriz",
    email: "rameriz@example.com",
    phone: "+11367529510",
    country: "Japan",
    status: "Active",
  },
  {
    id: 3,
    code: "CU003",
    name: "Robert Lamon",
    email: "robert@example.com",
    phone: "+15362789414",
    country: "USA",
    status: "Active",
  },
  {
    id: 4,
    code: "CU004",
    name: "Patricia Lewis",
    email: "patricia@example.com",
    phone: "+18513094627",
    country: "Austria",
    status: "Active",
  },
  {
    id: 5,
    code: "CU005",
    name: "Mark Joslyn",
    email: "markjoslyn@example.com",
    phone: "+14678219025",
    country: "Turkey",
    status: "Active",
  },
];

export default function Customers() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [modalShow, setModalShow] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleAdd = (data) => {
    const id = customers.length
      ? Math.max(...customers.map((c) => c.id)) + 1
      : 1;
    setCustomers((prev) => [{ id, ...data }, ...prev]);
  };

  const handleUpdate = (id, updated) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa khách hàng này?")) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const openAdd = () => {
    setEditing(null);
    setModalShow(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setModalShow(true);
  };
  const openView = (c) => {
    setEditing(c);
    setModalShow(true);
  }; // modal dùng chung view/edit

  return (
    <>
      <TopHeader />
      <MainMenu />
      <Container fluid className="customers-page p-4">
        <Row className="mb-3 align-items-center">
          <Col>
            <h4 className="page-title">Customers</h4>
            <small className="text-muted">Manage your customers</small>
          </Col>
          <Col className="text-end">
            <Button variant="light" className="me-2 export-btn">
              PDF
            </Button>
            <Button variant="light" className="me-2 export-btn">
              Excel
            </Button>
            <Button variant="outline-secondary" className="me-2">
              <i className="bi bi-arrow-clockwise"></i>
            </Button>
            <Button variant="warning" className="btn-add" onClick={openAdd}>
              + Add Customer
            </Button>
          </Col>
        </Row>

        <Row>
          <Col>
            <CustomerTable
              customers={customers}
              onEdit={openEdit}
              onView={openView}
              onDelete={handleDelete}
            />
          </Col>
        </Row>

        <AddEditCustomerModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          editing={editing}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
        />
      </Container>
      <div className="floating-gear">⚙</div>
    </>
  );
}
