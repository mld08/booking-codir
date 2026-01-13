import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Dashboard from "../pages/cloud/Dashboard";
import MyDashboard from "../pages/cloud/MyDashboard";
import CloudOffer from "../pages/cloud/CloudOffer";
import Layout from "../layout/Layout";
import LayoutAdmin from "../layout/LayoutAdmin";
import ClientsList from "../pages/clients/ClientsList";
import ClientDetails from "../pages/clients/ClientDetails";
import OfferForm from "../pages/cloud/OfferForm";
import OfferDetails from "../pages/cloud/OfferDetails";
import ClientForm from "../pages/clients/ClientForm";
import AdminDashboard from "../pages/admin/AdminDashboard";
import PriceList from "../pages/cloud/PriceList";

// SOC Pages
import DashboardSOC from "../pages/soc/DashboardSOC";
import OfferListSOC from "../pages/soc/OfferListSOC";
import OfferFormSOC from "../pages/soc/OfferFormSOC";
import OfferDetailsSOC from "../pages/soc/OfferDetailsSOC";
import PriceListSOC from "../pages/soc/PriceListSOC";

import Login from "../pages/auth/Login";
import ProtectedRoute from "../components/auth/ProtectedRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Route de connexion (publique) */}
      <Route path="/login" element={<Login />} />

      {/* Page d'accueil (protégée) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Section CLOUD (protégée) */}
      <Route
        path="/cloud"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MyDashboard />} />
        <Route path="offer" element={<CloudOffer />} />
        <Route path="offer/add" element={<OfferForm />} />
        <Route path="offer/edit/:id" element={<OfferForm />} />
        <Route path="offer/:id" element={<OfferDetails />} />
        <Route path="gestion-prix" element={<PriceList />} />
      </Route>

      {/* Section SOC (protégée) */}
      <Route
        path="/soc"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardSOC />} />
        <Route path="offers" element={<OfferListSOC />} />
        <Route path="offer/add" element={<OfferFormSOC />} />
        <Route path="offer/edit/:id" element={<OfferFormSOC />} />
        <Route path="offer/:id" element={<OfferDetailsSOC />} />
        <Route path="gestion-prix" element={<PriceListSOC />} />
      </Route>

      {/* Section CLIENTS (protégée) */}
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientsList />} />
        <Route path="add" element={<ClientForm />} />
        <Route path="edit/:id" element={<ClientForm />} />
        <Route path=":id" element={<ClientDetails />} />
      </Route>

      {/* Section ADMIN (protégée) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute is_admin={true}>
            <LayoutAdmin />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}