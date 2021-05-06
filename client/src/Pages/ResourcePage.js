import Axios from "axios";
import { useCallback } from "react";
import React, { useEffect, useState } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import jsonp from "jsonp";
import Container from "@material-ui/core/Container";
import { Button, Snackbar, Typography } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import "@inovua/reactdatagrid-community/index.css";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import "./ResourcePage.css";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PureComponent } from "react";
import { PieChart, Pie, Sector } from "recharts";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

function ResourcePage(props) {
  const classes = useStyles();
  const {
    resourceId,
    yearFormat,
    resourceName,
    NLGData,
    displayData,
  } = props.data;
  const [warning, setWarning] = useState(false);
  const [chart, setChartType] = useState("bar");
  const [rowData, setRowData] = useState({});
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [pageSize, setPageSize] = useState(100);
  const [loading, setLoading] = useState(true);
  const [columnMap, setColumnMap] = useState({});
  const [visibleMap, setVisibleMap] = useState({});
  const [infoMap, setInfoMap] = useState({});
  const gridStyle = {};
  const [selected, setSelected] = useState({});
  const [message, setMessage] = useState("");
  const [supported, setSupported] = useState(false);
  const [graphState, setGraphState] = useState([]);
  const [name_filter, setNameFilter] = useState([]);
  const [name, setName] = useState("");
  const [stats, setStats] = useState({
    min: -1,
    max: -1,
    avg: -1,
  });
  const [overview, setOverview] = useState("");
  let myUrl = "";

  useEffect(() => {
    fetchFilterData();
    fetchStatistics();
    // fetchCkanData();
  }, [props]);

  const createUrlFilters = () => {
    const base =
      "https://data.diversitydatakids.org/api/3/action/datastore_search";
    myUrl = new URL(base);
    myUrl.searchParams.append("offset", 0);
    myUrl.searchParams.append("fields", "name");
    myUrl.searchParams.append("distinct", "true");
    myUrl.searchParams.append("include_total", "false");
    myUrl.searchParams.append("resource_id", resourceId);
  };

  const handleChangeNameFilter = (e) => {
    fetchCkanData(e.target.value);
    setName(e.target.value);
  };

  const createUrl = () => {
    const base =
      "https://data.diversitydatakids.org/api/3/action/datastore_search";
    myUrl = new URL(base);
    myUrl.searchParams.append("limit", pageSize);
    myUrl.searchParams.append("resource_id", resourceId);
  };

  const fetchFilterData = () => {
    if (resourceId === "") {
      setWarning(true);
      return;
    }
    createUrlFilters();
    setLoading(true);
    jsonp(myUrl.toString(), null, function (err, res) {
      let label = "";
      if (err) {
        setWarning(true);
        setLoading(false);
        return;
      } else {
        console.log(res.result.records);
        let name_filter = res.result.records.map((record) => {
          return record.name;
        });

        setName(name_filter[0]);
        fetchCkanData(name_filter[0]);

        console.log(name_filter);
        setNameFilter(name_filter);
      }
    });
  };

  const fetchStatistics = () => {
    // let statUrl = "https://data.diversitydatakids.org/api/3/action/datastore_search_sql?sql=SELECT name, year, total_est from \""+resourceId+"\" where total_est = (SELECT aggregation(total_est) from \""+resourceId+"\")"
    let url =
      'https://data.diversitydatakids.org/api/3/action/datastore_search_sql?sql=SELECT min(total_est),max(total_est),avg(total_est) from "' +
      resourceId +
      '" where total_est > 0';
    jsonp(url, null, function (err, res) {
      if (err) {
        setWarning(true);
      } else {
        let data = res.result.records[0];
        if (data && res.success) {
          setStats({ min: data.min, max: data.max, avg: data.avg });
          Axios.post("http://localhost:5000/getOverview", {
            NLGData: NLGData,
            stats: { min: data.min, max: data.max, avg: data.avg },
            resourceName: resourceName,
            yearFormat: yearFormat,
          }).then((result) => {
            setOverview(result.data);
          });
        }
      }
    });
  };

  const createUrl_sql = (filter) => {
    const base =
      "https://data.diversitydatakids.org/api/3/action/datastore_search_sql";
    myUrl = new URL(base);
    myUrl.searchParams.append(
      "sql",
      'SELECT * from "' + resourceId + "\" WHERE name LIKE '" + filter + "'"
    );
  };

  const fetchCkanData = (filter) => {
    if (resourceId === "") {
      setWarning(true);
      return;
    }
    createUrl_sql(filter);
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
                return { name: field.id, header: "id", visible: false };
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

  const showBarChart = () => {
    setChartType("bar");
  };

  const showPieChart = () => {
    setChartType("pie");
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

  const onSelectionChange = useCallback(
    ({ selected: selectedMap, data }) => {
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
      // console.log(stats);
      setVisibleMap(visibleMap);
      if (supported) {
        Axios.post("http://localhost:5000/getRowText", {
          NLGData: NLGData,
          info: infoMap,
          data: visibleMap,
          stats: stats,
        })
          .then((result) => {
            let graphData = [];
            for (var key of Object.keys(data[0])) {
              console.log(key + " -> " + data[0][key]);
              if (key.includes("_est") && !key.includes("total_est")) {
                console.log("inside", key + " -> " + data[0][key]);
                graphData.push({ key: key, ethnicity: data[0][key] });
              }
            }

            console.log(graphData);
            setGraphState(graphData);
            setMessage(result.data);
          })
          .catch((error) => {});
      } else {
        setMessage("NLG is not supported for this kind of dataset");
      }
    },
    [supported, NLGData, infoMap, visibleMap, stats]
  );

  let CustomTooltip = ({ active, payload, label }) => {
    if (active) {
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#ffff",
            padding: "5px",
            border: "1px solid #cccc",
          }}
        >
          <label>{payload[0].payload.payload.key}</label>
        </div>
      );
    }

    return null;
  };

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
      <div className="name-filter-div">
        <FormControl>
          <InputLabel id="demo-simple-select-label">Age</InputLabel>
          <Select
            className="filter"
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={name}
            onChange={handleChangeNameFilter}
          >
            {name_filter.map((value) => (
              <MenuItem value={value}>{value}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
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
      <div style={{ display: "flex" }}>
        <div>
          {message.length && (
            <React.Fragment>
              <div className={classes.root}>
                {chart == "bar" && (
                  <ButtonGroup
                    color="primary"
                    aria-label="outlined primary button group"
                  >
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={() => {
                        showBarChart();
                      }}
                    >
                      Bar
                    </Button>
                    <Button
                      onClick={() => {
                        showPieChart();
                      }}
                    >
                      Pie
                    </Button>
                  </ButtonGroup>
                )}
                {chart == "pie" && (
                  <ButtonGroup
                    color="primary"
                    aria-label="outlined primary button group"
                  >
                    <Button
                      onClick={() => {
                        showBarChart();
                      }}
                    >
                      Bar
                    </Button>
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={() => {
                        showPieChart();
                      }}
                    >
                      Pie
                    </Button>
                  </ButtonGroup>
                )}
              </div>

              <CssBaseline />
              <Container
                maxWidth="sm"
                className={chart == "pie" ? "pie" : "bar"}
              >
                {chart == "bar" && (
                  <BarChart
                    width={500}
                    height={300}
                    data={graphState}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ethnicity" fill="#8884d8" />
                  </BarChart>
                )}
                {chart == "pie" && (
                  <PieChart width={500} height={250}>
                    <Pie
                      isAnimationActive={false}
                      dataKey="ethnicity"
                      startAngle={180}
                      endAngle={0}
                      data={graphState}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    />

                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                )}
              </Container>
            </React.Fragment>
          )}
        </div>
        <div>
          <div>{overview}</div>
          <div>{message}</div>
        </div>
      </div>
    </div>
  );
}

export default ResourcePage;
