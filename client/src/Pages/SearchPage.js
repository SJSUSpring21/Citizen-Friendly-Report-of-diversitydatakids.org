import { useEffect, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
import { withStyles, makeStyles } from "@material-ui/core/styles";

import SearchIcon from "@material-ui/icons/Search";
import {
  IconButton,
  InputBase,
  Paper,
  Snackbar,
  Tooltip,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import Axios from "axios";
import { Link } from "react-router-dom";
import { PolarAngleAxis } from "recharts";

const useStylesBootstrap = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
  },
}));

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "auto",
    margin: "8px 240px",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
}));

const LightTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);

function BootstrapTooltip(props) {
  const classes = useStylesBootstrap();

  return <Tooltip arrow classes={classes} {...props} />;
}
function SearchPage() {
  const classes = useStyles();
  const [rowData, setRowData] = useState({});
  const [rows, setRows] = useState([]);
  const [input, setInput] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const columns = [
    {
      field: "title",
      headerName: "Dataset Name",
      headerClassName: "grid-header",
      flex: 300,
      renderCell: (params) => {
        return (
          <div>
          <Link style={{marginLeft:"auto"}} to={"/packages?id=" + params.getValue("id") } target="_blank" >
          {params.value}
        </Link>
        </div>
        );
      },
    },
    {
      field: "notes",
      headerName: "Dataset Description",
      headerClassName: "grid-header",
      flex: 400,
      renderCell: (params) => {
        return (
          // <BootstrapTooltip
          //   title={params.value}
          //   style={{ overflow: "hidden", Width: "95%" }}
          // >
            <span className="table-cell-trucate" style={{textOverflow:"ellipsis",whiteSpace: "initial",
    lineHeight: "normal",maxHeight:"48px", textOverflow:"ellipsis"}}>{params.value}</span>
          // </BootstrapTooltip>
        );
      },
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
  const closeWarning = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setWarning(false);
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
      })
      .catch((err) => {
        setLoading(false);
      });
  };
  const preventDefault = (event) => event.preventDefault();
  return (
    <div className="App">
      <Paper component="form" className={classes.root}>
        <InputBase
          type="input"
          className={classes.input}
          placeholder="Search Datasets..."
          inputProps={{ "aria-label": "search datasets" }}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={(e)=>{
            if(e.key === "Enter"){
              e.preventDefault();
              fetchCkanData();
            }
          }}
        />
        <IconButton
          className={classes.iconButton}
          aria-label="search"
          onClick={(e) => {
            console.log(e);
            fetchCkanData();
          }}
        >
          <SearchIcon />
        </IconButton>
      </Paper>
      <div style={{ margin: "8px" }}>
        <Snackbar open={warning} autoHideDuration={6000} onClose={closeWarning}>
          <Alert onClose={closeWarning} severity="error">
            Unable to fetch data
          </Alert>
        </Snackbar>
      </div>
      <div style={{ width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          pageSize={20}
          autoHeight = {true}
          onRowSelected={(e) => {
            setRowData(e.data);
            setIsSelected(e.isSelected)
          }}
        />
      </div>
      {/* <div style={{margin:"16px",display:"flex"}} >
      {isSelected && <Link style={{marginLeft:"auto"}} to={"/packages?id=" + rowData.id } >
          Show Geographic datasets
        </Link>}
      </div> */}
      
    </div>
  );
}

export default SearchPage;
