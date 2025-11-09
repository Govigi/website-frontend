# GoVigi - Complete File Flow Reference

## 📂 FIRST TIME USER FLOW - All Files

```
FIRST TIME USER FLOW
└── Landing Page
    └── src/app/page.tsx
        └── src/app/layout.tsx (provider setup)
            └── src/libs/context/AuthContext.js
            └── src/libs/context/LoginModalContext.js
            └── src/libs/context/ToastContext.js
            └── src/components/general-components/Header.tsx
                └── [Login Button Click]
                    └── [LoginModal Opens - managed by LoginModalContext]
                        └── POST /login API call
                            └── Token stored in localStorage
                                └── Auto-redirect to /webapp

└── Dashboard/WebApp
    └── src/app/webapp/page.tsx
        └── src/components/general-components/ViewAll.tsx
            └── Fetch products from backend
            └── src/components/general-components/ProductCard.tsx
                └── [Add to Cart Click]
                    └── src/components/core/Cart/CartContext.js
                        └── Cart items stored in localStorage

└── View Cart
    └── src/app/cart/page.jsx
        └── src/components/general-components/CartComponent.tsx (variant="full")
            └── Display cart items from CartContext
            └── [Proceed to Checkout Click]
                └── Navigate to /checkout

└── Checkout - NEW USER (Add Address)
    └── src/app/checkout/page.jsx
        ├── POST /getAddress (check if addresses exist)
        ├── src/app/saved-address/page.tsx (embedded or modal)
        │   └── [Add New Address Form]
        │       └── Name, Phone, Email
        │       └── City, State, Landmark, Pincode
        │       └── POST /createAddress API call
        ├── [Select Address]
        ├── [Review Cart Items]
        ├── [Select Scheduled Date]
        └── [Place Order Button]
            └── POST /createOrder
                ├── Pass: address, items, totalAmount, name, contact, email, scheduledDate
                ├── src/components/general-components/Toast.tsx (Success toast)
                ├── localStorage.removeItem('cart') (Clear cart)
                └── setTimeout redirect to /ordershistory (2.5s)

└── Order History
    └── src/app/ordershistory/page.tsx
        ├── POST /userOrders (fetch all user orders)
        ├── src/components/general-components/OrderCard.tsx
        │   ├── Status badge with color mapping
        │   └── Product preview grid
        └── [View More Click]
            └── Navigate to /ordershistory/[orderId]
                └── src/app/ordershistory/[orderId]/page.tsx
                    ├── GET /getOrder/:orderId
                    ├── Display order details
                    ├── Show all items
                    ├── Show delivery address
                    └── Show action buttons (Reorder, Get Invoice)
```

---

## 👤 EXISTING USER FLOW - All Files

```
EXISTING USER FLOW
└── Auto-Login Check
    └── src/app/layout.tsx
        └── Check localStorage token exists
        └── If token exists:
            └── isAuthenticated = true
            └── Conditional rendering:
                ├── ShoppingHeader.tsx (app header)
                ├── BottomNavbar.tsx (app navigation)
                └── Route-specific pages

└── Dashboard/WebApp (Auto-redirect from /)
    └── src/app/page.tsx (auto-redirect if isAuthenticated)
    └── src/app/webapp/page.tsx
        └── src/components/general-components/ShoppingHeader.tsx
        │   ├── Search bar
        │   ├── Cart count
        │   ├── Profile menu
        │   └── Wishlist toggle
        └── src/components/general-components/ViewAll.tsx
            ├── src/components/general-components/ProductCard.tsx
            │   ├── Product image, name, price
            │   ├── [Add to Cart Click]
            │   │   └── src/components/core/Cart/CartContext.js
            │   │       └── Update localStorage cart
            │   └── [Add to Wishlist Click]
            │       └── src/app/wishlist/page.tsx (contextual)
            └── Search products
            └── Filter by category

└── Browse & Add Products
    ├── Additional Feature Pages (accessible from BottomNavbar)
    ├── src/app/searchpro/page.tsx (search results)
    ├── src/app/wishlist/page.tsx (saved favorites)
    ├── src/app/notifications/page.tsx (order updates)
    └── src/app/wallet/page.tsx (balance & history)

└── View Cart
    └── src/app/cart/page.jsx
        └── src/components/general-components/CartComponent.tsx (variant="full")
            ├── Display all cart items
            ├── Edit quantities
            ├── Remove items
            └── [Proceed to Checkout Click]
                └── Navigate to /checkout

└── Checkout - EXISTING USER (Saved Addresses)
    └── src/app/checkout/page.jsx
        ├── POST /getAddress (fetch all saved addresses)
        ├── [Display Saved Addresses List]
        │   └── Pre-populated from previous orders
        │   └── [Select Address to Mark as Delivery]
        ├── [Edit Address Option]
        │   └── src/app/saved-address/page.tsx
        │       ├── Edit form modal
        │       ├── PUT /updateAddress/:id
        │       └── Return to checkout
        ├── [Add New Address Option] (if < 5 addresses)
        │   └── POST /createAddress
        ├── [Quick Payment Method Selection]
        ├── [Review Order Summary]
        └── [Place Order Button]
            └── POST /createOrder
                ├── Response with order confirmation
                ├── Toast notification "Order Placed Successfully"
                ├── Clear cart from localStorage
                └── Auto-redirect to /ordershistory (2.5s)

└── Order History & Management
    └── src/app/ordershistory/page.tsx
        ├── POST /userOrders (fetch all orders)
        ├── Display with Enhanced UI:
        │   ├── src/components/general-components/OrderCard.tsx
        │   │   ├── Order ID clickable
        │   │   ├── Status badge (Pending/Shipped/Delivered/Cancelled)
        │   │   ├── Order date & time
        │   │   ├── Product count & total quantity
        │   │   ├── Total price
        │   │   ├── Product preview grid (2 items shown)
        │   │   ├── [View More Button]
        │   │   └── [Reorder Button]
        ├── Multi-select Filter Pills
        │   ├── Pending (yellow)
        │   ├── Shipped (blue)
        │   ├── Delivered (green)
        │   ├── Cancelled (red)
        │   └── [X Mark to Remove Filter]
        └── Search functionality
            └── Search by Order ID or Product Name

└── Order Details Page
    └── Navigate to /ordershistory/[orderId]
    └── src/app/ordershistory/[orderId]/page.tsx
        ├── GET /getOrder/:orderId (fetch single order)
        ├── Left Column:
        │   ├── Order ID & Status Badge
        │   ├── Product Items Grid
        │   │   └── Product name, image, quantity, price
        │   └── Order total
        ├── Right Column:
        │   ├── Order Summary
        │   │   ├── Subtotal
        │   │   ├── Tax/Fees (if applicable)
        │   │   └── Total Amount
        │   ├── Delivery Address
        │   │   └── Full address details
        │   ├── Payment Method
        │   ├── Scheduled Date
        │   └── Order Status Timeline
        └── Action Buttons
            ├── [Reorder Button]
            │   └── Add all items back to cart
            │   └── Navigate to /cart
            └── [Get Invoice Button]
                └── Download PDF or view invoice

└── Manage Profile & Settings
    └── src/components/general-components/BottomNavbar.tsx
        ├── [Profile Icon Click]
        │   └── src/app/profile/page.tsx
        │       ├── Edit Profile Form
        │       ├── Linked Actions:
        │       │   ├── [Manage Addresses]
        │       │   │   └── src/app/saved-address/page.tsx
        │       │   │       ├── POST /getAddress (view all)
        │       │   │       ├── POST /createAddress (add new)
        │       │   │       ├── PUT /updateAddress/:id (edit)
        │       │   │       ├── DELETE /deleteAddress/:id (delete)
        │       │   │       ├── Display in grid card layout
        │       │   │       ├── Edit/Delete icons on hover
        │       │   │       └── Selection indicator
        │       │   ├── [View Wallet]
        │       │   │   └── src/app/wallet/page.tsx
        │       │   ├── [View Notifications]
        │       │   │   └── src/app/notifications/page.tsx
        │       │   ├── [Payment Options]
        │       │   │   └── src/app/paymentoptions/page.tsx
        │       │   └── [Bulk Orders]
        │       │       └── src/app/bulkorders/page.tsx
        │       └── [Logout]
        │           └── Clear localStorage
        │           └── src/libs/context/AuthContext.js (setUser(null))
```

---

## 📋 Comparison: Files Used in Each Flow

### ONLY in First Time User Flow
```
src/components/general-components/Header.tsx (landing header)
    - Login button to open LoginModal
    - Marketing navigation
```

### ONLY in Existing User Flow
```
src/components/general-components/ShoppingHeader.tsx (app header)
    - Product search
    - Cart count
    - Profile menu
    - Wishlist quick access

src/components/general-components/BottomNavbar.tsx (app navigation)
    - Navigation to all app features
    - Profile, Orders, Wishlist, Notifications, Wallet
```

### In BOTH Flows
```
src/app/layout.tsx
    └── src/app/page.tsx (landing page with auth check)
    └── src/app/webapp/page.tsx (product catalog)
    └── src/components/general-components/ViewAll.tsx
    └── src/components/general-components/ProductCard.tsx
    └── src/components/core/Cart/CartContext.js
    └── src/app/cart/page.jsx
    └── src/components/general-components/CartComponent.tsx
    └── src/app/checkout/page.jsx
    └── src/app/ordershistory/page.tsx
    └── src/components/general-components/OrderCard.tsx
    └── src/app/ordershistory/[orderId]/page.tsx
    └── src/app/saved-address/page.tsx
    └── src/components/general-components/Toast.tsx
    └── src/libs/context/AuthContext.js
    └── src/libs/context/CartContext.js
    └── src/libs/context/ToastContext.js
    └── src/libs/context/LoginModalContext.js
```

---

## 🎯 Key Decision Points in Flows

### First Time User - Critical Moments
1. **Login Success** - Token stored → Auto-redirect to /webapp
2. **Add First Item** - CartContext initialized → Item persisted
3. **First Checkout** - Address creation required → Can't proceed without
4. **Place Order** - POST /createOrder → Order ID generated
5. **Order Confirmation** - Auto-redirect to history → See first order

### Existing User - Decision Points
1. **Landing Page** - Redirected vs. browsing
2. **Add to Cart vs. Add to Wishlist** - Different flows
3. **Select Address** - Use saved vs. add new
4. **Checkout** - One-click vs. review details
5. **Order History** - View details vs. reorder
6. **Profile Updates** - Address management vs. payment settings

---

## 📊 Data Flow Summary

### Cart Data
- **Storage**: localStorage (CartContext persists it)
- **Structure**: Array of items with id, name, price, quantity
- **Sync Points**: Added → Checkout → Clear on order success

### Authentication Data
- **Storage**: localStorage (token)
- **AuthContext**: Provides isAuthenticated, user, logout functions
- **Sync Points**: Login → Page render → Redirect logic

### Order Data
- **Source**: Backend APIs (/userOrders, /getOrder/:id)
- **Display**: OrderCard component with status-based styling
- **Actions**: Reorder (add to cart), View Details, Download Invoice

### Address Data
- **Source**: Backend (/getAddress endpoint)
- **Types**: Saved addresses, temporary checkout address
- **Manage**: Add, Edit, Delete via /createAddress, /updateAddress, /deleteAddress

---

## 🔗 API Endpoints Summary

### Authentication
- `POST /login` - Used in LoginModal

### Products
- `GET /products` - ViewAll component
- `GET /searchpro` - Search functionality

### Cart (Client-side)
- Stored in `localStorage` with key `cart`

### Orders
- `POST /createOrder` - Checkout page
- `POST /userOrders` - Order history list (with token)
- `GET /getOrder/:id` - Order detail page

### Addresses
- `POST /getAddress` - Fetch all (with token)
- `POST /createAddress` - Add new
- `PUT /updateAddress/:id` - Edit existing
- `DELETE /deleteAddress/:id` - Delete

### Profile
- `GET /profile` - Profile page
- `PUT /updateProfile` - Edit profile

---

## 🎨 Component Hierarchy

```
App Layout (layout.tsx)
├── Conditional Header
│   ├── Header.tsx (landing)
│   └── ShoppingHeader.tsx (app)
├── BottomNavbar.tsx (app routes only)
└── Route Pages
    ├── Landing (/)
    ├── WebApp (/webapp)
    │   └── ViewAll
    │       └── ProductCard
    ├── Cart (/cart)
    │   └── CartComponent
    ├── Checkout (/checkout)
    │   ├── Address list display
    │   └── Address form (add/edit)
    ├── Orders History (/ordershistory)
    │   ├── Filter pills
    │   └── OrderCard (expandable)
    ├── Order Detail (/ordershistory/[orderId])
    │   └── Order details layout
    ├── Profile (/profile)
    ├── Saved Addresses (/saved-address)
    ├── Wishlist (/wishlist)
    ├── Notifications (/notifications)
    ├── Wallet (/wallet)
    └── Other pages...

Context Providers (in layout.tsx)
├── ToastProvider
├── AuthProvider
├── CartProvider
└── LoginModalProvider
```

---

## ✅ Checklist for Testing Both Flows

### First Time User Flow
- [ ] Landing page loads without auth
- [ ] Login button opens modal
- [ ] Successful login redirects to /webapp
- [ ] Products display correctly
- [ ] Add to cart works
- [ ] Cart page shows items
- [ ] Checkout requires new address
- [ ] Address form validates
- [ ] Order creation succeeds
- [ ] Confirmation modal appears
- [ ] Auto-redirect to order history
- [ ] New order visible in list

### Existing User Flow
- [ ] Authenticated user auto-redirected from /
- [ ] ShoppingHeader displays correctly
- [ ] BottomNavbar shows all options
- [ ] Saved addresses pre-load in checkout
- [ ] Quick address selection works
- [ ] Order creation works
- [ ] Order filters function (multi-select)
- [ ] Order search works
- [ ] Order details page loads correctly
- [ ] Reorder adds items to cart
- [ ] Invoice download works
- [ ] Profile management accessible
- [ ] Address CRUD operations work
