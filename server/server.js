const fetch = require("node-fetch");
const Exp = require("express");
const app = Exp();
const cors = require("cors");
const { genText } = require("./rosaTut");
const disability = require("./routes/disability");

let ckan = "";
app.use(cors());
const result = fetch(
  "https://data.diversitydatakids.org/api/3/action/datastore_search?resource_id=e08d7053-226a-4990-bb2b-6448fdbc4eba&limit=5"
)
  .then((res) => res.json())

  .then((json) => (ckan = json));

app.get("/click", (req, res) => {
  res.json(ckan);
});

app.get("/", (req, res) => {
  res.send(genText);
});

app.use(disability);

app.listen(5000, () => console.log(`Example app listening on port 5000!`));
