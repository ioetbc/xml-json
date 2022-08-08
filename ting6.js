var xmldoc = require("xmldoc");
const fs = require("fs");
const { timeStamp } = require("console");



const createOpenSearchParentId = () => {
  const indexId = {
    index: { _index: "stamps" },
  };

  fs.writeFileSync("output/boom.json", JSON.stringify(indexId), {
    flag: "a+",
  });
};

const createOpenSearchRecord = (stamp) => {
  fs.writeFileSync("output/boom.json", "\n", {
    flag: "a+",
  });

  fs.writeFileSync("output/boom.json", JSON.stringify({ stamp }), {
    flag: "a+",
  })

  fs.writeFileSync("output/boom.json", "\n", {
    flag: "a+",
  });
};

const xml = fs.readFileSync(
  "./catalogues/sotw-volume-1.xml",
  "utf8"
);

var document = new xmldoc.XmlDocument(xml);
var section = document.childNamed("tps:section");

function spliceIntoChunks(arr, chunkSize) {
  const res = [];
  while (arr.length > 0) {
    const chunk = arr.splice(0, chunkSize);
    res.push(chunk);
  }
  return res;
}

const getStyledElements = (item) => {
  const strings = item.children
  const allValues = strings.map((string) => string.text || string.val);

  // filter empty strings
  const beauty = allValues.filter((e) => e)
  return beauty

}

let stamps = [];

let table = [];
let countryData = {}
let stamp = {};

section.eachChild((item, index) => {
     if (item.name === "tps:table") {
       let table = [];
       const groups = item.children.filter(
         (child) => child.name === "tps:tgroup"
       );
       const bodys = groups[0].children.filter(
         (child) => child.name === "tps:tbody"
       );
       const rows = bodys[0].children.filter(
         (child) => child.name === "tps:row"
       );
       const entries = rows.map((entry) =>
        entry.children.filter((child) => child.name === "tps:entry")
       );

       entries.forEach((entry) => {
         entry.forEach(
           (child, index) => {
            if (child.attr.type === "cpnr_cs") {
              stamp.sgNumber = child.childNamed("tps:p").val;
            }

            if (child.attr.type === "typenr_cs") {
              stamp.typeNumber = child.childNamed("tps:p").children[0]?.val
            }

             if (child.attr.type === "price_unused_cs") {
               // check if price_unused_cs is odd or even since price_unused_cs is used for both prices :facepalm
               if (index % 2 === 0) {
                 stamp.priceUnused = child.childNamed("tps:p").val;
               } else {
                 stamp.priceUsed = child.childNamed("tps:p").val;
               }
             }

             if (child.attr.type === "descr_cs") {
              // console.log('the fucking desc', child)
              stamp.desc = child.childNamed("tps:p").val;
             }

             // check to see all values have been set before starting a new object
             if (
               !!stamp.priceUnused &&
               !!stamp.priceUsed
             ) {
               stamps.push(stamp);
               stamp = {};
             }
           }
            //  table.push({
            //    sgNumber: child.childNamed("tps:p").val,
            //    typeNumber: child.childNamed("tps:p").children[0]?.val,
            //    usedPrice: child.childNamed("tps:p").val,
            //    unusedPrice: child.childNamed("tps:p").val,
            //  })
           //    child.childNamed("tps:p").val
           //      ? child.childNamed("tps:p").val
           //      : child.childNamed("tps:p").children[0]?.val
           //  )
         );
       });


      // stamps.push({
      //   table: spliceIntoChunks(table, 5),
      // });
     }

})
      //  console.log("stamps", stamps);

console.log(JSON.stringify(stamps, null, 4))
console.log(stamps.length)

