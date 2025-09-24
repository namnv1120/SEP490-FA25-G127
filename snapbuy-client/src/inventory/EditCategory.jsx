import React from "react";
import { useParams } from "react-router-dom";
import "../styles/Category.css";

export default function EditCategory() {
  const { slug } = useParams();

  return (
    <div className="category-page">
      <div className="header">
        <h2>Edit Category</h2>
        <p>Modify details for <strong>{slug}</strong></p>
      </div>

      <form className="edit-form">
        <label>Category Name</label>
        <input type="text" defaultValue={slug.charAt(0).toUpperCase() + slug.slice(1)} />

        <label>Category Slug</label>
        <input type="text" defaultValue={slug} />

        <label>Status</label>
        <select defaultValue="Active">
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <button className="btn add" type="submit">Save Changes</button>
      </form>
    </div>
  );
}
