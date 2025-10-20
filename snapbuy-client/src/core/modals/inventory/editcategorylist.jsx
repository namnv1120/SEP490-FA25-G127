import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import axios from 'axios'; // Import axios for saving changes

// Accept props for the category being edited and a function to refresh the list
const EditCategoryList = ({ categoryToEdit, onSaveSuccess }) => {
    // State to manage form inputs
    const [categoryName, setCategoryName] = useState('');
    const [categorySlug, setCategorySlug] = useState('');
    const [status, setStatus] = useState(true); // Assuming true = Active
    const [categoryId, setCategoryId] = useState(null); // To store the ID of the category being edited
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Effect to populate the form when categoryToEdit prop changes
    useEffect(() => {
        if (categoryToEdit) {
            setCategoryName(categoryToEdit.category || '');
            setCategorySlug(categoryToEdit.categoryslug || '');
            setStatus(categoryToEdit.status === 'Active'); // Convert status string to boolean
            setCategoryId(categoryToEdit.id); // Assuming your category object has an 'id'
            setError(null); // Clear previous errors
        } else {
            // Reset form if no category is selected (optional)
            setCategoryName('');
            setCategorySlug('');
            setStatus(true);
            setCategoryId(null);
        }
    }, [categoryToEdit]); // Re-run effect when categoryToEdit changes

    // --- Handle Save Changes ---
    const handleSaveChanges = async (event) => {
        event.preventDefault(); // Prevent default form submission if using type="submit"
        if (!categoryId) {
            setError("No category selected to edit.");
            return;
        }
        setIsSaving(true);
        setError(null);

        const updatedCategory = {
            category: categoryName,
            categoryslug: categorySlug,
            status: status ? 'Active' : 'Inactive', // Convert boolean back to string for API
        };

        try {
            // **Replace with your actual API endpoint for updating a category**
            // Use PUT or PATCH method, include categoryId in the URL
            const response = await axios.put(`/api/categories/${categoryId}`, updatedCategory);

            console.log("Category updated:", response.data);

            // Close the modal (Bootstrap 5 JS API or trigger click)
            const modalElement = document.getElementById('edit-category'); // Get modal element
            if (modalElement) {
                 // Use Bootstrap's JavaScript API if available
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                } else {
                     // Fallback: Simulate click on a dismiss button if API not ready
                    const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
                    if (closeButton) closeButton.click();
                }
            }


            // Call the callback function passed from the parent to refresh the list
            if (onSaveSuccess) {
                onSaveSuccess();
            }

        } catch (err) {
            console.error("Error updating category:", err);
            setError("Failed to save changes. Please try again.");
            // Optionally: Display more specific error from err.response.data
        } finally {
            setIsSaving(false);
        }
    };
    // ----------------------------

    // Render nothing or a placeholder if no category is selected yet
    // This prevents showing the modal with stale data briefly
    // if (!categoryToEdit) {
    //     return null; // Or some placeholder logic
    // }

    return (
        // Ensure the ID matches the data-bs-target in the trigger link (e.g., "#edit-customer")
        // It seems the trigger uses #edit-customer, while modal uses #edit-category. Let's stick to #edit-category for consistency within this component.
        <div className="modal fade" id="edit-category">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="page-wrapper-new p-0">
                        <div className="content">
                            <div className="modal-header">
                                <div className="page-title">
                                    <h4>Edit Category</h4>
                                </div>
                                <button
                                    type="button"
                                    className="close bg-danger text-white fs-16"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => setError(null)} // Clear error on close
                                >
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {/* Display error message */}
                                {error && <div className="alert alert-danger">{error}</div>}

                                {/* Use onSubmit for the form */}
                                <form onSubmit={handleSaveChanges}>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Category<span className="text-danger ms-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={categoryName} // Controlled input
                                            onChange={(e) => setCategoryName(e.target.value)}
                                            required // Add basic validation
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Category Slug<span className="text-danger ms-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={categorySlug} // Controlled input
                                            onChange={(e) => setCategorySlug(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-0">
                                        <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                            <span className="status-label">
                                                Status<span className="text-danger ms-1">*</span>
                                            </span>
                                            <input
                                                type="checkbox"
                                                id={`edit-category-status-${categoryId || 'new'}`} // More unique ID
                                                className="check"
                                                checked={status} // Controlled input
                                                onChange={(e) => setStatus(e.target.checked)}
                                            />
                                            <label htmlFor={`edit-category-status-${categoryId || 'new'}`} className="checktoggle" />
                                        </div>
                                    </div>

                                     {/* Move buttons inside form for type="submit" */}
                                    <div className="modal-footer">
                                        <button
                                            type="button" // Important: type="button" for cancel
                                            className="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                                            data-bs-dismiss="modal"
                                            onClick={() => setError(null)} // Clear error on cancel
                                            disabled={isSaving} // Disable while saving
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit" // Use type="submit"
                                            className="btn btn-primary fs-13 fw-medium p-2 px-3"
                                            disabled={isSaving} // Disable button while saving
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form> {/* End of form */}
                            </div>
                           {/* Footer moved inside the form */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCategoryList;