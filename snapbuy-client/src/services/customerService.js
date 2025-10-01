const customers = [
  {
    id: 1,
    code: "CU001",
    name: "Carl Evans",
    email: "carlevans@example.com",
    phone: "+12163547758",
    country: "Germany",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    code: "CU002",
    name: "Minerva Rameriz",
    email: "rameriz@example.com",
    phone: "+11367529510",
    country: "Japan",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    code: "CU003",
    name: "Robert Lamon",
    email: "robert@example.com",
    phone: "+15362789414",
    country: "USA",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: 4,
    code: "CU004",
    name: "Patricia Lewis",
    email: "patricia@example.com",
    phone: "+18513094627",
    country: "Austria",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: 5,
    code: "CU005",
    name: "Mark Joslyn",
    email: "markjoslyn@example.com",
    phone: "+14678219025",
    country: "Turkey",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
];

const customerService = {
  getAll: async () => customers,
  create: async (data) => {
    customers.push({ ...data, id: customers.length + 1 });
    return data;
  },
  update: async (id, data) => {
    const idx = customers.findIndex((c) => c.id === id);
    customers[idx] = { ...customers[idx], ...data };
    return customers[idx];
  },
  delete: async (id) => {
    const idx = customers.findIndex((c) => c.id === id);
    customers.splice(idx, 1);
    return true;
  },
};

export default customerService;