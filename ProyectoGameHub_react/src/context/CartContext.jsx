import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useCatalog } from "./CatalogContext";
import { useAuth } from "./AuthContext";
import { getFinalPrice } from "../utils/format";
import { readStorage, writeStorage } from "../utils/storage";
import { gamehubApi } from "../services/gamehubApi";

const GUEST_CART_KEY = "gamehub_carrito_invitado";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { products } = useCatalog();
    const { session } = useAuth();
    const { token } = useAuth();
    const cartKey = session?.id ? `gamehub_carrito_usuario_${session.id}` : GUEST_CART_KEY;
    const [lines, setLines] = useState(() => readStorage(GUEST_CART_KEY, []));
    const [loadedCartKey, setLoadedCartKey] = useState(null);
    const [couponInfo, setCouponInfo] = useState(null);

    // Al cambiar de sesión, carga el carrito correspondiente antes de permitir guardados.
    // Así el carrito de una cuenta no sobrescribe el de otra.
    useEffect(() => {
        setLoadedCartKey(null);
        setLines(readStorage(cartKey, []));
        setLoadedCartKey(cartKey);
    }, [cartKey]);
    useEffect(() => {
        if (loadedCartKey === cartKey) writeStorage(cartKey, lines);
    }, [cartKey, lines, loadedCartKey]);

    const addToCart = useCallback((productId, quantity) => {
        setLines((current) => {
            const existing = current.find((line) => line.idProducto === productId);
            if (existing) {
                return current.map((line) =>
                    line.idProducto === productId ? { ...line, cantidad: line.cantidad + quantity } : line
                );
            }
            return [...current, { idProducto: productId, cantidad: quantity }];
        });
    }, []);

    const updateQuantity = useCallback((productId, quantity) => {
        setLines((current) =>
            quantity <= 0
                ? current.filter((line) => line.idProducto !== productId)
                : current.map((line) => (line.idProducto === productId ? { ...line, cantidad: quantity } : line))
        );
    }, []);

    const removeFromCart = useCallback((productId) => {
        setLines((current) => current.filter((line) => line.idProducto !== productId));
    }, []);

    const clearCart = useCallback(() => {
        setLines([]);
    }, []);

    const applyCoupon = useCallback(async (code) => {
        if (!token) return { valid: false, reason: "Inicia sesión para aplicar un cupón." };
        try {
            const nextCoupon = await gamehubApi.validarCupon(code, token);
            setCouponInfo(nextCoupon);
            return { valid: true, coupon: nextCoupon };
        } catch (cause) {
            setCouponInfo(null);
            return { valid: false, reason: cause.message || "Cupón no válido." };
        }
    }, [token]);

    const removeCoupon = useCallback(() => setCouponInfo(null), []);

    const totals = useMemo(() => {
        const detailedLines = lines
            .map((line) => {
                const product = products.find((item) => item.id === line.idProducto);
                if (!product) return null;
                const unitPrice = getFinalPrice(product);
                return { product, quantity: line.cantidad, unitPrice, subtotal: unitPrice * line.cantidad };
            })
            .filter(Boolean);

        const subtotal = detailedLines.reduce((sum, line) => sum + line.subtotal, 0);

        const discount = couponInfo
            ? Math.min(subtotal * couponInfo.porcentaje / 100, couponInfo.tope ?? Infinity)
            : 0;
        return { detailedLines, subtotal, discount, total: Math.max(subtotal - discount, 0) };
    }, [lines, products, couponInfo]);

    const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.cantidad, 0), [lines]);

    const value = {
        ...totals,
        itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        couponCode: couponInfo?.codigo ?? "",
        couponInfo,
        applyCoupon,
        removeCoupon,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used inside CartProvider");
    return context;
}
