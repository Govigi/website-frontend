export type OrderItem = {
  product: {
    _id: string;
    name: string;
    image: { url: string };
    price: number;
  };
  quantity: number;
};

export type Order = {
  id: string;
  date: string;
  status: "Delivered" | "Pending" | "Shipped" | "Cancelled";
  items: OrderItem[];
  summary: {
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  deliveryAddress: {
    name: string;
    address: string;
    phone: string;
  };
  paymentMethod: {
    type: string;
    provider: string;
    status: string;
  };
};

export const mockOrderData: Order = {
  id: "GOVIGI-8675309",
  date: "October 26, 2025",
  status: "Delivered", // You can change this to "Pending", "Shipped", or "Cancelled" to test the UI
  items: [
    {
      product: {
        _id: "prod1",
        name: "Organic Hass Avocado",
        image: { url: "/webapp/avocado.png" }, // Assuming images are in public/webapp/
        price: 80,
      },
      quantity: 3,
    },
    {
      product: {
        _id: "prod2",
        name: "Fresh Strawberries (500g)",
        image: { url: "/webapp/strawberry.png" },
        price: 250,
      },
      quantity: 2,
    },
    {
      product: {
        _id: "prod3",
        name: "Cold-Pressed Olive Oil",
        image: { url: "/webapp/oil.png" },
        price: 450,
      },
      quantity: 1,
    },
    {
      product: {
        _id: "prod4",
        name: "Organic Kale Bunch",
        image: { url: "/webapp/kale.png" },
        price: 60,
      },
      quantity: 5,
    },
  ],
  summary: {
    subtotal: 1490,
    deliveryFee: 0, // Free because subtotal > 500
    total: 1490,
  },
  deliveryAddress: {
    name: "Jane Doe",
    address: "123 Green Valley, Organica City, Farmshire 560001",
    phone: "+91 98765 43210",
  },
  paymentMethod: {
    type: "Wallet",
    provider: "GoVigi Wallet",
    status: "Paid",
  },
};