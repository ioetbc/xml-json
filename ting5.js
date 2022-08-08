var xmldoc = require("xmldoc");
const fs = require("fs");
const { timeStamp } = require("console");


// TO FIX

// if more than one table in a set then it only shows last table
// Alexandretta, Alexandria etc are not showing
// setHeads: [] but then also setHead-index having two lots of headings
// need to have footnote-1, footnote-2 etc
// stampboxalignment should not be an array but instead image-1: '', image-1-context: '' so that they are not nested in an array

// json structure


const createOpenSearchParentId = (stamp) => {
  const indexId = {
    index: { _index: "stamps" },
  };

  fs.writeFileSync("output/boom.json", JSON.stringify(indexId), {
    flag: "a+",
  });

  fs.writeFileSync("output/boom.json", "\n", {
    flag: "a+",
  });

  fs.writeFileSync("output/boom.json", JSON.stringify({ ...stamp }), {
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
let temp = { setHeads: [] };
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
let countryShit = []
let setHeads = []
section.eachChild((item, index) => {
    if (
      item.attr.type !== "stampbox_alignment" &&
      item.attr.type !== "Set Head"
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
        temp.table = spliceIntoChunks(table, 5);
      }


      if (item.attr.type === "country-name") {
        countryShit = []
        console.log("item.val", item.val);
        countryShit.push({ countryName: item.val });
      }
      if (item.attr.type === "Introductory paragraph") {
        countryShit.push({ introPara: item.val });
      }
      if (item.attr.type === "Currency notes") {
        countryShit.push({ currencyNotes: item.val });
      }

      if (
        item.attr.type === "Design_Footnote" ||
        item.attr.type === "footnote_cs"
      ) {
        const thing = getStyledElements(item);
        temp.footnote = thing.join(" ");
      }
    } else {
      let stampboxAlignment = [];
      if (item.attr.type === "stampbox_alignment") {
        // result.push(temp);
        createOpenSearchParentId(temp)
        temp = { setHeads: [] };
        const contexts = item.children.filter(
          (child) => child.name === "tps:context"
        );
        contexts.forEach((context) => {
          context.children.map((child) => {
            if (child.name === "tps:p") {
              stampboxAlignment.push(child.val);
            }

            if (child.name === "tps:image") {
              stampboxAlignment.push(child.attr.ref);
            }
          });
        });

        temp.countryName = countryShit[0].countryName;
        temp.introPara = countryShit[1].introPara;
        temp.currencyNotes = countryShit[2] && countryShit[2].currencyNotes;
        temp.stampboxAlignment = stampboxAlignment;
        stampboxAlignment = []
      }

      if (item.attr.type === "Set Head") {
        temp.countryName = countryShit[0].countryName;
        temp.introPara = countryShit[1].introPara;
        temp.currencyNotes =
          countryShit[2] && countryShit[2].currencyNotes;

        const thing = getStyledElements(item);
        const hasSetHead = temp?.setHead
        const hasManyStampImages = temp?.stampboxAlignment;

                console.log('thing.join("")', thing.join(""));
                setHeads.push(thing.join(""));
                temp.setHeads.push(setHeads);
                temp.setHeads.forEach(
                  (heading, index) => (temp[`setHead-${index}`] = heading[0])
                );
                setHeads = []

        if (hasManyStampImages && hasManyStampImages.length > 0) {
          if (
            !!hasSetHead &&
            hasSetHead.length > 0 &&
            hasManyStampImages[0].length <= 2
          ) {
            createOpenSearchParentId(temp);
            temp = {setHeads: []};
          }
        } else {
          createOpenSearchParentId(temp);
          temp = { setHeads: [] };
        }
      }
    }
});

// console.log("result", JSON.stringify(result, null, 4));

// // write to new file
// result.forEach((result, index) => createOpenSearchParentId(result, index));




