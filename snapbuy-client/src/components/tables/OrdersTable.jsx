import React from "react";

function OrdersTable() {
  const orders = [
    { id: 1, customer: "Carlos Curran", total: 4560, status: "Completed" },
    { id: 2, customer: "Stan Gaunter", total: 3569, status: "Completed" },
    { id: 3, customer: "Richard Wilson", total: 4123, status: "Pending" },
  ];

  return (
    <div className="card mt-4">
      <div className="card-header">Recent Orders</div>
      <div className="card-body">
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.customer}</td>
                <td>${order.total}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrdersTable;
