import React, { useState } from "react";
import "../../CustomerList.scss";

const CustomerList = () => {
  const [search, setSearch] = useState("");

  const customers = [
    {
      code: "CU001",
      name: "Carl Evans",
      email: "carlevans@example.com",
      phone: "+12163547758",
      country: "Germany",
      status: "Active",
      avatar: "https://i.pravatar.cc/40?img=1",
    },
    {
      code: "CU002",
      name: "Minerva Rameriz",
      email: "rameriz@example.com",
      phone: "+11367529510",
      country: "Japan",
      status: "Active",
      avatar: "https://i.pravatar.cc/40?img=2",
    },
    {
      code: "CU003",
      name: "Robert Lamon",
      email: "robert@example.com",
      phone: "+15362789414",
      country: "USA",
      status: "Active",
      avatar: "https://i.pravatar.cc/40?img=3",
    },
    {
      code: "CU004",
      name: "Patricia Lewis",
      email: "patricia@example.com",
      phone: "+18513094627",
      country: "Austria",
      status: "Active",
      avatar: "https://i.pravatar.cc/40?img=4",
    },
    {
      code: "CU005",
      name: "Mark Joslyn",
      email: "markjoslyn@example.com",
      phone: "+14678219025",
      country: "Turkey",
      status: "Active",
      avatar: "https://i.pravatar.cc/40?img=5",
    },
  ];

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="customer-page">
      <div className="header-bar">
        <h3>Customers</h3>
        <div className="actions">
          <button className="btn">PDF</button>
          <button className="btn">Excel</button>
          <button className="btn add">+ Add Customer</button>
        </div>
      </div>

      <p className="subtitle">Manage your customers</p>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select>
          <option>Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      <table className="customer-table">
        <thead>
          <tr>
            <th></th>
            <th>Code</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Country</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.code}>
              <td>
                <input type="checkbox" />
              </td>
              <td>{c.code}</td>
              <td>
                <div className="customer-info">
                  <img src={c.avatar} alt={c.name} />
                  <span>{c.name}</span>
                </div>
              </td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.country}</td>
              <td>
                <span className="status active">{c.status}</span>
              </td>
              <td>
                <button className="icon-btn view">👁</button>
                <button className="icon-btn edit">✏️</button>
                <button className="icon-btn delete">🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <select>
          <option>10</option>
          <option>25</option>
          <option>50</option>
        </select>
        <span>
          Showing 1 to {filtered.length} of {customers.length} entries
        </span>
        <div className="pages">
          <button>{"<<"}</button>
          <button>{"<"}</button>
          <button className="active">1</button>
          <button>{">"}</button>
          <button>{">>"}</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
