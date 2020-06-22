const xmlutil = {};

xmlutil.findTag = (dom, tag) => {
  for (;;) {
    if (!dom) return null;
    if (dom.tagName === tag) return dom;
    if (dom.childNodes) {
      for (let i = 0; i < dom.childNodes.length; i++) {
        const ret = xmlutil.findTag(dom.childNodes[i], tag);
        if (ret) return ret;
      }
    }
    dom = dom.nextSibling;
  }
};
xmlutil.getTag = (dom, tag) => {
  if (dom.childNodes) {
    for (let i = 0; i < dom.childNodes.length; i++) {
      const c = dom.childNodes[i];
      if (c.tagName === tag) return c;
      const ret = xmlutil.getTag(c, tag);
      if (ret) return ret;
    }
  }
};
xmlutil.getTagValue = (dom, tag) => {
  const atag = xmlutil.getTag(dom, tag);
  return xmlutil.getText(atag);
};
xmlutil.getTags = (dom, tag) => {
  const getTags = (dom, tag, res) => {
    if (dom.childNodes) {
      for (let i = 0; i < dom.childNodes.length; i++) {
        const c = dom.childNodes[i]
        if (c.tagName === tag) {
          res.push(c);
        }
        getTags(c, tag, res);
      }
    }
  }
  const res = [];
  getTags(dom, tag, res);
  return res.length === 0 ? null : res;
};
xmlutil.getAttribute = (dom, name) => {
  if (!dom.attributes) return null;
  for (let i = 0; i < dom.attributes.length; i++) {
    const att = dom.attributes[i];
    if (att.name === name) {
      return att.value;
    }
  }
  return null;
};
xmlutil.getAttributes = (dom) => {
  const res = {};
  for (let i = 0; i < dom.attributes.length; i++) {
    const a = dom.attributes[i];
    res[a.name] = a.value;
  }
  return res;
};
xmlutil.getAttributeNames = (dom) => {
  const res = [];
  for (let i = 0; i < dom.attributes.length; i++) {
    const a = dom.attributes[i];
    res.push(a.name);
  }
  return res;
};
xmlutil.getText = (dom) => {
  if (!dom) return null;
  const getText = (dom, res) => {
    if (dom.childNodes) {
      for (let i = 0; i < dom.childNodes.length; i++) {
        const c = dom.childNodes[i];
        if (c.tagName === undefined) {
          res.push(c.data);
        } else {
          getText(c, res);
        }
      }
    }
  }
  const res = [];
  getText(dom, res);
  return res.join("");
};

export default xmlutil;
