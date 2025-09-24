import React from "react";
import "../styles/Category.css";
import { FaFilePdf, FaFileExcel, FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";



const categories = [
  { name: "Laptop", slug: "laptop", createdOn: "25 May 2023", status: "Active" },
  { name: "Electronics", slug: "electronics", createdOn: "24 Jun 2023", status: "Active" },
  { name: "Shoe", slug: "shoe", createdOn: "23 Jul 2023", status: "Active" },
  { name: "Speaker", slug: "speaker", createdOn: "22 Aug 2023", status: "Active" },
  { name: "Furniture", slug: "furniture", createdOn: "21 Sep 2023", status: "Active" },
  { name: "Bags", slug: "bags", createdOn: "20 Sep 2023", status: "Active" },
  { name: "Phone", slug: "phone", createdOn: "20 Sep 2023", status: "Active" },
  { name: "Chairs", slug: "chairs", createdOn: "20 Sep 2023", status: "Active" },
];

export default function Category() {
  return (
    <div className="category-page">
      <div className="header">
        <div>
          <h2>Category</h2>
          <p>Manage your categories</p>
        </div>
        <div className="header-buttons">
          <button className="btn pdf"><FaFilePdf /></button>
          <button className="btn excel"><FaFileExcel /></button>
          <button className="btn add">+ Add Category</button>
        </div>
      </div>

      <div className="filters">
        <input type="text" placeholder="Search" />
        <select>
          <option>Status</option>
        </select>
        <select>
          <option>Sort By : Last 7 Days</option>
        </select>
      </div>

      <table className="category-table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>Category</th>
            <th>Category Slug</th>
            <th>Created On</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c, i) => (
            <tr key={i}>
              <td><input type="checkbox" /></td>
              <td>{c.name}</td>
              <td>{c.slug}</td>
              <td>{c.createdOn}</td>
              <td>
                <span className="status active">{c.status}</span>
              </td>
             <td className="actions">
            <Link to={`/category/edit/${c.slug}`} className="btn-icon edit">
              <FaEdit />
            </Link>
            <Link to={`/category/delete/${c.slug}`} className="btn-icon delete">
              <FaTrash />
            </Link>
          </td>

            </tr>
          ))}
        </tbody>
      </table>

          <div className="footer">
      <div className="footer-left">
        <span>Row Per Page</span>
        <select>
          <option>10</option>
          <option>20</option>
        </select>
        <span>Entries</span>
      </div>

      <div className="pagination">
        <button>{"<<"}</button>
        <button className="active">1</button>
        <button>{"2"}</button>
        <button>{">>"}</button>
      </div>
    </div>
    </div>


  );
}
