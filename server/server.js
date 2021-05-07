const Exp = require("express");
const app = Exp();
const cors = require("cors");
const disability = require("./routes/disability");
const converter = require("./converter/convertToText")
const search = require("./routes/search")

app.use(Exp.json());
app.use(cors());

app.use(disability);
app.use(converter);
app.use(search);

app.listen(5000, () => console.log(`Example app listening on port 5000!`));
