import { useState } from "react";

interface ProductImage {
    image_id: number;
    image_url: string;
    display_order: number;
    is_primary: boolean;
}

interface ProductGalleryProps {
    images: ProductImage[];
}

function ProductGallery({ images }: ProductGalleryProps) {

    const defaultImage =
        "https://via.placeholder.com/600x400?text=No+Image";

    const [selectedImage, setSelectedImage] = useState(
        images.length > 0 ? images[0].image_url : defaultImage
    );

    return (

        <div className="gallery">

            <div className="gallery-main">

                <img
                    src={selectedImage}
                    alt="Product"
                    className="gallery-main-image"
                />

            </div>

            <div className="gallery-thumbnails">

                {images.map((img) => (

                    <img
                        key={img.image_id}
                        src={img.image_url}
                        alt="Thumbnail"
                        className={`gallery-thumb ${
                            selectedImage === img.image_url
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setSelectedImage(img.image_url)
                        }
                    />

                ))}

            </div>

        </div>

    );

}

export default ProductGallery;