import PrimeDataTable from "../../../components/data-table";
import { onlineOrderData } from "../../../core/json/onlineOrderData";
import { Link } from "react-router-dom";
import OnlineorderModal from "../online-order/onlineorderModal";
import CommonFooter from "../../../components/footer/commonFooter";
import TableTopHead from "../../../components/table-top-head";
import DeleteModal from "../../../components/delete-modal";
import SearchFromApi from "../../../components/data-table/search";
import { useState } from "react";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Modal states
  const [viewModal, setViewModal] = useState({ open: false, order: null });
  const [editModal, setEditModal] = useState({ open: false, order: null });
  const [paymentsModal, setPaymentsModal] = useState({ open: false, order: null });
  const [createPaymentModal, setCreatePaymentModal] = useState({ open: false, order: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, order: null });

  const getStatusColor = (status) => {
    return status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-100 text-cyan-700';
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Unpaid': return 'bg-red-50 text-red-600 border-red-200';
      case 'Overdue': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // View Details Modal
  const ViewDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Sale Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reference</p>
                <p className="text-lg font-semibold text-gray-900">{order.reference}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <p className="text-lg font-semibold text-gray-900">{order.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer</p>
                <p className="text-lg font-semibold text-gray-900">{order.customer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Grand Total:</span>
                  <span className="font-semibold text-gray-900 text-lg">{order.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Paid:</span>
                  <span className="font-semibold text-green-600">{order.paid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Due:</span>
                  <span className="font-semibold text-red-600">{order.due}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">Biller: <span className="font-semibold text-gray-900">{order.biller}</span></p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Sale Modal
  const EditSaleModal = ({ order, onClose }) => {
    if (!order) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between rounded-t-xl">
            <h2 className="text-2xl font-bold text-white">Edit Sale</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
              <input type="text" defaultValue={order.customer} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
                <input type="text" defaultValue={order.reference} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input type="text" defaultValue={order.date} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select defaultValue={order.status} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none">
                <option>Completed</option>
                <option>Pending</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={onClose} className="flex-1 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                Cancel
              </button>
              <button onClick={onClose} className="flex-1 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 font-medium transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show Payments Modal
  const ShowPaymentsModal = ({ order, onClose }) => {
    if (!order) return null;
    
    const payments = [
      { id: 1, date: '24 Dec 2024', amount: '$500', method: 'Cash', status: 'Completed' },
      { id: 2, date: '20 Dec 2024', amount: '$500', method: 'Card', status: 'Completed' },
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 flex items-center justify-between rounded-t-xl">
            <h2 className="text-2xl font-bold text-white">Payment History - {order.reference}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Amount:</span>
                <span className="text-2xl font-bold text-gray-900">{order.total}</span>
              </div>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{payment.date}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{payment.amount}</td>
                    <td className="px-4 py-3 text-gray-700">{payment.method}</td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Create Payment Modal
  const CreatePaymentModal = ({ order, onClose }) => {
    if (!order) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center justify-between rounded-t-xl">
            <h2 className="text-2xl font-bold text-white">Create Payment</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Order: <span className="font-semibold text-gray-900">{order.reference}</span></p>
              <p className="text-sm text-gray-600">Due Amount: <span className="font-semibold text-red-600 text-lg">{order.due}</span></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
              <input type="number" placeholder="Enter amount" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option>Cash</option>
                <option>Card</option>
                <option>Bank Transfer</option>
                <option>E-wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
              <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
              <textarea rows={3} placeholder="Add note..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"></textarea>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={onClose} className="flex-1 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                Cancel
              </button>
              <button onClick={onClose} className="flex-1 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-medium transition-colors">
                Create Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = ({ order, onClose, onConfirm }) => {
    if (!order) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Sale?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete order <span className="font-semibold">{order.reference}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                Cancel
              </button>
              <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Dropdown = ({ label, options }) => (
    <div className="relative">
      <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
        {label}
        <ChevronDown size={16} />
      </button>
    </div>
  );

  const ActionMenu = ({ order }) => {
    const handleAction = (action) => {
      setOpenDropdown(null);
      
      switch(action) {
        case 'view':
          setViewModal({ open: true, order });
          break;
        case 'edit':
          setEditModal({ open: true, order });
          break;
        case 'payments':
          setPaymentsModal({ open: true, order });
          break;
        case 'create-payment':
          setCreatePaymentModal({ open: true, order });
          break;
        case 'download':
          alert(`Đang tải PDF cho đơn hàng ${order.reference}`);
          break;
        case 'delete':
          setDeleteModal({ open: true, order });
          break;
      }
    };

    return (
      <div className="relative">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdown(openDropdown === order.id ? null : order.id);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical size={18} className="text-gray-600" />
        </button>
        
        {openDropdown === order.id && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setOpenDropdown(null)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <button 
                onClick={() => handleAction('view')}
                className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-3 text-sm text-gray-700 rounded-t-lg transition-colors"
              >
                <Eye size={16} className="text-blue-500" />
                Sale Detail
              </button>
              <button 
                onClick={() => handleAction('edit')}
                className="w-full px-4 py-2.5 text-left hover:bg-amber-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
              >
                <Edit size={16} className="text-amber-500" />
                Edit Sale
              </button>
              <button 
                onClick={() => handleAction('payments')}
                className="w-full px-4 py-2.5 text-left hover:bg-green-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
              >
                <DollarSign size={16} className="text-green-500" />
                Show Payments
              </button>
              <button 
                onClick={() => handleAction('create-payment')}
                className="w-full px-4 py-2.5 text-left hover:bg-purple-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
              >
                <PlusCircle size={16} className="text-purple-500" />
                Create Payment
              </button>
              <button 
                onClick={() => handleAction('download')}
                className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
              >
                <Download size={16} className="text-indigo-500" />
                Download PDF
              </button>
              <button 
                onClick={() => handleAction('delete')}
                className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600 border-t border-gray-100 rounded-b-lg transition-colors"
              >
                <Trash2 size={16} />
                Delete Sale
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">POS Orders</h1>
              <p className="text-gray-600">Manage Your pos orders</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2.5 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors">
                <Download size={20} className="text-red-600" />
              </button>
              <button className="p-2.5 bg-white border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
                <Download size={20} className="text-green-600" />
              </button>
              <button className="p-2.5 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <RefreshCw size={20} className="text-blue-600" />
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-lg shadow-orange-500/30">
                <Plus size={20} />
                Add Sales
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none w-64"
                  />
                </div>
                
                <select 
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Dropdown label="Customer" />
                <Dropdown label="Status" />
                <Dropdown label="Payment Status" />
                <Dropdown label="Sort By: Last 7 Days" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Grand Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Due</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Biller</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {ordersData.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {order.customer.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{order.customer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{order.reference}</td>
                    <td className="px-6 py-4 text-gray-700">{order.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{order.total}</td>
                    <td className="px-6 py-4 text-gray-700">{order.paid}</td>
                    <td className="px-6 py-4 text-gray-700">{order.due}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{order.biller}</td>
                    <td className="px-6 py-4">
                      <ActionMenu order={order} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">1</span> to <span className="font-semibold">10</span> of <span className="font-semibold">10</span> entries
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                «
              </button>
              <button className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium">
                1
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                »
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewModal.open && <ViewDetailsModal order={viewModal.order} onClose={() => setViewModal({ open: false, order: null })} />}
      {editModal.open && <EditSaleModal order={editModal.order} onClose={() => setEditModal({ open: false, order: null })} />}
      {paymentsModal.open && <ShowPaymentsModal order={paymentsModal.order} onClose={() => setPaymentsModal({ open: false, order: null })} />}
      {createPaymentModal.open && <CreatePaymentModal order={createPaymentModal.order} onClose={() => setCreatePaymentModal({ open: false, order: null })} />}
      {deleteModal.open && (
        <DeleteConfirmModal 
          order={deleteModal.order} 
          onClose={() => setDeleteModal({ open: false, order: null })}
          onConfirm={() => alert(`Đã xóa đơn hàng ${deleteModal.order.reference}`)}
        />
      )}
    </div>
  );
};

export default Orders;