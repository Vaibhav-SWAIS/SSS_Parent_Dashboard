import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import Loader from "../components/Loader";

interface Product {
  product_id: number;
  sku_code: string;
  product_name: string;
  category: string;
  unit: string;
  brand: string;
  price: number;
  weight: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
}

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);

    try {
      const response = await API.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Product API Error:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return <h2>Product not found.</h2>;
  }

  return (
    <div className="product-details">
      <div className="product-info">

        <h1>{product.product_name}</h1>

        <table>
          <tbody>
            <tr>
              <td><strong>SKU</strong></td>
              <td>{product.sku_code}</td>
            </tr>

            <tr>
              <td><strong>Category</strong></td>
              <td>{product.category}</td>
            </tr>

            <tr>
              <td><strong>Brand</strong></td>
              <td>{product.brand || "-"}</td>
            </tr>

            <tr>
              <td><strong>Unit</strong></td>
              <td>{product.unit || "-"}</td>
            </tr>

            <tr>
              <td><strong>Price</strong></td>
              <td>{product.price ? `₹ ${product.price}` : "-"}</td>
            </tr>

            <tr>
              <td><strong>Weight</strong></td>
              <td>{product.weight} Kg</td>
            </tr>

            <tr>
              <td><strong>Length</strong></td>
              <td>{product.length_cm} cm</td>
            </tr>

            <tr>
              <td><strong>Width</strong></td>
              <td>{product.width_cm} cm</td>
            </tr>

            <tr>
              <td><strong>Height</strong></td>
              <td>{product.height_cm} cm</td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default ProductDetails;