import React from 'react';

// Sample order data
const orders = [
  { tracking_no: '84564564', name: 'Camera Lens', total: 40, status: 2, amount: 40570 },
  { tracking_no: '98764564', name: 'Laptop', total: 300, status: 1, amount: 180139 },
  { tracking_no: '98756325', name: 'Mobile', total: 355, status: 1, amount: 90989 },
  { tracking_no: '98652366', name: 'Handset', total: 50, status: 1, amount: 10239 },
  { tracking_no: '13286564', name: 'Computer Accessories', total: 100, status: 0, amount: 83348 },
];

function statusLabel(code: number) {
  switch (code) {
    case 0:
      return { title: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    case 1:
      return { title: 'Approved', color: 'bg-green-100 text-green-800' };
    case 2:
      return { title: 'Rejected', color: 'bg-red-100 text-red-800' };
    default:
      return { title: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  }
}

export default function OrdersTable() {
  return (
    <div className="bg-white rounded-lg shadow p-6 overflow-auto">
      <h2 className="text-lg font-medium text-desi-gray mb-4">Recent Orders</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking No.</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Order</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => {
            const status = statusLabel(order.status);
            return (
              <tr key={order.tracking_no}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">{order.tracking_no}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{order.total}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>{status.title}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${order.amount.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 
