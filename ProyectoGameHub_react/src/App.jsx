import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CartPage from "./pages/CartPage";
import CatalogPage from "./pages/CatalogPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="catalogo" element={<CatalogPage />} />
                <Route path="producto/:id" element={<ProductDetailPage />} />
                <Route path="carrito" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="ordenes" element={<OrdersPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="registro" element={<RegisterPage />} />
                <Route path="*" element={<HomePage />} />
            </Route>
        </Routes>
    );
}
