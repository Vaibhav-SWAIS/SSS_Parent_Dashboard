import { useEffect, useState } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

interface Product {

    product_id: number;

    sku_code: string;

    product_name: string;

    category: string;

    weight: number;

    image: string | null;
}

function Products() {

    const [products, setProducts] = useState<Product[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {

        try {

            const response = await API.get("/products");

            setProducts(response.data);

        } catch (error) {

            console.error("Products Error:", error);

        } finally {

            setLoading(false);

        }

    };

    if (loading) {
        return <Loader />;
    }

    return (

        <div>

            <div className="page-header">

                <h1>Grocery Products</h1>

                <button
                    className="btn"
                    onClick={loadProducts}
                >
                    Refresh
                </button>

            </div>

            <div className="products-grid">

                {products.map((product) => (

                    <ProductCard

                        key={product.product_id}

                        product_id={product.product_id}

                        product_name={product.product_name}

                        category={product.category}

                        sku_code={product.sku_code}

                        weight={product.weight}

                        image={product.image ?? undefined}

                    />

                ))}

            </div>

        </div>

    );

}

export default Products;