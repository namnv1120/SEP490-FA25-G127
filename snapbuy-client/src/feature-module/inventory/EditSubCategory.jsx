import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import axios from 'axios'; // Import axios
import { Link } from 'react-router-dom';
import CommonSelect from '../../../components/select/common-select'; // Assuming path

// Accept props for the subcategory being edited and a success callback
const EditSubcategories = ({ subcategoryToEdit, onSaveSuccess }) => {
    // State for form fields
    const [selectedCategory, setSelectedCategory] = useState(null); // For parent category dropdown
    const [subcategoryName, setSubcategoryName] = useState('');
    const [categoryCode, setCategoryCode] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState(true); // true = Active
    const [subcategoryId, setSubcategoryId] = useState(null); // To store the ID

    // State for API interaction
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Placeholder for parent categories (fetch these from an API ideally)
    const [parentCategories, setParentCategories] = useState([
        // Example: Fetch categories in useEffect or pass via props
        { value: "cat1", label: "Computers" },
        { value: "cat2", label: "Fruits" },
        { value: "cat3", label: "Accessories" },
    ]);

    // Effect to populate form when subcategoryToEdit prop changes
    useEffect(() => {
        if (subcategoryToEdit) {
            // Find the parent category object to set the select value correctly
            const parentCat = parentCategories.find(cat => cat.label === subcategoryToEdit.category); // Assuming parent name is in 'category' field
            setSelectedCategory(parentCat ? parentCat.value : null);

            setSubcategoryName(subcategoryToEdit.parentcategory || ''); // Assuming subcat name is 'parentcategory' field
            setCategoryCode(subcategoryToEdit.categorycode || '');
            setDescription(subcategoryToEdit.description || '');
            setStatus(subcategoryToEdit.status === 'Active');
            setSubcategoryId(subcategoryToEdit.id); // Assuming your object has an 'id'
            setError(null);
        } else {
            // Reset form if needed
            setSelectedCategory(null);
            setSubcategoryName('');
            setCategoryCode('');
            setDescription('');
            setStatus(true);
            setSubcategoryId(null);
        }
        // Add parentCategories to dependency array if fetched within this component
    }, [subcategoryToEdit, parentCategories]);

    // --- Handle Save Changes ---
    const handleSaveChanges = async (event) => {
        event.preventDefault(); // Prevent default form submission
        if (!subcategoryId) {
            setError("No subcategory selected to edit.");
            return;
        }
        setIsSaving(true);
        setError(null);

        // Find the label for the selected parent category value
        const parentCategoryLabel = parentCategories.find(cat => cat.value === selectedCategory)?.label || '';


        const updatedSubcategory = {
            // Adjust field names based on your API expectation
            category: parentCategoryLabel,     // Sending parent category label
            parentcategory: subcategoryName, // Sending subcategory name
            categorycode: categoryCode,
            description: description,
            status: status ? 'Active' : 'Inactive',
            // Include parent_category_id if your API needs it
            // parent_category_id: selectedCategory,
        };

        try {
            // **Replace with your actual API endpoint for updating a subcategory**
            const response = await axios.put(`/api/subcategories/${subcategoryId}`, updatedSubcategory);

            console.log("Subcategory updated:", response.data);

            // Close modal using Bootstrap JS API
            const modalElement = document.getElementById('edit-category');
            if (modalElement) {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                } else {
                    const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
                    if (closeButton) closeButton.click();
                }
            }


            // Call parent callback to refresh list
            if (onSaveSuccess) {
                onSaveSuccess();
            }

        } catch (err) {
            console.error("Error updating subcategory:", err);
            setError("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };
    // ----------------------------


    return (
        <div>
            {/* Edit Category - Ensure this ID matches the trigger */}
            <div className="modal fade" id="edit-category">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Edit Sub Category</h4>
                                    </div>
                                    <button
                                        type="button"
                                        className="close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                        onClick={() => setError(null)} // Clear error on close
                                    >
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    <form onSubmit={handleSaveChanges}>
                                        <div className="mb-3">
                                            <label className="form-label">Parent Category</label>
                                            <CommonSelect
                                                className="w-100"
                                                options={parentCategories} // Use fetched/defined categories
                                                value={selectedCategory} // Controlled component
                                                onChange={(e) => setSelectedCategory(e.value)}
                                                placeholder="Choose Parent Category" // More specific placeholder
                                                // filter={false} // Assuming no filter needed
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Subcategory Name</label> {/* Updated Label */}
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={subcategoryName} // Controlled
                                                onChange={(e) => setSubcategoryName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Subcategory Code</label> {/* Updated Label */}
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={categoryCode} // Controlled
                                                onChange={(e) => setCategoryCode(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3 input-blocks">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                value={description} // Controlled
                                                onChange={(e) => setDescription(e.target.value)}
                                                // defaultValue={"Type Description"} // Remove defaultValue when using value
                                            />
                                        </div>
                                        <div className="mb-3"> {/* Added mb-3 for spacing */}
                                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                                <span className="status-label">Status</span>
                                                <input
                                                    type="checkbox"
                                                    id={`edit-subcat-status-${subcategoryId || 'new'}`} // Unique ID
                                                    className="check"
                                                    checked={status} // Controlled
                                                    onChange={(e) => setStatus(e.target.checked)}
                                                />
                                                <label htmlFor={`edit-subcat-status-${subcategoryId || 'new'}`} className="checktoggle" />
                                            </div>
                                        </div>
                                        <div className="modal-footer-btn">
                                            <button
                                                type="button" // Cancel button
                                                className="btn btn-cancel me-2"
                                                data-bs-dismiss="modal"
                                                onClick={() => setError(null)} // Clear error
                                                disabled={isSaving}
                                            >
                                                Cancel
                                            </button>
                                            <button // Changed Link to button
                                                type="submit" // Submit button
                                                className="btn btn-submit"
                                                disabled={isSaving}
                                            >
                                                {isSaving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Edit Category */}
        </div>
    );
};

export default EditSubcategories;