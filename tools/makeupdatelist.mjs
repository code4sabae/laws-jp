import xmlutil from "./xmlutil.mjs"; // common

/*
import Deno from "./node/Deno.mjs"; // for Node
import xmldom from "xmldom"; // for Node
import util from "./node/util.mjs"; // for Node
*/
import xmldom from "https://dev.jspm.io/xmldom"; // for Deno
import util from "https://taisukef.github.io/denolib/util.mjs";
import IMIEnrichmentDate from "https://code4sabae.github.io/imi-enrichment-date-es/IMIEnrichmentDate.mjs";

const DOMParser = xmldom.DOMParser;


const normalizeDate = (d) => {
  return d.substring(0, d.indexOf('日') + 1);
};

const path = "../data/laws/";
const laws = Deno.readDirSync(path);

const data = [];

let totalcnt = 0;
let cnt = 0;
for (const f of laws) {
  if (!f.name.endsWith(".xml")) continue;
  const sxml = Deno.readTextFileSync(path + f.name);
  totalcnt++;
  const xml = new DOMParser().parseFromString(sxml, "application/xml");
  // Element, data, tagName, attributes, parentNode, childNodes, previousSibling, nextSibling, 

  /*
  <?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <Law Era="Meiji" Lang="ja" LawType="CabinetOrder" Num="337" Year="05">
  <LawNum>明治五年太政官布告第三百三十七号</LawNum>
  <LawBody>
  <LawTitle>明治五年太政官布告第三百三十七号（改暦ノ布告）</LawTitle>

    <SupplProvision AmendLawNum="平成三〇年七月一三日法律第七二号" Extract="true">
  */
  const lawtitle = xmlutil.getTagValue(xml, "LawTitle");
  console.log(lawtitle);

  const sup = xmlutil.getTags(xml, "SupplProvision");
  if (!sup) continue;

  // console.log(xmlutil.getText(xml));

  const d = {};
  const dates = [];
  for (const s of sup) {
    // console.log(s.attributes, s.tagName, xmlutil.getAttributes(s), xmlutil.getText(s));
    // console.log(s.attributes, s.tagName, xmlutil.getAttributeNames(s));
    //const wdate = s.attributes.find("AmendLawNum").value; // //xmlutil.getAttribute("AmendLawNum");
    const wdate = xmlutil.getAttribute(s, "AmendLawNum");
    if (!wdate) {
      // throw new Error("can't find AmendLawNum");
      // このパターンに対応必要あり
      /*
   <SupplProvision>
      <SupplProvisionLabel>附　則</SupplProvisionLabel>
      <Paragraph Hide="false" Num="1">
        <ParagraphNum>○１</ParagraphNum>
        <ParagraphSentence>
          <Sentence WritingMode="vertical">この勅令は、昭和二十一年十月一日から、これを施行する。</Sentence>
        </ParagraphSentence>
      </Paragraph>
      <Paragraph Hide="false" Num="2">
        <ParagraphNum>○２</ParagraphNum>
        <ParagraphSentence>
          <Sentence WritingMode="vertical">昭和二十年勅令第五百号人口動態調査令臨時特例は、これを廃止する。</Sentence>
        </ParagraphSentence>
      </Paragraph>
    </SupplProvision>
          */
      continue;
    }
    //console.log(wdate, wdate == null);
    const date = IMIEnrichmentDate(normalizeDate(wdate)).標準型日付;
    //console.log(date);
    dates.push(date);
  }
  if (dates.length === 0) continue;
  d.xml = f.name;
  d.update = dates.join(";");
  //console.log(d);
  data.push(d);
  //break;
  cnt++;
  console.log(f.name, dates.length);
}
console.log(data.length, cnt, totalcnt);
Deno.writeTextFileSync("../data/laws-jp-update.csv", util.addBOM(util.encodeCSV(util.json2csv(data))));
