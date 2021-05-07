import "./App.css";
import Axios from "axios";
import { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import NavigationBar from "./components/NavBar/NavBar";
import PackagePage from "./Pages/PagckagePage";
import ResourcePage from "./Pages/ResourcePage";
import SearchPage from "./Pages/SearchPage";
import "@fontsource/roboto";

function App() {
  const DefaultContainer = () => (
    <div>
      <NavigationBar />
      <Router>
        <Switch>
          <Route path="/delete" exact component={Dashboard} />
          <Route path="/packages" exact component={PackagePage} />
          <Route path="/" exact component={SearchPage} />
        </Switch>
      </Router>
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
