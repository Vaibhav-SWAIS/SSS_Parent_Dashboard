import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";
import Table from "../components/Table";

interface Recommendation {
  recommendation_id: number;
  product_id: number;
  suggested_quantity: number;
  suggested_order_date: string;
  estimated_cost: number;
  priority: string;
  ai_confidence: number;
  status: string;
}

function RecommendationCenter() {

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const response = await API.get("/recommendations");
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const columns = [
    {
      key: "recommendation_id",
      label: "Recommendation ID",
    },
    {
      key: "product_id",
      label: "Product ID",
    },
    {
      key: "suggested_quantity",
      label: "Suggested Qty",
    },
    {
      key: "suggested_order_date",
      label: "Order Date",
    },
    {
      key: "estimated_cost",
      label: "Estimated Cost",
    },
    {
      key: "priority",
      label: "Priority",
    },
    {
      key: "ai_confidence",
      label: "AI Confidence",
    },
    {
      key: "status",
      label: "Status",
    },
  ];

  return (
    <div>

      <div className="page-header">

        <h1>AI Recommendation Center</h1>

        <button
          className="btn"
          onClick={loadRecommendations}
        >
          Refresh
        </button>

      </div>

      <div className="table-card">

        <Table
          columns={columns}
          data={recommendations}
        />

      </div>

    </div>
  );
}

export default RecommendationCenter;