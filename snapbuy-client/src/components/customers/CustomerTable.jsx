import React, { useMemo, useState } from "react";
import { Table, Form, InputGroup, Button, Row, Col } from "react-bootstrap";
import {
  AiOutlineEye,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineSearch,
} from "react-icons/ai";

export default function CustomerTable({ customers, onEdit, onView, onDelete }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (statusFilter !== "All" && c.status !== statusFilter) return false;
      if (!s) return true;
      return [c.code, c.name, c.email, c.phone, c.country].some((x) =>
        x?.toLowerCase().includes(s)
      );
    });
  }, [customers, search, statusFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const visible = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const toggleAll = (e) => {
    if (e.target.checked) setSelectedIds(visible.map((v) => v.id));
    else setSelectedIds([]);
  };
  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const goto = (p) => {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setPage(p);
  };

  const pageButtons = () => {
    const out = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) out.push(i);
    } else {
      out.push(1);
      if (page > 4) out.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) out.push(i);
      if (page < totalPages - 3) out.push("...");
      out.push(totalPages);
    }
    return out;
  };

  return (
    <div className="card p-3 customers-card">
      <Row className="mb-3 align-items-center">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <AiOutlineSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        </Col>

        <Col md={3}></Col>

        <Col md={3} className="text-end">
          <Form.Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: 120, display: "inline-block" }}
          >
            <option value="All">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Form.Select>
        </Col>
      </Row>

      <Table hover responsive className="align-middle mb-2">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <Form.Check
                onChange={toggleAll}
                checked={
                  selectedIds.length === visible.length && visible.length > 0
                }
              />
            </th>
            <th>Code</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Country</th>
            <th>Status</th>
            <th style={{ width: 140 }} className="text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.map((c) => (
            <tr key={c.id}>
              <td>
                <Form.Check
                  checked={selectedIds.includes(c.id)}
                  onChange={() => toggleOne(c.id)}
                />
              </td>
              <td className="fw-medium">{c.code}</td>
              <td>
                <div className="d-flex align-items-center">
                  <div
                    className="avatar me-2"
                    style={{
                      backgroundImage: `url(https://i.pravatar.cc/60?u=${c.email})`,
                    }}
                  />
                  <div>{c.name}</div>
                </div>
              </td>
              <td className="text-muted">{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.country}</td>
              <td>
                <span
                  className={`badge ${
                    c.status === "Active" ? "bg-success" : "bg-danger"
                  }`}
                >
                  {c.status}
                </span>
              </td>
              <td className="text-center">
                <Button
                  variant="light"
                  size="sm"
                  className="action-btn me-1"
                  title="View"
                  onClick={() => onView && onView(c)}
                >
                  <AiOutlineEye />
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  className="action-btn me-1"
                  title="Edit"
                  onClick={() => onEdit && onEdit(c)}
                >
                  <AiOutlineEdit />
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  className="action-btn"
                  title="Delete"
                  onClick={() => onDelete && onDelete(c.id)}
                >
                  <AiOutlineDelete />
                </Button>
              </td>
            </tr>
          ))}

          {visible.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-muted py-4">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-2">
        <div className="d-flex align-items-center">
          <span className="me-2">Row Per Page</span>
          <Form.Select
            size="sm"
            style={{ width: 90 }}
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </Form.Select>
          <span className="ms-3 text-muted">
            Showing {Math.min((page - 1) * rowsPerPage + 1, total)} to{" "}
            {Math.min(page * rowsPerPage, total)} of {total} entries
          </span>
        </div>

        <div>
          <Button
            variant="light"
            size="sm"
            className="me-1"
            disabled={page === 1}
            onClick={() => goto(1)}
          >
            ⏮
          </Button>
          <Button
            variant="light"
            size="sm"
            className="me-2"
            disabled={page === 1}
            onClick={() => goto(page - 1)}
          >
            ‹
          </Button>

          {pageButtons().map((p, idx) =>
            p === "..." ? (
              <Button
                key={idx}
                variant="link"
                size="sm"
                disabled
                className="text-muted"
              >
                ...
              </Button>
            ) : (
              <Button
                key={idx}
                variant={p === page ? "warning" : "light"}
                size="sm"
                className="me-1"
                onClick={() => goto(p)}
              >
                {p}
              </Button>
            )
          )}

          <Button
            variant="light"
            size="sm"
            className="ms-2"
            disabled={page === totalPages}
            onClick={() => goto(page + 1)}
          >
            ›
          </Button>
          <Button
            variant="light"
            size="sm"
            className="ms-1"
            disabled={page === totalPages}
            onClick={() => goto(totalPages)}
          >
            ⏭
          </Button>
        </div>
      </div>
    </div>
  );
}
