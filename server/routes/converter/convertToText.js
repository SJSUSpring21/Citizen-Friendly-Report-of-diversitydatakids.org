const express = require("express");
const router = express.Router();

const rosaenlgPug = require("rosaenlg");
module.exports = router;

//let compiled = rosaenlgPug.compile("rowConverter.pug");
// compiled.call();
router.post("/getRowText", (req, res) => {
  const { NLGData, columns, columnMap, rowData } = req.body;
  let text = "";
  if (NLGData.Race_and_Ethnicity[0] == "Yes") {
    text = rosaenlgPug.renderFile("./routes/converter/converterRace.pug", {
      language: "en_US",
      map: columnMap,
      rowData: rowData,
      NLG: NLGData,
      cache: true,
    });
    console.log(text);
  } else {
    text = rosaenlgPug.renderFile("./routes/converter/converterRace.pug", {
      language: "en_US",
      map: columnMap,
      rowData: rowData,
      NLG: NLGData,
      cache: true,
    });
    console.log(text);
  }

  res.status(200).send(text);
});
