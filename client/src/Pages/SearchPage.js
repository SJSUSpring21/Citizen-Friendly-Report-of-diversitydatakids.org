import { useEffect, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import {
  IconButton,
  InputBase,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
} from "@material-ui/core";
import Divider from '@material-ui/core/Divider';
import Alert from "@material-ui/lab/Alert";
import Axios from "axios";
import { Link } from "react-router-dom";
import jsonp from "jsonp";

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
    margin: "16px 32px",
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
  const [subTopics, setSubTopics] = useState({});
  const columns = [
    {
      field: "title",
      headerName: "Dataset Name",
      headerClassName: "grid-header",
      flex: 300,
      renderCell: (params) => {
        return (
          <div
            style={{
              textOverflow: "ellipsis",
              whiteSpace: "initial",
              lineHeight: "normal",
              maxHeight: "48px",
            }}
          >
            <Link
              style={{
                textOverflow: "ellipsis",
                whiteSpace: "initial",
                lineHeight: "normal",
                maxHeight: "48px",
              }}
              to={"/packages?id=" + params.getValue("id")}
              target="_blank"
            >
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
          <span
            className="table-cell-trucate"
            style={{
              textOverflow: "ellipsis",
              whiteSpace: "initial",
              lineHeight: "normal",
              maxHeight: "48px",
            }}
          >
            {params.value}
          </span>
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
    fetchCkanData("");
    fetchSubTopics();
  },[]);

  const fetchCkanData = (input) => {
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
  const fetchSubTopics = () => {
    Axios.post("http://localhost:5000/subtopics", {
      input: input,
    })
      .then((result) => {
        setSubTopics(result.data.result.facets.vocab_Subtopic);
      })
      .catch((err) => {});
  };
  return (
    <div style={{ display: "flex" }}>
      <div style={{width:"250px"}}>
        <Typography variant="subtitle2" style={{margin:"16px",marginBottom:"0px",fontWeight:"700"}}>
          Pick a Subtopic
        </Typography>
        <Divider />
        <List component="nav" aria-label="Sub Topics" dense={true} style={{ height: "550px", overflow: "auto" }}>
          {Object.keys(subTopics).map((each,id) => {
            return (
              <ListItem key={id} button onClick={(e)=>{
                setInput(e.target.innerText)
                fetchCkanData(e.target.innerText);
              }} >
                <ListItemText primary={each} />
              </ListItem>
            );
          })}
        </List>
      </div>
      <div style={{ width: "100%" }}>
        <Paper component="form" className={classes.root}>
          <InputBase
            type="input"
            className={classes.input}
            placeholder="Search Datasets..."
            inputProps={{ "aria-label": "search datasets" }}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                fetchCkanData(input);
              }
            }}
          />
          <IconButton
            className={classes.iconButton}
            aria-label="search"
            onClick={(e) => {
              fetchCkanData(input);
            }}
          >
            <SearchIcon />
          </IconButton>
        </Paper>
        <div style={{ margin: "8px" }}>
          <Snackbar
            open={warning}
            autoHideDuration={6000}
            onClose={closeWarning}
          >
            <Alert onClose={closeWarning} severity="error">
              Unable to fetch data
            </Alert>
          </Snackbar>
        </div>
        <div style={{ height: "500px", width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            pageSize={20}
            autoHeight={false}
            onRowSelected={(e) => {
              setRowData(e.data);
              setIsSelected(e.isSelected);
            }}
          />
        </div>
        {/* <div style={{margin:"16px",display:"flex"}} >
      {isSelected && <Link style={{marginLeft:"auto"}} to={"/packages?id=" + rowData.id } >
          Show Geographic datasets
        </Link>}
      </div> */}
      </div>
    </div>
  );
}

export default SearchPage;
