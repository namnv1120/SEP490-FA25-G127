import React from "react";
import { user02, user33, user34, user35, user36 } from "../../utils/imagepath";

export const customersData = [
  {
    code: "CU001",
    customer: "Carl Evans",
    avatar: user33,
    email: "carlevans@example.com",
    phone: "+12163547758",
    country: "Germany",
    status: "Active",
  },
  {
    code: "CU002",
    customer: "Minerva Rameriz",
    avatar: user02,
    email: "rameriz@example.com",
    phone: "+11367529510",
    country: "Japan",
    status: "Active",
  },
  {
    code: "CU003",
    customer: "Robert Lamon",
    avatar: user34,
    email: "robert@example.com",
    phone: "+15362789414",
    country: "USA",
    status: "Active",
  },
  {
    code: "CU004",
    customer: "Patricia Lewis",
    avatar: user35,
    email: "patricia@example.com",
    phone: "+18513094627",
    country: "Austria",
    status: "Active",
  },
  {
    code: "CU005",
    customer: "Mark Joslyn",
    avatar: user36,
    email: "markjoslyn@example.com",
    phone: "+14678219025",
    country: "Turkey",
    status: "Active",
  },
];

const CustomerDataComponent = () => {
  return (
    <div>
      {customersData.map((item, index) => (
        <div key={index} className="flex items-center gap-3 p-2 border-b">
          <img
            src={item.avatar}
            alt={item.customer}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="font-semibold">{item.customer}</div>
            <div className="text-sm text-gray-500">{item.email}</div>
            <div className="text-sm">{item.country}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerDataComponent;
