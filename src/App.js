import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SCSS/App.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import Projects from "./screens/Projects";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      {/* <Header /> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
    </Router>
  );
}

export default App;
