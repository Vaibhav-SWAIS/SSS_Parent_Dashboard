import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";

interface Inventory {
    inventory_id: number;
    product_id: number;
    location_id: number;
    quantity: number;
    reserved_quantity: number;
    available_quantity: number;
    reorder_level: number;
    last_updated: string;
}

function Inventory() {

    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {

        try {

            const response = await API.get("/inventory");

            setInventory(response.data);

        } catch (error) {

            console.error("Inventory Error:", error);

        } finally {

            setLoading(false);

        }

    };

    if (loading) return <Loader />;

    return (

        <div>

            <div className="page-header">

                <h1>Warehouse Inventory</h1>

                <button
                    className="btn"
                    onClick={loadInventory}
                >
                    Refresh
                </button>

            </div>

            <table className="inventory-table">

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Product ID</th>

                        <th>Location</th>

                        <th>Total Qty</th>

                        <th>Reserved</th>

                        <th>Available</th>

                        <th>Reorder Level</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    {inventory.map((item) => (

                        <tr key={item.inventory_id}>

                            <td>{item.inventory_id}</td>

                            <td>{item.product_id}</td>

                            <td>{item.location_id}</td>

                            <td>{item.quantity}</td>

                            <td>{item.reserved_quantity}</td>

                            <td>{item.available_quantity}</td>

                            <td>{item.reorder_level}</td>

                            <td>

                                {item.available_quantity <= item.reorder_level ? (

                                    <span className="status-low">
                                        Low Stock
                                    </span>

                                ) : (

                                    <span className="status-ok">
                                        Available
                                    </span>

                                )}

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default Inventory;