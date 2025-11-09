# GoVigi E-Commerce User Flow Analysis

## 🎯 Project Overview
**GoVigi** is a Next.js 15 e-commerce frontend for ordering agricultural products (wholesale/bulk orders) with:
- **Target Users**: Both first-time and returning customers
- **Core Feature**: Browse products → Add to cart → Checkout → Order management
- **Key Pages**: Home, WebApp (products), Cart, Checkout, Orders History, Saved Addresses, Profile

---

## 📱 FIRST TIME USER FLOW

### Flow Diagram
```
Landing Page (/) 
    ↓
Header (Login Button)
    ↓
Login Modal 
    ↓
Dashboard/WebApp (/webapp)
    ↓
Browse Products (ViewAll Component)
    ↓
Add to Cart (CartContext)
    ↓
View Cart (/cart)
    ↓
Checkout (/checkout)
    ├─ Add New Address
    ├─ Select Delivery Address
    └─ Place Order
    ↓
Order Confirmation Modal
    ↓
Order History (/ordershistory)
```

### Step-by-Step Breakdown

#### **Step 1: Landing Page** 
**File**: `src/app/page.tsx`
- Unauthenticated users see marketing content
- Components: Bulk benefits, Quality section, Price list, Testimonials, FAQ
- Auto-redirect to `/webapp` if authenticated

```tsx
// Auto-redirect logic for authenticated users
if (isAuthenticated) {
  router.replace("/webapp");
}
```

#### **Step 2: Authentication - Login**
**File**: `src/components/general-components/Header.tsx`
- Login button opens LoginModal
- Uses `LoginModalContext` for global login state
- Upon successful login, token stored in localStorage

#### **Step 3: Dashboard/WebApp**
**File**: `src/app/webapp/page.tsx`
- Shows all available products via `ViewAll` component
- Displays products in grid layout
- Ready to add items to cart

#### **Step 4: Add to Cart**
**File**: `src/components/core/Cart/CartContext.js`
- Items added via CartContext
- Cart stored in localStorage
- Shows cart count in header

#### **Step 5: View Cart**
**File**: `src/app/cart/page.jsx`
- Display all cart items
- Shows quantity × price calculations
- "Proceed to Checkout" button

#### **Step 6: Checkout Page**
**File**: `src/app/checkout/page.jsx`
**Key Features:**
- **Address Selection**: View all saved addresses
- **Add New Address**: Form to add delivery address with fields:
  - Name, Phone, Email
  - City, State, Landmark, Pincode
- **Select Address**: Click to mark as delivery address
- **Place Order Button**: Creates order with:
  - Selected address
  - Cart items
  - Total amount
  - Scheduled date

**Order Creation**:
```javascript
POST /createOrder
{
  phone, name, email,
  address: { city, landmark, state, pincode, fullAddress },
  items: [{ productId, name, quantityKg, image, price }],
  totalAmount,
  scheduledDate
}
```

#### **Step 7: Order Confirmation**
- Success modal shows "Order Placed Successfully"
- Auto-redirects to `/ordershistory` after 2.5 seconds
- Cart is cleared from localStorage

#### **Step 8: Order History Page**
**File**: `src/app/ordershistory/page.tsx`
- Lists all user orders
- Shows order status, items count, total quantity, date
- Filter by status (Pending, Shipped, Delivered, Cancelled)
- Search by order ID or product name

---

## 👤 EXISTING USER FLOW

### Flow Diagram
```
Landing Page (/)
    ↓ (Auto-redirect if authenticated)
Dashboard/WebApp (/webapp)
    ↓
Browse & Search Products
    ├─ Add to Cart
    └─ Add to Wishlist (/wishlist)
    ↓
View Cart (/cart)
    ↓
Checkout (/checkout)
    ├─ Select Saved Address
    ├─ Edit Address (/saved-address)
    └─ Place Order
    ↓
Order History (/ordershistory)
    ├─ View Order Details (/ordershistory/[orderId])
    ├─ Reorder
    └─ Download Invoice
    ↓
Profile (/profile)
├─ Edit Profile
├─ Manage Addresses (/saved-address)
├─ Wallet (/wallet)
├─ Notifications (/notifications)
└─ Payment Options (/paymentoptions)
```

### Step-by-Step Breakdown

#### **Step 1: Auto-Login & Dashboard**
**File**: `src/app/page.tsx` & `src/app/layout.tsx`
- Token exists in localStorage
- Auto-redirected to `/webapp`
- ShoppingHeader shown (not landing Header)

#### **Step 2: Browse Products**
**File**: `src/app/webapp/page.tsx`
**Features**:
- Search products
- Filter by category
- View wishlist
- Add/remove favorites

#### **Step 3: Add to Cart or Wishlist**
- Add to cart → Update CartContext
- Add to wishlist → Store in context/localStorage
- Show success toast

#### **Step 4: View Cart**
**File**: `src/app/cart/page.jsx`
- View cart items with details
- Edit quantities
- Remove items
- Proceed to checkout

#### **Step 5: Checkout with Saved Address**
**File**: `src/app/checkout/page.jsx`
**Enhancements for Existing Users:**
- All addresses pre-loaded
- First address auto-selected
- Quick edit/add address inline
- One-click order placement
- Edit address modal (/saved-address)

#### **Step 6: Order History & Management**
**File**: `src/app/ordershistory/page.tsx`
**Features**:
- View all orders with status (Pending, Shipped, Delivered, Cancelled)
- Filter by status using multi-select pills
- Search by order ID or product name
- View product previews in expanded state
- Reorder button (add items back to cart)
- Get Invoice button

#### **Step 7: View Order Details**
**File**: `src/app/ordershistory/[orderId]/page.tsx`
- Full order details with all items
- Order summary (subtotal, total)
- Delivery address
- Payment method
- Scheduled date
- Order status badge
- Reorder & Download Invoice buttons

**API Call**:
```javascript
GET /getOrder/:orderId
Returns: Complete order details from MongoDB
```

#### **Step 8: Manage Profile**
**Files**: `src/app/profile/page.tsx`
- View/Edit profile information
- Manage saved addresses (/saved-address)
- View wallet balance (/wallet)
- View notifications (/notifications)
- Payment settings (/paymentoptions)

#### **Step 9: Saved Addresses**
**File**: `src/app/saved-address/page.tsx`
**Features**:
- View all saved addresses
- Add new address (up to 5)
- Edit existing addresses
- Delete addresses
- Select address as default
- Enhanced UI with:
  - Header bar with icon
  - Address sections
  - Edit/Delete on hover
  - Selected indicator with checkmark
  - Loading and empty states

---

## 🔑 Key Files & Their Roles

### Authentication & Context
| File | Purpose |
|------|---------|
| `src/libs/context/AuthContext.js` | User auth state, login/logout logic |
| `src/libs/context/LoginModalContext.js` | Global login modal state |
| `src/libs/context/ToastContext.js` | Global toast notifications |

### Cart Management
| File | Purpose |
|------|---------|
| `src/components/core/Cart/CartContext.js` | Cart state, add/remove items |
| `src/app/cart/page.jsx` | Cart display & management |

### Order Management
| File | Purpose |
|------|---------|
| `src/app/checkout/page.jsx` | Address selection, order creation |
| `src/app/ordershistory/page.tsx` | Order list with filters & search |
| `src/app/ordershistory/[orderId]/page.tsx` | Order details page |

### Profile & Settings
| File | Purpose |
|------|---------|
| `src/app/profile/page.tsx` | User profile management |
| `src/app/saved-address/page.tsx` | Address management |
| `src/app/wallet/page.tsx` | Wallet/Balance |
| `src/app/notifications/page.tsx` | Notifications |

### Layout & Navigation
| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with providers |
| `src/components/general-components/Header.tsx` | Landing page header with login |
| `src/components/general-components/ShoppingHeader.tsx` | App header for authenticated users |
| `src/components/general-components/BottomNavbar.tsx` | Mobile bottom navigation |

---

## 📊 API Endpoints Used

### User & Authentication
- `POST /login` - User login
- `POST /getAddress` - Fetch saved addresses
- `POST /createAddress` - Add new address
- `PUT /editAddress/:id` - Update address
- `DELETE /deleteAddress/:id` - Delete address

### Orders
- `POST /createOrder` - Place new order
- `POST /userOrders` - Fetch user's orders (with token)
- `GET /getOrder/:id` - Fetch order details

### Products
- `GET /products` - Fetch all products
- `GET /product/:id` - Fetch product details

### Cart
- Stored in `localStorage` as JSON
- Synced via CartContext

---

## 🎨 Design Pattern Consistency

### Color Scheme by Status
- **Pending**: Yellow (text-yellow-600, bg-yellow-50)
- **Shipped**: Blue (text-blue-600, bg-blue-50)
- **Delivered**: Green (text-green-600, bg-green-50)
- **Cancelled**: Red (text-red-600, bg-red-50)

### Border Radius
- **Standard**: `rounded-md` (used across all cards, buttons, inputs)

### Components & Icons
- Uses **Heroicons** for consistent iconography
- Uses **Tailwind CSS** for styling
- Uses **Next.js App Router** for navigation

---

## 🚀 Recent Enhancements

### Order History Page
✅ Multi-select filter pills for status filtering
✅ Inline product preview with grid layout
✅ View More button for detailed order page
✅ Search by order ID or product name
✅ Order stats cards (items count, quantity)
✅ Reorder & View Details buttons
✅ Responsive design for mobile and web

### Saved Addresses Page
✅ Enhanced card layout with header bar
✅ Multi-select capability for addresses
✅ Edit/Delete on hover
✅ Selected address indicator
✅ Loading state with spinner
✅ Empty state with CTA
✅ Add new address form (up to 5)

---

## 📱 Responsive Design

### Mobile (< 640px)
- Stack layouts vertically
- Full-width buttons & inputs
- Bottom navbar for navigation
- Horizontal scroll for filters/pills

### Tablet (640px - 1024px)
- 2-column grids where applicable
- Larger touches targets
- Simplified navigation

### Desktop (> 1024px)
- 3-column grids
- Sidebar filters
- Full feature display
- Multi-select capabilities

---

## 📝 Data Models

### Order Schema (Backend)
```javascript
{
  orderNumber: String (unique),
  items: [{
    productId: String,
    name: String,
    image: String,
    quantityKg: Number,
    price: Number
  }],
  address: [{
    city: String,
    contact: String,
    email: String,
    landmark: String,
    name: String,
    pincode: String,
    state: String
  }],
  totalAmount: Number,
  status: String (Pending|Shipped|Delivered|Cancelled),
  name: String,
  contact: String,
  paymentMethod: String,
  scheduledDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Item (Frontend)
```javascript
{
  _id: String (product ID),
  name: String,
  image: { url: String },
  price: Number,
  pricePerKg: Number,
  quantity: Number (in kg)
}
```

---

## ✨ Key Features Summary

| Feature | First User | Existing User |
|---------|-----------|---------------|
| Login | Required | Auto-filled |
| Add Address | During checkout | Managed separately |
| Browse Products | Yes | Yes |
| Add to Cart | Yes | Yes |
| Add to Wishlist | Yes | Yes |
| Checkout | Simple | Quick (saved addresses) |
| Order History | Create first order | Browse, filter, search |
| Order Details | N/A | View full details |
| Reorder | N/A | Yes (quick reorder) |
| Invoice Download | N/A | Yes |
| Profile Management | Basic | Full management |
| Saved Addresses | None | Up to 5 |
| Wallet | N/A | Yes |
| Notifications | N/A | Yes |

---

## 🔄 User Journey Map

```
FIRST TIME                          EXISTING USER
    |                                   |
    v                                   v
Landing Page ────────────────────> Auto-redirect
    |                                   |
    v                                   v
Login Modal                         Dashboard
    |                                   |
    v                                   v
Dashboard/WebApp ◄──────────────────────┘
    |
    v (Browse & Add)
Cart Context
    |
    v
View Cart
    |
    v
Checkout (New Address)          Checkout (Saved Address)
    |                                   |
    +───────────────┬───────────────────+
                    v
            Place Order
                    |
                    v
            Order Confirmation
                    |
                    v
            Order History
                    |
            ┌───────┴────────┐
            v                v
        View Details     Manage Profile
            |                |
            +────────────────+
                    |
                    v
            Reorder / Download Invoice
```
