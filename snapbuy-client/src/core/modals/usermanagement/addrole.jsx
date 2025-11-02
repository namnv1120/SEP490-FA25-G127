import { useState } from "react";
import { createRole } from "../../../services/RoleService";

const AddRole = ({ id = "add-role", onCreated }) => {
  const [roleName, setRoleName] = useState("");
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreateRole = async () => {
    if (!roleName.trim()) {
      alert("Please enter a role name!");
      return;
    }

    const newRole = {
      roleName: roleName.trim(),
      active: status,
    };

    try {
      setLoading(true);
      await createRole(newRole);
      alert("Role created successfully!");
      setRoleName("");
      setStatus(true);

      // Close modal
      const modal = window.bootstrap?.Modal.getInstance(
        document.getElementById(id)
      );
      modal?.hide();

      // Reload list after adding
      onCreated && onCreated();
    } catch (error) {
      alert("Failed to create role. Please try again!");
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
              <h4>Create Role</h4>
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

          <form>
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
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateRole}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Role"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRole;