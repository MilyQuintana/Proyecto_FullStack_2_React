import { Link } from "react-router-dom";
import { formatCLP, getFinalPrice } from "../utils/format";

export default function ProductCard({ product }) {
    return (
        <Link className="card h-100 text-decoration-none tarjeta-producto" to={`/producto/${product.id}`}>
            <img className="card-img-top" src={product.image} alt={product.name} loading="lazy" />
            <div className="card-body">
                <h3 className="card-title h6">{product.name}</h3>
                <span className="fw-bold text-body">{formatCLP(getFinalPrice(product))}</span>
                {product.stock === 0 && <span className="badge text-bg-danger ms-2">Sin stock</span>}
            </div>
        </Link>
    );
}
