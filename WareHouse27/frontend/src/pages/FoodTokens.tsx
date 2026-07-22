import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";

interface FoodToken {

    token_id:number;

    canteen_name:string;

    token_date:string;

    breakfast_tokens:number;

    lunch_tokens:number;

    dinner_tokens:number;

    total_tokens:number;

}

function FoodTokens(){

    const [tokens,setTokens]=useState<FoodToken[]>([]);

    const [loading,setLoading]=useState(true);

    useEffect(()=>{

        loadTokens();

    },[]);

    const loadTokens=async()=>{

        try{

            const res=await API.get("/food-token");

            setTokens(res.data);

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

                <h1>Food Token Integration</h1>

                <button
                    className="btn"
                    onClick={loadTokens}
                >
                    Refresh
                </button>

            </div>

            <table className="inventory-table">

                <thead>

                    <tr>

                        <th>Canteen</th>

                        <th>Date</th>

                        <th>Breakfast</th>

                        <th>Lunch</th>

                        <th>Dinner</th>

                        <th>Total Tokens</th>

                    </tr>

                </thead>

                <tbody>

                    {tokens.map(token=>(

                        <tr key={token.token_id}>

                            <td>{token.canteen_name}</td>

                            <td>{token.token_date}</td>

                            <td>{token.breakfast_tokens}</td>

                            <td>{token.lunch_tokens}</td>

                            <td>{token.dinner_tokens}</td>

                            <td>

                                <b>{token.total_tokens}</b>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}

export default FoodTokens;