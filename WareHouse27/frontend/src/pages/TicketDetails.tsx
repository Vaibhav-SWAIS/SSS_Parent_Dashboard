import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import Loader from "../components/Loader";

interface Ticket {

    ticket_id:number;

    ticket_number:string;

    canteen_name:string;

    request_date:string;

    required_date:string;

    requested_by:string;

    approved_by:string;

    status:string;

    remarks:string;
}

interface Item{

    item_id:number;

    product_id:number;

    requested_qty:number;

    approved_qty:number;

    issued_qty:number;
}

function TicketDetails(){

    const { id } = useParams();

    const [ticket,setTicket]=useState<Ticket|null>(null);

    const [items,setItems]=useState<Item[]>([]);

    const [loading,setLoading]=useState(true);

    useEffect(()=>{

        loadData();

    },[id]);

    const loadData=async()=>{

        try{

            const ticketRes=await API.get(
                `/replenishment-ticket/${id}`
            );

            const itemRes=await API.get(
                `/replenishment-items/${id}`
            );

            setTicket(ticketRes.data);

            setItems(itemRes.data);

        }
        catch(err){

            console.log(err);

        }
        finally{

            setLoading(false);

        }

    };

    if(loading) return <Loader/>;

    if(!ticket) return <h2>Ticket Not Found</h2>;

    return(

        <div>

            <div className="page-header">

                <h1>{ticket.ticket_number}</h1>

            </div>

            <div className="ticket-card">

                <p><b>Canteen :</b> {ticket.canteen_name}</p>

                <p><b>Request Date :</b> {ticket.request_date}</p>

                <p><b>Required Date :</b> {ticket.required_date}</p>

                <p><b>Requested By :</b> {ticket.requested_by}</p>

                <p><b>Approved By :</b> {ticket.approved_by}</p>

                <p><b>Status :</b> {ticket.status}</p>

                <p><b>Remarks :</b> {ticket.remarks}</p>

            </div>

            <h2>Requested Items</h2>

            <table className="inventory-table">

                <thead>

                    <tr>

                        <th>Product ID</th>

                        <th>Requested Qty</th>

                        <th>Approved Qty</th>

                        <th>Issued Qty</th>

                    </tr>

                </thead>

                <tbody>

                    {items.map(item=>(

                        <tr key={item.item_id}>

                            <td>{item.product_id}</td>

                            <td>{item.requested_qty}</td>

                            <td>{item.approved_qty}</td>

                            <td>{item.issued_qty}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default TicketDetails;