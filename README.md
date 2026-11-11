# 🎂 Bakery & Cake Shop Management System (MERN Stack)

A complete, production-ready, and responsive Bakery and Cake Shop Management System built using the **MERN** stack (MongoDB, Express.js, React.js with Vite, and Node.js), styled with Bootstrap 5 and custom bakery-themed CSS.

---

## 🌟 Technology Stack

- **Frontend:** React.js (v18) + Vite
- **Styling:** Bootstrap 5, Bootstrap Icons & Custom Bakery Palette (Cream, Chocolate, Caramel, Pastel Rose)
- **Backend:** Node.js + Express.js REST API
- **Database:** MongoDB + Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs + Passwordless SMS OTP for Customers
- **File Uploads:** Multer (multipart form handling for cakes, logos, documents)
- **Online Payment:** Razorpay API Integration with backend HMAC-SHA256 signature verification + Cash on Delivery (COD)
- **State Management:** React Context API (`AuthContext`, `CartContext`, `ToastContext`)

---

## 📂 Project Structure

```text
bakery-management/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── OwnerSidebar.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   └── ToastAlert.jsx
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   │   ├── CustomerHome.jsx
│   │   │   │   ├── CustomerProducts.jsx
│   │   │   │   ├── CustomerProductDetail.jsx
│   │   │   │   ├── CustomerCart.jsx
│   │   │   │   ├── CustomerCheckout.jsx
│   │   │   │   ├── CustomerOrders.jsx
│   │   │   │   ├── CustomerProfile.jsx
│   │   │   │   ├── CustomerLogin.jsx
│   │   │   │   └── BulkOrderInquiry.jsx
│   │   │   └── owner/
│   │   │       ├── OwnerLogin.jsx
│   │   │       ├── ShopRegistration.jsx
│   │   │       ├── OwnerDashboard.jsx
│   │   │       ├── ProductManagement.jsx
│   │   │       ├── StockManagement.jsx
│   │   │       ├── SalesManagement.jsx
│   │   │       ├── ExpenseManagement.jsx
│   │   │       ├── OrderManagement.jsx
│   │   │       └── BulkOrderManagement.jsx
│   │   ├── layouts/
│   │   │   ├── CustomerLayout.jsx
│   │   │   └── OwnerLayout.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   └── useToast.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── shopController.js
│   │   ├── categoryController.js
│   │   ├── productController.js
│   │   ├── stockController.js
│   │   ├── cartController.js
│   │   ├── addressController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── salesController.js
│   │   ├── expenseController.js
│   │   ├── bulkOrderController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Owner.js
│   │   ├── Shop.js
│   │   ├── Customer.js
│   │   ├── Address.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   ├── StockMovement.js
│   │   ├── Sale.js
│   │   ├── Expense.js
│   │   └── BulkOrder.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── shopRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── productRoutes.js
│   │   ├── stockRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── addressRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── salesRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── bulkOrderRoutes.js
│   │   └── dashboardRoutes.js
│   ├── services/
│   │   ├── smsService.js
│   │   └── razorpayService.js
│   ├── utils/
│   │   └── seed.js
│   ├── uploads/
│   ├── server.js
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (running locally on port 27017 or a MongoDB Atlas URI)

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env` (pre-created or copy from `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/bakery_management
   JWT_SECRET=supersecretbakeryjwtkey_2026_special_token
   JWT_EXPIRES_IN=7d
   RAZORPAY_KEY_ID=rzp_test_bakery123456
   RAZORPAY_KEY_SECRET=testsecret_bakery_signature_abc
   MOCK_OTP=123456
   CLIENT_URL=http://localhost:5173
   ```
4. Seed the database with sample products, categories, owner account, and orders:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

### 3. Frontend Setup
1. Open a separate terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The customer storefront will open at `http://localhost:5173`.*

---

## 🔑 Default Login Credentials

### 1. Owner / Admin Portal
- **URL:** [http://localhost:5173/owner/login](http://localhost:5173/owner/login)
- **Email:** `owner@bakery.com` (or Mobile: `9876543210`)
- **Password:** `password123`

### 2. Customer Portal
- **URL:** [http://localhost:5173/customer/login](http://localhost:5173/customer/login)
- **Mobile Number:** Enter any 10-digit number (e.g., `9876500001` or your personal mobile)
- **OTP:** `123456` (displayed with a one-click auto-fill button in development mode)

---

## 🍰 Key Modules & Features

### 👑 1. Owner / Admin Features
- **Dashboard:**
  - Visual summary of 9 key metrics: Total Products, Available Stock, Today's Sales, Total Sales, Total Orders, Pending Orders, Completed Orders, Total Expenses, Estimated Profit.
  - Low stock warning banner and recent orders table.
- **Product Management:**
  - Add, View, Edit, and Delete products with Multer image upload.
  - Active category management (Cake, Birthday Cake, Chocolate Cake, Black Forest Cake, Red Velvet Cake, Cupcake, Donut).
  - Availability toggle and price/quantity configuration.
- **Stock & Inventory:**
  - Real-time stock audit with quick replenishment (`+` batch bake, `-` deduction, `=` set).
  - Low stock threshold alerts.
  - Stock movement history audit trail (`IN`, `OUT`, `ADJUSTMENT`, `SALE`, `RETURN`).
- **Sales Management:**
  - Date filtering: Today, Past 7 Days, This Month, or Custom Date Range.
  - Filter by payment method (Razorpay vs COD).
  - Total revenue, average order value, and items sold calculation.
- **Expense Tracking:**
  - Record operational expenses by category (Ingredients, Packaging, Utilities, Rent, Equipment, Salaries, Marketing, Maintenance, Other).
  - Automatic deduction from sales to calculate **Estimated Profit**.
- **Order Management:**
  - Order status workflow: `Pending` → `Confirmed` → `Preparing` → `Ready` → `Out for Delivery` → `Delivered`.
  - Cancellation with automatic stock return.
  - Customer contact details, delivery address, and notes.
- **Bulk Order Management:**
  - Review wedding, birthday, and corporate party cake inquiries.
  - Update status (`Inquiry`, `Quoted`, `Confirmed`, `In Progress`, `Completed`), set estimated budget, and record advance deposit.
- **Shop Registration:**
  - Register Shop Name, Owner Name, Contact Number, Email, Street, Lane, Village, City, District, State, Pincode, Shop Logo, and FSSAI/Trade license documents.

---

### 🛒 2. Customer Features
- **Storefront Home:**
  - Hero banner with fresh bakery imagery, category highlights, and featured bakes.
  - Why Choose Us section (100% pure butter, chilled delivery, hygiene assurance).
- **Product Catalog & Filters:**
  - Filter by category pills (Cake, Birthday Cake, Chocolate Cake, Black Forest Cake, Red Velvet Cake, Cupcake, Donut).
  - Live search bar and sort by Price (Low to High, High to Low), Rating, or Name.
  - "In Stock Only" toggle.
- **Product Cards:**
  - High quality imagery, stock status badges, interactive quantity selector, **Add to Cart**, and **Buy Now**.
- **Interactive Cart:**
  - Add items, increase/decrease quantities with live stock cap enforcement, delete items, clear cart.
  - Automatic Subtotal, Free Delivery calculation over ₹500, and Grand Total.
- **Customer Address Book:**
  - Add, edit, delete, and select default delivery addresses with full street, village, taluk, district, pincode, and state details.
- **Checkout & Payment:**
  - Option 1: **Razorpay Online Payment** (UPI, Cards, Net Banking) with secure HMAC signature verification.
  - Option 2: **Cash on Delivery (COD)**.
  - Special instructions / cake writing message box.
- **Order History & Live Tracking:**
  - Visual 6-step progress stepper (`Pending` → `Confirmed` → `Preparing` → `Ready` → `Out for Delivery` → `Delivered`).
  - Order details, breakdown, and cancellation option.
- **Custom Cake & Bulk Catering Inquiries:**
  - Form for wedding cakes, multi-tiered birthday centerpieces, and corporate batches.

---

## 🔒 Security & Best Practices

- **Role-Based Access Control:** Separate JWT authorization middleware for Owner (`isOwner`) and Customer (`isCustomer`).
- **Secret Protection:** Razorpay secret keys and JWT secrets are stored exclusively in backend `.env` and never exposed to React clients.
- **Input Validation:** Mongoose schemas validate phone numbers, email regex, required fields, and non-negative amounts.
- **Inventory Safety:** Auto-decrement on order placement and auto-replenishment on cancellation.
