import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";
import Table from "../components/Table";

interface PurchaseOrder {
  po_id: number;
  supplier_id: number;
  product_id: number;
  quantity: number;
  expected_delivery: string;
  status: string;
  approved_by: string;
  created_at: string;
}

function ReplenishmentApproval() {

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {

    try {

      const response = await API.get("/purchase-orders");

      setOrders(response.data);

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
      key: "po_id",
      label: "PO ID"
    },
    {
      key: "supplier_id",
      label: "Supplier ID"
    },
    {
      key: "product_id",
      label: "Product ID"
    },
    {
      key: "quantity",
      label: "Quantity"
    },
    {
      key: "expected_delivery",
      label: "Expected Delivery"
    },
    {
      key: "status",
      label: "Status"
    },
    {
      key: "approved_by",
      label: "Approved By"
    },
    {
      key: "created_at",
      label: "Created At"
    }
  ];

  return (

    <div>

      <div className="page-header">

        <h1>Replenishment Approval</h1>

        <button
          className="btn"
          onClick={loadOrders}
        >
          Refresh
        </button>

      </div>

      <div className="table-card">

        <Table
          columns={columns}
          data={orders}
        />

      </div>

    </div>

  );

}

export default ReplenishmentApproval;