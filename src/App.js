import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SCSS/App.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";

export function PortfolioRoutes() {
  return (
    <Routes>
      {/* Child matches supply URL state to the persistent Home shell, so Home
          deliberately has no visual Outlet. */}
      <Route path="/" element={<Home />}>
        <Route index element={null} />
        <Route path="projects" element={null} />
        <Route path="projects/:projectId" element={null} />
        <Route path="resume" element={null} />
        <Route path="threeDeeResume" element={null} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <PortfolioRoutes />
    </Router>
  );
}

export default App;
