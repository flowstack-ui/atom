import { test, assert, React, renderToStaticMarkup } from "../test-utils.mjs";
import { selectCurrentSection } from "../../dist/_internal/primitives/table-of-contents/geometry.js";
import { TableOfContents } from "../../dist/table-of-contents.js";
const h=React.createElement;

test("TOC SSR keeps native links, one current location and title relationship",()=>{
  const html=renderToStaticMarkup(h(TableOfContents.Root,{items:[{id:"a b",depth:2}],defaultActiveId:"a b"},
    h(TableOfContents.Nav,null,h(TableOfContents.Title,null,"Contents"),h(TableOfContents.List,null,
      h(TableOfContents.Item,{value:"a b"},h(TableOfContents.Link,null,"Section"))),h(TableOfContents.Indicator))));
  assert.match(html,/href="#a%20b"/);assert.match(html,/aria-current="location"/);
  const label=html.match(/aria-labelledby="([^"]+)"/)[1];
  assert.ok(html.includes(`id="${label}"`));
  assert.doesNotMatch(html,/role="(menu|tree|tablist)"/);
  assert.match(html,/<\/ul><span/);
});

test("TOC asChild preserves native link and consumer attributes",()=>{
  const html=renderToStaticMarkup(h(TableOfContents.Root,{items:[{id:"a",depth:2}]},
    h(TableOfContents.Nav,{"aria-label":"Contents"},h(TableOfContents.List,null,
      h(TableOfContents.Item,{value:"a"},h(TableOfContents.Link,{asChild:true},h("a",{"data-example":"kept"},"A")))))));
  assert.match(html,/data-example="kept"/);assert.equal((html.match(/<a /g)||[]).length,1);
});

test("TOC section selection retains long sections and reaches the short final section", () => {
  const positions = [{id:"a",top:-800,bottom:-780,offset:40},{id:"b",top:300,bottom:320,offset:40}];
  assert.equal(selectCurrentSection(positions,600,false),"a");
  assert.equal(selectCurrentSection(positions,600,true),"b");
  assert.equal(selectCurrentSection([],600,true),"");
  assert.equal(selectCurrentSection([{id:"a",top:700,bottom:720,offset:0}],600,false),"");
});

test("TOC repeated navigation sets have unique server labels",()=>{
  const nav=()=>h(TableOfContents.Nav,null,h(TableOfContents.Title,null,"Contents"),h(TableOfContents.List,null,
    h(TableOfContents.Item,{value:"a"},h(TableOfContents.Link,null,"A"))));
  const html=renderToStaticMarkup(h(TableOfContents.Root,{items:[{id:"a",depth:2}],defaultActiveId:"a"},nav(),nav()));
  const labels=[...html.matchAll(/aria-labelledby="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(labels).size,2);
  for(const label of labels)assert.ok(html.includes(`id="${label}"`));
  assert.equal((html.match(/aria-current="location"/g)||[]).length,2);
});
