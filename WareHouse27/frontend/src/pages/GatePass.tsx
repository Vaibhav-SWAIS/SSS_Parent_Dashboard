import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";

interface GatePass {

    gate_pass_id:number;

    gate_pass_number:string;

    ticket_id:number;

    vehicle_number:string;

    driver_name:string;

    security_name:string;

    dispatch_time:string;

    status:string;

}

function GatePass(){

    const [gatePasses,setGatePasses]=useState<GatePass[]>([]);

    const [loading,setLoading]=useState(true);

    useEffect(()=>{

        loadGatePasses();

    },[]);

    const loadGatePasses=async()=>{

        try{

            const res=await API.get("/gate-pass");

            setGatePasses(res.data);

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

                <h1>Gate Pass</h1>

                <button
                    className="btn"
                    onClick={loadGatePasses}
                >
                    Refresh
                </button>

            </div>

            <table className="inventory-table">

                <thead>

                    <tr>

                        <th>Gate Pass No</th>

                        <th>Ticket ID</th>

                        <th>Vehicle No</th>

                        <th>Driver</th>

                        <th>Security</th>

                        <th>Dispatch Time</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    {gatePasses.map(g=>(
                        <tr key={g.gate_pass_id}>

                            <td>{g.gate_pass_number}</td>

                            <td>{g.ticket_id}</td>

                            <td>{g.vehicle_number}</td>

                            <td>{g.driver_name}</td>

                            <td>{g.security_name}</td>

                            <td>{g.dispatch_time}</td>

                            <td>

                                <span
                                    className={
                                        g.status==="Verified"
                                        ? "status-ok"
                                        : "status-low"
                                    }
                                >
                                    {g.status}
                                </span>

                            </td>

                        </tr>
                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default GatePass;