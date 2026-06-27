import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartDrawer } from "@/components/cart-drawer";
import { Toaster } from "@/components/ui/sonner";

// Styles
import "./styles.css";

// Public Pages
import Home from "./routes/index";
import About from "./routes/about";
import Contact from "./routes/contact";
import Shop from "./routes/shop";
import Checkout from "./routes/checkout";
import CustomCake from "./routes/custom-cake";
import ProductPage from "./routes/product.$slug";

// Admin Dashboard
import AdminShell from "./routes/admin";
import AdminIndex from "./routes/admin.index";
import AdminProducts from "./routes/admin.products";
import AdminBanners from "./routes/admin.banners";
import AdminOrders from "./routes/admin.orders";
import AdminSettings from "./routes/admin.settings";
import AdminLogin from "./routes/admin.login";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
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
          <Route path="banners" element={<AdminBanners />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="login" element={<AdminLogin />} />
        </Route>

        {/* Fallback Redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Elements */}
      <CartDrawer />
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  </React.StrictMode>,
);
