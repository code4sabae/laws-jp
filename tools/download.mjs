// import cheerio from "https://dev.jspm.io/cheerio@0.22.0";
import cheerio from "cheerio";
import fetch from "node-fetch";
import Deno from "./Deno.mjs";

/*
<form id="appForm" action="" method="post"><div><input type="hidden" name="jp.go.nta.houjin_bangou.framework.web.common.CNSFWTokenProcessor.request.token" value="8066bb93-a3be-410a-ba85-662db80f11c8"/></div>
<input type="hidden" name="event" id="event" value="download">
<input type="hidden" name="selDlFileNo" id="selDlFileNo">
*/
const download = async (url, dstfn) => {
  const res = await fetch(url);
  // const res = await fetch(formurl + `?selDlFileNo=${fileno}`); // GETでは取得できない
  const bin = await res.arrayBuffer();
  const ar = new Uint8Array(bin);
  console.log(`${url} downloaded ${ar.length} bytes, saved ${dstfn}`);
  Deno.writeFileSync(dstfn, ar);
  return ar.length;
};
// await download(11348, "temp/test.zip");
// Deno.exit(0);

const downloadIndex = async () => {
  const url = "https://elaws.e-gov.go.jp/download/lawdownload.html";
  const html = await (await fetch(url)).text();
  Deno.writeTextFileSync("index.html", html);
};

// await downloadIndex();
const html = Deno.readTextFileSync("index.html");
const dom = cheerio.load(html);

const searchDomClass = (base, cls) => {
  let c = base;
  for (;;) {
    c = c.next;
    if (c == null) return null;
    if (c.type !== "tag") continue;
    if (c.attribs.class === cls) break;
  }
  return c;
};

try {
  Deno.mkdirSync("temp");
} catch (e) {
}

const tbl = dom("#sclTbl")[0];
const links = dom("A", null, tbl);
for (let i = 0; i < links.length; i++) {
  const link = links[i];
  //console.log(link);
  //console.log(link.attribs["href"]);
  const code = link.attribs["href"]?.match(/^javascript:lawdata_download\('(\d+).zip'\)$/);
  if (!code) continue;
  const dllink = `https://elaws.e-gov.go.jp/download/${code[1]}.zip`;
  console.log(dllink);
  const len = await download(dllink, `temp/${code[1]}.zip`);
  // console.log(`${len} bytes downloaded`);
}
