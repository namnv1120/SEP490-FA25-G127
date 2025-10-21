import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Import axios
import { Link } from 'react-router-dom';
import {
    pdf,
    printer,
    qrCodeImage,
    scanners,
    // Keep images if used statically, otherwise remove if fetched via API
    stockImg02,
    stockImg03,
    stockImg05,
} from '../../utils/imagepath'; // Adjust path if needed
import { Editor } from 'primereact/editor';
import CommonDatePicker from '../../components/date-picker/common-date-picker';
import CommonSelect from '../../components/select/common-select';

// Main component containing all modals
const OnlineorderModal = ({ saleIdForDetails, saleIdForEdit, saleIdForPayments, paymentIdForEdit, onDataChange }) => {
    // --- General State ---
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- State for Dropdown Options (Fetched via API) ---
    const [customers, setCustomers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    // Assuming OrderStatus and PaymentType might be relatively static or fetched less often
    const OrderStatus = [ { label: "Completed", value: "Completed" }, { label: "Pending", value: "Pending" }, /* Add more if needed */ ];
    const PaymentType = [ { label: "Cash", value: "Cash" }, { label: "Card", value: "Card" }, { label: "Online", value: "Online" }, /* Add more */ ];

    // --- State for Add Sales Modal ---
    const [addSaleDate, setAddSaleDate] = useState(new Date());
    const [addSelectedCustomer, setAddSelectedCustomer] = useState(null);
    const [addSelectedSupplier, setAddSelectedSupplier] = useState(null);
    const [addSelectedStatus, setAddSelectedStatus] = useState(null);
    const [addProducts, setAddProducts] = useState([]); // Products added to the new sale
    const [addOrderTax, setAddOrderTax] = useState(0);
    const [addDiscount, setAddDiscount] = useState(0);
    const [addShipping, setAddShipping] = useState(0);
    // Add product search state if needed
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // --- State for Sales Details Modal ---
    const [saleDetails, setSaleDetails] = useState(null);

    // --- State for Edit Sales Modal ---
    const [editSaleDate, setEditSaleDate] = useState(new Date());
    const [editSelectedCustomer, setEditSelectedCustomer] = useState(null);
    const [editSelectedSupplier, setEditSelectedSupplier] = useState(null);
    const [editSelectedStatus, setEditSelectedStatus] = useState(null);
    const [editProducts, setEditProducts] = useState([]); // Products in the sale being edited
    const [editOrderTax, setEditOrderTax] = useState(0);
    const [editDiscount, setEditDiscount] = useState(0);
    const [editShipping, setEditShipping] = useState(0);
    const [editNotes, setEditNotes] = useState('');

    // --- State for Show/Create/Edit Payments ---
    const [paymentsList, setPaymentsList] = useState([]);
    const [createPaymentDate, setCreatePaymentDate] = useState(new Date());
    const [createPaymentRef, setCreatePaymentRef] = useState('');
    const [createPaymentReceived, setCreatePaymentReceived] = useState('');
    const [createPaymentPaying, setCreatePaymentPaying] = useState('');
    const [createPaymentType, setCreatePaymentType] = useState(null);
    const [createPaymentDesc, setCreatePaymentDesc] = useState('');

    const [editPaymentData, setEditPaymentData] = useState(null); // Holds the payment being edited
    const [editPaymentDate, setEditPaymentDate] = useState(null);
    const [editPaymentRef, setEditPaymentRef] = useState('');
    const [editPaymentReceived, setEditPaymentReceived] = useState('');
    const [editPaymentPaying, setEditPaymentPaying] = useState('');
    const [editPaymentType, setEditPaymentType] = useState(null);
    const [editPaymentDesc, setEditPaymentDesc] = useState('');


    // --- Refs for Modals (to close them programmatically) ---
    const addModalRef = useRef(null);
    const editModalRef = useRef(null);
    const detailsModalRef = useRef(null);
    const showPaymentsModalRef = useRef(null);
    const createPaymentModalRef = useRef(null);
    const editPaymentModalRef = useRef(null);
    // --------------------------------------------------------

    // --- Helper to close Bootstrap modal ---
    const closeModal = (modalId) => {
        const modalElement = document.getElementById(modalId);
         if (modalElement && window.bootstrap) {
            const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
         }
    };
    // -------------------------------------

    // --- Fetch initial dropdown data ---
    useEffect(() => {
        const fetchDropdownData = async () => {
            setLoading(true);
            try {
                // Replace with your actual API endpoints
                const [customerRes, supplierRes] = await Promise.all([
                    axios.get('/api/customers?select=name,id'), // Fetch only needed fields
                    axios.get('/api/suppliers?select=name,id')
                ]);

                // Format for CommonSelect { label: 'Name', value: 'id' }
                setCustomers(customerRes.data.map(c => ({ label: c.name, value: c.id })));
                setSuppliers(supplierRes.data.map(s => ({ label: s.name, value: s.id })));

            } catch (err) {
                console.error("Error fetching dropdown data:", err);
                setError("Could not load customer/supplier lists.");
            } finally {
                setLoading(false);
            }
        };
        fetchDropdownData();
    }, []); // Run only once on mount
    // ---------------------------------

    // --- Fetch Sale Details when saleIdForDetails changes ---
    useEffect(() => {
        const fetchSaleDetails = async () => {
            if (!saleIdForDetails) {
                setSaleDetails(null);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // Replace with your actual endpoint
                const response = await axios.get(`/api/sales/${saleIdForDetails}`);
                setSaleDetails(response.data); // Assuming API returns sale object with customer, items, etc.
            } catch (err) {
                console.error(`Error fetching sale details for ID ${saleIdForDetails}:`, err);
                setError("Could not load sale details.");
                setSaleDetails(null);
            } finally {
                setLoading(false);
            }
        };
        fetchSaleDetails();
    }, [saleIdForDetails]);
    // ----------------------------------------------------

     // --- Fetch Sale Data for Editing when saleIdForEdit changes ---
    useEffect(() => {
        const fetchSaleForEdit = async () => {
            if (!saleIdForEdit) {
                // Reset edit form state if needed
                setEditingSubcategory(null); // Assuming this state holds the data
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // Replace with your actual endpoint
                const response = await axios.get(`/api/sales/${saleIdForEdit}`);
                const saleData = response.data;

                // Populate edit form state
                setEditSaleDate(new Date(saleData.date)); // Ensure date is parsed correctly
                setEditSelectedCustomer(saleData.customerId); // Assuming API returns customerId
                setEditSelectedSupplier(saleData.supplierId); // Assuming API returns supplierId
                setEditSelectedStatus(saleData.status);
                setEditProducts(saleData.items || []); // Assuming items are in 'items' array
                setEditOrderTax(saleData.orderTax || 0);
                setEditDiscount(saleData.discount || 0);
                setEditShipping(saleData.shipping || 0);
                setEditNotes(saleData.notes || '');

            } catch (err) {
                console.error(`Error fetching sale for editing (ID ${saleIdForEdit}):`, err);
                setError("Could not load sale data for editing.");
                // Reset form state on error?
            } finally {
                setLoading(false);
            }
        };
        fetchSaleForEdit();
    }, [saleIdForEdit]);
    // --------------------------------------------------------

     // --- Fetch Payments when saleIdForPayments changes ---
     useEffect(() => {
        const fetchPayments = async () => {
            if (!saleIdForPayments) {
                setPaymentsList([]);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // Replace with your actual endpoint
                const response = await axios.get(`/api/sales/${saleIdForPayments}/payments`);
                setPaymentsList(response.data || []);
            } catch (err) {
                console.error(`Error fetching payments for sale ID ${saleIdForPayments}:`, err);
                setError("Could not load payments.");
                setPaymentsList([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [saleIdForPayments]);
    // --------------------------------------------------

     // --- Fetch Payment Data for Editing when paymentIdForEdit changes ---
     useEffect(() => {
        const fetchPaymentForEdit = async () => {
            if (!paymentIdForEdit) {
                setEditPaymentData(null);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // Replace with your actual endpoint
                const response = await axios.get(`/api/payments/${paymentIdForEdit}`);
                const paymentData = response.data;
                setEditPaymentData(paymentData); // Store the original data if needed

                // Populate edit payment form state
                setEditPaymentDate(paymentData.date ? new Date(paymentData.date) : null);
                setEditPaymentRef(paymentData.reference || '');
                setEditPaymentReceived(paymentData.receivedAmount || '');
                setEditPaymentPaying(paymentData.payingAmount || '');
                setEditPaymentType(paymentData.paymentType || null);
                setEditPaymentDesc(paymentData.description || '');

            } catch (err) {
                console.error(`Error fetching payment for editing (ID ${paymentIdForEdit}):`, err);
                setError("Could not load payment data for editing.");
                 setEditPaymentData(null); // Clear data on error
            } finally {
                setLoading(false);
            }
        };
        fetchPaymentForEdit();
    }, [paymentIdForEdit]);
    // -------------------------------------------------------------


    // --- Form Submission Handlers (Implement API calls) ---
    const handleAddSaleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const saleData = {
            date: addSaleDate,
            customerId: addSelectedCustomer,
            supplierId: addSelectedSupplier,
            status: addSelectedStatus,
            items: addProducts, // Ensure this structure matches API
            orderTax: addOrderTax,
            discount: addDiscount,
            shipping: addShipping,
            // Add other necessary fields
        };
        console.log("Submitting Add Sale:", saleData);
        try {
            // ** Replace with your POST endpoint **
            await axios.post('/api/sales', saleData);
            closeModal('add-sales-new');
            if (onDataChange) onDataChange(); // Notify parent component to refresh list
            // Reset Add form state if needed
        } catch (err) {
             console.error("Error adding sale:", err);
             setError("Failed to add sale. " + (err.response?.data?.message || err.message));
        } finally {
             setLoading(false);
        }
    };

    const handleEditSaleSubmit = async (event) => {
        event.preventDefault();
        if (!saleIdForEdit) return;
        setLoading(true);
        setError(null);
         const updatedSaleData = {
            date: editSaleDate,
            customerId: editSelectedCustomer,
            supplierId: editSelectedSupplier,
            status: editSelectedStatus,
            items: editProducts,
            orderTax: editOrderTax,
            discount: editDiscount,
            shipping: editShipping,
            notes: editNotes,
             // Add other necessary fields
        };
        console.log("Submitting Edit Sale:", updatedSaleData);
         try {
            // ** Replace with your PUT/PATCH endpoint **
            await axios.put(`/api/sales/${saleIdForEdit}`, updatedSaleData);
            closeModal('edit-sales-new');
            if (onDataChange) onDataChange(); // Notify parent
        } catch (err) {
             console.error("Error updating sale:", err);
             setError("Failed to update sale. " + (err.response?.data?.message || err.message));
        } finally {
             setLoading(false);
        }
    };

    const handleCreatePaymentSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const paymentData = {
            saleId: saleIdForPayments, // Assuming you need to link it to the sale
            date: createPaymentDate,
            reference: createPaymentRef,
            receivedAmount: createPaymentReceived,
            payingAmount: createPaymentPaying,
            paymentType: createPaymentType,
            description: createPaymentDesc,
        };
        console.log("Submitting Create Payment:", paymentData);
         try {
            // ** Replace with your POST endpoint **
            await axios.post('/api/payments', paymentData); // Or /api/sales/{saleId}/payments
            closeModal('createpayment');
             // Refetch payments for the show payments modal (or notify parent)
             if(saleIdForPayments) {
                // A bit inefficient to fetch all sales again, better to just update paymentsList
                 const response = await axios.get(`/api/sales/${saleIdForPayments}/payments`);
                 setPaymentsList(response.data || []);
             }
             if (onDataChange) onDataChange(); // Also notify main list may need update (payment status)
             // Reset create payment form
             setCreatePaymentDate(new Date());
             setCreatePaymentRef('');
             // ... reset other fields

        } catch (err) {
             console.error("Error creating payment:", err);
             setError("Failed to create payment. " + (err.response?.data?.message || err.message));
        } finally {
             setLoading(false);
        }
    };

    const handleEditPaymentSubmit = async (event) => {
        event.preventDefault();
        if (!paymentIdForEdit) return;
        setLoading(true);
        setError(null);
        const updatedPaymentData = {
             date: editPaymentDate,
             reference: editPaymentRef,
             receivedAmount: editPaymentReceived,
             payingAmount: editPaymentPaying,
             paymentType: editPaymentType,
             description: editPaymentDesc,
        };
        console.log("Submitting Edit Payment:", updatedPaymentData);
         try {
            // ** Replace with your PUT/PATCH endpoint **
            await axios.put(`/api/payments/${paymentIdForEdit}`, updatedPaymentData);
            closeModal('editpayment');
             // Refetch payments for the show payments modal
             if(saleIdForPayments) {
                 const response = await axios.get(`/api/sales/${saleIdForPayments}/payments`);
                 setPaymentsList(response.data || []);
             }
             if (onDataChange) onDataChange(); // Notify main list
             setEditPaymentData(null); // Clear edit data

        } catch (err) {
             console.error("Error updating payment:", err);
             setError("Failed to update payment. " + (err.response?.data?.message || err.message));
        } finally {
             setLoading(false);
        }
    };

    // --- Add/Edit Sale - Product Quantity Handlers ---
     const handleProductQtyChange = (productId, newQty, isEdit = false) => {
       const qty = parseInt(newQty, 10);
       const validQty = isNaN(qty) || qty < 1 ? 1 : qty;
       const productListSetter = isEdit ? setEditProducts : setAddProducts;

       productListSetter(prevProducts =>
           prevProducts.map(p =>
               p.id === productId ? { ...p, qty: validQty } : p
           )
       );
   };
    const handleProductDecrement = (productId, isEdit = false) => {
       const productListSetter = isEdit ? setEditProducts : setAddProducts;
        productListSetter(prevProducts =>
            prevProducts.map(p =>
                p.id === productId && p.qty > 1 ? { ...p, qty: p.qty - 1 } : p
            )
        );
    };
     const handleProductIncrement = (productId, isEdit = false) => {
        const productListSetter = isEdit ? setEditProducts : setAddProducts;
        productListSetter(prevProducts =>
            prevProducts.map(p =>
                p.id === productId ? { ...p, qty: p.qty + 1 } : p
            )
        );
    };
    // --------------------------------------------------

    // --- Render ---
    return (
        <div>
            {/* Display general errors */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* ======================== Add Sales Modal ======================== */}
             <div className="modal fade" id="add-sales-new" ref={addModalRef} tabIndex="-1">
                {/* ... (Modal structure as before) ... */}
                <form onSubmit={handleAddSaleSubmit}>
                    <div className="modal-body">
                         {/* --- Product Search/Add UI --- */}
                        <div className="mb-3">
                         <label className="form-label">Product Search</label>
                         <div className="input-groupicon select-code">
                             <input
                                type="text"
                                className="form-control"
                                placeholder="Scan/Search Product by code or name"
                                value={productSearchTerm}
                                onChange={(e) => {
                                    setProductSearchTerm(e.target.value);
                                    // Add logic here to trigger API search after delay or on Enter
                                    // e.g., fetchProductSearchResults(e.target.value);
                                }}
                               />
                             <div className="addonset"><img src={qrCodeImage} alt="QR"/></div>
                         </div>
                         {/* Display search results here */}
                         {/* {searchResults.map(prod => <div key={prod.id} onClick={() => addProductToSale(prod)}>{prod.name}</div>)} */}
                        </div>

                         {/* --- Added Products Table --- */}
                        <div className="table-responsive no-pagination mb-3">
                            <table className="table datanew table-sm">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th style={{ width: '120px' }}>Qty</th>
                                        <th>Price ($)</th>
                                        {/* Add other columns like discount, tax */}
                                        <th>Subtotal ($)</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {addProducts.length === 0 && (
                                        <tr><td colSpan="5" className="text-center">No products added.</td></tr>
                                    )}
                                    {addProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td>{product.name}</td>
                                            <td>
                                                <div className="input-group input-group-sm">
                                                    <button className="btn btn-outline-secondary" type="button" onClick={() => handleProductDecrement(product.id, false)}>-</button>
                                                    <input type="number" className="form-control text-center" value={product.qty} onChange={(e) => handleProductQtyChange(product.id, e.target.value, false)} min="1"/>
                                                    <button className="btn btn-outline-secondary" type="button" onClick={() => handleProductIncrement(product.id, false)}>+</button>
                                                </div>
                                            </td>
                                            <td className="text-end">{product.price?.toFixed(2)}</td>
                                            <td className="text-end fw-bold">{/* Calculate Subtotal */}</td>
                                            <td><button type="button" className="btn btn-sm btn-outline-danger"> {/* Remove action */} <i className="feather icon-x"/> </button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* --- Other Fields (Customer, Date, Supplier) --- */}
                         <div className="row">
                            <div className="col-lg-4 col-sm-6 col-12">
                                <div className="mb-3">
                                <label className="form-label">Customer<span className="text-danger ms-1">*</span></label>
                                <CommonSelect options={customers} value={addSelectedCustomer} onChange={(e) => setAddSelectedCustomer(e.value)} placeholder="Choose Customer" className="w-100" />
                                </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 col-12">
                                <div className="mb-3">
                                <label className="form-label">Date<span className="text-danger ms-1">*</span></label>
                                <CommonDatePicker value={addSaleDate} onChange={setAddSaleDate} className="w-100"/>
                                </div>
                            </div>
                            <div className="col-lg-4 col-sm-6 col-12">
                                <div className="mb-3">
                                <label className="form-label">Supplier</label>
                                <CommonSelect options={suppliers} value={addSelectedSupplier} onChange={(e) => setAddSelectedSupplier(e.value)} placeholder="Choose Supplier" className="w-100"/>
                                </div>
                            </div>
                         </div>
                        {/* --- Summary & Status --- */}
                         <div className="row justify-content-end">
                            <div className="col-lg-6">
                                {/* Summary Calculation UI */}
                            </div>
                        </div>
                        <div className="row">
                             <div className="col-lg-3 col-sm-6 col-12">
                                <div className="mb-3">
                                    <label className="form-label">Status<span className="text-danger ms-1">*</span></label>
                                    <CommonSelect options={OrderStatus} value={addSelectedStatus} onChange={(e) => setAddSelectedStatus(e.value)} placeholder="Choose Status" className="w-100"/>
                                </div>
                             </div>
                        </div>
                    </div>
                     <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Submit Sale'}
                        </button>
                    </div>
                </form>
            </div>
          </div>
        </div>
            {/* /add popup */}

            {/* ======================== Sales Detail Modal ======================== */}
             <div className="modal fade" id="sales-details-new" ref={detailsModalRef} tabIndex="-1">
                 <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Sales Detail {saleDetails ? `(#${saleDetails.reference})` : ''}</h5>
                            {/* Print/PDF buttons */}
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {loading && <p>Loading details...</p>}
                            {error && <p className="text-danger">{error}</p>}
                            {saleDetails && !loading && !error && (
                                <>
                                    {/* Display saleDetails data here */}
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-4"> {/* Customer */}
                                            <div className="bg-light p-3 rounded h-100">
                                                <h6 className="text-muted mb-2">Customer Info</h6>
                                                <h5 className="mb-1">{saleDetails.customer?.name || 'N/A'}</h5>
                                                {/* Add address, email, phone */}
                                            </div>
                                        </div>
                                         <div className="col-md-4"> {/* Company - Static or from settings */}
                                             <div className="bg-light p-3 rounded h-100">
                                                <h6 className="text-muted mb-2">Company Info</h6>
                                                {/* ... */}
                                             </div>
                                         </div>
                                        <div className="col-md-4"> {/* Invoice */}
                                            <div className="bg-light p-3 rounded h-100">
                                                <h6 className="text-muted mb-2">Invoice Info</h6>
                                                <p className="mb-1">Reference: <span className="fw-bold text-primary ms-2">#{saleDetails.reference || 'N/A'}</span></p>
                                                <p className="mb-1">Date: <span className="ms-2 text-dark">{saleDetails.date ? new Date(saleDetails.date).toLocaleDateString() : 'N/A'}</span></p>
                                                <p className="mb-1">Status: <span className={`badge bg-${saleDetails.status === 'Completed' ? 'success' : 'warning'} ms-2`}>{saleDetails.status}</span></p>
                                                <p className="mb-0">Payment: <span className={`badge badge-soft-${saleDetails.paymentStatus === 'Paid' ? 'success' : 'danger'} ms-2`}><i className="ti ti-point-filled me-1"/>{saleDetails.paymentStatus}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <h5 className="mb-3">Order Summary</h5>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm">
                                            {/* Table Head */}
                                            <tbody>
                                                 {/* Map saleDetails.items */}
                                                 {saleDetails.items?.map(item => (
                                                    <tr key={item.productId}>
                                                        <td>{item.productName}</td>
                                                        <td className="text-end">{item.price?.toFixed(2)}</td>
                                                        <td className="text-center">{item.quantity}</td>
                                                        {/* Add discount, tax etc. */}
                                                        <td className="text-end fw-bold">{/* Subtotal */}</td>
                                                    </tr>
                                                 ))}
                                            </tbody>
                                            {/* Table Foot (Totals) */}
                                            <tfoot className="table-light">
                                                <tr><td colSpan="X" className="text-end fw-bold">Subtotal:</td><td className="text-end fw-bold">{saleDetails.subTotal?.toFixed(2)}</td></tr>
                                                <tr><td colSpan="X" className="text-end text-muted">Order Tax:</td><td className="text-end text-muted">{saleDetails.orderTax?.toFixed(2)}</td></tr>
                                                {/* ... other totals */}
                                                <tr><td colSpan="X" className="text-end fw-bolder fs-6">Grand Total:</td><td className="text-end fw-bolder fs-6">{saleDetails.grandTotal?.toFixed(2)}</td></tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
             </div>
            {/* /details popup */}

             {/* ======================== Edit Sales Modal ======================== */}
             <div className="modal fade" id="edit-sales-new" ref={editModalRef} tabIndex="-1">
                 <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Sale {editingSubcategory ? `(#${editingSubcategory.reference})` : ''}</h5>
                             <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { setEditingSubcategory(null); setError(null); }} />
                        </div>
                        {loading && <p>Loading sale data...</p>}
                        {error && <div className="alert alert-danger mx-3">{error}</div>}
                        {editingSubcategory && !loading && (
                            <form onSubmit={handleEditSaleSubmit}>
                                <div className="modal-body">
                                     {/* Product Table for Editing */}
                                    <div className="table-responsive no-pagination mb-3">
                                         <table className="table datanew table-sm">
                                             <thead><tr><th>Product</th><th style={{width: '120px'}}>Qty</th><th>Price ($)</th><th>Discount ($)</th><th>Tax (%)</th><th>Subtotal ($)</th><th></th></tr></thead>
                                             <tbody>
                                                {editProducts.map((product) => (
                                                    <tr key={product.id || product.productId}> {/* Use unique key */}
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <Link to="#" className="avatar avatar-sm me-2"><img src={product.img || laptop} alt="product"/></Link>
                                                                <span className="text-dark">{product.productName || product.name}</span> {/* Adjust field name */}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="input-group input-group-sm">
                                                                <button className="btn btn-outline-secondary" type="button" onClick={() => handleProductDecrement(product.id || product.productId, true)}>-</button>
                                                                <input type="number" className="form-control text-center" value={product.qty} onChange={(e) => handleProductQtyChange(product.id || product.productId, e.target.value, true)} min="1"/>
                                                                <button className="btn btn-outline-secondary" type="button" onClick={() => handleProductIncrement(product.id || product.productId, true)}>+</button>
                                                            </div>
                                                        </td>
                                                        {/* Add inputs for price, discount, tax if editable */}
                                                        <td className="text-end">{product.price?.toFixed(2)}</td>
                                                        <td className="text-end">{product.discount?.toFixed(2)}</td>
                                                        <td className="text-end">{product.taxPercent?.toFixed(2)}</td>
                                                        <td className="text-end fw-bold">{/* Calculate Subtotal */}</td>
                                                        <td><button type="button" className="btn btn-sm btn-outline-danger"> {/* Remove action */} <i className="feather icon-trash-2"/> </button></td>
                                                    </tr>
                                                ))}
                                             </tbody>
                                         </table>
                                     </div>
                                      {/* Other Fields (Customer, Date, Supplier, Status, Notes) */}
                                       <div className="row">
                                           {/* Customer */}
                                           <div className="col-lg-4 col-sm-6 col-12">
                                                <div className="mb-3">
                                                    <label className="form-label">Customer<span className="text-danger ms-1">*</span></label>
                                                    <CommonSelect options={customers} value={editSelectedCustomer} onChange={(e) => setEditSelectedCustomer(e.value)} placeholder="Choose Customer" className="w-100"/>
                                                </div>
                                           </div>
                                            {/* Date */}
                                            <div className="col-lg-4 col-sm-6 col-12">
                                                <div className="mb-3">
                                                    <label className="form-label">Date<span className="text-danger ms-1">*</span></label>
                                                    <CommonDatePicker value={editSaleDate} onChange={setEditSaleDate} className="w-100"/>
                                                </div>
                                            </div>
                                             {/* Supplier */}
                                             <div className="col-lg-4 col-sm-6 col-12">
                                                <div className="mb-3">
                                                    <label className="form-label">Supplier</label>
                                                    <CommonSelect options={suppliers} value={editSelectedSupplier} onChange={(e) => setEditSelectedSupplier(e.value)} placeholder="Choose Supplier" className="w-100"/>
                                                </div>
                                             </div>
                                      </div>
                                       {/* Summary (Editable) */}
                                       <div className="row justify-content-end">
                                            <div className="col-lg-6">
                                                {/* Summary Calculation UI (using editOrderTax, editDiscount, editShipping state) */}
                                            </div>
                                       </div>
                                       {/* Status & Notes */}
                                       <div className="row">
                                            <div className="col-lg-3 col-sm-6 col-12">
                                                <div className="mb-3">
                                                    <label className="form-label">Status<span className="text-danger ms-1">*</span></label>
                                                    <CommonSelect options={OrderStatus} value={editSelectedStatus} onChange={(e) => setEditSelectedStatus(e.value)} placeholder="Choose Status" className="w-100"/>
                                                </div>
                                            </div>
                                            <div className="col-lg-9">
                                                <div className="mb-3">
                                                    <label className="form-label">Notes</label>
                                                    <Editor value={editNotes} onTextChange={(e) => setEditNotes(e.htmlValue)} style={{ height: "100px" }} />
                                                </div>
                                            </div>
                                       </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={loading} onClick={() => { setEditingSubcategory(null); setError(null); }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                         )}
                    </div>
                </div>
             </div>
            {/* /edit popup */}

            {/* ======================== Show Payments Modal ======================== */}
             <div className="modal fade" id="showpayment" ref={showPaymentsModalRef} tabIndex="-1">
                 <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Payments for Sale #{saleIdForPayments}</h5> {/* Dynamic ID */}
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {loading && <p>Loading payments...</p>}
                            {error && <p className="text-danger">{error}</p>}
                            <div className="table-responsive rounded">
                                <table className="table table-hover table-sm">
                                     <thead className="table-light"><tr><th>Date</th><th>Reference</th><th className="text-end">Amount</th><th>Paid By</th><th>Action</th></tr></thead>
                                     <tbody>
                                         {paymentsList.length === 0 && !loading && <tr><td colSpan="5" className="text-center text-muted">No payments found for this sale.</td></tr>}
                                         {paymentsList.map(payment => (
                                            <tr key={payment.id}>
                                                <td>{payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}</td>
                                                <td>{payment.reference}</td>
                                                <td className="text-end">$ {payment.amount?.toFixed(2)}</td>
                                                <td>{payment.paidBy}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {/* Add Print handler */}
                                                        <button className="btn btn-sm btn-outline-secondary me-2 p-1" title="Print"><i className="feather icon-printer"/></button>
                                                        {/* Edit Button */}
                                                        <button className="btn btn-sm btn-outline-info me-2 p-1" data-bs-toggle="modal" data-bs-target="#editpayment" title="Edit Payment" onClick={() => {/* Set paymentIdForEdit state here: setPaymentIdForEdit(payment.id) */}}>
                                                            <i className="feather icon-edit"/>
                                                        </button>
                                                        {/* Delete Button */}
                                                        <button className="btn btn-sm btn-outline-danger p-1" data-bs-toggle="modal" data-bs-target="#delete-payment-modal" title="Delete Payment" onClick={() => {/* Set payment ID for delete confirmation */} }>
                                                            <i className="feather icon-trash-2"/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                         ))}
                                     </tbody>
                                </table>
                            </div>
                        </div>
                         <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createpayment">Add Payment</button>
                        </div>
                    </div>
                 </div>
             </div>
            {/* /show payment Modal */}

             {/* ======================== Create Payment Modal ======================== */}
             <div className="modal fade" id="createpayment" ref={createPaymentModalRef} tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                         <div className="modal-header">
                            <h5 className="modal-title">Create Payment for Sale #{saleIdForPayments}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setError(null)}/>
                         </div>
                         <form onSubmit={handleCreatePaymentSubmit}>
                             <div className="modal-body">
                                 {error && <div className="alert alert-danger">{error}</div>}
                                 <div className="row">
                                    <div className="col-lg-6 mb-3">
                                         <label className="form-label">Date<span className="text-danger ms-1">*</span></label>
                                         <CommonDatePicker value={createPaymentDate} onChange={setCreatePaymentDate} className="w-100"/>
                                    </div>
                                    <div className="col-lg-6 mb-3">
                                         <label className="form-label">Reference<span className="text-danger ms-1">*</span></label>
                                         <input type="text" className="form-control" value={createPaymentRef} onChange={(e) => setCreatePaymentRef(e.target.value)} required/>
                                    </div>
                                 </div>
                                 <div className="row">
                                     <div className="col-lg-4 mb-3">
                                        <label className="form-label">Received Amount<span className="text-danger ms-1">*</span></label>
                                        <div className="input-group"><span className="input-group-text">$</span><input type="number" step="0.01" className="form-control" value={createPaymentReceived} onChange={(e) => setCreatePaymentReceived(e.target.value)} required/></div>
                                     </div>
                                      <div className="col-lg-4 mb-3">
                                        <label className="form-label">Paying Amount<span className="text-danger ms-1">*</span></label>
                                        <div className="input-group"><span className="input-group-text">$</span><input type="number" step="0.01" className="form-control" value={createPaymentPaying} onChange={(e) => setCreatePaymentPaying(e.target.value)} required/></div>
                                     </div>
                                      <div className="col-lg-4 mb-3">
                                         <label className="form-label">Payment Type<span className="text-danger ms-1">*</span></label>
                                         <CommonSelect options={PaymentType} value={createPaymentType} onChange={(e) => setCreatePaymentType(e.value)} placeholder="Choose Type" className="w-100"/>
                                     </div>
                                 </div>
                                 <div className="mb-3">
                                     <label className="form-label">Description</label>
                                     <Editor value={createPaymentDesc} onTextChange={(e) => setCreatePaymentDesc(e.htmlValue)} style={{ height: "100px" }}/>
                                 </div>
                             </div>
                             <div className="modal-footer">
                                 <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={loading}>Cancel</button>
                                 <button type="submit" className="btn btn-primary" disabled={loading}>
                                     {loading ? 'Saving...' : 'Submit Payment'}
                                </button>
                             </div>
                         </form>
                    </div>
                </div>
             </div>
            {/* /Create payment Modal */}

             {/* ======================== Edit Payment Modal ======================== */}
             <div className="modal fade" id="editpayment" ref={editPaymentModalRef} tabIndex="-1">
                 <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Payment {editPaymentData ? `(${editPaymentData.reference})` : ''}</h5>
                             <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { setEditPaymentData(null); setError(null); }} />
                        </div>
                         {loading && <p>Loading payment...</p>}
                         {error && <div className="alert alert-danger mx-3">{error}</div>}
                         {editPaymentData && !loading && (
                             <form onSubmit={handleEditPaymentSubmit}>
                                 <div className="modal-body">
                                     {/* Form fields using editPayment... state variables */}
                                     <div className="row">
                                        <div className="col-lg-6 mb-3">
                                             <label className="form-label">Date<span className="text-danger ms-1">*</span></label>
                                             <CommonDatePicker value={editPaymentDate} onChange={setEditPaymentDate} className="w-100"/>
                                        </div>
                                        <div className="col-lg-6 mb-3">
                                             <label className="form-label">Reference<span className="text-danger ms-1">*</span></label>
                                             <input type="text" className="form-control" value={editPaymentRef} onChange={(e) => setEditPaymentRef(e.target.value)} required/>
                                        </div>
                                     </div>
                                     <div className="row">
                                        <div className="col-lg-4 mb-3">
                                            <label className="form-label">Received Amount<span className="text-danger ms-1">*</span></label>
                                            <div className="input-group"><span className="input-group-text">$</span><input type="number" step="0.01" className="form-control" value={editPaymentReceived} onChange={(e) => setEditPaymentReceived(e.target.value)} required/></div>
                                        </div>
                                        <div className="col-lg-4 mb-3">
                                            <label className="form-label">Paying Amount<span className="text-danger ms-1">*</span></label>
                                            <div className="input-group"><span className="input-group-text">$</span><input type="number" step="0.01" className="form-control" value={editPaymentPaying} onChange={(e) => setEditPaymentPaying(e.target.value)} required/></div>
                                        </div>
                                        <div className="col-lg-4 mb-3">
                                            <label className="form-label">Payment Type<span className="text-danger ms-1">*</span></label>
                                            <CommonSelect options={PaymentType} value={editPaymentType} onChange={(e) => setEditPaymentType(e.value)} placeholder="Choose Type" className="w-100"/>
                                        </div>
                                     </div>
                                      <div className="mb-3">
                                         <label className="form-label">Description</label>
                                         <Editor value={editPaymentDesc} onTextChange={(e) => setEditPaymentDesc(e.htmlValue)} style={{ height: "100px" }}/>
                                     </div>
                                 </div>
                                 <div className="modal-footer">
                                     <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={loading} onClick={() => { setEditPaymentData(null); setError(null); }}>Cancel</button>
                                     <button type="submit" className="btn btn-primary" disabled={loading}>
                                         {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                 </div>
                             </form>
                         )}
                    </div>
                </div>
             </div>
            {/* /edit payment Modal */}
        </div>
    );
};

export default OnlineorderModal;