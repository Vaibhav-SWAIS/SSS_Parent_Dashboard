import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";

interface Ledger {

    ledger_id: number;

    product_id: number;

    opening_stock: number;

    received_qty: number;

    consumed_qty: number;

    closing_stock: number;

    transaction_date: string;

}

function CanteenLedger() {

    const [ledger, setLedger] = useState<Ledger[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadLedger();

    }, []);

    const loadLedger = async () => {

        try {

            const response = await API.get("/canteen-ledger");

            setLedger(response.data);

        }
        catch (error) {

            console.error(error);

        }
        finally {

            setLoading(false);

        }

    };

    if (loading) return <Loader />;

    return (

        <div>

            <div className="page-header">

                <h1>Canteen Stock Ledger</h1>

                <button
                    className="btn"
                    onClick={loadLedger}
                >
                    Refresh
                </button>

            </div>

            <table className="inventory-table">

                <thead>

                    <tr>

                        <th>Ledger ID</th>

                        <th>Product ID</th>

                        <th>Opening Stock</th>

                        <th>Received</th>

                        <th>Consumed</th>

                        <th>Closing Stock</th>

                        <th>Date</th>

                    </tr>

                </thead>

                <tbody>

                    {ledger.map((item) => (

                        <tr key={item.ledger_id}>

                            <td>{item.ledger_id}</td>

                            <td>{item.product_id}</td>

                            <td>{item.opening_stock}</td>

                            <td>{item.received_qty}</td>

                            <td>{item.consumed_qty}</td>

                            <td>{item.closing_stock}</td>

                            <td>{item.transaction_date}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default CanteenLedger;