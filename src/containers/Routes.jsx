import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import Header from "../components/HeaderContainerComponent";
import Board from "./Board";
import StepperPage from "./StepperPage"; // Import StepperPage component

const RoutesComponent = () => {
  return (
    <Router>
      {/* <Header /> */}
      <Routes>
        <Route path="/board" element={<>  <Header /><Board /></>}></Route>
        <Route path="/stepper" element={<StepperPage />}></Route>
      </Routes>
    </Router>
  );
};

export default RoutesComponent;
