import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";

interface Receipt {

    receipt_id: number;

    ticket_id: number;

    received_by: string;

    received_date: string;

    received_status: string;

    remarks: string;

}

function Receipt() {

    const [receipts, setReceipts] = useState<Receipt[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadReceipts();

    }, []);

    const loadReceipts = async () => {

        try {

            const response = await API.get("/receipt");

            setReceipts(response.data);

        } catch (error) {

            console.error("Receipt Error:", error);

        } finally {

            setLoading(false);

        }

    };

    if (loading) return <Loader />;

    return (

        <div>

            <div className="page-header">

                <h1>Canteen Receipt</h1>

                <button
                    className="btn"
                    onClick={loadReceipts}
                >
                    Refresh
                </button>

            </div>

            <table className="inventory-table">

                <thead>

                    <tr>

                        <th>Receipt ID</th>

                        <th>Ticket ID</th>

                        <th>Received By</th>

                        <th>Received Date</th>

                        <th>Status</th>

                        <th>Remarks</th>

                    </tr>

                </thead>

                <tbody>

                    {receipts.map((receipt) => (

                        <tr key={receipt.receipt_id}>

                            <td>{receipt.receipt_id}</td>

                            <td>{receipt.ticket_id}</td>

                            <td>{receipt.received_by}</td>

                            <td>{receipt.received_date}</td>

                            <td>

                                <span
                                    className={
                                        receipt.received_status === "Received"
                                            ? "status-ok"
                                            : "status-low"
                                    }
                                >
                                    {receipt.received_status}
                                </span>

                            </td>

                            <td>{receipt.remarks}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default Receipt;