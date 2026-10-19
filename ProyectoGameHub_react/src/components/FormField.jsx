export function controlClass(error, base = "form-control") {
    return error ? `${base} is-invalid` : base;
}

export default function FormField({ id, label, error, help, children }) {
    return (
        <div className="mb-3">
            <label htmlFor={id} className="form-label">{label}</label>
            {children}
            {help && (
                <div id={`${id}-help`} className="form-text">
                    {help}
                </div>
            )}
            <div id={`${id}-error`} className="invalid-feedback d-block" role="alert">
                {error}
            </div>
        </div>
    );
}
