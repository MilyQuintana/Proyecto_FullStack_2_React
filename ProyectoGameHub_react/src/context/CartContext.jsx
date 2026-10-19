import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "../data/catalog";
import { getFinalPrice } from "../utils/format";
import { readStorage, writeStorage, removeStorage } from "../utils/storage";
import { validateCoupon } from "../utils/coupons";

const CART_KEY = "gamehub_carrito";
const COUPON_KEY = "gamehub_cupon";
const ORDERS_KEY = "gamehub_ordenes";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [lines, setLines] = useState(() => readStorage(CART_KEY, []));
    const [couponCode, setCouponCode] = useState(() => readStorage(COUPON_KEY, null)?.codigo ?? null);
    const [orders, setOrders] = useState(() => readStorage(ORDERS_KEY, []));

    useEffect(() => writeStorage(CART_KEY, lines), [lines]);
    useEffect(() => {
        if (couponCode) writeStorage(COUPON_KEY, { codigo: couponCode });
        else removeStorage(COUPON_KEY);
    }, [couponCode]);
    useEffect(() => writeStorage(ORDERS_KEY, orders), [orders]);

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

    const removeCoupon = useCallback(() => setCouponCode(null), []);

    const clearCart = useCallback(() => {
        setLines([]);
        setCouponCode(null);
    }, []);

    const applyCoupon = useCallback((code) => {
        const result = validateCoupon(code);
        if (result.valid) setCouponCode(result.coupon.code);
        return result;
    }, []);

    const addOrder = useCallback((order) => setOrders((current) => [order, ...current]), []);

    const updateOrder = useCallback((orderNumber, changes) => {
        setOrders((current) => current.map((order) => (order.numero === orderNumber ? { ...order, ...changes } : order)));
    }, []);

    const totals = useMemo(() => {
        const detailedLines = lines
            .map((line) => {
                const product = PRODUCTS.find((item) => item.id === line.idProducto);
                if (!product) return null;
                const unitPrice = getFinalPrice(product);
                return { product, quantity: line.cantidad, unitPrice, subtotal: unitPrice * line.cantidad };
            })
            .filter(Boolean);

        const subtotal = detailedLines.reduce((sum, line) => sum + line.subtotal, 0);

        let discount = 0;
        if (couponCode) {
            const result = validateCoupon(couponCode);
            if (result.valid) {
                discount = Math.min(subtotal * (result.coupon.percentage / 100), result.coupon.cap);
            }
        }

        return { detailedLines, subtotal, discount, total: Math.max(subtotal - discount, 0) };
    }, [lines, couponCode]);

    const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.cantidad, 0), [lines]);

    const value = {
        ...totals,
        itemCount,
        couponCode,
        orders,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        addOrder,
        updateOrder,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used inside CartProvider");
    return context;
}
