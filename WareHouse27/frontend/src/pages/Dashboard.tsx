import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";
import SummaryCard from "../components/SummaryCard";


interface DashboardData {

    total_products: number;
    total_suppliers: number;
    inventory_items: number;
    below_reorder_level: number;

    pending_recommendations: number;
    approved_purchase_orders: number;

    forecast_accuracy: number;
    alerts: number;

    total_food_tokens?: number;
    today_tickets?: number;

}



function Dashboard() {


    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {

        fetchDashboard();

    }, []);



    const fetchDashboard = async () => {


        try {


            const response = await API.get("/dashboard/kpis");


            setDashboard(response.data);



        } catch(error) {


            console.error(
                "Dashboard API Error:",
                error
            );


        } finally {


            setLoading(false);


        }


    };



    if(loading){

        return <Loader />;

    }



    if(!dashboard){

        return (

            <div>

                <h2>
                    No Dashboard Data Found
                </h2>

            </div>

        );

    }




    return (

        <div className="dashboard-container">


            <div className="page-header">


                <h1>
                    Warehouse Dashboard
                </h1>



                <button
                    className="btn"
                    onClick={fetchDashboard}
                >
                    Refresh
                </button>


            </div>





            <div className="summary-grid">


                <SummaryCard

                    title="Total Products"

                    value={dashboard.total_products}

                />



                <SummaryCard

                    title="Total Suppliers"

                    value={dashboard.total_suppliers}

                />



                <SummaryCard

                    title="Inventory Items"

                    value={dashboard.inventory_items}

                />



                <SummaryCard

                    title="Low Stock Items"

                    value={dashboard.below_reorder_level}

                />



                <SummaryCard

                    title="AI Recommendations"

                    value={dashboard.pending_recommendations}

                />



                <SummaryCard

                    title="Approved Orders"

                    value={dashboard.approved_purchase_orders}

                />



                <SummaryCard

                    title="Forecast Accuracy"

                    value={`${dashboard.forecast_accuracy}%`}

                />



                <SummaryCard

                    title="Alerts"

                    value={dashboard.alerts}

                />





               



                </div>



            </div>



        
    );


}


export default Dashboard;