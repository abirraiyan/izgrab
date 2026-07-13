import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartDrawer } from "@/components/cart-drawer";
import { Toaster } from "@/components/ui/sonner";

// Styles
import "./styles.css";

import { Suspense, lazy } from "react";

// Public Pages (lazy)
const Home = lazy(() => import("./routes/index"));
const About = lazy(() => import("./routes/about"));
const Contact = lazy(() => import("./routes/contact"));
const Shop = lazy(() => import("./routes/shop"));
const Checkout = lazy(() => import("./routes/checkout"));
const CustomCake = lazy(() => import("./routes/custom-cake"));
const ProductPage = lazy(() => import("./routes/product.$slug"));

// Admin Dashboard (lazy)
const AdminShell = lazy(() => import("./routes/admin"));
const AdminIndex = lazy(() => import("./routes/admin.index"));
const AdminProducts = lazy(() => import("./routes/admin.products"));
const AdminCategories = lazy(() => import("./routes/admin.categories"));
const AdminBanners = lazy(() => import("./routes/admin.banners"));
const AdminOrders = lazy(() => import("./routes/admin.orders"));
const AdminSettings = lazy(() => import("./routes/admin.settings"));
const AdminLogin = lazy(() => import("./routes/admin.login"));
const AdminMedia = lazy(() => import("./routes/admin.media"));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center bg-background text-cocoa">
            <div className="w-8 h-8 border-4 border-blush border-t-cocoa rounded-full animate-spin" />
            <p className="text-xs font-serif mt-4 tracking-widest uppercase">IZ Patisserie</p>
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/custom-cake" element={<CustomCake />} />
          <Route path="/product/:slug" element={<ProductPage />} />

          {/* Admin Area */}
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<AdminIndex />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="login" element={<AdminLogin />} />
          </Route>

          {/* Fallback Redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Global Elements */}
      <CartDrawer />
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  </React.StrictMode>,
);
