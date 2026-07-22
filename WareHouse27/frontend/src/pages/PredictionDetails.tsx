import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";
import Table from "../components/Table";

interface Forecast {
  forecast_id: number;
  product_id: number;
  forecast_period: string;
  predicted_demand: number;
  confidence_score: number;
  forecast_date: string;
}

function PredictionDetails() {

  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {

    try {

      const response = await API.get("/forecast");

      setForecast(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  if (loading) {

    return <Loader />;

  }

  const columns = [

    {
      key: "forecast_id",
      label: "Forecast ID"
    },

    {
      key: "product_id",
      label: "Product ID"
    },

    {
      key: "forecast_period",
      label: "Forecast Period"
    },

    {
      key: "predicted_demand",
      label: "Predicted Demand"
    },

    {
      key: "confidence_score",
      label: "Confidence %"
    },

    {
      key: "forecast_date",
      label: "Forecast Date"
    }

  ];

  return (

    <div>

      <div className="page-header">

        <h1>Prediction Details</h1>

        <button
          className="btn"
          onClick={loadForecast}
        >
          Refresh
        </button>

      </div>

      <div className="table-card">

        <Table
          columns={columns}
          data={forecast}
        />

      </div>

    </div>

  );

}

export default PredictionDetails;