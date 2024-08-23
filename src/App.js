import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SCSS/App.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import Projects from "./screens/Projects";
import ThreeDeeResume from "./screens/ThreeDeeResume";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/threeDeeResume" element={<ThreeDeeResume />} />
      </Routes>
    </Router>
  );
}

export default App;
