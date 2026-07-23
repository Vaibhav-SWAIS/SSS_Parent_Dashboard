import { Link } from "react-router-dom";

interface ProductCardProps {
  product_id: number;
  product_name: string;
  category: string;
  sku_code: string;
  weight: number;
}

function ProductCard({
  product_id,
  product_name,
  category,
  sku_code,
  weight,
}: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-body">
        <h3>{product_name}</h3>

        <p><strong>SKU:</strong> {sku_code}</p>

        <p><strong>Category:</strong> {category}</p>

        <p><strong>Weight:</strong> {weight} Kg</p>

        <Link to={`/products/${product_id}`} className="btn">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;