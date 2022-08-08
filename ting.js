var xmldoc = require("xmldoc");
const fs = require("fs");


const xml = fs.readFileSync("./catalogues/sotw-volume-1.xml", "utf8");
let temp = [];
let result = [];
var document = new xmldoc.XmlDocument(xml);
var section = document.childNamed("tps:section");


 // tps:table / tps:tgroup / tps:tbody / tps:row / tps:entry / tps:p

section.eachChild((item) => {
    if (item.attr.type !== "stampbox_alignment") {
        if (item.name === "tps:table") {
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
          )

          const hmm = entries.map((entry) => entry.map(item => item.children.map((child) => child.val))).filter((item => !!item));
            
          temp.push({
            table: hmm,
          });
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

      if (item.attr.type === "Set Head") {
        temp.push({ setHead: item.val });
      }

      if (
        item.attr.type === "Design_Footnote" ||
        item.attr.type === "footnote_cs"
      ) {
        temp.push({ footnote: item.val });
      }
    } else {
        let tag
        let image;
      result.push(temp);
      temp = [];
        const contexts = item.children.filter((child) => child.name === 'tps:context');
        contexts.forEach((context) => {
          context.children.forEach((child) => {
            if (child.name === "tps:p") {
              tag = child.val;
            }

            if (child.name === "tps:image") {
              image = child.attr.ref;
            }
          });
        });
        temp.push({
          stampboxAlignment: {
            url: image,
            context: tag,
          },
        });
    }
});

console.log("result", JSON.stringify(result, null, 2));