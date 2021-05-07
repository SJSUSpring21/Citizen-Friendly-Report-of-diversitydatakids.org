import { useEffect, useState } from "react";
import jsonp from "jsonp";
import { DataGrid } from "@material-ui/data-grid";

import SearchIcon from "@material-ui/icons/Search";
import { Button, IconButton, Snackbar, TextField } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import Axios from "axios";

function SearchPage() {
  const [packageId, setPackageId] = useState(
    "17010_1_c-single-parent-families-with-children-aged-0-17-years--count--by-race-ethnicity"
  );

  const [rowData, setRowData] = useState({});
  const [rows, setRows] = useState([]);
  const [input, setInput] = useState("");
  const columns = [
    {
      field: "title",
      headerName: "Title",
    },
    {
      field: "notes",
      headerName: "Description",
      flex:500
    },
    {
      field: "id",
      headerName: "id",
      width: 500,
      hide: true,
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
    const base = "https://data.diversitydatakids.org/api/search/dataset";
    myUrl = new URL(base);
    myUrl.searchParams.append("fq", "");
    myUrl.searchParams.append("q", input);
    myUrl.searchParams.append("fl", "title,notes");
    myUrl.searchParams.append("rows", "1000");
  };

  useEffect(() => {
    fetchCkanData();
  }, []);
  const fetchCkanData = () => {
    setLoading(true);
    Axios.post("http://localhost:5000/search", {
      input: input,
    })
      .then((result) => {
        setRows(result.data.results);
        setLoading(false);
        console.log(result);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };
  return (
    <div className="App">
      <Snackbar open={warning} autoHideDuration={6000} onClose={closeWarning}>
        <Alert onClose={closeWarning} severity="error">
          Please enter correct package id
        </Alert>
      </Snackbar>
      <TextField id="standard-search" label="Search field" type="search" />
      <IconButton aria-label="delete">
        <SearchIcon />
      </IconButton>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          pageSize={20}
          onRowSelected={(rowData) => {
            setRowData(rowData);
          }}
        />
        <Button
          style={{ margin: "8px", display: "block", marginLeft: "auto" }}
          variant="contained"
          color="primary"
          disabled={!(rowData && rowData.isSelected)}
          onClick={() => {
            setResourceMode(true);
          }}
        >
          Show Tabular content
        </Button>
      </div>
    </div>
  );
}

export default SearchPage;
