# Govigi Website Frontend - Complete Project Documentation

**Project Name**: GoVigi Website Frontend  
**Framework**: Next.js 15.3.4 with TypeScript & App Router  
**Styling**: Tailwind CSS v4 with PostCSS  
**Package Manager**: npm  
**Node Environment**: React 18.3.1  
**Status**: Active Development

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Approach](#architecture--approach)
3. [Technology Stack](#technology-stack)
4. [Color System & Design Language](#color-system--design-language)
5. [Mobile/Desktop Strategy](#mobiledesktop-strategy)
6. [API Integration & Backend Communication](#api-integration--backend-communication)
7. [Context & State Management](#context--state-management)
8. [Component Architecture](#component-architecture)
9. [File Structure & Organization](#file-structure--organization)
10. [Key Components Deep-Dive](#key-components-deep-dive)
11. [Page Routes](#page-routes)
12. [Animation & UX Patterns](#animation--ux-patterns)
13. [Development Guidelines](#development-guidelines)
14. [Responsive Design Patterns](#responsive-design-patterns)
15. [Minor Details & Best Practices](#minor-details--best-practices)

---

## 1. Project Overview

### Purpose
GoVigi is an e-commerce web application focused on organic/fresh produce delivery. The frontend provides a complete shopping experience with cart management, order history, user profiles, delivery options, and payment integration.

### Key Features
- **Shopping Experience**: Browse and search products with filtering
- **Cart Management**: Add/remove items, modify quantities (localStorage-persisted)
- **Order Management**: View order history, reorder functionality
- **User Profile**: Manage account settings, saved addresses
- **Flexible Scheduling**: Delivery date/time options
- **Wishlist**: Save favorite items for later
- **Wallet Integration**: Digital wallet for payments
- **Notifications**: Order updates and promotional messages
- **Mobile-First**: Fully responsive design optimized for mobile devices

### Development Mode
```bash
npm run dev      # Start Turbopack dev server
npm run build    # Production build
npm run start    # Production start
npm run lint     # ESLint check
```

---

## 2. Architecture & Approach

### Design Philosophy: Mobile-First Responsive Design

This project follows a **mobile-first approach** where:
- Base styles target mobile devices (320px+)
- Desktop enhancements use Tailwind's `sm:` breakpoint (640px+)
- Complex interactions adapt between touch (mobile) and hover (desktop)

### Architectural Patterns

#### **1. Context API for State Management**
- **CartContext**: Global cart state (items, quantities, add/remove operations)
- **AuthContext**: Authentication state and user operations (login, logout, wishlist, addresses)
- **ToastContext**: Notification/toast messages
- **LoginModalContext**: Login modal state visibility

#### **2. Component Variant Pattern**
Components accept a `variant` prop to adapt behavior:
```tsx
// Example: CartComponent
<CartComponent variant="full" />      // Full page display
<CartComponent variant="preview" />   // Sidebar preview
```

#### **3. Responsive Rendering Strategy**
Conditional rendering based on screen size:
```tsx
// Desktop-only hover effects
<button className="sm:opacity-0 sm:group-hover:opacity-100">
  Remove
</button>

// Mobile-only display
<div className="sm:hidden">
  Mobile content
</div>

// Desktop-only display
<div className="hidden sm:inline">
  Desktop content
</div>
```

#### **4. Backend Integration Pattern**
- Config-based environment setup (`config.ts`)
- Axios for HTTP requests with error handling
- Token-based authentication stored in localStorage
- API responses trigger toast notifications

#### **5. Feature-Scoped Page Structure**
Each feature (cart, orders, profile, etc.) is organized in its own folder:
```
src/app/
├── cart/page.jsx
├── ordershistory/page.tsx
├── profile/page.tsx
├── checkout/page.jsx
└── [feature-name]/page.[tsx|jsx]
```

---

## 3. Technology Stack

### Core Framework
- **Next.js 15.3.4**: App Router, Turbopack for faster builds, Server Components ready
- **React 18.3.1**: Hooks, Context API, Suspense
- **TypeScript 5.8.3**: Type safety (strict: false for flexibility)

### Styling & CSS
- **Tailwind CSS v4**: Utility-first CSS framework with PostCSS
- **PostCSS**: CSS processing and vendor prefixing
- Custom CSS utilities: `.no-scrollbar`, `.perspective`, `.animate-slide-up`

### Icon Libraries (Multi-Library Strategy)
We use multiple icon libraries for maximum flexibility and coverage:

| Library | Usage | Format | Example |
|---------|-------|--------|---------|
| **@heroicons/react** | Primary icons | 24/outline, 24/solid | CartIcon, ChevronRightIcon, ShoppingBagIcon |
| **@phosphor-icons/react** | Cart controls | Filled/Bold | Minus, Plus, X icons |
| **@tabler/icons-react** | Alternative set | Outlined/Filled | Extended icon set |
| **@hugeicons/react** | Extended icons | Regular/Solid | Additional coverage |
| **lucide-react** | Fallback icons | Stroke-based | Alternative implementations |

**Usage Pattern**:
```tsx
import { ShoppingBagIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Minus, Plus, X } from "@phosphor-icons/react";

// Use based on context
<ShoppingBagIcon className="w-4 h-4" />
<Plus className="w-4 h-4" />
```

### State Management
- **React Context API**: CartContext, AuthContext, ToastContext
- **localStorage**: Cart persistence, token storage
- **useState**: Local component state
- **useRef**: DOM references, tracking component mounts

### HTTP & External Services
- **axios**: HTTP requests with error handling
- **firebase v12.5.0**: Backend services
- **@react-google-maps/api**: Google Maps integration

### Additional Libraries
- **Carousel**: swiper, react-slick (for product galleries)
- **Notifications**: react-hot-toast, react-toastify
- **PDF Export**: jspdf, html2canvas, html2pdf.js, jspdf-autotable
- **QR Code**: qrcode.react
- **Drag & Drop**: @dnd-kit suite for sorting/reordering
- **Accessibility**: @headlessui/react (accessible components)
- **Progress Bar**: nextjs-progressbar, nprogress
- **Utilities**: lodash.debounce

---

## 4. Color System & Design Language

### Primary Brand Colors

#### **Green - Brand Primary**
Used for primary actions, success states, and brand identity.

```tsx
// Text & Icons
<p className="text-green-600">Primary text</p>
<p className="text-green-700">Strong text</p>

// Backgrounds
<div className="bg-green-50">Light background</div>
<div className="bg-green-500">Primary button</div>

// Borders
<div className="border border-green-200">Subtle border</div>
<div className="border border-green-300">Stronger border</div>

// Hover States
<button className="hover:bg-green-600">Hover darker</button>
<button className="hover:bg-green-100">Hover lighter</button>

// Gradients
<div className="bg-gradient-to-r from-green-500 to-emerald-600">
  Gradient button
</div>
```

**Use Cases**:
- Primary action buttons (Reorder, Checkout, Continue Shopping)
- Success states and confirmations
- Cart/shopping context elements
- Stat boxes showing quantity/items

#### **Gray - Neutral Foundation**
Used for all neutral elements, text, and UI structure.

```tsx
// Text hierarchy
<p className="text-gray-900">Primary text (body, headlines)</p>
<p className="text-gray-600">Secondary text (labels, descriptions)</p>
<p className="text-gray-500">Tertiary text (hints, helper text)</p>

// Backgrounds
<div className="bg-gray-50">Very light background</div>
<div className="bg-gray-100">Light background</div>

// Borders
<div className="border border-gray-200">Subtle border</div>
<div className="border border-gray-300">Stronger border</div>

// Hover States
<button className="hover:bg-gray-50">Light hover</button>
<button className="hover:bg-gray-100">Darker hover</button>
```

**Use Cases**:
- All text content
- Card backgrounds and containers
- Borders and dividers
- Secondary/default button styling
- Disabled states

#### **Status Colors**
Color-coded states for order status, badges, and alerts:

```tsx
// Delivered - Green
<div className="bg-green-50 border border-green-200 text-green-700">
  <CheckBadgeIcon /> Delivered
</div>

// Pending - Yellow/Amber
<div className="bg-yellow-50 border border-yellow-200 text-yellow-700">
  <ClockIcon /> Pending
</div>

// Shipped - Blue
<div className="bg-blue-50 border border-blue-200 text-blue-700">
  <TruckIcon /> Shipped
</div>

// Cancelled - Red
<div className="bg-red-50 border border-red-200 text-red-700">
  <XCircleIcon /> Cancelled
</div>
```

**Pattern**: `{color}-50` (background) + `{color}-200` (border) + `{color}-600/700` (text)

### Color Usage Map

| Component | Color | Tailwind Classes | Purpose |
|-----------|-------|------------------|---------|
| Primary Buttons | Green | `bg-green-500 hover:bg-green-600 text-white` | Main CTA |
| Secondary Buttons | Gray | `bg-white border border-gray-300 text-gray-700 hover:bg-gray-50` | Alternative action |
| Tertiary Buttons | Green (light) | `bg-green-50 border border-green-300 text-green-700 hover:bg-green-100` | Subtle action (Reorder) |
| Cards | Gray | `border border-gray-200 bg-white rounded-md` | Content containers |
| Empty State | Green | `bg-gradient-to-br from-green-100 to-emerald-100` | Visual emphasis |
| Stat Boxes | Multi | Color-coded | Order status indicators |
| Text Links | Green | `text-green-600 hover:text-green-700` | Navigation/interactive text |

---

## 5. Mobile/Desktop Strategy

### Responsive Breakpoint
- **Mobile**: < 640px (default styles)
- **Desktop**: ≥ 640px (use `sm:` prefix)

### Mobile-First Implementation

#### **Layout Adaptations**

**Full Width on Mobile → Contained on Desktop**
```tsx
// Mobile: full width, Desktop: max-width container
<div className="sm:max-w-4xl sm:mx-auto">
  Content
</div>
```

**Stack Vertically on Mobile → Row on Desktop**
```tsx
// Mobile: flex-col, Desktop: flex-row
<div className="flex flex-col sm:flex-row gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

#### **Navigation Changes**

**Mobile Cart Behavior**
```tsx
// ShoppingHeader.tsx
if (isMobile) {
  router.push("/cart");  // Navigate to full-page cart
} else {
  openPanel("cart");     // Open sidebar preview
}
```

**Bottom Navigation**
- Mobile: Fixed bottom navbar for main navigation
- Desktop: Top navigation bar with sidebar panels
- Responsive rule: Show BottomNavbar when route starts with `/webapp`, `/cart`, etc.

---

## 6. API Integration & Backend Communication

### Backend Configuration

**File**: `src/libs/utils/config.ts`

```tsx
// Environment-based backend URL selection
export const config = {
  backend_url: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
};
```

### Authentication Flow

**Token Management**
```tsx
// Storage pattern - stored as JSON string
const token = JSON.parse(localStorage.getItem("token"));

// On login
localStorage.setItem("token", JSON.stringify(tokenValue));

// On logout
localStorage.removeItem("token");
```

### API Endpoints & Operations

#### **Authentication Endpoints**

```tsx
// Login
POST /login
Body: { email, password }

// Logout (client-side only)
// Token removed from localStorage
```

#### **Address Management**

```tsx
// Add new address
POST /addAddress
Body: { token, address }

// Edit existing address
PATCH /editAddress
Body: { token, index, updatedAddress }

// Delete address
POST /deleteAddress
Body: { token, index }
```

#### **Wishlist Operations**

```tsx
// Get user's wishlist
POST /getWishlist
Body: { token }

// Toggle wishlist item
POST /togglewish
Body: { token, productId }
```

### Error Handling & User Feedback

All API operations trigger toast notifications:

```tsx
// Success
showToast("Address saved successfully!", "success");

// Error
showToast(res.data.message || "Failed to save address", "error");
```

---

## 7. Context & State Management

### 1. CartContext
**Purpose**: Global shopping cart state and operations  
**Location**: `src/components/core/Cart/CartContext.js`

```tsx
// Available methods
{
  cartItems: [],
  addToCart(item),
  incrementQuantity(item),
  decreaseQuantity(item),
  removeFromCart(item),
  clearCart(),
  updateQuantity(item, newQty)
}
```

### 2. AuthContext
**Purpose**: User authentication and account operations  
**Location**: `src/libs/context/AuthContext.js`

```tsx
// Available methods
{
  isAuthenticated: boolean,
  login(token),
  logout(),
  updateAddress(address),
  editAddress_context(index, address),
  deleteAddress_context(index),
  Get_Wishlist(),
  Toggle_wishlist(product_id),
  extractAddress(data),
}
```

### 3. ToastContext
**Purpose**: Global notification/toast message system

```tsx
const { showToast } = useToast();
showToast("Message", "success" | "error" | "warning" | "info");
```

### 4. LoginModalContext
**Purpose**: Control login modal visibility across app

```tsx
const { isModalOpen, toggleModal } = useLoginModal();
```

---

## 8. Component Architecture

### Variant Pattern
Components use a `variant` prop to adapt behavior:

```tsx
interface ComponentProps {
  variant?: "full" | "preview" | "compact";
}

// Usage
<CartComponent variant="full" />      // Page display
<CartComponent variant="preview" />   // Sidebar display
```

---

## 9. File Structure & Organization

```
src/
├── app/
│   ├── layout.tsx                    # Root layout with context providers
│   ├── globals.css                   # Global styles and utilities
│   ├── page.tsx                      # Home page
│   ├── cart/
│   │   └── page.jsx                  # Cart page
│   ├── checkout/
│   │   └── page.jsx                  # Checkout flow
│   ├── ordershistory/
│   │   └── page.tsx                  # Order history
│   ├── profile/
│   │   └── page.tsx                  # User profile
│   ├── saved-address/
│   │   └── page.tsx                  # Address management
│   └── ...other routes
│
├── components/
│   ├── core/
│   │   └── Cart/
│   │       └── CartContext.js
│   └── general-components/
│       ├── CartComponent.tsx
│       ├── Header.tsx
│       ├── ShoppingHeader.tsx
│       ├── BottomNavbar.tsx
│       └── ...other components
│
└── libs/
    ├── context/
    │   ├── AuthContext.js
    │   ├── ToastContext.js
    │   └── LoginModalContext.js
    ├── utils/
    │   └── config.ts
    └── data/
        └── products.json
```

---

## 10. Key Components

### CartComponent.tsx
**Purpose**: Universal cart display  
**Props**: `variant?: "full" | "preview"`

### ordershistory/page.tsx
**Purpose**: Display order history with filtering and reorder

### ShoppingHeader.tsx
**Purpose**: Adaptive navigation header for authenticated users

---

## 11. Development Guidelines

### Code Style
1. Use `.tsx` for components with JSX
2. Use `.ts` for utilities and configs
3. Use `.jsx`/`.js` for context providers

### Naming Conventions
```tsx
// Components: PascalCase
export default function CartComponent() { }

// Functions: camelCase
const handleSubmit = () => { }

// Constants: UPPER_SNAKE_CASE
const MAX_ITEMS = 100;
```

### Tailwind Best Practices
1. Mobile-first approach (base is mobile, enhance with `sm:`)
2. Consistent spacing scale (p-2, p-3, p-4)
3. Named color tokens (no arbitrary colors)
4. Use `rounded-md` as standard border radius

---

## 12. Responsive Design Patterns

### Common Patterns

**Full Width → Contained**
```tsx
<div className="px-4 sm:max-w-4xl sm:mx-auto">
  Content
</div>
```

**Stack → Row**
```tsx
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

**Grid Columns**
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
  {items}
</div>
```

---

## 13. Summary

### Key Takeaways

**Architecture**:
✅ Mobile-first responsive design with `sm:` breakpoint  
✅ Context API for global state (Cart, Auth, Toast)  
✅ Variant pattern for reusable components  
✅ Conditional rendering for mobile/desktop differences  

**Styling**:
✅ Tailwind CSS with consistent spacing and colors  
✅ Green as primary brand color  
✅ Gray for neutral elements  
✅ Status-specific color coding  
✅ Rounded borders with `rounded-md` standard  

**Development**:
✅ Next.js 15 App Router with TypeScript  
✅ Multiple icon libraries  
✅ Token-based authentication  
✅ Axios for HTTP requests  
✅ Performance optimized  

---

**End of Documentation**
