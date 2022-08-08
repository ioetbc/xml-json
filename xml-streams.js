const fs = require("fs")
const path = require("path")
const XmlStream = require("xml-stream");


// Create a file stream and pass it to XmlStream
const stream = fs.readFileSync("./catalogues/sotw-volume-1.xml", "utf8");
var xml = new XmlStream(stream);

// const shit = xml.collect("tps:p");
// xml.on("endElement: tps:table", function (item) {
//   console.log(item);
// });
console.log(xml);
