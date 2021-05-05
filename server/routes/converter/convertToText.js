const express = require("express");
const router = express.Router();

const rosaenlgPug = require("rosaenlg");
module.exports = router;

//let compiled = rosaenlgPug.compile("rowConverter.pug");
// compiled.call();
router.post("/getRowText", (req, res) => {
  const { NLGData, info, data } = req.body;
  let text = "";
  let min, max;
  let minArray = [],maxArray=[], unknownArray = [], zeroArray = [], other = {};
  let values = Object.values(data).map((each)=>{
    return each.data
  });
  min = Math.min.apply(null,values.filter(Boolean))
  max = Math.max.apply(null,values)
  //Math.min.apply(null, arr.filter(Boolean))
  for(let key in data){
    if(data.hasOwnProperty(key)){
      if(!data[key].data){
        unknownArray.push(data[key].title)
      }else if(data[key].data === 0){
        zeroArray.push(data[key].title)
      }else if(data[key].data === min){
        minArray.push(data[key].title)
      }else if(data[key].data === max && min !== max){
        maxArray.push(data[key].title)
      }else{
        other[key] = data[key];
      }
    }
  }
  if (NLGData.Race_and_Ethnicity[0] == "Yes") {
    text = rosaenlgPug.renderFile("./routes/converter/converterRace.pug", {
      language: "en_US",
      NLG: NLGData,
      info: info,
      data: data,
      min: min,
      max: max,
      minArray: minArray,
      maxArray: maxArray,
      other: other,
      cache: true
    });
    console.log(text);
  } else {
    text = rosaenlgPug.renderFile("./routes/converter/converterRace.pug", {
      language: "en_US",
      NLG: NLGData,
      info: info,
      data: data,
      cache: true
    });
    console.log(text);
  }

  res.status(200).send(text);
});
