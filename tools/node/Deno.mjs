import fs from "fs";

const Deno = {};

Deno.mkdirSync = (dirn) => {
  fs.mkdirSync(dirn);
};
Deno.writeTextFileSync = (fn, s) => {
  fs.writeFileSync(fn, new TextEncoder().encode(s));
};
Deno.readTextFileSync = (fn) => {
  return new TextDecoder().decode(fs.readFileSync(fn));
};
Deno.writeFileSync = (fn, bin) => {
  fs.writeFileSync(fn, bin);
};
Deno.readDirSync = (fn) => {
  const list = fs.readdirSync(fn);
  const res = list.map(l => { return { name: l } }); // isFileとかいろいろは未実装
  return res;
};

export default Deno;
