import React from "react";
import "../styles/Product.css";
import { FaFilePdf, FaFileExcel, FaEdit, FaTrash } from "react-icons/fa";

const products = [
  {
    sku: "PT001",
    name: "Lenovo 3rd Generatio",
    category: "Laptop",
    brand: "Lenovo",
    price: 12500,
    unit: "Pc",
    qty: 100,
    createdBy: "Arroon",
    image: "/images/lenovo.png",
  },
  {
    sku: "PT002",
    name: "Bold V3.2",
    category: "Electronics",
    brand: "Bolt",
    price: 1600,
    unit: "Pc",
    qty: 140,
    createdBy: "Kenneth",
    image: "/images/bold.png",
  },
  {
    sku: "PT003",
    name: "Nike Jordan",
    category: "Shoe",
    brand: "Nike",
    price: 6000,
    unit: "Pc",
    qty: 780,
    createdBy: "Gooch",
    image: "/images/nike.png",
  },
];

export default function Product() {
  return (
    <div className="product-page">
      <div className="header">
        <div>
          <h2>Product List</h2>
          <p>Manage your products</p>
        </div>
        <div className="header-buttons">
          <button className="btn pdf">
            <FaFilePdf /> 
          </button>
          <button className="btn excel">
            <FaFileExcel /> 
          </button>
          <button className="btn add">+ Add New Product</button>
          <button className="btn import">Import Product</button>
        </div>
      </div>

      <div className="filters">
        <input type="text" placeholder="Search" />
        <select>
          <option>Product</option>
        </select>
        <select>
          <option>Created By</option>
        </select>
        <select>
          <option>Category</option>
        </select>
        <select>
          <option>Brand</option>
        </select>
        <select>
          <option>Sort By : Last 7 Days</option>
        </select>
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>SKU</th>
            <th>Product</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Unit</th>
            <th>Qty</th>
            <th>Created By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={i}>
              <td><input type="checkbox" /></td>
              <td>{p.sku}</td>
              <td className="product-name">
                <img src={p.image} alt={p.name} />
                {p.name}
              </td>
              <td>{p.category}</td>
              <td>{p.brand}</td>
              <td>${p.price.toFixed(2)}</td>
              <td>{p.unit}</td>
              <td>{p.qty}</td>
              <td><span className="created-by">{p.createdBy}</span></td>
              <td className="actions">
                <button className="btn-icon edit"><FaEdit /></button>
                <button className="btn-icon delete"><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="footer">
        <span>Row Per Page</span>
        <select>
          <option>10</option>
          <option>20</option>
          <option>30</option>
        </select>
        <span>Entries</span>
        <div className="pagination">
          <button>{"<<"}</button>
          <button className="active">1</button>
          <button>{">>"}</button>
        </div>
      </div>
    </div>
  );
}
