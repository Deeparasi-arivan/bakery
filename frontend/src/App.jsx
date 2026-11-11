import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import OwnerLayout from './layouts/OwnerLayout';

// Customer Pages
import CustomerHome from './pages/customer/CustomerHome';
import CustomerProducts from './pages/customer/CustomerProducts';
import CustomerProductDetail from './pages/customer/CustomerProductDetail';
import CustomerCart from './pages/customer/CustomerCart';
import CustomerCheckout from './pages/customer/CustomerCheckout';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerLogin from './pages/customer/CustomerLogin';
import BulkOrderInquiry from './pages/customer/BulkOrderInquiry';

// Owner Pages
import OwnerLogin from './pages/owner/OwnerLogin';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ProductManagement from './pages/owner/ProductManagement';
import StockManagement from './pages/owner/StockManagement';
import SalesManagement from './pages/owner/SalesManagement';
import ExpenseManagement from './pages/owner/ExpenseManagement';
import OrderManagement from './pages/owner/OrderManagement';
import BulkOrderManagement from './pages/owner/BulkOrderManagement';
import ShopRegistration from './pages/owner/ShopRegistration';

function App() {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<CustomerHome />} />
        <Route path="products" element={<CustomerProducts />} />
        <Route path="products/:id" element={<CustomerProductDetail />} />
        <Route path="cart" element={<CustomerCart />} />
        <Route path="checkout" element={<CustomerCheckout />} />
        <Route path="my-orders" element={<CustomerOrders />} />
        <Route path="my-profile" element={<CustomerProfile />} />
        <Route path="customer/login" element={<CustomerLogin />} />
        <Route path="login" element={<Navigate to="/customer/login" replace />} />
        <Route path="bulk-order-inquiry" element={<BulkOrderInquiry />} />
      </Route>

      {/* Owner Login (Standalone) */}
      <Route path="/owner/login" element={<OwnerLogin />} />

      {/* Owner Admin Protected Routes */}
      <Route path="/owner" element={<OwnerLayout />}>
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="stock" element={<StockManagement />} />
        <Route path="sales" element={<SalesManagement />} />
        <Route path="expenses" element={<ExpenseManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="bulk-orders" element={<BulkOrderManagement />} />
        <Route path="shop-register" element={<ShopRegistration />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
