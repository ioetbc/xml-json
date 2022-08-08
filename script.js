var parseString = require("xml2js").parseString;
const fs = require("fs");

const newData = [];
const splitHeadings = [];
const stampAlignment = [];
const dates = [];
const titles = [];
const images = [];
try {
  const data = JSON.parse(fs.readFileSync("./mad.json", "utf8"));
  // console.log("data", data);
  data.map((item) => {
    console.log("item", item.type);
    if (!item.type) return;
    const isSetHead = Object.values(item?.type).includes("Set Head");
    const isSplitHeading = Object.values(item.type).includes("Split-heading");
    const isFootnote = Object.values(item.type).includes("footnote_cs");
    const isStampAlignment = Object.values(item.type).includes(
      "stampbox_alignment"
    );

    if (isSetHead) {
      item["tps:style"].map((item, index) => {
        dates.push({
          preview: index,
          date: item._,
        });
      });
    }

    if (isSplitHeading) {
      splitHeadings.push(item._);
    }

    // TODO - attach this to set set
    // if (isFootnote) {
    //   newData.push({ footNotes: item._ });
    // }

    if (isStampAlignment) {
      item["tps:context"].map((item) => {
        stampAlignment.push(item["tps:image"][0].ref[0]);
      });
    }
  });

  splitHeadings.map((item, index) => {
    titles.push({
      preview: index,
      title: item,
    });
  });

  stampAlignment.map((item, index) => {
    images.push({
      preview: index,
      image: item,
    });
  });

  // const arr3 = newData[0].previews.map((item, i) =>
  //   Object.assign({}, item, second[i])
  // );
  // console.log("dates", JSON.stringify(dates, null, 4));
  // console.log("titles", JSON.stringify(titles, null, 4));
  // console.log("images", JSON.stringify(images, null, 4));

  const combined = dates.map((item, i) => Object.assign({}, item, titles[i]));
  console.log("combined", JSON.stringify(combined, null, 4));

  // const combinedAgain = combined.map((item, i) =>
  //   Object.assign({}, item, images[i])
  // );
  let merged = [];
  for (let i = 0; i < combined.length; i++) {
    merged.push({
      ...combined[i],
      ...images.find((itmInner) => itmInner.preview === combined[i].preview),
    });
  }

  console.log("combinedAgain", JSON.stringify(merged, null, 4));
  fs.writeFileSync("./combined.json", JSON.stringify(merged, null, 4));
  // const arr4 = newData[0].previews.map((item, i) =>
  //   Object.assign({}, item, third[i])
  // );
} catch (err) {
  console.error(err);
}
