const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const { DOMParser } = require("xmldom-qsa");
const parseString = require("xml2js").parseString;
const { transform } = require("camaro");

app.get("/", (req, res) => {
const xml = fs.readFileSync("./catalogues/sotw-volume-1.xml", "utf8");


let damn = false;

// v1
// const template = {
//   sets: [
//     "tps:content/tps:section/tps:table",
//     {
//       type: "@type",
//       values: ["tps:tgroup/tps:tbody/tps:row/tps:entry", {
//         type: "@type",
//         value: "tps:p",
//       }],
//     },
//   ],
// };

// v2 
const template = {
  sets: [
    "tps:content/tps:section/tps:table",
    {
        setOfStamps: [
          "tps:tgroup/tps:tbody/tps:row",
          {
            stamp: [
              "tps:entry",
              {
                type: "@type",
                value: "tps:p",
              },
            ],
          },
        ],

    },
  ],
};


(async function () {
  damn = await transform(xml, template);
  console.log(JSON.stringify(damn, null, 2));
})();

  res.send(JSON.stringify(damn, null, 2));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
