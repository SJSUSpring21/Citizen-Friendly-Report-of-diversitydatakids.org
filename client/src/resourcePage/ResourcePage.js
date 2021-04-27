import Axios from "axios";
import { useState } from "react";
import jsonp from "jsonp";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";

function ResourcePage() {
  const [genText, setGenText] = useState([]);
  const base =
    "https://data.diversitydatakids.org/api/3/action/datastore_search";
  const myUrl = new URL(base);
  myUrl.searchParams.append("limit", 100);
  myUrl.searchParams.append("resource_id", [
    "0afe28b9-4b19-4cd1-aa8c-43526deea3fb"
  ]);

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortModel, setSortModel] = useState();

  const clickHandler = () => {
    jsonp(myUrl.toString(), null, function (err, res) {
      let label = "";
      if (err) {
        console.error(err.message);
      } else {
        setColumns(
          res.result.fields.map((field) => {
            if (field.info) {
              label = field.info.label.split(";")[1];
              if (!label) {
                label = field.info.label;
              }
              return {
                field: field.id,
                headerName: label,
                width: 150,
                resizable: true,
              };
            } else {
              return { field: field.id, headerName: "id" };
            }
          })
        );
        setRows(res.result.records);
      }
    });
  };

  const updateRows = (params) => {
    setLoading(true);
    console.log(params); // pageSize ,
    jsonp(myUrl, null, function (err, res) {
      if (err) {
        console.error(err.message);
      } else {
        setRows(res.result.records);
        setRowCount(200);
        setLoading(false);
      }
    });
  };

  const clickHandler2 = () => {
    Axios.get("http://localhost:5000/").then((result) =>
      setGenText(result.data)
    );
  };

  return (
    <div className="App">
      <button id="test1" onClick={clickHandler}>
        {" "}
        CKAN{" "}
      </button>
      <button id="test1" onClick={clickHandler2}>
        {" "}
        Rosa Tut{" "}
      </button>
      <div>{genText}</div>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
          // navigation
          pagination
          pageSize={pageSize}
          rowCount={rowCount}
          paginationMode="server"
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          onPageChange={(params) => {
            updateRows(params);
          }}
          onPageSizeChange={(params) => {
            updateRows(params);
          }}
          //sorting
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={updateRows}
          //filters
          filterMode="server"
          onFilterModelChange={updateRows}
          components={{
            Toolbar: GridToolbar,
          }}
        />
      </div>
    </div>
  );
}

export default ResourcePage;
