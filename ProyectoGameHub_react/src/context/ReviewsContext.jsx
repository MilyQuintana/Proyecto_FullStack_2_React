import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { PRODUCTS } from "../data/catalog";
import { readStorage, writeStorage } from "../utils/storage";

const REVIEWS_KEY = "gamehub_resenas";

const ReviewsContext = createContext(null);

export function ReviewsProvider({ children }) {
    const [userReviews, setUserReviews] = useState(() => readStorage(REVIEWS_KEY, {}));

    useEffect(() => writeStorage(REVIEWS_KEY, userReviews), [userReviews]);

    const addReview = useCallback((productId, review) => {
        setUserReviews((current) => ({ ...current, [productId]: [...(current[productId] ?? []), review] }));
    }, []);

    const getReviews = useCallback(
        (productId) => {
            const product = PRODUCTS.find((item) => item.id === productId);
            return [...(product?.reviews ?? []), ...(userReviews[productId] ?? [])];
        },
        [userReviews]
    );

    return <ReviewsContext.Provider value={{ addReview, getReviews }}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
    const context = useContext(ReviewsContext);
    if (!context) throw new Error("useReviews must be used inside ReviewsProvider");
    return context;
}
