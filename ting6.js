var xmldoc = require("xmldoc");
const fs = require("fs");
const { timeStamp } = require("console");
const times = require("lodash/times")
const constant = require("lodash/constant")


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

const getNestedStyles = (item) => {
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
let headings = [];
let numberOfStampsInSet = []

section.eachChild((item, index) => {
  if (item.attr.type === "Set Head") {
    const text = getNestedStyles(item);
    stamp.tableHeading = text.join('')
  }

  if (item.attr.type === "country-name") {
    const text = getNestedStyles(item);
    stamp.country = text.join();
  }

  if (item.attr.type === "Introductory paragraph") {
    const text = getNestedStyles(item);
    stamp.countryIntroduction = text.join();
  }

  if (item.attr.type === "Currency notes") {
    const text = getNestedStyles(item);
    stamp.currencyNotes = text.join();
  }

  if (item.name === "tps:table") {
    let table = [];
    const groups = item.children.filter(
      (child) => child.name === "tps:tgroup"
    );
    const bodys = groups[0].children.filter(
      (child) => child.name === "tps:tbody"
    );
    const rows = bodys[0].children.filter(
      (child, index) => {
        return child.name === "tps:row"
      });
    const entries = rows.map((entry, index) => {
        numberOfStampsInSet.push(index);

      return entry.children.filter((child) => child.name === "tps:entry");
    });

    entries.forEach((entry, index) => {
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
            stamp.desc = child.childNamed("tps:p")?.val;
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
      );
    });
  }

})

// console.log("numberOfStampsInSet", numberOfStampsInSet.length);

// const hmm = numberOfStampsInSet.map((number, index) =>
//   Array(number).fill(headings[index])
// );
// const merged = [].concat.apply([], hmm);
// // console.log("headings", merged.length);

// stamps.forEach((set, index) => {
//   set.heading = merged[index]
// })

// console.log(JSON.stringify(stamps, null, 4))


let currentCountry = "";
let currentCountryIntroduction = "";
let currentTableHeading = "";
let currentCurrencyNotes = "";
let pop = []

for (i = 0; i < stamps.length; i++) {
    const hasCountryNode = stamps[i]?.country;
    const hasCountryIntroductionNode = stamps[i]?.countryIntroduction;
    const hasTableHeading = stamps[i]?.tableHeading;
    const hasCurrencyNotes = stamps[i]?.currencyNotes;

    if (hasCountryNode) {
      currentCountry = hasCountryNode
    }

    if (!hasCountryNode) {
      stamps[i].country = currentCountry;
      pop.push(stamps[i])
    }

    if (hasCountryIntroductionNode) {
      currentCountryIntroduction = hasCountryIntroductionNode;
    }

    if (!hasCountryIntroductionNode) {
      stamps[i].countryIntroduction = currentCountryIntroduction;
      pop.push(stamps[i]);
    }

    if (hasTableHeading) {
      currentTableHeading = hasTableHeading;
    }
    
    if (!hasTableHeading) {
      stamps[i].tableHeading = currentTableHeading;
      pop.push(stamps[i]);
    }

    if (hasCurrencyNotes) {
      currentCurrencyNotes = hasCurrencyNotes;
    }
    
    if (!hasCurrencyNotes) {
      stamps[i].currencyNotes = currentCurrencyNotes;
      pop.push(stamps[i]);
    }
}

console.log(JSON.stringify(pop, null, 4));

