import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import StatCard from "../components/dashboard/StatCard";
import CompaniesChart from "../components/dashboard/CompaniesChart";
import RevenueChart from "../components/dashboard/RevenueChart";
import PlansPieChart from "../components/dashboard/PlansPieChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import RecentlyRegistered from "../components/dashboard/RecentlyRegistered";
import RecentExpired from "../components/dashboard/RecentExpired";
import "../styles/Dashboard.css";

const DashboardHome = () => {
  return (
    <Container fluid className="mt-4 dashboard-page">
      {/* Welcome Banner */}
      <Card className="mb-4 bg-warning text-white p-4 shadow-sm border-0">
        <h4>Welcome Back, Adrian</h4>
        <p>14 New Companies Subscribed Today !!!</p>
      </Card>

      {/* Top Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <StatCard title="Total Companies" value="5468" change="+19.01%" />
        </Col>
        <Col md={3}>
          <StatCard title="Active Companies" value="4598" change="-1.2%" />
        </Col>
        <Col md={3}>
          <StatCard title="Total Subscribers" value="3698" change="+1.6%" />
        </Col>
        <Col md={3}>
          <StatCard title="Total Earnings" value="$89,878.58" change="-1.6%" />
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={6}>
          <CompaniesChart />
        </Col>
        <Col md={6}>
          <RevenueChart />
        </Col>
      </Row>

      {/* Pie Chart */}
      <Row className="mb-4">
        <Col md={6}>
          <PlansPieChart />
        </Col>
      </Row>

      {/* Tables */}
      <Row>
        <Col md={4}>
          <RecentTransactions />
        </Col>
        <Col md={4}>
          <RecentlyRegistered />
        </Col>
        <Col md={4}>
          <RecentExpired />
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardHome;
