import { useState } from "react";
import { createRolePermission } from "../../../services/RolesPermissionService";

const AddRole = ({ onRoleAdded }) => {
  const [roleName, setRoleName] = useState("");
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreateRole = async () => {
    if (!roleName.trim()) {
      alert("Please enter a role name!");
      return;
    }

    const newRole = {
      role: roleName.trim(),
      status: status ? "Active" : "Inactive",
      createdon: new Date().toISOString().split("T")[0],
    };

    try {
      setLoading(true);
      await createRolePermission(newRole);
      alert("Role created successfully!");
      setRoleName("");
      setStatus(true);

      // Close modal
      const modal = window.bootstrap?.Modal.getInstance(
        document.getElementById("add-units")
      );
      modal?.hide();

      // Reload list after adding
      onRoleAdded && onRoleAdded();
    } catch (error) {
      console.error("Error creating role:", error);
      alert("Failed to create role. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade" id="add-units" tabIndex="-1">
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