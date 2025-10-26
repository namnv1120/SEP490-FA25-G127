import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios'; // Import axios
import { Link } from 'react-router-dom';
import {
    pdf,
    printer,
    qrCodeImage,
    scanners,
    // Keep images if used statically, otherwise remove if fetched via API
    // stockImg02, // Example: remove if product images come from API
    // stockImg03,
    // stockImg05,
} from '../../utils/imagepath'; // Adjust path if needed
import { Editor } from 'primereact/editor';
import CommonDatePicker from '../../components/date-picker/common-date-picker';
import CommonSelect from '../../components/select/common-select';

// Debounce helper function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}


// Main component containing all modals
const OnlineorderModal = ({
    saleIdForDetails,    // ID of sale to show details for
    saleIdForEdit,       // ID of sale to edit
    saleIdForPayments,   // ID of sale to show/add payments for
    paymentIdForEdit,    // ID of payment to edit
    onDataChange,        // Callback to notify parent component (e.g., PosOrder) to refresh data
    triggerPaymentEdit,  // Function passed from parent to set paymentIdForEdit state in parent
    triggerDeletePayment // Function passed from parent to set paymentIdForDelete state in parent and show confirmation
 }) => {
    // --- General State ---
    const [loading, setLoading] = useState(false); // General loading for submit actions
    const [modalLoading, setModalLoading] = useState(false); // Specific loading for fetching modal data
    const [modalError, setModalError] = useState(null); // Specific error display within modals

    // --- State for Dropdown Options ---
    const [customers, setCustomers] = useState([]); // { label: 'Name', value: 'id' }
    const [suppliers, setSuppliers] = useState([]); // { label: 'Name', value: 'id' }
    const OrderStatus = [ { label: "Completed", value: "Completed" }, { label: "Pending", value: "Pending" }]; // Static example
    const PaymentType = [ { label: "Cash", value: "Cash" }, { label: "Card", value: "Card" }, { label: "Online", value: "Online" } ]; // Static example

    // --- State for Add Sales Modal ---
    const [addSaleDate, setAddSaleDate] = useState(new Date());
    const [addSelectedCustomer, setAddSelectedCustomer] = useState(null);
    const [addSelectedSupplier, setAddSelectedSupplier] = useState(null);
    const [addSelectedStatus, setAddSelectedStatus] = useState('Pending'); // Default status
    const [addProducts, setAddProducts] = useState([]); // { id, name, qty, price, discount?, taxPercent?, subtotal }
    const [addOrderTax, setAddOrderTax] = useState(0); // This could be percentage or fixed based on your logic
    const [addDiscount, setAddDiscount] = useState(0); // Overall discount
    const [addShipping, setAddShipping] = useState(0);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const addFormRef = useRef(null); // Ref to reset Add form

    // --- State for Sales Details Modal ---
    const [saleDetails, setSaleDetails] = useState(null);

    // --- State for Edit Sales Modal ---
    const [editSaleDate, setEditSaleDate] = useState(new Date());
    const [editSelectedCustomer, setEditSelectedCustomer] = useState(null);
    const [editSelectedSupplier, setEditSelectedSupplier] = useState(null);
    const [editSelectedStatus, setEditSelectedStatus] = useState(null);
    const [editProducts, setEditProducts] = useState([]);
    const [editOrderTax, setEditOrderTax] = useState(0);
    const [editDiscount, setEditDiscount] = useState(0);
    const [editShipping, setEditShipping] = useState(0);
    const [editNotes, setEditNotes] = useState('');
    const editFormRef = useRef(null); // Ref to reset Edit form (though data is loaded via useEffect)

    // --- State for Show/Create/Edit Payments ---
    const [paymentsList, setPaymentsList] = useState([]);
    const [createPaymentDate, setCreatePaymentDate] = useState(new Date());
    const [createPaymentRef, setCreatePaymentRef] = useState('');
    const [createPaymentReceived, setCreatePaymentReceived] = useState('');
    const [createPaymentPaying, setCreatePaymentPaying] = useState('');
    const [createPaymentType, setCreatePaymentType] = useState(null);
    const [createPaymentDesc, setCreatePaymentDesc] = useState('');
    const createPaymentFormRef = useRef(null);

    const [editPaymentData, setEditPaymentData] = useState(null);
    const [editPaymentDate, setEditPaymentDate] = useState(null);
    const [editPaymentRef, setEditPaymentRef] = useState('');
    const [editPaymentReceived, setEditPaymentReceived] = useState('');
    const [editPaymentPaying, setEditPaymentPaying] = useState('');
    const [editPaymentType, setEditPaymentType] = useState(null);
    const [editPaymentDesc, setEditPaymentDesc] = useState('');
    const editPaymentFormRef = useRef(null);

    // --- Helper to close Bootstrap modal ---
    const closeModal = (modalId) => {
        const modalElement = document.getElementById(modalId);
         if (modalElement && window.bootstrap) {
            try {
                const modalInstance = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement);
                if (modalInstance) modalInstance.hide();
            } catch(e) { console.warn(`Could not get/init modal: ${modalId}`, e); }
         } else { console.warn(`Modal element/Bootstrap JS not found: ${modalId}`); }
    };
    // -------------------------------------

    // --- API Fetch Functions ---
    const fetchDropdownData = useCallback(async () => {
        try {
            // ** Replace API endpoints **
            const [customerRes, supplierRes] = await Promise.all([
                axios.get('/api/customers?select=id,full_name'), // Use full_name based on SQL
                axios.get('/api/suppliers?select=id,supplier_name') // Use supplier_name based on SQL
            ]);
            // Format for CommonSelect { label: 'Name', value: 'id' }
            setCustomers(customerRes.data.map(c => ({ label: c.full_name, value: c.id })));
            setSuppliers(supplierRes.data.map(s => ({ label: s.supplier_name, value: s.id })));
        } catch (err) {
            console.error("Error fetching dropdown data:", err);
            setModalError("Could not load customer/supplier lists.");
        }
    }, []);

    const fetchSaleDetailsAPI = useCallback(async (id) => {
        if (!id) { setSaleDetails(null); return; }
        setModalLoading(true); setModalError(null);
        try {
            // ** Replace API endpoint ** (Assume it includes customer and order_detail data)
            const response = await axios.get(`/api/orders/${id}`); // Match SQL table name 'orders'
            setSaleDetails(response.data);
        } catch (err) { console.error(`Error fetching order details ${id}:`, err); setModalError("Could not load sale details."); setSaleDetails(null);
        } finally { setModalLoading(false); }
    }, []);

    const fetchSaleForEditAPI = useCallback(async (id) => {
        if (!id) return;
        setModalLoading(true); setModalError(null);
        try {
             // ** Replace API endpoint ** (Assume it includes customer and order_detail data)
            const response = await axios.get(`/api/orders/${id}`);
            const saleData = response.data;
            setEditSaleDate(new Date(saleData.order_date)); // Use order_date from SQL
            setEditSelectedCustomer(saleData.customer_id); // Use customer_id
            setEditSelectedSupplier(saleData.supplier_id); // Does orders table have supplier_id? Probably not. Remove if irrelevant.
            setEditSelectedStatus(saleData.order_status); // Use order_status
            // Map order_detail items, ensure unique key. Assume API returns product name/img.
            setEditProducts(saleData.order_detail?.map((item, index) => ({
                ...item,
                id: item.product_id, // Use product_id
                key: item.product_id || `edit-item-${index}`, // Unique key for React list
                name: item.product?.product_name || 'N/A', // Get name via nested product object if available
                img: item.product?.image_url || null, // Get image url if available
                qty: item.quantity,
                price: item.unit_price,
                // Add discount, tax if returned per item
            })) || []);
            setEditOrderTax(saleData.tax_amount || 0); // Use tax_amount
            setEditDiscount(saleData.discount_amount || 0); // Use discount_amount
            setEditShipping(saleData.shipping_amount || 0); // Assuming shipping_amount exists
            setEditNotes(saleData.notes || '');
        } catch (err) { console.error(`Error fetching order for edit ${id}:`, err); setModalError("Could not load sale data.");
        } finally { setModalLoading(false); }
    }, []);

    const fetchPaymentsAPI = useCallback(async (id) => {
         if (!id) { setPaymentsList([]); return; }
         setModalLoading(true); setModalError(null);
         try {
             // ** Replace API endpoint ** (Get payments by order_id)
            const response = await axios.get(`/api/orders/${id}/payments`); // Assumes nested route or filter param
            setPaymentsList(response.data || []); // API should return array of payments for this order
         } catch (err) { console.error(`Error fetching payments ${id}:`, err); setModalError("Could not load payments."); setPaymentsList([]);
         } finally { setModalLoading(false); }
    }, []);

    const fetchPaymentForEditAPI = useCallback(async (id) => {
         if (!id) { setEditPaymentData(null); return; }
         setModalLoading(true); setModalError(null);
         try {
             // ** Replace API endpoint **
            const response = await axios.get(`/api/payments/${id}`);
            const paymentData = response.data;
            setEditPaymentData(paymentData);
            setEditPaymentDate(paymentData.payment_date ? new Date(paymentData.payment_date) : null); // Assuming payment_date
            setEditPaymentRef(paymentData.transaction_reference || ''); // Use transaction_reference
            setEditPaymentReceived(paymentData.amount || ''); // Assuming 'amount' is received/paid
            setEditPaymentPaying(paymentData.amount || ''); // Needs clarification if received/paying are different fields
            setEditPaymentType(paymentData.payment_method || null); // Use payment_method
            setEditPaymentDesc(paymentData.notes || ''); // Use notes
         } catch (err) { console.error(`Error fetching payment for edit ${id}:`, err); setModalError("Could not load payment data."); setEditPaymentData(null);
         } finally { setModalLoading(false); }
    }, []);

    const searchProductsAPI = useCallback(debounce(async (term) => {
        if (!term || term.length < 2) { setSearchResults([]); return; }
        setSearchLoading(true);
        try {
            // ** Replace product search endpoint **
            const response = await axios.get(`/api/products?search=${term}&limit=10`);
            // ** Adjust mapping based on API response for products **
            setSearchResults(response.data.map(p => ({
                id: p.product_id, // Match SQL
                name: p.product_name, // Match SQL
                code: p.product_code, // Match SQL
                price: p.product_price?.unit_price || 0, // Get price from nested table
                img: p.image_url // Match SQL
             })) || []);
        } catch (err) { console.error("Error searching products:", err); setSearchResults([]);
        } finally { setSearchLoading(false); }
    }, 300), []);
    // --- End API Fetch Functions ---

    // --- useEffect Hooks ---
    useEffect(() => { fetchDropdownData(); }, [fetchDropdownData]);

    // Use event listeners to fetch data ONLY when modal is shown
     useEffect(() => {
        const setupModalListener = (modalId, fetchDataFn, idToFetch) => {
            const modalElement = document.getElementById(modalId);
            const handleShow = () => { if (idToFetch) fetchDataFn(idToFetch); };
            modalElement?.addEventListener('show.bs.modal', handleShow);
            return () => modalElement?.removeEventListener('show.bs.modal', handleShow);
        };

        const cleanupDetails = setupModalListener('sales-details-new', fetchSaleDetailsAPI, saleIdForDetails);
        const cleanupEditSale = setupModalListener('edit-sales-new', fetchSaleForEditAPI, saleIdForEdit);
        const cleanupShowPayments = setupModalListener('showpayment', fetchPaymentsAPI, saleIdForPayments);
        const cleanupEditPayment = setupModalListener('editpayment', fetchPaymentForEditAPI, paymentIdForEdit);

        return () => { // Cleanup all listeners on component unmount
            cleanupDetails();
            cleanupEditSale();
            cleanupShowPayments();
            cleanupEditPayment();
        };
    }, [saleIdForDetails, saleIdForEdit, saleIdForPayments, paymentIdForEdit, fetchSaleDetailsAPI, fetchSaleForEditAPI, fetchPaymentsAPI, fetchPaymentForEditAPI]);

     useEffect(() => { searchProductsAPI(productSearchTerm); }, [productSearchTerm, searchProductsAPI]);
    // -----------------------

    // --- Form Submission Handlers ---
    const handleAddSaleSubmit = async (event) => {
        event.preventDefault(); setLoading(true); setModalError(null);
        // ** Adjust payload keys to match backend API expectations based on SQL tables **
        const saleData = {
            order_date: addSaleDate, // Assuming API uses snake_case like SQL
            customer_id: addSelectedCustomer,
            // supplier_id: addSelectedSupplier, // Unlikely needed in orders table
            order_status: addSelectedStatus || 'PENDING', // Default if null
            payment_status: 'UNPAID', // Default payment status
            items: addProducts.map(p => ({ // Map to order_detail structure
                product_id: p.id,
                quantity: p.qty,
                unit_price: p.price,
                discount: p.discount || 0, // Add discount if tracked per item
            })),
            tax_amount: addOrderTax, // Assuming this is total tax amount
            discount_amount: addDiscount, // Assuming this is total discount amount
            shipping_amount: addShipping, // Assuming API expects this
            notes: '', // Add notes field if needed
        };
        try {
            // ** Replace API endpoint **
            await axios.post('/api/orders', saleData);
            closeModal('add-sales-new'); if (onDataChange) onDataChange('add_sale');
            resetAddForm();
        } catch (err) { console.error("Error adding order:", err); setModalError("Failed to add order: " + (err.response?.data?.message || err.message));
        } finally { setLoading(false); }
    };

    const handleEditSaleSubmit = async (event) => {
         event.preventDefault(); if (!saleIdForEdit) return; setLoading(true); setModalError(null);
         // ** Adjust payload keys to match backend API expectations **
         const updatedSaleData = {
            order_date: editSaleDate,
            customer_id: editSelectedCustomer,
            order_status: editSelectedStatus,
            items: editProducts.map(p => ({ // Map items back to API structure
                // Include existing order_detail_id if needed for updates, else just product_id etc.
                order_detail_id: p.order_detail_id, // If needed by API
                product_id: p.id || p.product_id,
                quantity: p.qty,
                unit_price: p.price,
                discount: p.discount || 0,
            })),
            tax_amount: editOrderTax,
            discount_amount: editDiscount,
            shipping_amount: editShipping,
            notes: editNotes,
            // DO NOT update payment_status here typically, handle via payments
        };
        try {
            // ** Replace API endpoint **
            await axios.put(`/api/orders/${saleIdForEdit}`, updatedSaleData);
            closeModal('edit-sales-new'); if (onDataChange) onDataChange('edit_sale');
        } catch (err) { console.error("Error updating order:", err); setModalError("Failed to update order: " + (err.response?.data?.message || err.message));
        } finally { setLoading(false); }
    };

    const handleCreatePaymentSubmit = async (event) => {
         event.preventDefault(); setLoading(true); setModalError(null);
         // ** Adjust payload keys to match backend API expectations for 'payments' table **
         const paymentData = {
            order_id: saleIdForPayments, // Link to the order
            payment_date: createPaymentDate, // Assuming API wants payment_date
            transaction_reference: createPaymentRef,
            amount: parseFloat(createPaymentPaying) || 0, // Use 'amount' based on SQL, use paying amount
            payment_method: createPaymentType,
            payment_status: 'SUCCESS', // Or determine based on logic
            notes: createPaymentDesc,
        };
        try {
             // ** Replace API endpoint **
            await axios.post('/api/payments', paymentData);
            closeModal('createpayment');
            fetchPaymentsAPI(saleIdForPayments); // Refresh payments list in the 'Show Payments' modal
            if (onDataChange) onDataChange('add_payment'); // Refresh main sales list (payment status might change)
            // Reset form
            setCreatePaymentDate(new Date()); setCreatePaymentRef(''); setCreatePaymentReceived(''); setCreatePaymentPaying(''); setCreatePaymentType(null); setCreatePaymentDesc('');
            if(createPaymentFormRef.current) createPaymentFormRef.current.reset();
        } catch (err) { console.error("Error creating payment:", err); setModalError("Failed to create payment: " + (err.response?.data?.message || err.message));
        } finally { setLoading(false); }
    };

    const handleEditPaymentSubmit = async (event) => {
        event.preventDefault(); if (!paymentIdForEdit) return; setLoading(true); setModalError(null);
        // ** Adjust payload keys to match backend API expectations **
        const updatedPaymentData = {
             payment_date: editPaymentDate,
             transaction_reference: editPaymentRef,
             amount: parseFloat(editPaymentPaying) || 0, // Use paying amount for edit too? Check logic.
             payment_method: editPaymentType,
             notes: editPaymentDesc,
             // payment_status might need updating too based on amount changes
        };
        try {
             // ** Replace API endpoint **
            await axios.put(`/api/payments/${paymentIdForEdit}`, updatedPaymentData);
            closeModal('editpayment');
            fetchPaymentsAPI(saleIdForPayments); // Refresh payments list
            if (onDataChange) onDataChange('edit_payment'); // Refresh main sales list
            setEditPaymentData(null); // Clear edit state
        } catch (err) { console.error("Error updating payment:", err); setModalError("Failed to update payment: " + (err.response?.data?.message || err.message));
        } finally { setLoading(false); }
    };
    // ----------------------------------------------------

    // --- Product Handling ---
    const addProductToSale = (product, isEdit = false) => {
        const productListSetter = isEdit ? setEditProducts : setAddProducts;
        const currentList = isEdit ? editProducts : addProducts;
        const existingProductIndex = currentList.findIndex(p => p.id === product.id);

        if (existingProductIndex > -1) {
            // Increment quantity
            productListSetter(prev => prev.map((p, index) =>
                index === existingProductIndex ? { ...p, qty: p.qty + 1 } : p
            ));
        } else {
            // Add new product
            productListSetter(prev => [...prev, {
                id: product.id,
                name: product.name,
                price: product.price,
                img: product.img,
                qty: 1,
                discount: 0, // Default values
                taxPercent: 0,
                key: product.id || `temp-${Date.now()}` // Unique key
             }]);
        }
        setProductSearchTerm('');
        setSearchResults([]);
    };

     const removeProductFromSale = (productKey, isEdit = false) => {
         const productListSetter = isEdit ? setEditProducts : setAddProducts;
         productListSetter(prev => prev.filter(p => p.key !== productKey));
     };

    // handleProductQtyChange, handleProductDecrement, handleProductIncrement remain similar, using key
     const handleProductQtyChange = (productKey, newQty, isEdit = false) => {
        const qty = parseInt(newQty, 10);
        const validQty = isNaN(qty) || qty < 1 ? 1 : qty;
        const productListSetter = isEdit ? setEditProducts : setAddProducts;
        productListSetter(prevProducts =>
            prevProducts.map(p => p.key === productKey ? { ...p, qty: validQty } : p)
        );
    };
     const handleProductDecrement = (productKey, isEdit = false) => {
        const productListSetter = isEdit ? setEditProducts : setAddProducts;
         productListSetter(prevProducts =>
             prevProducts.map(p => p.key === productKey && p.qty > 1 ? { ...p, qty: p.qty - 1 } : p)
         );
     };
      const handleProductIncrement = (productKey, isEdit = false) => {
         const productListSetter = isEdit ? setEditProducts : setAddProducts;
         productListSetter(prevProducts =>
             prevProducts.map(p => p.key === productKey ? { ...p, qty: p.qty + 1 } : p)
         );
     };
    // -----------------------

    // --- Calculate Totals ---
     const calculateTotals = (products, taxAmount, discountAmount, shippingAmount) => {
        const subTotal = products.reduce((sum, p) => sum + (p.qty * p.price), 0);
        // Assuming taxAmount, discountAmount, shippingAmount are the FINAL values, not rates
        const grandTotal = subTotal - discountAmount + taxAmount + shippingAmount;
        return { subTotal, grandTotal };
     };
     const addTotals = calculateTotals(addProducts, addOrderTax, addDiscount, addShipping);
     const editTotals = calculateTotals(editProducts, editOrderTax, editDiscount, editShipping);
    // -----------------------

    // Reset Add Form Fields
    const resetAddForm = () => {
         setAddSaleDate(new Date());
         setAddSelectedCustomer(null);
         setAddSelectedSupplier(null);
         setAddSelectedStatus('Pending');
         setAddProducts([]);
         setAddOrderTax(0);
         setAddDiscount(0);
         setAddShipping(0);
         setProductSearchTerm('');
         setSearchResults([]);
         setModalError(null);
         if(addFormRef.current) addFormRef.current.reset();
    };

    // --- Render ---
    return (
        // Keep the overall <div> and <> structure
        <div>
            <>
                {/* ======================== Add Sales Modal ======================== */}
                 <div className="modal fade" id="add-sales-new" ref={addModalRef} tabIndex="-1" aria-labelledby="addSalesModalLabel" aria-hidden="true">
                     <div className="modal-dialog modal-lg modal-dialog-centered">
                         <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="addSalesModalLabel">Add New Sale</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={resetAddForm}></button>
                            </div>
                            <form onSubmit={handleAddSaleSubmit} ref={addFormRef}>
                                <div className="modal-body">
                                    {modalError && <div className="alert alert-danger">{modalError}</div>}
                                     {/* Product Search */}
                                    <div className="mb-3 position-relative">
                                         <label className="form-label">Product Search</label>
                                         <div className="input-groupicon select-code">
                                             <input type="text" className="form-control" placeholder="Scan/Search Product by code or name..." value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)} />
                                             <div className="addonset"><img src={qrCodeImage} alt="QR"/></div>
                                         </div>
                                         { (searchLoading || searchResults.length > 0) && (
                                             <div className="list-group position-absolute w-100 shadow" style={{ zIndex: 1056, maxHeight: '200px', overflowY: 'auto' }}>
                                                 {searchLoading && <div className="list-group-item disabled">Searching...</div>}
                                                 {searchResults.map(prod => (<button type="button" key={prod.id} className="list-group-item list-group-item-action" onClick={() => addProductToSale(prod, false)}> {prod.name} ({prod.code}) - $ {prod.price?.toFixed(2)} </button>))}
                                             </div>
                                         )}
                                    </div>
                                    {/* Added Products Table */}
                                    <div className="table-responsive no-pagination mb-3">
                                         <table className="table datanew table-sm">
                                             <thead><tr><th>Product</th><th style={{width: '120px'}}>Qty</th><th>Price ($)</th><th>Subtotal ($)</th><th></th></tr></thead>
                                             <tbody>
                                                 {addProducts.length === 0 && (<tr><td colSpan="5" className="text-center">No products added.</td></tr>)}
                                                 {addProducts.map((product) => (
                                                     <tr key={product.key}>
                                                         <td>{product.name}</td>
                                                         <td><div className="input-group input-group-sm"><button className="btn btn-outline-secondary" type="button" onClick={() => handleProductDecrement(product.key, false)}>-</button><input type="number" className="form-control text-center" value={product.qty} onChange={(e) => handleProductQtyChange(product.key, e.target.value, false)} min="1"/><button className="btn btn-outline-secondary" type="button" onClick={() => handleProductIncrement(product.key, false)}>+</button></div></td>
                                                         <td className="text-end">{product.price?.toFixed(2)}</td>
                                                         <td className="text-end fw-bold">{ (product.qty * product.price).toFixed(2) }</td>
                                                         <td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeProductFromSale(product.key, false)}> <i className="feather icon-x"/> </button></td>
                                                     </tr>
                                                 ))}
                                             </tbody>
                                         </table>
                                    </div>
                                    {/* Other Fields */}
                                    <div className="row">
                                        <div className="col-lg-4 col-sm-6 col-12"><div className="mb-3"><label className="form-label">Customer*</label><CommonSelect options={customers} value={addSelectedCustomer} onChange={(e) => setAddSelectedCustomer(e.value)} placeholder="Choose" className="w-100" name="customerId" required/></div></div>
                                        <div className="col-lg-4 col-sm-6 col-12"><div className="mb-3"><label className="form-label">Date*</label><CommonDatePicker value={addSaleDate} onChange={setAddSaleDate} className="w-100" name="orderDate" required/></div></div>
                                        <div className="col-lg-4 col-sm-6 col-12"><div className="mb-3"><label className="form-label">Supplier</label><CommonSelect options={suppliers} value={addSelectedSupplier} onChange={(e) => setAddSelectedSupplier(e.value)} placeholder="Choose" className="w-100" name="supplierId"/></div></div>
                                    </div>
                                    {/* Summary & Status */}
                                    <div className="row justify-content-end">
                                        <div className="col-lg-6">
                                            <div className="total-order w-100 max-widthauto m-auto mb-4">
                                                <ul className="list-group list-group-flush">
                                                    <li className="list-group-item d-flex justify-content-between align-items-center"><span>Subtotal ($)</span><span>{addTotals.subTotal.toFixed(2)}</span></li>
                                                    <li className="list-group-item d-flex justify-content-between align-items-center"><label htmlFor="addOrderTax" className="form-label mb-0 me-2">Order Tax ($)</label><input id="addOrderTax" type="number" step="0.01" className="form-control form-control-sm w-auto" value={addOrderTax} onChange={(e) => setAddOrderTax(parseFloat(e.target.value) || 0)}/></li>
                                                    <li className="list-group-item d-flex justify-content-between align-items-center"><label htmlFor="addDiscount" className="form-label mb-0 me-2">Discount ($)</label><input id="addDiscount" type="number" step="0.01" className="form-control form-control-sm w-auto" value={addDiscount} onChange={(e) => setAddDiscount(parseFloat(e.target.value) || 0)}/></li>
                                                    <li className="list-group-item d-flex justify-content-between align-items-center"><label htmlFor="addShipping" className="form-label mb-0 me-2">Shipping ($)</label><input id="addShipping" type="number" step="0.01" className="form-control form-control-sm w-auto" value={addShipping} onChange={(e) => setAddShipping(parseFloat(e.target.value) || 0)}/></li>
                                                    <li className="list-group-item d-flex justify-content-between align-items-center bg-light"><span className="fw-bolder">Grand Total ($)</span><span className="fw-bolder fs-5">{addTotals.grandTotal.toFixed(2)}</span></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-4 col-sm-6 col-12"><div className="mb-3"><label className="form-label">Status*</label><CommonSelect options={OrderStatus} value={addSelectedStatus} onChange={(e) => setAddSelectedStatus(e.value)} placeholder="Choose" className="w-100" name="orderStatus" required/></div></div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={loading} onClick={resetAddForm}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Submit Sale'}</button>
                                </div>
                            </form>
                         </div>
                     </div>
                 </div>
                {/* /add popup */}


                {/* ======================== Sales Detail Modal ======================== */}
                <div className="modal fade" id="sales-details-new" ref={detailsModalRef} tabIndex="-1">
                    {/* ... Structure same as before ... */}
                    {/* Display 'saleDetails' state */}
                     <div className="modal-dialog modal-xl modal-dialog-centered">
                         <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Sales Detail {saleDetails ? `(#${saleDetails.order_number})` : ''}</h5>
                                <div className='d-flex align-items-center'>
                                    {/* Add onClick handlers for print/pdf */}
                                    <button type="button" className="btn btn-outline-secondary btn-sm me-2"><img src={pdf} alt="PDF" style={{ width: '16px', height: '16px' }}/></button>
                                    <button type="button" className="btn btn-outline-secondary btn-sm me-3"><img src={printer} alt="Print" style={{ width: '16px', height: '16px' }}/></button>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                            </div>
                             <div className="modal-body">
                                {modalLoading && <div className="text-center p-5">Loading details...</div>}
                                {modalError && <div className="alert alert-danger">{modalError}</div>}
                                {saleDetails && !modalLoading && !modalError && (
                                     <>
                                        {/* Display saleDetails data based on SQL structure */}
                                        <div className="row g-3 mb-4">
                                            {/* Customer Info */}
                                            <div className="col-md-4"> <div className="bg-light p-3 rounded h-100">
                                                <h6 className="text-muted mb-2">Customer Info</h6>
                                                <h5 className="mb-1">{saleDetails.customer?.full_name || 'N/A'}</h5>
                                                <p className="mb-1 small">{/* Address? */}</p>
                                                <p className="mb-1 small">Email: <span className="text-primary">{saleDetails.customer?.email || 'N/A'}</span></p>
                                                <p className="mb-0 small">Phone: <span>{saleDetails.customer?.phone || 'N/A'}</span></p>
                                            </div> </div>
                                            {/* Company Info - Assuming static or from settings */}
                                            <div className="col-md-4"> <div className="bg-light p-3 rounded h-100"> <h6 className="text-muted mb-2">Company Info</h6> {/* ... */} </div> </div>
                                            {/* Invoice Info */}
                                            <div className="col-md-4"> <div className="bg-light p-3 rounded h-100">
                                                <h6 className="text-muted mb-2">Invoice Info</h6>
                                                <p className="mb-1">Reference: <span className="fw-bold text-primary ms-1">#{saleDetails.order_number || 'N/A'}</span></p>
                                                <p className="mb-1">Date: <span className="ms-1 text-dark">{saleDetails.order_date ? new Date(saleDetails.order_date).toLocaleDateString() : 'N/A'}</span></p>
                                                <p className="mb-1">Status: <span className={`badge bg-${saleDetails.order_status === 'COMPLETED' ? 'success' : 'warning'} ms-1`}>{saleDetails.order_status}</span></p>
                                                <p className="mb-0">Payment: <span className={`badge badge-soft-${saleDetails.payment_status === 'PAID' ? 'success' : 'danger'} ms-1`}><i className="ti ti-point-filled me-1"/>{saleDetails.payment_status}</span></p>
                                            </div> </div>
                                        </div>
                                         <h5 className="mb-3">Order Summary</h5>
                                        <div className="table-responsive"> <table className="table table-bordered table-sm">
                                            <thead className='table-light'><tr><th>Product</th><th>Price ($)</th><th>Qty</th><th>Discount</th><th>Subtotal ($)</th></tr></thead>
                                            <tbody>
                                                {saleDetails.order_detail?.map(item => (
                                                    <tr key={item.order_detail_id || item.product_id}>
                                                        <td>{item.product?.product_name || 'N/A'}</td>
                                                        <td className="text-end">{item.unit_price?.toFixed(2)}</td>
                                                        <td className="text-center">{item.quantity}</td>
                                                        <td className="text-end">{item.discount?.toFixed(2) || '0.00'}</td>
                                                        <td className="text-end fw-bold">{ ((item.quantity * item.unit_price) - (item.discount || 0)).toFixed(2) }</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="table-light">
                                                {/* Calculate these based on order_detail items if not directly available */}
                                                <tr><td colSpan="4" className="text-end fw-bold">Subtotal:</td><td className="text-end fw-bold">$ {/* Calculate */}</td></tr>
                                                <tr><td colSpan="4" className="text-end text-muted">Order Tax:</td><td className="text-end text-muted">$ {saleDetails.tax_amount?.toFixed(2) || '0.00'}</td></tr>
                                                <tr><td colSpan="4" className="text-end text-muted">Shipping:</td><td className="text-end text-muted">$ {saleDetails.shipping_amount?.toFixed(2) || '0.00'}</td></tr>
                                                <tr><td colSpan="4" className="text-end text-muted">Discount:</td><td className="text-end text-muted">$ {saleDetails.discount_amount?.toFixed(2) || '0.00'}</td></tr>
                                                <tr><td colSpan="4" className="text-end fw-bolder fs-6">Grand Total:</td><td className="text-end fw-bolder fs-6">$ {saleDetails.total_amount?.toFixed(2)}</td></tr>
                                                {/* Add Paid/Due if needed */}
                                            </tfoot>
                                        </table> </div>
                                     </>
                                )}
                            </div>
                            <div className="modal-footer"> <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button> </div>
                         </div>
                    </div>
                </div>
                {/* /details popup */}


                {/* ======================== Edit Sales Modal ======================== */}
                 <div className="modal fade" id="edit-sales-new" ref={editModalRef} tabIndex="-1">
                     {/* ... Structure same as before ... */}
                     {/* Conditional rendering based on saleIdForEdit */}
                     {saleIdForEdit ? (
                         <>
                             {/* ... Modal Header ... */}
                             {modalLoading && <div className="modal-body"><p>Loading sale data...</p></div>}
                             {modalError && <div className="modal-body"><div className="alert alert-danger">{modalError}</div></div>}
                             {!modalLoading && !modalError && editProducts && (
                                 <form onSubmit={handleEditSaleSubmit}>
                                     <div className="modal-body">
                                         {/* --- Product Search --- */}
                                         {/* ... Add Product Search UI similar to Add Modal ... */}

                                         {/* --- Edit Products Table --- */}
                                         <div className="table-responsive no-pagination mb-3">
                                             <table className="table datanew table-sm">
                                                  <thead><tr><th>Product</th><th style={{width: '120px'}}>Qty</th><th>Price ($)</th><th>Subtotal ($)</th><th></th></tr></thead>
                                                 <tbody>
                                                     {editProducts.map((product) => (
                                                         <tr key={product.key}>
                                                             <td>{product.product?.product_name || product.name}</td>
                                                             <td><div className="input-group input-group-sm"><button className="btn btn-outline-secondary" type="button" onClick={() => handleProductDecrement(product.key, true)}>-</button><input type="number" className="form-control text-center" value={product.qty || product.quantity} onChange={(e) => handleProductQtyChange(product.key, e.target.value, true)} min="1"/><button className="btn btn-outline-secondary" type="button" onClick={() => handleProductIncrement(product.key, true)}>+</button></div></td>
                                                             <td className="text-end">{product.price?.toFixed(2) || product.unit_price?.toFixed(2)}</td>
                                                             <td className="text-end fw-bold">{ ((product.qty || product.quantity) * (product.price || product.unit_price)).toFixed(2) }</td>
                                                             <td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeProductFromSale(product.key, true)}> <i className="feather icon-trash-2"/> </button></td>
                                                         </tr>
                                                     ))}
                                                 </tbody>
                                             </table>
                                         </div>
                                         {/* --- Other Fields --- */}
                                         <div className="row">
                                            <div className="col-lg-4 col-sm-6 col-12"><div className="mb-3"><label className="form-label">Customer*</label><CommonSelect options={customers} value={editSelectedCustomer} onChange={(e) => setEditSelectedCustomer(e.value)} placeholder="Choose" className="w-100"/></div></div>
                                            <div className="col-lg-4 col-sm-6 col-12"><div className="mb-3"><label className="form-label">Date*</label><CommonDatePicker value={editSaleDate} onChange={setEditSaleDate} className="w-100"/></div></div>
                                            <div className="col-lg-4 col-sm-6 col-12"><div className="mb-3"><label className="form-label">Supplier</label><CommonSelect options={suppliers} value={editSelectedSupplier} onChange={(e)=> setEditSelectedSupplier(e.value)} placeholder="Choose" className="w-100"/></div></div>
                                         </div>
                                         {/* --- Summary (Editable) --- */}
                                         <div className="row justify-content-end">
                                            <div className="col-lg-6">
                                                <ul className="list-group list-group-flush mb-3">
                                                    <li className="list-group-item d-flex justify-content-between align-items-center"><span>Subtotal ($)</span><span>{editTotals.subTotal.toFixed(2)}</span></li>
                                                    <li className="list-group-item d-flex justify-content-between align-items-center"><label htmlFor="editOrderTax" className="form-label mb-0 me-2">Order Tax ($)</label><input id="editOrderTax" type="number" step="0.01" className="form-control form-control-sm w-auto" value={editOrderTax} onChange={(e) => setEditOrderTax(parseFloat(e.target.value) || 0)}/></li>
                                                    <li className="list-group-item d-flex justify-content-between align-items-center"><label htmlFor="editDiscount" className="form-label mb-0 me-2">Discount ($)</label><input id="editDiscount" type="number" step="0.01" className="form-control form-control-sm w-auto" value={editDiscount} onChange={(e) => setEditDiscount(parseFloat(e.target.value) || 0)}/></li>
                                                    <li className="list-group-item d-flex justify-content-between align-items-center"><label htmlFor="editShipping" className="form-label mb-0 me-2">Shipping ($)</label><input id="editShipping" type="number" step="0.01" className="form-control form-control-sm w-auto" value={editShipping} onChange={(e) => setEditShipping(parseFloat(e.target.value) || 0)}/></li>
                                                    <li className="list-group-item d-flex justify-content-between align-items-center bg-light"><span className="fw-bolder">Grand Total ($)</span><span className="fw-bolder fs-5">{editTotals.grandTotal.toFixed(2)}</span></li>
                                                </ul>
                                            </div>
                                         </div>
                                         {/* --- Status & Notes --- */}
                                        <div className="row">
                                            <div className="col-lg-3 col-sm-6 col-12"><div className="mb-3"><label className="form-label">Status*</label><CommonSelect options={OrderStatus} value={editSelectedStatus} onChange={(e) => setEditSelectedStatus(e.value)} placeholder="Choose" className="w-100"/></div></div>
                                            <div className="col-lg-9"><div className="mb-3"><label className="form-label">Notes</label><Editor value={editNotes} onTextChange={(e) => setEditNotes(e.htmlValue)} style={{ height: "100px" }} /></div></div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={loading} onClick={() => { /* Reset edit state */ }}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                                    </div>
                                </form>
                             )}
                         </>
                     ) : (
                         <div className="modal-body"><p>Select a sale to edit.</p></div>
                     )}
                 </div>
                </div>
            </div>
            {/* /edit popup */}


            {/* ======================== Show Payments Modal ======================== */}
             <div className="modal fade" id="showpayment" ref={showPaymentsModalRef} tabIndex="-1">
                  {/* ... Structure same as before, using 'paymentsList' state ... */}
                  {/* Ensure buttons call triggerPaymentEdit and triggerDeletePayment props */}
             </div>
            {/* /show payment Modal */}


            {/* ======================== Create Payment Modal ======================== */}
             <div className="modal fade" id="createpayment" ref={createPaymentModalRef} tabIndex="-1">
                 {/* ... Structure same as before, using createPayment... state ... */}
             </div>
            {/* /Create payment Modal */}


            {/* ======================== Edit Payment Modal ======================== */}
             <div className="modal fade" id="editpayment" ref={editPaymentModalRef} tabIndex="-1">
                 {/* ... Structure same as before, using editPayment... state ... */}
                 {/* Conditional rendering based on editPaymentData */}
             </div>
            {/* /edit payment Modal */}

        </> {/* Closing the main fragment */}
    </div> // Closing the main div
   );
};

export default OnlineorderModal;