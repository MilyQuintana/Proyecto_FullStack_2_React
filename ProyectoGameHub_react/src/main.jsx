import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { ReviewsProvider } from "./context/ReviewsContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <CartProvider>
                <ReviewsProvider>
                    <App />
                </ReviewsProvider>
            </CartProvider>
        </BrowserRouter>
    </React.StrictMode>
);