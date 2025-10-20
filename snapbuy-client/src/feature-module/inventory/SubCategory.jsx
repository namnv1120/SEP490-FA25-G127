import React, { useState, useEffect, useRef } from 'react'; // Import useEffect, useRef
import axios from 'axios'; // Import axios
import { Link } from 'react-router-dom';
import CommonFooter from '../../components/footer/commonFooter';
import {
    laptop, // Keep for placeholder image
    // Product images removed as data comes from API
} from '../../utils/imagepath';
import PrimeDataTable from '../../components/data-table';
import TableTopHead from '../../components/table-top-head';
import CommonSelect from '../../components/select/common-select';
import DeleteModal from '../../components/delete-modal';
import SearchFromApi from '../../components/data-table/search';
import { Editor } from 'primereact/editor';
// Import Edit Modal if it's a separate component
// import EditSubcategories from '../../core/modals/inventory/EditSubcategories';

// Static data removed

const SubCategories = () => {
    // --- State for API data ---
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [parentCategories, setParentCategories] = useState([]); // For dropdowns
    // -------------------------

    // --- State for Table and Modals ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [rows, setRows] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingSubcategory, setEditingSubcategory] = useState(null); // Data for edit modal
    const [deletingSubcategoryId, setDeletingSubcategoryId] = useState(null); // ID for delete modal

    // State for Add Modal fields
    const [addSelectedParentCategory, setAddSelectedParentCategory] = useState(null);
    const [addSubCategoryName, setAddSubCategoryName] = useState('');
    const [addCategoryCode, setAddCategoryCode] = useState('');
    const [addDescription, setAddDescription] = useState('');
    const [addStatus, setAddStatus] = useState(true); // true = Active
    const [addImageFile, setAddImageFile] = useState(null); // For file input

     // State for Edit Modal fields (can also be managed inside EditSubcategories component)
    const [editSelectedParentCategory, setEditSelectedParentCategory] = useState(null);
    const [editSubCategoryName, setEditSubCategoryName] = useState('');
    const [editCategoryCode, setEditCategoryCode] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStatus, setEditStatus] = useState(true);
    const [editImageFile, setEditImageFile] = useState(null);
    const [editExistingImageUrl, setEditExistingImageUrl] = useState('');


    // Refs for modal instances to close them programmatically
    const addModalRef = useRef(null);
    const editModalRef = useRef(null);
    const deleteModalRef = useRef(null);
    // -------------------------------

    // --- Helper to close Bootstrap modal ---
    const closeModal = (modalId) => {
        const modalElement = document.getElementById(modalId);
         if (modalElement && window.bootstrap) { // Check if bootstrap is loaded
            const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
         }
    };
    // -------------------------------------

    // --- Fetch Parent Categories ---
    const fetchParentCategories = async () => {
        try {
            // ** Replace with your actual categories API endpoint **
            const response = await axios.get('/api/categories?all=true'); // Fetch all for dropdown
             // ** Adjust mapping based on your API response **
            const formattedCategories = response.data.map(cat => ({
                label: cat.name, // Assuming API returns 'name'
                value: cat.id    // Assuming API returns 'id'
            }));
            setParentCategories(formattedCategories);
        } catch (err) {
            console.error("Error fetching parent categories:", err);
            // Handle error (e.g., show message)
        }
    };
    // -----------------------------

    // --- Fetch Subcategories Data ---
    const fetchData = async (search = searchQuery, page = currentPage, limit = rows) => {
        setLoading(true);
        setError(null);
        try {
            // ** Replace with your actual API endpoint **
            let url = `/api/subcategories?page=${page}&limit=${limit}`;
            if (search) {
                url += `&search=${search}`;
            }
            // Add sorting/filtering params if needed: &sortField=name&sortOrder=asc&status=Active

            const response = await axios.get(url);

            // ** Adjust based on your API response structure **
             if (response.data && Array.isArray(response.data.data)) {
                setDataSource(response.data.data);
                setTotalRecords(response.data.total || 0);
             } else {
                throw new Error("Invalid data structure received.");
             }
        } catch (err) {
            console.error("Error fetching subcategories:", err);
            setError("Failed to load subcategories.");
            setDataSource([]); // Clear data on error
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };
    // -----------------------------

    // --- useEffect Hooks ---
    useEffect(() => {
        fetchParentCategories(); // Fetch parent categories on mount
    }, []); // Empty array runs once

    useEffect(() => {
        fetchData(searchQuery, currentPage, rows);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, rows]); // Re-fetch when page or rows change (search triggers manually)
    // -----------------------

     // --- Populate Edit Modal ---
     useEffect(() => {
        if (editingSubcategory) {
            setEditSelectedParentCategory(
                parentCategories.find(cat => cat.label === editingSubcategory.category)?.value || null
            );
            setEditSubCategoryName(editingSubcategory.parentcategory || '');
            setEditCategoryCode(editingSubcategory.categorycode || '');
            setEditDescription(editingSubcategory.description || '');
            setEditStatus(editingSubcategory.status === 'Active');
            setEditExistingImageUrl(editingSubcategory.img || ''); // Store existing image URL
            setEditImageFile(null); // Reset file input
            setError(null); // Clear modal error
        }
    }, [editingSubcategory, parentCategories]); // Re-run when item to edit or categories list changes
    // --------------------------


    // --- Handlers ---
    const handleSearch = (value) => {
        setSearchQuery(value);
        setCurrentPage(1); // Reset page on new search
        fetchData(value, 1, rows);
    };

    const handleEditClick = (subcategoryData) => {
        setEditingSubcategory(subcategoryData); // Set data which triggers useEffect to populate form
    };

    const handleDeleteClick = (subcategoryId) => {
        setDeletingSubcategoryId(subcategoryId);
    };

    // Add Form Submit
    const handleAddSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); // Indicate loading state
        setError(null);

        // --- Image Upload Logic (Basic Example - needs refinement) ---
        const formData = new FormData();
        formData.append('parentCategoryId', addSelectedParentCategory); // Send parent ID
        formData.append('name', addSubCategoryName); // API expects 'name' for subcat?
        formData.append('code', addCategoryCode);   // API expects 'code'?
        formData.append('description', addDescription);
        formData.append('status', addStatus ? 'Active' : 'Inactive');
        if (addImageFile) {
            formData.append('image', addImageFile); // Key 'image' depends on backend
        }
        // -------------------------------------------------------------

        try {
            // ** Replace with your POST endpoint **
            await axios.post(`/api/subcategories`, formData, {
                headers: { // Needed if sending FormData (files)
                    'Content-Type': 'multipart/form-data',
                },
            });
            fetchData(); // Refresh list on success
            closeModal('add-category'); // Close modal
            // Reset Add form state
            setAddSelectedParentCategory(null);
            setAddSubCategoryName('');
            setAddCategoryCode('');
            setAddDescription('');
            setAddStatus(true);
            setAddImageFile(null);
            event.target.reset(); // Reset file input visually

        } catch (err) {
            console.error("Error adding subcategory:", err);
            setError("Failed to add subcategory. " + (err.response?.data?.message || err.message)); // Show specific error if available
        } finally {
            setLoading(false);
        }
    };

    // Edit Form Submit
    const handleEditSubmit = async (event) => {
        event.preventDefault();
        if (!editingSubcategory?.id) return;
        setLoading(true); // Indicate loading state
        setError(null);

        // --- Image Upload Logic (Basic Example) ---
        const formData = new FormData();
        formData.append('parentCategoryId', editSelectedParentCategory);
        formData.append('name', editSubCategoryName);
        formData.append('code', editCategoryCode);
        formData.append('description', editDescription);
        formData.append('status', editStatus ? 'Active' : 'Inactive');
        if (editImageFile) {
            formData.append('image', editImageFile); // Send new image if selected
        }
         // Optionally: Add a field to indicate if image should be removed if editImageFile is null and editExistingImageUrl exists
        // formData.append('remove_image', !editImageFile && editExistingImageUrl ? 'true' : 'false');

        // Note: For PUT with FormData, some backends might have issues. PATCH might be better.
        // Or send JSON and handle image upload separately.

        try {
            // ** Replace with your PUT/PATCH endpoint **
             // Using POST with _method=PUT for potential FormData compatibility
            await axios.post(`/api/subcategories/${editingSubcategory.id}`, formData, {
                 headers: { 'Content-Type': 'multipart/form-data' },
                 params: { _method: 'PUT' } // Or use PUT directly if backend supports FormData with PUT
             });

            fetchData(searchQuery, currentPage, rows); // Refresh list on success (stay on current page/search)
            closeModal('edit-category'); // Close modal
            setEditingSubcategory(null); // Clear editing state

        } catch (err) {
            console.error("Error updating subcategory:", err);
             setError("Failed to save changes. " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };


    // Delete Confirmation
     const confirmDelete = async () => {
         if (!deletingSubcategoryId) return;
         setLoading(true); // Indicate loading
         setError(null);
         try {
            // ** Replace with your DELETE endpoint **
             await axios.delete(`/api/subcategories/${deletingSubcategoryId}`);
             setDeletingSubcategoryId(null); // Clear ID
             closeModal('delete-modal'); // Close confirm modal
              // Refresh data, potentially adjusting page if last item deleted
              const newTotalRecords = totalRecords - 1;
              const newTotalPages = Math.ceil(newTotalRecords / rows);
              const newCurrentPage = currentPage > newTotalPages ? Math.max(newTotalPages, 1) : currentPage;
              if(currentPage !== newCurrentPage){
                setCurrentPage(newCurrentPage); // Fetch will be triggered by useEffect
              } else {
                fetchData(searchQuery, newCurrentPage, rows); // Fetch current page data
              }

         } catch(err) {
            console.error("Error deleting subcategory:", err);
            setError("Failed to delete subcategory."); // Show error (maybe in delete modal?)
            setLoading(false); // Stop loading indicator on error
             // Consider closing delete modal even on error?
             // closeModal('delete-modal');
         }
         // setLoading(false) is handled by fetchData on success
     };
    // ----------------

    // --- Define Columns ---
    const columns = [
        {
            header: <label className="checkboxs"><input type="checkbox" id="select-all" /><span className="checkmarks" /></label>,
            body: () => <label className="checkboxs"><input type="checkbox" /><span className="checkmarks" /></label>,
            sortable: false, key: "checked",
        },
        {
            field: "img", // Field name from API data
            header: "Image", key: "logo", sortable: false, // Usually not sortable
            body: (rowData) => (
                <span className="productimgname">
                    <Link to="#" className="product-img stock-img">
                         {/* Ensure rowData.img exists */}
                        <img alt={rowData.parentcategory || 'Subcategory'} src={rowData.img || laptop /* Fallback */} />
                    </Link>
                </span>
            ),
        },
        { field: "parentcategory", header: "Sub Category", key: "parentcategory", sortable: true },
        { field: "category", header: "Category", key: "category", sortable: true },
        { field: "categorycode", header: "Code", key: "categorycode", sortable: true },
        { field: "description", header: "Description", key: "description", sortable: true },
        {
            field: "status", header: "Status", key: "status", sortable: true,
            body: (rowData) => (
                <span className={`badge ${rowData.status === 'Active' ? 'bg-success' : 'bg-lightred'} fw-medium fs-10`}>
                    {rowData.status}
                </span>
            ),
        },
        {
            header: "Actions", field: "actions", key: "actions", sortable: false,
            body: (rowData) => (
                <div className="edit-delete-action d-flex align-items-center">
                    <button type="button" className="me-2 p-2 d-flex align-items-center border rounded btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#edit-category" onClick={() => handleEditClick(rowData)} >
                        <i className="feather icon-edit"></i>
                    </button>
                    <button type="button" className="p-2 d-flex align-items-center border rounded btn btn-sm btn-outline-danger" data-bs-toggle="modal" data-bs-target="#delete-modal" onClick={() => handleDeleteClick(rowData.id)} >
                        <i className="feather icon-trash-2"></i>
                    </button>
                </div>
            ),
        },
    ];
    // --- End Columns ---

    return (
        <>
            <div className="page-wrapper">
                <div className="content">
                    <div className="page-header">
                        <div className="add-item d-flex">
                            <div className="page-title">
                                <h4 className="fw-bold">Sub Category</h4>
                                <h6>Manage your sub categories</h6>
                            </div>
                        </div>
                        <TableTopHead />
                        <div className="page-btn">
                            <Link to="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-category" >
                                <i className="ti ti-circle-plus me-1"></i> Add Sub Category
                            </Link>
                        </div>
                    </div>

                    <div className="card table-list-card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                            <SearchFromApi
                                callback={handleSearch}
                                rows={rows}
                                setRows={setRows} // Allow changing rows per page via SearchFromApi?
                            />
                            {/* Filters can be added here */}
                            <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                                {/* Add Category/Status filter dropdowns if needed */}
                            </div>
                        </div>
                        <div className="card-body">
                             {/* Show errors above table */}
                             {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                {error}
                                <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
                            </div>}

                            <div className="table-responsive sub-category-table">
                                <PrimeDataTable
                                    column={columns}
                                    data={dataSource}
                                    rows={rows}
                                    totalRecords={totalRecords}
                                    paginator
                                    first={(currentPage - 1) * rows}
                                    onPage={(e) => {
                                        // Only update state if page or rows actually changed
                                        if (e.page + 1 !== currentPage || e.rows !== rows) {
                                            setCurrentPage(e.page + 1);
                                            setRows(e.rows);
                                        }
                                    }}
                                    rowsPerPageOptions={[5, 10, 20, 50]}
                                    loading={loading} // Show loading overlay during fetch
                                    emptyMessage="No subcategories found."
                                    lazy // Enable lazy loading for server-side operations
                                    // Add sorting props if needed and supported by API
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <CommonFooter />
            </div>

            {/* --- Modals --- */}

            {/* Add Sub Category Modal */}
            <div className="modal fade" id="add-category" ref={addModalRef} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Add Sub Category</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setError(null)}/>
                                </div>
                                <div className="modal-body">
                                    {/* Display modal-specific errors */}
                                     {error && <div className="alert alert-danger">{error}</div>}
                                    <form onSubmit={handleAddSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Image</label>
                                            <div className="image-upload">
                                                <input type="file" name="imageFile" accept="image/png, image/jpeg" onChange={(e) => setAddImageFile(e.target.files[0])} />
                                                <div className="image-uploads">
                                                    <h4 className="fs-13 fw-medium">Upload Image</h4>
                                                </div>
                                            </div>
                                            <small>JPEG, PNG up to 2 MB</small>
                                             {/* Optional: Preview image */}
                                             {addImageFile && <img src={URL.createObjectURL(addImageFile)} alt="Preview" width="100" className="mt-2"/>}
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Parent Category<span className="text-danger ms-1">*</span></label>
                                            <CommonSelect
                                                className="w-100"
                                                options={parentCategories} // Use fetched parent categories
                                                value={addSelectedParentCategory}
                                                onChange={(e) => setAddSelectedParentCategory(e.value)}
                                                placeholder="Choose Parent Category"
                                                filter={false}
                                                name="parentCategory"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Sub Category Name<span className="text-danger ms-1">*</span></label>
                                            <input type="text" className="form-control" name="subCategoryName" value={addSubCategoryName} onChange={(e) => setAddSubCategoryName(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Sub Category Code<span className="text-danger ms-1">*</span></label>
                                            <input type="text" className="form-control" name="subCategoryCode" value={addCategoryCode} onChange={(e) => setAddCategoryCode(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Description</label> {/* Removed required star */}
                                            <Editor value={addDescription} onTextChange={(e) => setAddDescription(e.htmlValue)} style={{ height: "150px" }} />
                                        </div>
                                        <div className="mb-3">
                                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                                <span className="status-label">Status</span>
                                                <input type="checkbox" id="add-subcat-status" className="check" name="status" checked={addStatus} onChange={(e) => setAddStatus(e.target.checked)} />
                                                <label htmlFor="add-subcat-status" className="checktoggle" />
                                            </div>
                                        </div>
                                        <div className="modal-footer border-0 pt-0">
                                            <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal" disabled={loading}>Cancel</button>
                                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                                {loading ? 'Creating...' : 'Create Subcategory'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Add Sub Category Modal */}


            {/* Edit Sub Category Modal */}
            {/* Using a separate component might be cleaner, but embedding for completeness */}
             <div className="modal fade" id="edit-category" ref={editModalRef} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                         <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Sub Category</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { setEditingSubcategory(null); setError(null); }}/> {/* Clear state on close */}
                                </div>
                                <div className="modal-body">
                                     {error && <div className="alert alert-danger">{error}</div>}
                                     {/* Render form only if editingSubcategory is set */}
                                    {editingSubcategory ? (
                                        <form onSubmit={handleEditSubmit}>
                                            <div className="mb-3">
                                                <label className="form-label">Image</label>
                                                {/* Display Existing Image */}
                                                {editExistingImageUrl && !editImageFile && (
                                                    <div className="mb-2">
                                                        <img src={editExistingImageUrl} alt="Current" width="100" />
                                                        {/* Optional: Button to remove image */}
                                                        {/* <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => setEditExistingImageUrl('')}>Remove</button> */}
                                                    </div>
                                                )}
                                                {/* Preview New Image */}
                                                 {editImageFile && <img src={URL.createObjectURL(editImageFile)} alt="New Preview" width="100" className="mb-2"/>}
                                                {/* File Input */}
                                                <div className="image-upload">
                                                    <input type="file" name="imageFile" accept="image/png, image/jpeg" onChange={(e) => setEditImageFile(e.target.files[0])} />
                                                    <div className="image-uploads">
                                                        <h4 className="fs-13 fw-medium">
                                                            {editExistingImageUrl || editImageFile ? 'Change Image' : 'Upload Image'}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <small>JPEG, PNG up to 2 MB</small>
                                            </div>
                                             <div className="mb-3">
                                                <label className="form-label">Parent Category<span className="text-danger ms-1">*</span></label>
                                                <CommonSelect
                                                    className="w-100"
                                                    options={parentCategories}
                                                    value={editSelectedParentCategory}
                                                    onChange={(e) => setEditSelectedParentCategory(e.value)}
                                                    placeholder="Choose Parent Category"
                                                    filter={false}
                                                    name="parentCategory"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Sub Category Name<span className="text-danger ms-1">*</span></label>
                                                <input type="text" className="form-control" name="subCategoryName" value={editSubCategoryName} onChange={(e) => setEditSubCategoryName(e.target.value)} required />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Sub Category Code<span className="text-danger ms-1">*</span></label>
                                                <input type="text" className="form-control" name="subCategoryCode" value={editCategoryCode} onChange={(e) => setEditCategoryCode(e.target.value)} required />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Description</label>
                                                <Editor value={editDescription} onTextChange={(e) => setEditDescription(e.htmlValue)} style={{ height: "150px" }} />
                                            </div>
                                            <div className="mb-3">
                                                <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                                    <span className="status-label">Status</span>
                                                    <input type="checkbox" id={`edit-subcat-status-${editingSubcategory.id}`} className="check" name="status" checked={editStatus} onChange={(e) => setEditStatus(e.target.checked)} />
                                                    <label htmlFor={`edit-subcat-status-${editingSubcategory.id}`} className="checktoggle" />
                                                </div>
                                            </div>
                                            <div className="modal-footer border-0 pt-0">
                                                <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal" disabled={loading} onClick={() => { setEditingSubcategory(null); setError(null); }}>Cancel</button>
                                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                                    {loading ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </form>
                                     ) : (
                                         <p>Loading data...</p> // Placeholder while data loads into state
                                     )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Edit Sub Category Modal */}

            <DeleteModal
                onConfirm={confirmDelete} // Pass confirmation handler
                // The DeleteModal component itself likely needs internal state
                // to show the correct item info based on deletingSubcategoryId
                // Or you can pass the item name/details as props too
                itemName={`Subcategory ID ${deletingSubcategoryId}`} // Example of passing info
                modalId="delete-modal" // Ensure ID matches trigger
                show={deletingSubcategoryId !== null} // Control visibility via prop if needed
                onHide={() => setDeletingSubcategoryId(null)} // Add handler to clear ID when modal closes
            />
        </>
    );
};

export default SubCategories;