const fs = require("fs");
const { DOMParser } = require('xmldom-qsa')
var parseString = require("xml2js").parseString;

const xml = fs.readFileSync("./raw.xml", "utf8");


var document = new DOMParser().parseFromString(xml);
var tables = document.getElementsByTagName("tps:table");


// console.log(tables);

parseString(tables, function (err, result) {
  console.log(JSON.stringify(result, null, 3));
});