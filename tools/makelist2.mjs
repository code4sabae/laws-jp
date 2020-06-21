import Deno from "./node/Deno.mjs"; // for Node
import xmldom from "xmldom"; // for Node
import util from "./node/util.mjs"; // for Node

/*
import xmldom from "https://dev.jspm.io/xmldom"; // for Deno
import util from "https://taisukef.github.io/denolib/util.mjs";
*/
const DOMParser = xmldom.DOMParser;

/*
Denoでエラー

<--- Last few GCs --->

[1525:0xad100000000]   122758 ms: Scavenge 1399.0 (1406.0) -> 1398.8 (1406.2) MB, 1.2 / 0.0 ms  (average mu = 0.295, current mu = 0.408) allocation failure 
[1525:0xad100000000]   122903 ms: Mark-sweep (reduce) 1399.6 (1406.2) -> 1399.1 (1406.7) MB, 141.9 / 0.0 ms  (+ 0.0 ms in 13 steps since start of marking, biggest step 0.0 ms, walltime since start of marking 145 ms) (average mu = 0.240, current mu = 0.111

<--- JS stacktrace --->


#
# Fatal javascript OOM in Ineffective mark-compacts near heap limit
#
*/

const getFullYear = (era, year) => {
  const y = parseInt(year);
  if (era === 'Meiji') {
    return y + 1868 - 1;
  } else if (era == 'Taisho') {
    return y + 1912 - 1;
  } else if (era === 'Showa') {
    return y + 1926 - 1;
  } else if (era === 'Heisei') {
    return y + 1989 - 1;
  } else if (era === 'Reiwa') {
    return y + 2019 - 1;
  } else {
    throw new Error("can't convert era");
  }
};

const findTag = (dom, tag) => {
  for (;;) {
    if (!dom) return null;
    if (dom.tagName === tag) return dom;
    if (dom.childNodes) {
      for (let i = 0; i < dom.childNodes.length; i++) {
        const ret = findTag(dom.childNodes[i], tag);
        if (ret) return ret;
      }
    }
    dom = dom.nextSibling;
  }
};

const path = "../data/laws/";
const laws = Deno.readDirSync(path);
const data = [];
for (const f of laws) {
  if (!f.name.endsWith(".xml")) continue;
  const sxml = Deno.readTextFileSync(path + f.name);
  const xml = new DOMParser().parseFromString(sxml, "application/xml");
  // Element, data, tagName, attributes, parentNode, childNodes, previousSibling, nextSibling, 

  /*
  <?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <Law Era="Meiji" Lang="ja" LawType="CabinetOrder" Num="337" Year="05">
  <LawNum>明治五年太政官布告第三百三十七号</LawNum>
  <LawBody>
  <LawTitle>明治五年太政官布告第三百三十七号（改暦ノ布告）</LawTitle>
  */
  const lawtag = findTag(xml, "Law");
  if (!lawtag) {
    console.log("not found Law tag!!");
    Deno.exit(1);
  }
  const d = {};
  // DataInfo(ないこともある) Era Lang LawType Num Year PromulgateDay(公布日、ないものが多い) PromulgateMonth(公布月、ないものが多い)
  for (let i = 0; i < lawtag.attributes.length; i++) {
    const a = lawtag.attributes[i];
    // console.log(i, a.name, a.value);
    d[a.name] = a.value;
  }
  d.FullYear = getFullYear(d.Era, d.Year);
  const lawnum = findTag(lawtag, "LawNum").childNodes[0];
  // 昭和三十四年文部省令第二十一号 { #text: "地教育振興法施行規則", Ruby: [ { #text: "へ", Rt: "ヽ" }, { #text: "き", Rt: "ヽ" } ] } 334M50000080021_20170401_999M50000080021.xml
  const lawnumval = !lawnum.tagName ? lawnum.data : lawnum.childNodes[0].data;
  d.LawNum = lawnumval;
  const lawtitletag = findTag(xml, "LawTitle");
  const lawtitleval = lawtitletag.childNodes[0].data;
  d.LawTitle = lawtitleval;
  
  d.xml = f.name;

  console.log(d);
  data.push(d);
}
console.log(data.length);
Deno.writeTextFileSync("../data/laws-jp2.csv", util.addBOM(util.encodeCSV(util.json2csv(data))));
