import "./App.css";
import Axios from "axios";
import { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import NavigationBar from "./components/NavBar/NavBar";

function App() {
  const [content, setContent] = useState([]);
  const [genText, setGenText] = useState([]);

  const clickHandler = () => {
    Axios.get("http://localhost:5000/click").then((result) =>
      setContent(JSON.stringify(result.data.result))
    );
  };

  const clickHandler2 = () => {
    Axios.get("http://localhost:5000/").then((result) =>
      setGenText(result.data)
    );
  };

  const DefaultContainer = () => (
    <div>
      <NavigationBar />

      <Route path="/" exact component={Dashboard} />
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
