var xmldoc = require("xmldoc");
const fs = require("fs");


// TO FIX

// if multiple footnotes have an array currently just two objects within set
// stamp alignment needs to use the getNestedStyles function (Sheikh Zayed and(T. Hayashi))
// country name needs to be split into own array "countryName": "Aden" lives within above set
// if there are two images in the stampbox alignment then the second image will belong to the next setHead
// context for stampalignment needs to have the styling ting added

// Countries
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

section.eachChild((item, index) => {
    if (
      item.attr.type !== "stampbox_alignment" &&
      item.attr.type !== "Set Head" &&
      item.attr.type !== "country-name"
    ) {
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

        temp.push({
          table: spliceIntoChunks(table, 5),
        });
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
        const thing = getStyledElements(item);
        temp.push({ footnote: thing.join(" ") });
      }
    } else {
      let tag = [];
      
      if (item.attr.type === "stampbox_alignment") {
        result.push(temp);
        temp = [];

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

      if (item.attr.type === "Set Head") {
        const thing = getStyledElements(item);
        const hasSetHead = temp
          .map((item) => item.setHead)
          .filter((item) => item !== undefined);
        const hasManyStampImages = temp
          .map((item) => item.stampboxAlignment)
          .filter((item) => item !== undefined);

        if (hasManyStampImages.length > 0) {
          if (!!hasSetHead.length && hasManyStampImages[0].length <= 2) {
            result.push(temp);
            temp = [];
          }
        } else {
          result.push(temp);
          temp = [];
        }

        temp.push({
          setHead: thing.join(""),
        });
      }

      if (item.attr.type === "country-name") {
        result.push(temp);
        temp = [];
        temp.push({ countryName: item.val });
      }
    }
});

console.log("result", JSON.stringify(result, null, 1));

// get an array of countries and context

[
  {
    countryName: "Abu Dabi",
    intro: "son intro",
    currenyNotes: "$100 = 1300",
  },
  {
    countryName: "Aden",
    intro: "some intro",
    currenyNotes: "$200 = 100",
  },
];

