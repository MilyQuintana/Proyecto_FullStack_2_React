export function required(value, label = "Este campo") {
    return String(value ?? "").trim() === "" ? `${label} es obligatorio.` : "";
}

export function selectRequired(value, label = "Debes seleccionar una opción") {
    return String(value ?? "").trim() === "" ? `${label}.` : "";
}

export function email(value) {
    const missing = required(value, "El correo");
    if (missing) return missing;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value.trim()) ? "" : "Ingresa un correo con formato válido (ej: nombre@correo.com).";
}

export function phone(value, { min = 8, max = 15 } = {}) {
    const missing = required(value, "El teléfono");
    if (missing) return missing;
    const digits = value.replace(/[^0-9]/g, "");
    return digits.length < min || digits.length > max
        ? `El teléfono debe tener entre ${min} y ${max} dígitos numéricos.`
        : "";
}

export function phoneCL(value) {
    const missing = required(value, "El teléfono");
    if (missing) return missing;
    const digits = value.replace(/[^0-9]/g, "");
    return /^569\d{8}$/.test(digits)
        ? ""
        : "El teléfono debe tener 11 dígitos con el formato +569 seguido de 8 números (ej: +56 9 1234 5678).";
}

export function integerInRange(value, { min = null, max = null, label = "El valor" } = {}) {
    const number = Number(value);
    if (String(value).trim() === "" || Number.isNaN(number)) return `${label} debe ser un número.`;
    if (!Number.isInteger(number)) return `${label} debe ser un número entero.`;
    if (min !== null && number < min) return `${label} no puede ser menor que ${min}.`;
    if (max !== null && number > max) return `${label} no puede ser mayor que ${max}.`;
    return "";
}

export function minLength(value, min, label = "Este campo") {
    const missing = required(value, label);
    if (missing) return missing;
    return value.trim().length < min ? `${label} debe tener al menos ${min} caracteres.` : "";
}

export function rangeCoherence(minValue, maxValue, message) {
    if (String(minValue).trim() === "" || String(maxValue).trim() === "") return "";
    return Number(minValue) > Number(maxValue) ? message : "";
}

export function hasErrors(errors) {
    return Object.values(errors).some(Boolean);
}
