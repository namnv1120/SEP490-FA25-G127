// SupplierList.jsx
import React from 'react';
import '../styles/Supplier.css';

const SuppliersList = [
  {
    code: 'SU001',
    name: 'Apex Computers',
    email: 'apexcomputers@example.com',
    phone: '+1562476234',
    country: 'Germany',
    status: 'Active',
  },
  {
    code: 'SU002',
    name: 'Beats Headphones',
    email: 'beatsheadphone@example.com',
    phone: '+1362789100',
    country: 'Japan',
    status: 'Active',
  },
  {
    code: 'SU003',
    name: 'Dazzle Shoes',
    email: 'dazzleshoes@example.com',
    phone: '+1789023456',
    country: 'USA',
    status: 'Active',
  },
  {
    code: 'SU004',
    name: 'Best Accessories',
    email: 'bestaccessories@example.com',
    phone: '+1987234567',
    country: 'Austria',
    status: 'Active',
  },
  {
    code: 'SU005',
    name: 'D2 Store',
    email: 'd2store@example.com',
    phone: '+1267489103',
    country: 'Turkey',
    status: 'Active',
  },
];

export default function SupplierList() {
  return (
    <div className="supplier-container">
      <div className="header">
        <h2>Supplier Management</h2>
        <button className="add-button">Add Supplier</button>
      </div>

      <div className="filter">
        <label>Status:</label>
        <select>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <table className="supplier-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Country</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {SuppliersList.map((s, index) => (
            <tr key={index}>
              <td>{s.code}</td>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.phone}</td>
              <td>{s.country}</td>
              <td>{s.status}</td>
              <td>
                <button className="edit-btn">✏️</button>
                <button className="delete-btn">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
