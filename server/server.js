const fetch = require("node-fetch");
const Exp = require("express");
const app = Exp();
const cors = require("cors");
const disability = require("./routes/disability");
const converter = require("./routes/converter/convertToText")

app.use(Exp.json());
app.use(cors());

app.use(disability);
app.use(converter);

app.listen(5000, () => console.log(`Example app listening on port 5000!`));
