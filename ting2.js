var xmldoc = require("xmldoc");
const fs = require("fs");
const { text } = require("express");


// TO FIX
// breaks if there are there isnt a split heading to break up
// if multiple footnotes have an array currently just two objects within set
// stamp alignment needs to use the getStylesElement function (Sheikh Zayed and(T. Hayashi))
// country name needs to be split into own array "countryName": "Aden" lives within above set
// 

const xml = fs.readFileSync(
  "./catalogues/sotw-volume-1.xml",
  "utf8"
);
let temp = [];
let result = [];
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

section.eachChild((item) => {
    if (
      item.attr.type !== "stampbox_alignment"
    ) {
      if (item.attr.type === "Set Head") {
        const thing = getStyledElements(item);
        temp.push({
          setHead: thing.join(""),
        });
      }

      // might be able to use childNamed to get the child of the item instead of filtering
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
          entry.forEach((child) =>
            table.push(
              child.childNamed("tps:p").val
                ? child.childNamed("tps:p").val
                : child.childNamed("tps:p").children[0]?.val
            )
          );
        });

        // entries.forEach((entry) =>
        //   entry.forEach(item =>
        //     item.children.forEach((child) =>
        //     child.val && tables.push({table: child.val }))))

        temp.push({
          table: spliceIntoChunks(table, 5),
        });
        // console.log('tables', tables)
      }

      if (item.attr.type === "country-name") {
        temp.push({ countryName: item.val });
      }

      if (item.attr.type === "Introductory paragraph") {
        temp.push({ introPara: item.val });
      }
      if (item.attr.type === "Currency notes") {
        temp.push({ currencyNotes: item.val });
      }

      if (
        item.attr.type === "Design_Footnote" ||
        item.attr.type === "footnote_cs"
      ) {
        const thing = getStyledElements(item)
        temp.push({ footnote: thing.join(' ') });
      }
    } else {
      let tag = [];
      let image;
      result.push(temp);
      temp = [];

      // check temp array and if there is a stampbox_alignment in there then DONT break 
      // if array has both stampbox_alignment and set head the DO break




      if (item.attr.type === "stampbox_alignment") {
        const contexts = item.children.filter(
          (child) => child.name === "tps:context"
        );
        contexts.forEach((context) => {
          context.children.map((child) => {
            if (child.name === "tps:p") {
              tag.push(child.val);
            }

            if (child.name === "tps:image") {
              tag.push(child.attr.ref);
            }
          });
        });
        temp.push({
          stampboxAlignment: tag,
        });
      }
    }
});

console.log("result", JSON.stringify(result, null, 1));
// console.log("result", result);

// if there are two images in the stampbox alignment then the second image will belong to the next setHead
// context for stampalignment needs to have the styling ting added