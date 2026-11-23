import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import CartPage from "./pages/CartPage";
import CatalogPage from "./pages/CatalogPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useAuth } from "./context/AuthContext";
import InventoryPage from "./pages/InventoryPage";

function ProtectedRoute({ children }) {
    const { token } = useAuth();
    const location = useLocation();
    return token ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
function AdminRoute({ children }) {
    const { rol } = useAuth();
    return rol === "ADMINISTRADOR" ? children : <Navigate to="/" replace />;
}

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="catalogo" element={<CatalogPage />} />
                <Route path="producto/:id" element={<ProductDetailPage />} />
                <Route path="carrito" element={<CartPage />} />
                <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="ordenes" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="inventario" element={<AdminRoute><InventoryPage /></AdminRoute>} />
                <Route path="login" element={<LoginPage />} />
                <Route path="registro" element={<RegisterPage />} />
                <Route path="*" element={<HomePage />} />
            </Route>
        </Routes>
    );
}
