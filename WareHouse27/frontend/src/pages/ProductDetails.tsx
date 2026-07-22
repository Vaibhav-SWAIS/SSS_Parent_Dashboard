import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import Loader from "../components/Loader";
import ProductGallery from "../components/ProductGallery";

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

interface ProductImage {

    image_id: number;
    image_url: string;
    display_order: number;
    is_primary: boolean;

}

function ProductDetails() {

    const { id } = useParams();

    const [product, setProduct] = useState<Product | null>(null);

    const [images, setImages] = useState<ProductImage[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadProduct();

    }, [id]);

    const loadProduct = async () => {

        try {

            const productResponse =
                await API.get(`/products/${id}`);

            const imageResponse =
                await API.get(`/products/${id}/images`);

            setProduct(productResponse.data);

            setImages(imageResponse.data);

        } catch (error) {

            console.error(error);

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

            <div>

                <ProductGallery images={images} />

            </div>

            <div className="product-info">

                <h1>{product.product_name}</h1>

                <table>

                    <tbody>

                        <tr>

                            <td>SKU</td>

                            <td>{product.sku_code}</td>

                        </tr>

                        <tr>

                            <td>Category</td>

                            <td>{product.category}</td>

                        </tr>

                        <tr>

                            <td>Brand</td>

                            <td>{product.brand}</td>

                        </tr>

                        <tr>

                            <td>Unit</td>

                            <td>{product.unit}</td>

                        </tr>

                        <tr>

                            <td>Price</td>

                            <td>₹ {product.price}</td>

                        </tr>

                        <tr>

                            <td>Weight</td>

                            <td>{product.weight} Kg</td>

                        </tr>

                        <tr>

                            <td>Length</td>

                            <td>{product.length_cm} cm</td>

                        </tr>

                        <tr>

                            <td>Width</td>

                            <td>{product.width_cm} cm</td>

                        </tr>

                        <tr>

                            <td>Height</td>

                            <td>{product.height_cm} cm</td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default ProductDetails;