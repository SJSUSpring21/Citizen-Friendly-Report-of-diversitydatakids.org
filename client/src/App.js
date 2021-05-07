import "./App.css";
import Axios from "axios";
import { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import NavigationBar from "./components/NavBar/NavBar";
import PackagePage from "./Pages/PagckagePage";
import ResourcePage from "./Pages/ResourcePage";

function App() {
  const DefaultContainer = () => (
    <div>
      <NavigationBar />
      {/* <Route path="/" exact component={Dashboard} /> */}
      <Route path="/" exact component={PackagePage} />
    </div>
  );

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route component={DefaultContainer} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
