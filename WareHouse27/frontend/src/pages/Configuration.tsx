import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";
import Table from "../components/Table";

interface Threshold {
  threshold_id: number;
  product_id: number;
  safety_stock: number;
  reorder_point: number;
  maximum_stock: number;
  confidence_threshold: number;
}

function Configuration() {

  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThresholds();
  }, []);

  const loadThresholds = async () => {

    try {

      const response = await API.get("/thresholds");

      setThresholds(response.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  if (loading) {

    return <Loader />;

  }

  const columns = [

    {
      key: "threshold_id",
      label: "Threshold ID"
    },

    {
      key: "product_id",
      label: "Product ID"
    },

    {
      key: "safety_stock",
      label: "Safety Stock"
    },

    {
      key: "reorder_point",
      label: "Reorder Point"
    },

    {
      key: "maximum_stock",
      label: "Maximum Stock"
    },

    {
      key: "confidence_threshold",
      label: "Confidence Threshold (%)"
    }

  ];

  return (

    <div>

      <div className="page-header">

        <h1>Configuration & Threshold Settings</h1>

        <button
          className="btn"
          onClick={loadThresholds}
        >
          Refresh
        </button>

      </div>

      <div className="table-card">

        <Table
          columns={columns}
          data={thresholds}
        />

      </div>

    </div>

  );

}

export default Configuration;