import parser from "https://dev.jspm.io/fast-xml-parser";
// import cheerio from "cheerio";
// import fetch from "node-fetch";
// import Deno from "./Deno.mjs";
import util from "https://taisukef.github.io/denolib/util.mjs";

const path = "../data/laws/";
const laws = Deno.readDirSync(path);
const data = [];
for (const f of laws) {
  if (!f.name.endsWith(".xml")) continue;
  const xml = Deno.readTextFileSync(path + f.name);
  const json = parser.parse(xml);
  // console.log(f);
  //console.log(json)
  // console.log(JSON.stringify(json, null, 2))
  const num = json.Law.LawNum;
  let name = json.Law.LawBody.LawTitle;
  if (typeof name === "object") {
    // 昭和三十四年文部省令第二十一号 { #text: "地教育振興法施行規則", Ruby: [ { #text: "へ", Rt: "ヽ" }, { #text: "き", Rt: "ヽ" } ] } 334M50000080021_20170401_999M50000080021.xml
    name = name["#text"];
  }
  console.log(num, name, f.name);
  data.push({ num, name, xml: f.name });
}
console.log(data.length);
Deno.writeTextFileSync("../laws-jp.csv", util.addBOM(util.encodeCSV(util.json2csv(data))));
