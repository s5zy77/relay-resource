import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AIConciergeModal } from './components/AIConciergeModal';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { MyRentalsPage } from './pages/MyRentalsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage, SignupPage, VendorSignupPage } from './pages/AuthPages';
import { useSessionStore } from './stores/sessionStore';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSessionStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const [showAIModal, setShowAIModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF9F6] selection:bg-purple-200 selection:text-purple-900">
      
      <div>
        <Navbar onOpenAI={() => setShowAIModal(true)} />
        <main className="pb-12">
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<CatalogPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/vendor/signup" element={<VendorSignupPage />} />

            {/* Protected Portal Routes */}
            <Route
              path="/portal/rentals"
              element={
                <ProtectedRoute>
                  <MyRentalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/invoices"
              element={
                <ProtectedRoute>
                  <InvoicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>

      <Footer />

      {/* Global AI Operations Concierge Modal */}
      {showAIModal && <AIConciergeModal onClose={() => setShowAIModal(false)} />}

    </div>
  );
};
