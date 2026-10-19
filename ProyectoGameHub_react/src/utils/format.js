export function formatCLP(amount) {
    return amount.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export function getFinalPrice(product) {
    return product.discountPrice ?? product.regularPrice;
}
