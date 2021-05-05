import Axios from "axios";
import { useCallback, useEffect, useState } from "react";
import jsonp from "jsonp";
import {
  Button,
  Snackbar,
  Typography,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import "@inovua/reactdatagrid-community/index.css";

function ResourcePage(props) {
  const { resourceId, NLGData, displayData } = props.data;
  const [warning, setWarning] = useState(false);
  const [rowData, setRowData] = useState({});
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [columnMap, setColumnMap] = useState({});
  const [visibleMap, setVisibleMap] = useState({});
  const [infoMap, setInfoMap] = useState({});
  const gridStyle = {};
  const [selected, setSelected] = useState({});
  const [message, setMessage] = useState("");
  const [supported, setSupported] = useState(false);
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
                  columnMap[field.id] = {
                    title: field.info.label.split(";")[1],
                    visible: true,
                  };
                } else {
                  columnMap[field.id] = {
                    title: field.info.label,
                    visible: true,
                  };
                }
                return {
                  name: field.id,
                  header: label,
                  minWidth: 150,
                };
              } else {
                columnMap[field.id] = { title: "id", visible: true };
                return { name: field.id, header: "id", hide: true };
              }
            })
        );
        setVisibleData(columnMap);
        setColumnMap(columnMap);
        setRows(res.result.records);
        setLoading(false);
      }
    });
  };

  const setVisibleData = (columnMap) => {
    // let data = {}, info = {};
    for (const [key, value] of Object.entries(columnMap)) {
      if (
        key === "_id" ||
        key === "name" ||
        key === "geoid" ||
        key === "year" ||
        key === "total_est"
      ) {
        infoMap[key] = { title: value.title };
      } else {
        visibleMap[key] = { title: value.title };
      }
    }
    if (infoMap.total_est) {
      setSupported(true);
    } else {
      setSupported(false);
    }
    setVisibleMap(visibleMap);
    setInfoMap(infoMap);
  };

  const closeWarning = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setWarning(false);
  };

  const onSelectionChange = useCallback(({ selected: selectedMap, data }) => {
    setRowData(data[0]);
    for (const [key, value] of Object.entries(infoMap)) {
      value.data = data[0][key];
      infoMap[key] = value;
    }
    setInfoMap(infoMap);
    for (const [key, value] of Object.entries(visibleMap)) {
      value.data = data[0][key];
      visibleMap[key] = value;
    }
    setVisibleMap(visibleMap);
    if (supported) {
      Axios.post("http://localhost:5000/getRowText", {
        NLGData: NLGData,
        info: infoMap,
        data: visibleMap,
      })
        .then((result) => {
          setMessage(result.data);
        })
        .catch((error) => {});
    } else {
      setMessage("NLG is not supported for this kind of dataset");
    }
  }, []);

  const onColumnVisibleChange = (data) => {
    setColumnMap((old) => {
      old[data.column.name].visible = data.visible;
      return old;
    });
    setVisibleMap((old) => {
      if (data.visible) {
        if (!old[data.column.name]) {
          old[data.column.name] = { title: columnMap[data.column.name].title };
        }
      } else {
        delete old[data.column.name];
      }
    });
  };
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
      <div>
        <ReactDataGrid
          idProperty="_id"
          columns={columns}
          dataSource={rows}
          style={gridStyle}
          loading={loading}
          onSelectionChange={onSelectionChange}
          onColumnVisibleChange={onColumnVisibleChange}
          selected={selected}
          pagination
          // pagination="remote"
          // limit={pageSize}
        />
      </div>
      <div>
        <Button
          style={{ margin: "8px", display: "block", marginLeft: "auto" }}
          variant="contained"
          color="primary"
          disabled={Object.keys(rowData).length === 0}
          onClick={() => {
            console.log({
              NLGData: NLGData,
              columnMap: columnMap,
              rowData: rowData,
              columns: columns,
            });
          }}
        >
          Generate Text for selected row
        </Button>
        <div>{message} </div>
      </div>
    </div>
  );
}

export default ResourcePage;
