import "./App.css";
import ResourcePage from "./Pages/ResourcePage"
import PackagePage from "./Pages/PagckagePage"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

function App() {
  return (
      <Router>
        <Switch>
          <Route path="/" exact render={(props) => <PackagePage></PackagePage>} />
          <Route path="/resource" exact render={(props) => <ResourcePage />} />
          <Route path="*">
          </Route>
        </Switch>
      </Router>
  );
}

export default App;
