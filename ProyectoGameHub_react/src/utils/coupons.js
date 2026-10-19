export const COUPONS = [
    { code: "GAMER10", percentage: 10, cap: 50000, startDate: "2026-01-01", endDate: "2026-12-31" },
    { code: "BIENVENIDO15", percentage: 15, cap: 80000, startDate: "2026-01-01", endDate: "2026-08-01" },
];

export function validateCoupon(code) {
    const coupon = COUPONS.find((item) => item.code.toUpperCase() === code.toUpperCase());

    if (!coupon) {
        return { valid: false, reason: "Ese código de cupón no existe.", coupon: null };
    }

    const today = new Date().toISOString().slice(0, 10);
    if (today < coupon.startDate || today > coupon.endDate) {
        return { valid: false, reason: "Ese cupón está vencido o aún no está vigente.", coupon: null };
    }

    return { valid: true, reason: "", coupon };
}
