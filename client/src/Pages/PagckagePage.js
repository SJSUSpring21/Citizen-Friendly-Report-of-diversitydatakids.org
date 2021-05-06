import { useState } from "react";
import jsonp from "jsonp";
import { DataGrid } from "@material-ui/data-grid";
import {
  Button,
  FormControl,
  FormGroup,
  Snackbar,
  TextField,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import ResourcePage from "./ResourcePage";

function PackagePage() {
  const [packageId, setPackageId] = useState(
    "17010_1_c-single-parent-families-with-children-aged-0-17-years--count--by-race-ethnicity"
  );
  const [packageNLGData, setPackageNLGData] = useState({
    Scale: "",
    Nativity: "",
    Gender: "",
    Race_and_Ethnicity: "",
    Age_Group: "",
    Title: "",
  });
  const [packageDisplayData, setPackageDisplayData] = useState({
    title: "",
    name: "",
    notes: "",
  });
  const [rowData, setRowData] = useState({});
  const [rows, setRows] = useState([]);
  const columns = [
    {
      field: "id",
      headerName: "id",
      hide: true,
    },
    {
      field: "name",
      headerName: "Name",
      width: 500,
    },
    {
      field: "description",
      headerName: "Description",
      width: 150,
    },
  ];
  const [warning, setWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resourceMode, setResourceMode] = useState(false);
  let myUrl = "";
  const closeWarning = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setWarning(false);
  };
  const createUrl = () => {
    const base = "https://data.diversitydatakids.org/api/3/action/package_show";
    myUrl = new URL(base);
    myUrl.searchParams.append("id", packageId);
  };
  const fetchCkanData = () => {
    if (packageId === "") {
      setWarning(true);
      return;
    }
    createUrl();
    setLoading(true);
    jsonp(myUrl.toString(), null, function (err, res) {
      if (err) {
        setWarning(true);
        setLoading(false);
        return;
      } else {
        setPackageNLGData({
          Scale: res.result.Scale,
          Nativity: res.result.Nativity,
          Gender: res.result.Gender,
          Race_and_Ethnicity: res.result["Available by Race and Ethnicity"],
          Age_Group: res.result["Age Group"],
          Title: res.result.title.split("(")[0],
        });
        setPackageDisplayData({
          title: res.result.title,
          name: res.result.name,
          notes: res.result.notes,
        });
        setRows(res.result.resources);
        setLoading(false);
      }
    });
  };
  if (resourceMode) {
    return (
      <div>
        <Button
          style={{ margin: "8px", display: "block", marginRight: "auto" }}
          variant="contained"
          color="primary"
          onClick={() => {
            setResourceMode(false);
          }}
        >
          Go back
        </Button>
        <ResourcePage
          data={{
            NLGData: packageNLGData,
            resourceId: rowData.data.id,
            displayData: packageDisplayData,
          }}
        ></ResourcePage>
      </div>
    );
  }
  return (
    <div className="App">
      <Snackbar open={warning} autoHideDuration={6000} onClose={closeWarning}>
        <Alert onClose={closeWarning} severity="error">
          Please enter correct package id
        </Alert>
      </Snackbar>
      <FormGroup>
        <FormControl>
          <TextField
            id="private-event-name"
            label="Enter Dataset(package) ID"
            onChange={(e) => {
              setPackageId(e.target.value.trim());
            }}
            defaultValue="17010_1_c-single-parent-families-with-children-aged-0-17-years--count--by-race-ethnicity"
          />
        </FormControl>
        <FormControl>
          <Button
            style={{ margin: "8px", display: "block", marginRight: "auto" }}
            variant="contained"
            color="primary"
            onClick={() => {
              fetchCkanData();
            }}
          >
            Fetch Datasets
          </Button>
        </FormControl>
      </FormGroup>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          pageSize={20}
          onRowSelected={(rowData) => {
            console.log(rowData);
            setResourceMode(true);
            setRowData(rowData);
          }}
        />
        {/* <Button
          style={{ margin: "8px", display: "block", marginLeft: "auto" }}
          variant="contained"
          color="primary"
          disabled={!(rowData && rowData.isSelected)}
          onClick={() => {
            console.log("hello");
            setResourceMode(true);
          }}
        >
          Show Tabular content
        </Button> */}
      </div>
    </div>
  );
}
export default PackagePage;
