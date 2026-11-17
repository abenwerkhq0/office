/* ABENWERK Office service worker: push notifications + quick Reply / Like */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('push',e=>{
 let d={};try{d=e.data.json()}catch(_){d={title:'ABENWERK Office',body:e.data?e.data.text():''}}
 e.waitUntil((async()=>{
  const cl=await clients.matchAll({type:'window',includeUncontrolled:true});
  if(cl.some(c=>c.visibilityState==='visible'&&c.focused))return; // you are already looking at the app
  await self.registration.showNotification(d.title||'ABENWERK Office',{body:d.body||'',tag:d.tag,renotify:true,requireInteraction:!!d.mention,icon:'icon-192.png',badge:'icon-192.png',actions:d.actions||[],data:d});
 })());
});
self.addEventListener('notificationclick',e=>{
 const d=e.notification.data||{};e.notification.close();
 e.waitUntil((async()=>{
  const done=async(t,b)=>{await self.registration.showNotification(t,{body:b||'',tag:'done-'+Date.now(),icon:'icon-192.png',silent:true});await new Promise(r=>setTimeout(r,3500));(await self.registration.getNotifications()).filter(n=>/^done-/.test(n.tag)).forEach(n=>n.close())};
  if(e.action==='like'||(e.action==='reply'&&e.reply)){
   try{
    const r=await fetch(d.fn,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'act',token:d.token,kind:e.action,text:e.reply})});
    const j=await r.json();
    await done(j.ok?(e.action==='like'?'👍 Liked':'✓ Reply sent'):'Could not '+(e.action==='like'?'like':'send reply'),j.ok?'':(j.error||''));
   }catch(err){await done('Could not reach ABENWERK Office','Open the app to reply.')}
   return;
  }
  const cl=await clients.matchAll({type:'window',includeUncontrolled:true});
  for(const c of cl){if('focus' in c){await c.focus();c.postMessage({open:d.open});return}}
  await clients.openWindow('./?open='+encodeURIComponent(d.open||''));
 })());
});
