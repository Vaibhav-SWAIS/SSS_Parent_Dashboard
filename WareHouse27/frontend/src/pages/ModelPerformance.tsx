import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";
import Table from "../components/Table";

interface ModelMetric {
  metric_id: number;
  model_version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  evaluation_date: string;
}

interface ModelLog {
  log_id: number;
  model_version: string;
  training_date: string;
  prediction_count: number;
  status: string;
}

function ModelPerformance() {

  const [metrics, setMetrics] = useState<ModelMetric[]>([]);
  const [logs, setLogs] = useState<ModelLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {

    try {

      const [metricResponse, logResponse] = await Promise.all([
        API.get("/model-metrics"),
        API.get("/model-logs")
      ]);

      setMetrics(metricResponse.data);
      setLogs(logResponse.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  if (loading) {
    return <Loader />;
  }

  const metricColumns = [
    {
      key: "metric_id",
      label: "Metric ID"
    },
    {
      key: "model_version",
      label: "Model Version"
    },
    {
      key: "accuracy",
      label: "Accuracy"
    },
    {
      key: "precision",
      label: "Precision"
    },
    {
      key: "recall",
      label: "Recall"
    },
    {
      key: "f1_score",
      label: "F1 Score"
    },
    {
      key: "evaluation_date",
      label: "Evaluation Date"
    }
  ];

  const logColumns = [
    {
      key: "log_id",
      label: "Log ID"
    },
    {
      key: "model_version",
      label: "Model Version"
    },
    {
      key: "training_date",
      label: "Training Date"
    },
    {
      key: "prediction_count",
      label: "Prediction Count"
    },
    {
      key: "status",
      label: "Status"
    }
  ];

  return (

    <div>

      <div className="page-header">

        <h1>AI Model Performance</h1>

        <button
          className="btn"
          onClick={loadData}
        >
          Refresh
        </button>

      </div>

      <div className="table-card">

        <h2>Model Metrics</h2>

        <br />

        <Table
          columns={metricColumns}
          data={metrics}
        />

      </div>

      <br />

      <div className="table-card">

        <h2>Training Logs</h2>

        <br />

        <Table
          columns={logColumns}
          data={logs}
        />

      </div>

    </div>

  );

}

export default ModelPerformance;