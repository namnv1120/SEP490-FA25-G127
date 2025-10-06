import React, { useState } from "react";
import { updateRolePermission } from "../../../services/RolesPermissionService";

const EditRole = ({ role, onUpdated }) => {
  const [roleName, setRoleName] = useState(role?.role || "");
  const [status, setStatus] = useState(role?.status === "Active");

  const handleUpdate = async () => {
    if (!roleName.trim()) {
      alert("Please enter a role name!");
      return;
    }

    const updatedRole = {
      role: roleName.trim(),
      status: status ? "Active" : "Inactive",
    };

    try {
      await updateRolePermission(role.id, updatedRole);
      alert("Role updated successfully!");
      onUpdated && onUpdated();

      const modal = window.bootstrap?.Modal.getInstance(
        document.getElementById("edit-role")
      );
      modal?.hide();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update role!");
    }
  };

  return (
    <div className="modal fade" id="edit-role">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <div className="page-title">
              <h4>Edit Role</h4>
            </div>
            <button
              type="button"
              className="close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Role Name</label>
              <input
                type="text"
                className="form-control"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>

            <div className="d-flex align-items-center justify-content-between">
              <label className="form-label">Status</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                />
                <span className="slider round" />
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary me-2"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdate}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRole;