import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";

interface Picking {

    picking_id:number;

    ticket_id:number;

    picker_name:string;

    picked_date:string;

    status:string;

}

function Picking(){

    const [pickings,setPickings]=useState<Picking[]>([]);

    const [loading,setLoading]=useState(true);

    useEffect(()=>{

        loadPicking();

    },[]);

    const loadPicking=async()=>{

        try{

            const res=await API.get("/picking");

            setPickings(res.data);

        }
        catch(err){

            console.log(err);

        }
        finally{

            setLoading(false);

        }

    };

    if(loading) return <Loader/>;

    return(

        <div>

            <div className="page-header">

                <h1>Warehouse Picking</h1>

                <button
                    className="btn"
                    onClick={loadPicking}
                >
                    Refresh
                </button>

            </div>

            <table className="inventory-table">

                <thead>

                    <tr>

                        <th>Picking ID</th>

                        <th>Ticket ID</th>

                        <th>Picker</th>

                        <th>Picked Date</th>

                        <th>Status</th>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    {pickings.map(p=>(

                        <tr key={p.picking_id}>

                            <td>{p.picking_id}</td>

                            <td>{p.ticket_id}</td>

                            <td>{p.picker_name}</td>

                            <td>{p.picked_date}</td>

                            <td>

                                <span
                                    className={
                                        p.status==="Completed"
                                        ? "status-ok"
                                        : "status-low"
                                    }
                                >
                                    {p.status}
                                </span>

                            </td>

                            <td>

                                <button
                                    className="btn"
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

export default Picking;