import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Loader from "../components/Loader";

interface Ticket {
    ticket_id: number;
    ticket_number: string;
    canteen_name: string;
    request_date: string;
    required_date: string;
    requested_by: string;
    approved_by: string;
    status: string;
    remarks: string;
}

function ReplenishmentTicket() {

    const navigate = useNavigate();

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {

        try {

            const response = await API.get("/replenishment-ticket");

            setTickets(response.data);

        } catch (error) {

            console.error("Ticket Error:", error);

        } finally {

            setLoading(false);

        }

    };

    if (loading) return <Loader />;

    return (

        <div>

            <div className="page-header">

                <h1>Replenishment Tickets</h1>

                <button
                    className="btn"
                    onClick={loadTickets}
                >
                    Refresh
                </button>

            </div>


            <table className="inventory-table">

                <thead>

                    <tr>

                        <th>Ticket No</th>
                        <th>Canteen</th>
                        <th>Request Date</th>
                        <th>Required Date</th>
                        <th>Requested By</th>
                        <th>Approved By</th>
                        <th>Status</th>
                        <th>Action</th>

                    </tr>

                </thead>


                <tbody>

                    {tickets.map((ticket) => (

                        <tr key={ticket.ticket_id}>

                            <td>{ticket.ticket_number}</td>

                            <td>{ticket.canteen_name}</td>

                            <td>{ticket.request_date}</td>

                            <td>{ticket.required_date}</td>

                            <td>{ticket.requested_by}</td>

                            <td>{ticket.approved_by}</td>


                            <td>

                                <span
                                    className={
                                        ticket.status === "Approved"
                                            ? "status-ok"
                                            : "status-low"
                                    }
                                >
                                    {ticket.status}
                                </span>

                            </td>


                            <td>

                                <button
                                    className="btn"
                                    onClick={() =>
                                        navigate(`/tickets/${ticket.ticket_id}`)
                                    }
                                >
                                    View
                                </button>

                            </td>


                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default ReplenishmentTicket;