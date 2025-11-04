import React, { useState, useEffect } from "react";
import { updateRole } from "../../../services/RoleService";

const EditRole = ({ id = "edit-role", role, roleId, onUpdated, onClose }) => {
  const [roleName, setRoleName] = useState("");
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setRoleName(role.roleName || "");
      setStatus(role.active || false);
    }
  }, [role]);

  const handleUpdate = async () => {
    if (!roleName.trim()) {
      alert("Please enter a role name!");
      return;
    }

    const updatedRole = {
      roleName: roleName.trim(),
      active: status,
    };

    try {
      setLoading(true);
      await updateRole(roleId, updatedRole);
      alert("Role updated successfully!");

      const modal = window.bootstrap?.Modal.getInstance(
        document.getElementById(id)
      );
      modal?.hide();

      onUpdated && onUpdated();
      onClose && onClose();
    } catch (error) {
      alert("Failed to update role. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade" id={id} tabIndex="-1">
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
              onClick={onClose}
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
                placeholder="Enter role name"
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
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRole;