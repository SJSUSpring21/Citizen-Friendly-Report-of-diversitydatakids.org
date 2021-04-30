import Axios from "axios";
import { useCallback, useEffect, useState } from "react";
import jsonp from "jsonp";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import {
  Button,
  FormControl,
  FormGroup,
  Snackbar,
  Typography,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import "@inovua/reactdatagrid-community/index.css";

function ResourcePage(props) {
  const [genText, setGenText] = useState([]);
  // const [resourceID, setResourceId] = useState(
  //   "61430b80-e431-4db0-a7f1-490ec1c9a7d8"
  // );
  
  const { resourceId, NLGData, displayData } = props.data;
  const [warning, setWarning] = useState(false);
  const [rowData, setRowData] = useState({});
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortModel, setSortModel] = useState();
  const [gridData, setGridData] = useState({});
  const [columnMap, setColumnMap] = useState({});
  const gridStyle = {}
  const [selected, setSelected] = useState({});
  const [message, setMessage] = useState("");
  let myUrl = "";

  useEffect(() => {
    fetchCkanData();
  }, [props]);
  const createUrl = () => {
    const base =
      "https://data.diversitydatakids.org/api/3/action/datastore_search";
    myUrl = new URL(base);
    myUrl.searchParams.append("limit", pageSize);
    myUrl.searchParams.append("resource_id", resourceId);
  };
  const fetchCkanData = () => {
    if (resourceId === "") {
      setWarning(true);
      return;
    }
    createUrl();
    setLoading(true);
    jsonp(myUrl.toString(), null, function (err, res) {
      let label = "";
      if (err) {
        setWarning(true);
        setLoading(false);
        return;
      } else {
        setColumns(
          res.result.fields
            .filter((each) => {
              if (
                !each.info ||
                !each.info.notes.includes("(only available in download file)")
              ) {
                return true;
              }
            })
            .map((field) => {
              if (field.info) {
                label = field.id;
                if (field.info.label.includes(";")) {
                  columnMap[field.id] = {title: field.info.label.split(";")[1], visible:true}
                }else{ 
                  columnMap[field.id] = {title: field.info.label, visible:true}
                }
                return {
                  name: field.id,
                  header: label,
                  minWidth: 150,
                };
              } else {
                columnMap[field.id] = {title:"id",visible:true}
                return { name: field.id, header: "id", hide: true };
              }
            })
        );
        setColumnMap(columnMap);
        setRows(res.result.records);
        setLoading(false);
      }
    });
  };

  const updateRows = (params) => {};

  const closeWarning = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setWarning(false);
  };
  const onSelectionChange = useCallback(({ selected: selectedMap, data }) => {
    setRowData(data[0]);
    Axios.post("http://localhost:5000/getRowText",{
              NLGData: NLGData,
              columnMap: columnMap,
              rowData: rowData,
              columns: columns
            }).then((result)=>{
              setMessage(result.data);
            }).catch((error)=>{

            })
  }, [])
  const onColumnVisibleChange = (column) => {
    setColumnMap((old)=>{
      old[column.column.name].visible = column.visible;
      return old;
    })
  }
  return (
    <div className="App">
      <Snackbar open={warning} autoHideDuration={6000} onClose={closeWarning}>
        <Alert onClose={closeWarning} severity="error">
          Please enter correct resource id
        </Alert>
      </Snackbar>
      <Typography variant="h4" gutterBottom>
        {displayData.title}
      </Typography>
      <div >
        <ReactDataGrid
          idProperty="id"
          columns={columns}
          dataSource={rows}
          style={gridStyle}
          loading={loading}
          onSelectionChange ={onSelectionChange}
          onColumnVisibleChange={onColumnVisibleChange}
          selected = {selected}
          pagination = "remote"
          limit={pageSize}
        />
      </div>
      <div>
        <Button
          style={{ margin: "8px", display: "block", marginLeft: "auto" }}
          variant="contained"
          color="primary"
          disabled={(Object.keys(rowData).length === 0)}
          onClick={() => {
            console.log({
              NLGData: NLGData,
              columnMap: columnMap,
              rowData: rowData,
              columns: columns
            });
            
          }}
        >
          Generate Text for selected row
        </Button>
        <div>{message}</div>
      </div>
      
    </div>
  );
}

export default ResourcePage;
