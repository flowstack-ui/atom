import { assert, test } from "../test-utils.mjs";
import { createToastStore, createToastApi } from "../../dist/toast.js";

test("Toast stores isolate identity and delivery", () => {
  const a=createToastStore(), b=createToastStore();
  a.create({id:"same",title:"A"}); b.create({id:"same",title:"B"});
  a.remove();
  assert.equal(a.getCount(),0); assert.equal(b.getToasts()[0].title,"B");
  b.remove();
});

test("Toast queued time and independent pause reasons retain reading time", (t) => {
  t.mock.timers.enable({apis:["setTimeout","Date"],now:1000});
  const store=createToastStore();
  const id=store.create({duration:5000,title:"Queued"});
  t.mock.timers.tick(10000);
  assert.equal(store.getToasts()[0].remainingDuration,5000);
  store.setVisible([id]); t.mock.timers.tick(1000);
  store.pause(undefined,"hover"); store.pause(undefined,"focus");
  assert.equal(store.getToasts()[0].remainingDuration,4000);
  store.resume(undefined,"hover"); t.mock.timers.tick(10000);
  assert.equal(store.getToasts()[0].paused,true);
  store.resume(undefined,"focus"); t.mock.timers.tick(3999);
  assert.equal(store.isVisible(id),true);
  t.mock.timers.tick(1); assert.equal(store.isDismissed(id),true);
  t.mock.timers.tick(200); assert.equal(store.getCount(),0);
});

test("Toast external dismiss preserves exit lifecycle and fires once", (t) => {
  t.mock.timers.enable({apis:["setTimeout","Date"]});
  const store=createToastStore(); const events=[];
  const id=store.create({title:"Saved",onStatusChange:e=>events.push(e.status)});
  store.setVisible([id]); store.dismiss(id); store.dismiss(id);
  assert.equal(store.getCount(),1);
  assert.deepEqual(events,["queued","visible","dismissing"]);
  t.mock.timers.tick(200);
  assert.deepEqual(events,["queued","visible","dismissing","unmounted"]);
});

test("Toast new records inherit global pauses and updates do not cancel them", () => {
  const store=createToastStore(); store.pause(undefined,"page");
  const id=store.create({title:"Later"}); store.setVisible([id]);
  store.update(id,{type:"success"});
  assert.equal(store.getToasts()[0].paused,true);
  store.remove();
});

test("Toast tracking returns identity and never resurrects removed records", async () => {
  const store=createToastStore(); const api=createToastApi(store);
  let finish; const promise=new Promise(resolve=>{finish=resolve;});
  const tracked=api.track(promise,{loading:"Loading",success:"Done",error:"Failed"});
  store.remove(tracked.id); finish("result");
  assert.equal(await tracked.unwrap(),"result");
  assert.equal(store.getCount(),0);
});

test("Toast removal callbacks may enqueue a replacement without stale removal", (t) => {
  t.mock.timers.enable({apis:["setTimeout","Date"]});
  const store = createToastStore();
  store.create({id:"same",title:"Original",onDismiss:() => store.create({id:"same",title:"Replacement"})});
  store.setVisible(["same"]);
  store.dismiss("same");
  t.mock.timers.tick(200);
  assert.equal(store.getCount(),1);
  assert.equal(store.getToasts()[0].title,"Replacement");
  assert.equal(store.getToasts()[0].status,"queued");
  store.remove();
});

test("Toast measured layout and expansion work for arbitrary queue limits", () => {
  const store = createToastStore();
  const ids = Array.from({length:6},(_,i) => store.create({title:String(i),duration:Infinity}));
  store.setVisible(ids);
  ids.forEach((id,i) => store.setHeight(id,50 + i * 20));
  assert.equal(store.getVisibleToasts().length,6);
  assert.equal(store.getToasts()[0].height,150);
  store.expand(); assert.equal(store.isExpanded(),true);
  store.collapse(); assert.equal(store.isExpanded(),false);
  store.remove();
});

test("Toast auto-close callbacks cannot dismiss a replacement record", (t) => {
  t.mock.timers.enable({apis:["setTimeout","Date"]});
  const store = createToastStore();
  store.create({id:"same",title:"Original",duration:1000,onAutoClose:() => {
    store.remove("same");
    store.create({id:"same",title:"Replacement",duration:Infinity});
  }});
  store.setVisible(["same"]);
  t.mock.timers.tick(1000);
  assert.equal(store.getToasts()[0].title,"Replacement");
  assert.equal(store.isDismissed("same"),false);
  store.remove();
});
