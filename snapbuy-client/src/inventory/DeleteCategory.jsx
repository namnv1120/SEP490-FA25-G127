import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Category.css";

export default function DeleteCategory() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const handleDelete = () => {
    // Thực hiện xóa ở đây (API hoặc logic)
    alert(`Category "${slug}" deleted successfully.`);
    navigate("/category");
  };

  return (
    <div className="category-page">
      <div className="header">
        <h2>Delete Category</h2>
        <p>Are you sure you want to delete <strong>{slug}</strong>?</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button className="btn delete" onClick={handleDelete}>Yes, Delete</button>
        <button className="btn add" onClick={() => navigate("/category")}>Cancel</button>
      </div>
    </div>
  );
}
