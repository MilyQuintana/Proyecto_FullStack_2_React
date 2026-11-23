import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ReviewsProvider } from "./context/ReviewsContext";
import { CatalogProvider } from "./context/CatalogContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <CatalogProvider>
                    <CartProvider>
                        <ReviewsProvider>
                            <App />
                        </ReviewsProvider>
                    </CartProvider>
                </CatalogProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
