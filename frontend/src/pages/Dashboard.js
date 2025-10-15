import React from "react";
import "../style/Dashboard.css";

function Dashboard() {
  const user = localStorage.getItem("auth") ? "Admin" : "Visitante";

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard IoT</h1>
      <p>Usuário: {user}</p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Website Traffic</h3>
          <p>12k visitas</p>
        </div>
        <div className="dashboard-card">
          <h3>Bounce Rate</h3>
          <p>23%</p>
        </div>
        <div className="dashboard-card">
          <h3>ROI</h3>
          <p>283%</p>
        </div>
        <div className="dashboard-card">
          <h3>Customer Churn Rate</h3>
          <p>12.8%</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
