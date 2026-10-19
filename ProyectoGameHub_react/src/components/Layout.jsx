import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

const NAV_ITEMS = [
    { to: "/", label: "Inicio", end: true },
    { to: "/catalogo", label: "Catálogo" },
    { to: "/carrito", label: "Carrito" },
    { to: "/checkout", label: "Checkout" },
    { to: "/ordenes", label: "Mis órdenes" },
];

function Header() {
    const { itemCount } = useCart();
    const [open, setOpen] = useState(false);

    return (
        <header>
            <nav className="navbar navbar-expand-lg border-bottom sticky-top bg-body" aria-label="Navegación principal">
                <div className="container">
                    <Link to="/" className="navbar-brand fw-bold marca">
                        Game<span>Hub</span> Store
                    </Link>
                    <Link
                        to="/carrito"
                        className="btn btn-outline-light ms-auto me-2 order-lg-last"
                        aria-label="Ver carrito de compras"
                    >
                        🛒 <span className="badge text-bg-primary">{itemCount}</span>
                    </Link>
                    <button
                        type="button"
                        className="navbar-toggler"
                        aria-controls="menu-principal"
                        aria-expanded={open}
                        aria-label="Mostrar menú de navegación"
                        onClick={() => setOpen((value) => !value)}
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div id="menu-principal" className={`collapse navbar-collapse${open ? " show" : ""}`}>
                        <ul className="navbar-nav me-auto">
                            {NAV_ITEMS.map((item) => (
                                <li key={item.to} className="nav-item">
                                    <NavLink to={item.to} end={item.end} className="nav-link" onClick={() => setOpen(false)}>
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}

function Footer() {
    return (
        <footer className="border-top mt-5 py-4 bg-body-tertiary">
            <div className="container">
                <div className="row gy-3 align-items-center">
                    <div className="col-md-5">
                        <p className="fw-bold fs-5 mb-1 marca">
                            Game<span>Hub</span> Store
                        </p>
                        <p className="mb-0 text-body-secondary">
                            Tienda gamer en línea. Mejor lugar para comprar todo tipo de productos.
                        </p>
                    </div>
                    <nav className="col-md-4" aria-label="Enlaces del pie de página">
                        <ul className="list-unstyled d-flex flex-wrap gap-3 mb-0">
                            <li><Link to="/">Inicio</Link></li>
                            <li><Link to="/catalogo">Catálogo</Link></li>
                            <li><Link to="/carrito">Carrito</Link></li>
                            <li><Link to="/checkout">Checkout</Link></li>
                        </ul>
                    </nav>
                    <p className="col-md-3 mb-0 small text-body-secondary text-md-end">
                        © 2026 GameHub Store. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default function Layout() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <>
            <Header />
            <main id="contenido-principal">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
