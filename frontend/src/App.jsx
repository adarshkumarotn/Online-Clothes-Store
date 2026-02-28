// Root app component: defines route structure for customer and admin sections.

import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import AdminHeader from './components/layout/AdminHeader';
import AdminSidebar from './components/layout/AdminSidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/customer/HomePage';
import ProductListPage from './pages/customer/ProductListPage';
import ProductDetailsPage from './pages/customer/ProductDetailsPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import ProfilePage from './pages/customer/ProfilePage';
import OrderSuccessPage from './pages/customer/OrderSuccessPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageProductsPage from './pages/admin/ManageProductsPage';
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage';
import ManageOrdersPage from './pages/admin/ManageOrdersPage';
import ManageCustomersPage from './pages/admin/ManageCustomersPage';
import ReportsPage from './pages/admin/ReportsPage';

function CustomerLayout() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}

function AdminAuthLayout() {
  return (
    <>
      <AdminHeader />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route element={<AdminAuthLayout />}>
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<ManageProductsPage />} />
        <Route path="categories" element={<ManageCategoriesPage />} />
        <Route path="orders" element={<ManageOrdersPage />} />
        <Route path="customers" element={<ManageCustomersPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}

export default App;


