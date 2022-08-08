const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const { DOMParser } = require("xmldom-qsa");
const parseString = require("xml2js").parseString;
const { transform } = require("camaro");

app.get("/", (req, res) => {
  const xml = fs.readFileSync("./catalogues/sotw-volume-1.xml", "utf8");


  // to get all the tps:p that lives under tps:section
  // const template = {
  //   sets: [
  //     "tps:content/tps:section/tps:p",
  //     {
  //       type: "@type",
  //     },
  //   ],
  // };

  // to get the first tps:p that lives under rps:section
  // const template = {
  //   sets: [
  //     "tps:content/tps:section",
  //     {
  //       type: "@type",
  //       value: "tps:p",
  //     },
  //   ],
  // };

  // to get all the tps:p that lives under tps:section
  const template = {
    sets: [
      "tps:content/tps:section/tps:p",
        {
          type: "@type",
          value: "text()",
        },
    ],
  };



  let damn = false;
  (async function () {
    let tables = []
    let temp = [];
    let result = [];
    damn = await transform(xml, template).catch((err) => console.log('error processing xml', err));
    // tables = await transform(xml, tableTemplate);
    // console.log(JSON.stringify(tables.sets, null, 2));

    const newArr = (damn?.sets || []).map((item, index) => {
      if (item.type !== "stampbox_alignment") {
        // Set Head
        // console.log("item.type", item.type);

        if (item.type === "country-name") {
          temp.push({ countryName: item.value });
        }

        if (item.type === "Introductory paragraph") {
          temp.push({ introPara: item.value });
        }
        if (item.type === "Currency notes") {
          temp.push({ currencyNotes: item.value });
        }

        if (item.type === "Set Head") {
          temp.push({ setHead: item.value });
        }

        if (item.type === "Design_Footnote" || item.type === "footnote_cs") {
          temp.push({ footnote: item.value });
        }

        // if (item.type.includes("Note")) {
        //   temp.push({ footnote: item.value });
        // }
        // if (item.type.includes("set")) {
        //   temp.push({ table: item.value });
        // }
      } else {
        result.push(temp);
        temp = [];
        temp.push({ stampboxAlignment: item.value });
      }
    });


    // (tables?.sets || []).forEach((item, index) => result.splice(index, 0, {table: item}));
    console.log("result", result);

  })();

  res.send(JSON.stringify(damn, null, 2));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
