'use strict';
/* chem.js — вся логика химии. Загружается после scenes.js. */

/* ============ 12. ХИМИЯ: СПРАВОЧНИК ============ */
const CTC={tab:'ref'};
function renderChem(){
 const v=$('#v-chem');
 if(!CTC.tab)CTC.tab='ref';
 const tabs=el('div','tabs',
  '<button class="tab'+(CTC.tab==='ref'?' active':'')+'" data-t="ref">📚 Справочник</button>'
 +'<button class="tab'+(CTC.tab==='mol'?' active':'')+'" data-t="mol">⚛️ Молекулы</button>'
 +'<button class="tab'+(CTC.tab==='proc'?' active':'')+'" data-t="proc">🎬 Процессы</button>'
 +'<button class="tab'+(CTC.tab==='lab'?' active':'')+'" data-t="lab">🧪 Лаборатория</button>');
 tabs.addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;CTC.tab=b.dataset.t;renderChem()});
 v.innerHTML='';v.appendChild(tabs);
 if(CTC.tab==='ref')renderTable(v);
 else if(CTC.tab==='mol')renderMol(v);
 else if(CTC.tab==='proc')renderProc(v);
 else renderLab(v);
}
function renderTable(v){
 v.appendChild(el('p','muted','Нажмите на элемент — откроется карточка с 3D-атомом. В демо собраны 26 самых важных для школьного курса элементов.'));
 const wrap=el('div','ptwrap');const grid=el('div');grid.id='ptable';
 grid.appendChild(el('div','pt-h',''));
 for(let c=1;c<=18;c++)grid.appendChild(el('div','pt-h',String(c)));
 for(let p=1;p<=7;p++){
  grid.appendChild(el('div','pt-h',String(p)));
  for(let c=1;c<=18;c++){
   const sym=Object.keys(POS).find(s=>POS[s][0]===c&&POS[s][1]===p);
   if(sym&&EL[sym]){
    const e=EL[sym];
    const b=el('button','pt-cell');b.setAttribute('aria-label',e.name+' — открыть карточку');
    b.innerHTML='<span class="s" style="color:'+e.color+'">'+e.sym+'</span><span class="n">'+e.z+'</span>';
    b.addEventListener('click',()=>openElem(sym));
    grid.appendChild(b);
   }else{
    const b=el('button','pt-cell');b.disabled=true;b.innerHTML='<span class="s" style="visibility:hidden">·</span>';
    grid.appendChild(b);
   }
  }
 }
 wrap.appendChild(grid);v.appendChild(wrap);
}
function openElem(sym){
 const e=EL[sym];S.stats.elems++;bump('elems');save();
 const ov=el('div','overlay show');const box=el('div','box');
 box.appendChild(el('div','elemhead','<div class="symbox" style="background:'+e.color+'"><span class="s">'+e.sym+'</span><span class="z">'+e.z+'</span></div>'
  +'<div><h2 style="margin:0">'+esc(e.name)+'</h2><span class="muted">'+esc(e.cat)+' · атомная масса '+e.mass+'</span></div>'));
 const facts=el('div');
 facts.innerHTML='<p><b>'+GRPN[e.group]+'</b>, <b>'+e.period+'-й период</b></p>'
 +'<div class="eq">Электронная конфигурация: '+e.conf+'</div>'
 +'<div class="eq">Оболочки (электронов по уровням): '+e.shells.join(' · ')+'</div>'
 +'<p><b>Свойства.</b> '+esc(e.props)+'</p><p><b>Применение.</b> '+esc(e.use)+'</p>'
 +'<p><b>История открытия.</b> '+esc(e.hist)+'</p>';
 box.appendChild(facts);
 const h3=el('h3',null,'3D-модель атома: '+e.name);box.appendChild(h3);
 const cv=el('canvas','scene');cv.setAttribute('aria-label','Трёхмерная модель атома '+e.name+', вращайте пальцем или мышью');box.appendChild(cv);
 box.appendChild(el('p','muted','Ядро: '+e.z+' протонов и '+Math.max(0,Math.round(e.mass)-e.z)+' нейтронов. Вокруг — '+e.z+' электронов на '+e.shells.length+' оболочках. Вращение — перетаскиванием, масштаб — щипком или колесом.'));
 const cl=el('div','row');const bc=el('button','btn','Закрыть');bc.addEventListener('click',()=>ov.remove());cl.appendChild(bc);box.appendChild(cl);
 ov.appendChild(box);document.body.appendChild(ov);
 ov.addEventListener('click',ev=>{if(ev.target===ov)ov.remove()});
 const RS=e.shells.map((n,i)=>{const arr=[];for(let j=0;j<n;j++)arr.push(j/n*Math.PI*2);return arr});
 const rBase=[0.85,1.35,1.85,2.4,3.0,3.6,4.2];
 const nucl=[];const Zn=Math.round(e.mass)-e.z;const tot=e.z+Math.max(0,Zn);
 const cap=PERF.eco?46:90;const nn=Math.min(tot,cap);
 for(let i=0;i<nn;i++){const a=i/nn*Math.PI*2,r=.34*Math.cbrt(i/nn);const ph=(i*137.5%360)/180*Math.PI;nucl.push({x:Math.sin(ph)*r,y:Math.cos(ph)*r*.7,z:Math.cos(ph)*r})}
 const elc=[];RS.forEach((ang,si)=>{const rr=rBase[si]||4.2;const nShow=Math.min(ang.length,PERF.eco?14:ang.length);for(let j=0;j<nShow;j++){const a=ang[j]+si*0.7;const tilt=(si%3)*0.5-0.5;elc.push({a,rr,tilt,speed:.6+si*.25})}});
 const maxR=(rBase[e.shells.length-1]||4.2)+.5;
 new Scene(cv,{spin:true,draw:(sc,w,h,g)=>{
  g.save();
  const items=[];
  for(const n of nucl)drawBall(sc,n.x*.5,n.y*.5,n.z*.5,.09,n.v===undefined?(Math.random()<0?0:0):'#e05555',items);
  // ядро: протоны и нейтроны чередуются по индексу
  items.length=0;
  for(let i=0;i<nucl.length;i++){const n=nucl[i];const isP=i%2===0;drawBall(sc,n.x,n.y,n.z,.09,isP?'#e05555':'#f0c060',items)}
  renderSpheres(sc,items,w,h);
  for(const s of elc){const a=s.a+sc.t*s.speed;const x=Math.cos(a)*s.rr;const y=Math.sin(a)*s.rr*Math.sin(s.tilt*0.4+0.3);const z=Math.sin(a)*s.rr*Math.cos(s.tilt*0.4+0.3);
   drawBall(sc,x,y,z,.055,'#2f6fd8');renderSpheres(sc,[{x,y,z,r:.055,color:'#2f6fd8',z:0}],w,h)}
  g.restore();
 }});
 // масштаб сцены под largest shell
 // (используем zoom через кнопки не добавляем — хватает жестов)
}
/* ============ 13. ХИМИЯ: МОЛЕКУЛЫ ============ */
function renderMol(v){
 const sel=el('div','row');
 MOLEC.forEach(m=>{const b=el('button','btn'+(CTC.mol===m.id?' pri':''),m.f+' — '+m.n);b.addEventListener('click',()=>{CTC.mol=m.id;renderMol(v)});sel.appendChild(b)});
 v.appendChild(sel);
 const m=MOLEC.find(x=>x.id===CTC.mol)||MOLEC[2];CTC.mol=m.id;
 v.appendChild(el('h3',null,m.n+' ('+m.f+') — '+m.g));
 v.appendChild(el('p','muted',m.i));
 const cv=el('canvas','scene');cv.setAttribute('aria-label','Трёхмерная модель молекулы '+m.n);v.appendChild(cv);
 const rr=r=>(r||.4);
 new Scene(cv,{spin:true,draw:(sc,w,h,g)=>{
  const items=[];const scl=1.15;
  // связи
  for(const b of m.b){const a=m.a[b[0]],c=m.a[b[1]];drawLine(sc,a.x*scl,a.y*scl,a.z*scl,c.x*scl,c.y*scl,c.z*scl,'#5a6a7a',Math.max(3,b[2]*4),w,h)}
  for(const a of m.a)drawBall(sc,a.x*scl,a.y*scl,a.z*scl,rr(a.r),EL[a.e]?EL[a.e].color:'#999',items);
  renderSpheres(sc,items,w,h);
  for(const a of m.a)drawLabel(sc,a.x*scl,a.y*scl,a.z*scl,a.e,w,h,14,'#1c2733');
 }});
}
/* ============ 14. ХИМИЯ: ПРОЦЕССЫ ============ */
function renderProc(v){
 const sel=el('div','row');
 PROC.forEach(p=>{const b=el('button','btn'+(CTC.proc===p.id?' pri':''),p.n.split(':')[0]);b.addEventListener('click',()=>{CTC.proc=p.id;renderProc(v)});sel.appendChild(b)});
 v.appendChild(sel);
 const p=PROC.find(x=>x.id===CTC.proc)||PROC[0];CTC.proc=p.id;
 v.appendChild(el('h3',null,esc(p.n)));
 v.appendChild(el('p','muted',p.i));
 const cv=el('canvas','scene');cv.setAttribute('aria-label','Анимация процесса: '+p.n);v.appendChild(cv);
 const ctl=el('div','row');
 const play=el('button','btn pri',CTC.pp?'⏸ Пауза':'▶ Показать');const scrub=el('input');scrub.type='range';scrub.min=0;scrub.max=100;scrub.value=CTC.pt==null?0:Math.round(CTC.pt*100);scrub.style.flex='1';scrub.setAttribute('aria-label','Время процесса');
 const note=el('div','good',esc(p.f[0].note));
 ctl.appendChild(play);ctl.appendChild(scrub);v.appendChild(ctl);v.appendChild(note);
 let pr=CTC.pp||false;let pt=CTC.pt==null?0:CTC.pt;
 play.addEventListener('click',()=>{pr=!pr;play.textContent=pr?'⏸ Пауза':'▶ Показать'});
 scrub.addEventListener('input',()=>{pt=+scrub.value/100;pr=false;play.textContent='▶ Показать'});
 new Scene(cv,{spin:false,draw:(sc,w,h,g)=>{
  const fr=p.f;let i=0;while(i<fr.length-1&&pt>fr[i+1].t)i++;
  const a=fr[i],b=fr[Math.min(i+1,fr.length-1)];const span=(b.t-a.t)||1;let u=clamp((pt-a.t)/span,0,1);
  if(!pr&&pt>=1)u=1;
  const n=Math.max(a.at.length,b.at.length);
  const items=[];
  for(let j=0;j<n;j++){
   const aa=a.at[Math.min(j,a.at.length-1)],bb=b.at[Math.min(j,b.at.length-1)];
   const x=aa.x+(bb.x-aa.x)*u,y=aa.y+(bb.y-aa.y)*u,z=aa.z+(bb.z-aa.z)*u;
   const ee=u<0.5?aa.e:bb.e;
   drawBall(sc,x,y,z,ee==='e'?.07:(RAD[ee]||.45),ee==='e'?'#2f6fd8':(EL[ee]?EL[ee].color:'#999'),items);
  }
  const lk=u<0.5?a.lk:b.lk;
  for(const l of lk){const aa=a.at[l[0]]||b.at[l[0]],bb=b.at[l[1]]||a.at[l[1]];
   const x1=aa.x+(bb.x-aa.x)*0,y1=aa.y+(bb.y-aa.y)*0; // связи берём из кадров целиком
  }
  if(lk.length){const src=u<0.5?a.at:b.at;for(const l of lk){const A=src[l[0]],B=src[l[1]];if(A&&B)drawLine(sc,A.x,A.y,A.z,B.x,B.y,B.z,'#5a6a7a',Math.max(3,(l[2]||1)*4),w,h)}}
  renderSpheres(sc,items,w,h);
  for(let j=0;j<n;j++){const src=u<0.5?a.at:b.at;const aa=src[Math.min(j,src.length-1)];const ee=u<0.5?aa.e:(b.at[Math.min(j,b.at.length-1)]).e;if(ee!=='e')drawLabel(sc,src[Math.min(j,src.length-1)].x,src[Math.min(j,src.length-1)].y,src[Math.min(j,src.length-1)].z,ee,w,h,13,'#1c2733')}
 }});
 setInterval?0:0;
 // обновление подписи по кадру
 const upd=()=>{let i=0;const cur=CTC.pt==null?0:CTC.pt;let f=PROC.find(x=>x.id===CTC.proc);while(i<f.f.length-1&&cur>f.f[i+1].t)i++;if(note.textContent!==f.f[i].note)note.textContent=f.f[i].note};
 const iv=setInterval(upd,300);
 window.addEventListener('pagehide',()=>clearInterval(iv),{once:true});
}

/* ============ 15. ХИМИЯ: ЛАБОРАТОРИЯ ============ */
const L={app:'test',items:[],search:'',cat:'все',res:null,animT:0,prec:[],bub:[],heating:false,journal:[],msg:''};
function blend(list){if(!list.length)return null;let r=0,g=0,b=0;for(const c of list){const n=parseInt(c.slice(1),16);r+=(n>>16)&255;g+=(n>>8)&255;b+=n&255}r=Math.round(r/list.length);g=Math.round(g/list.length);b=Math.round(b/list.length);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
function hexLerp(a,b,t){const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);const r=Math.round(((pa>>16)&255)+(((pb>>16)&255)-((pa>>16)&255))*t),g=Math.round(((pa>>8)&255)+(((pb>>8)&255)-((pa>>8)&255))*t),bl=Math.round((pa&255)+((pb&255)-(pa&255))*t);return '#'+((1<<24)+(r<<16)+(g<<8)+bl).toString(16).slice(1)}
function findReaction(){
 const ids=L.items.slice().sort().join('|');
 for(const r of REACT){if(r.k===ids)return r}
 return null}
function renderLab(v){
 const warn=el('div','warn','⚠️ <b>Техника безопасности.</b> Это виртуальная лаборатория, но правила реальные: кислоты и щёлочи едкие, соединения свинца и бария токсичны. Реальные опыты проводите только с учителем и в вытяжном шкафу.');
 v.appendChild(warn);
 const wrap=el('div','row');wrap.style.alignItems='flex-start';
 // левая колонка: прибор + каталог
 const left=el('div');left.style.flex='1';left.style.minWidth='260px';
 left.appendChild(el('h3',null,'Прибор'));
 const apRow=el('div','row');
 Object.keys(APPA).forEach(k=>{const b=el('button','btn'+(L.app===k?' pri':''),APPA[k].n);b.addEventListener('click',()=>{L.app=k;renderLab(v)});apRow.appendChild(b)});
 left.appendChild(apRow);
 left.appendChild(el('h3',null,'Реагенты ('+Object.keys(REAG).length+')'));
 const srch=el('input');srch.type='search';srch.placeholder='Поиск по названию или формуле…';srch.value=L.search;srch.setAttribute('aria-label','Поиск реагентов');
 srch.addEventListener('input',()=>{L.search=srch.value;renderLabList(listBox)});
 left.appendChild(srch);
 const cats=['все','кислота','щёлочь','соль','металл','оксид','индикатор','газ','растворитель'];
 const cr=el('div','row');cr.style.margin='8px 0';
 cats.forEach(c=>{const b=el('button','btn'+(L.cat===c?' pri':''),c);b.style.minHeight='36px';b.style.padding='4px 12px';b.addEventListener('click',()=>{L.cat=c;renderLabList(listBox)});cr.appendChild(b)});
 left.appendChild(cr);
 const listBox=el('div');left.appendChild(listBox);
 renderLabList(listBox);
 // правая колонка: посуда + управление
 const right=el('div');right.style.flex='1';right.style.minWidth='280px';
 const cv=el('canvas','scene');cv.setAttribute('aria-label','Виртуальная посуда с реагентами');right.appendChild(cv);
 const btns=el('div','row');
 const bRun=el('button','btn pri','⚗️ Запустить реакцию');bRun.addEventListener('click',()=>runLab(v));
 const bHeat=el('button','btn','🔥 Нагреть');bHeat.setAttribute('aria-label','Нагреть спиртовкой');bHeat.addEventListener('click',()=>heatLab(v));
 const bClr=el('button','btn','🗑 Очистить');bClr.setAttribute('aria-label','Очистить посуду');bClr.addEventListener('click',()=>{L.items=[];L.res=null;L.prec=[];L.bub=[];L.animT=0;L.msg='';renderLab(v)});
 btns.appendChild(bRun);btns.appendChild(bHeat);btns.appendChild(bClr);
 right.appendChild(btns);
 const status=el('div');status.id='lab-status';right.appendChild(status);
 const jh=el('h3',null,'Журнал эксперимента');right.appendChild(jh);
 const j=el('div');j.id='lab-journal';right.appendChild(j);
 wrap.appendChild(left);wrap.appendChild(right);v.appendChild(wrap);
 updLabStatus(status);
 renderJournal(j);
 new Scene(cv,{spin:false,draw:(sc,w,h,g)=>drawVessel(g,w,h)});
}
function renderLabList(box){
 box.innerHTML='';
 const q=L.search.trim().toLowerCase();
 const cats=Object.keys(REAG).filter(k=>{const r=REAG[k];if(L.cat!=='все'&&r.t!==L.cat)return false;if(q&&!(r.n.toLowerCase().includes(q)||r.f.toLowerCase().includes(q)))return false;return true});
 if(!cats.length){box.appendChild(el('p','muted','Ничего не найдено — измените запрос или категорию.'))}
 const g=el('div','rg-grid');
 cats.forEach(k=>{const r=REAG[k];const b=el('button','reagent'+(r.d?' dgr':''));b.disabled=L.items.includes(k);
  b.innerHTML='<b>'+esc(r.n)+'</b><span class="f">'+r.f+(r.d?' ⚠️':'')+'</span>';
  b.addEventListener('click',()=>{L.items.push(k);if(r.d)toast('⚠️ '+r.n+': '+r.d);renderLab(document.getElementById('v-chem'))});
  g.appendChild(b)});
 box.appendChild(g);
}
function updLabStatus(box){
 box.innerHTML='';
 if(L.msg)box.appendChild(el('div','good',esc(L.msg)));
 if(L.items.length===0)box.appendChild(el('p','muted','Пусто. Добавьте реагенты из каталога слева, затем нажмите «Запустить реакцию».'));
 else{const names=L.items.map(k=>REAG[k].n).join(' + ');box.appendChild(el('p',null,'В '+APPA[L.app].n.toLowerCase()+': <b>'+esc(names)+'</b>'))}
}
function runLab(v){
 const r=findReaction();
 if(r){
  L.res=r;L.animT=0;L.msg='';
  if(r.prec&&!r.gas){const n=PERF.eco?16:36;for(let i=0;i<n;i++)L.prec.push({x:Math.random(),y:0,v:.5+Math.random()*.8})}
  S.stats.lab++;bump('lab');save();checkBadges();addXP(5);
  L.journal.unshift({eq:r.eq,note:r.note,time:new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})});
  if(r.danger)toast('⚠️ Реакция с токсичным веществом — соблюдайте технику безопасности!');
 }else{
  L.msg=L.items.length>=2?'Признаков реакции не обнаружено: эти вещества не реагируют между собой (или нужна другая пара реагентов).':'Добавьте минимум два реагента.';
 }
 const st=$('#lab-status');if(st){updLabStatus(st);renderJournal($('#lab-journal'))}
}
function heatLab(v){
 // нагрев даёт эффект только для определённых смесей
 const has=k=>L.items.includes(k);
 let h=null;
 if(has('CuSO4')&&has('NaOH'))h=HEATRX[0];
 else if(has('CaCO3'))h=HEATRX[1];
 if(h){
  if(L.animT<0.9&&L.res===null&&h.need==='cuh'){toast('Сначала получите осадок: смешайте CuSO₄ и NaOH.');return}
  L.res=h;L.animT=0;L.msg=h.note;
  if(h.gas){const n=PERF.eco?10:24;for(let i=0;i<n;i++)L.bub.push({x:Math.random(),y:0,v:.6+Math.random()*.9})}
  S.stats.lab++;bump('lab');save();checkBadges();addXP(5);
  L.journal.unshift({eq:h.eq,note:h.note,time:new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})});
 }else{toast('Нагрев не даёт эффекта с этими реагентами');return}
 const st=$('#lab-status');if(st){updLabStatus(st);renderJournal($('#lab-journal'))}
}
function renderJournal(box){
 box.innerHTML='';
 if(!L.journal.length){box.appendChild(el('p','muted','Пока пусто — проведите первую реакцию.'));return}
 L.journal.slice(0,6).forEach(e=>{box.appendChild(el('div','eq',esc(e.time+' · '+e.eq)));box.appendChild(el('p','muted',esc(e.note)))});
}
function drawVessel(g,w,h){
 const t=L.animT;
 const app=L.app;const bottom=h-14;
 const vw=w<400?110:150;
 let cx=w/2,topY=40,vh=bottom-topY;
 const liq=L.items.length?clamp(.22+L.items.length*.1,.22,.85):(L.res?.4:.22);
 let color=blend(L.items.map(k=>REAG[k].c))||'rgba(0,0,0,0)';
 if(L.res&&L.res.color)color=hexLerp(color||'#dfe9f5',L.res.color,clamp(t,0,1));
 if(L.res&&L.res.prec&&t>0.4)color=color;
 g.save();
 g.strokeStyle='#7a8ba0';g.fillStyle='rgba(255,255,255,.75)';g.lineWidth=3;
 // путь сосуда
 g.beginPath();
 if(app==='test'){
  const rw=vw*0.42;
  g.moveTo(cx-rw,topY);g.lineTo(cx-rw,bottom-rw);g.arc(cx,bottom-rw,rw,Math.PI,0,false);g.lineTo(cx+rw,topY);
 }else if(app==='cup'){
  const rw=vw*0.9;
  g.moveTo(cx-rw,topY+30);g.lineTo(cx-rw,bottom-16);g.quadraticCurveTo(cx-rw,bottom,cx-rw+16,bottom);g.lineTo(cx+rw-16,bottom);g.quadraticCurveTo(cx+rw,bottom,cx+rw,bottom-16);g.lineTo(cx+rw,topY+30);g.lineTo(cx+rw-10,topY);g.lineTo(cx-rw+10,topY);g.closePath();
 }else{
  const rw=vw*0.95;
  g.moveTo(cx-11,topY);g.lineTo(cx+11,topY);g.lineTo(cx+11,topY+36);g.lineTo(cx+rw,bottom);g.quadraticCurveTo(cx+rw,bottom+4,cx+rw-6,bottom+4);g.lineTo(cx-rw+6,bottom+4);g.quadraticCurveTo(cx-rw,bottom+4,cx-rw,bottom);g.lineTo(cx-11,topY+36);g.closePath();
 }
 g.fill();
 // жидкость: клип по форме сосуда
 g.save();g.clip();
 const lvl=bottom-(bottom-topY-6)*liq;
 g.fillStyle=color;g.globalAlpha=.85;
 g.fillRect(cx-vw*1.1,lvl,vw*2.2,bottom-lvl+8);
 g.globalAlpha=1;
 // мениск
 g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;g.beginPath();g.moveTo(cx-vw,lvl+3);g.quadraticCurveTo(cx,lvl+7,cx+vw,lvl+3);g.stroke();
 // осадок: частицы падают и оседают
 if(L.res&&L.res.prec){
  g.fillStyle=L.res.prec;
  for(const p of L.prec){p.y=Math.min(1,p.y+p.v*0.016);const py=lvl+(bottom-lvl-10)*Math.min(1,p.y*2.2);const settleY=bottom-8-Math.abs(Math.sin(p.x*40))*10;
   const yy=p.y>=0.45?Math.min(py,settleY):py;
   g.beginPath();g.arc(cx+(p.x-.5)*vw*1.5,yy,PERF.eco?2.5:3.5,0,7);g.fill()}
  // слой осадка на дне
  g.globalAlpha=Math.min(1,t*1.5)*.8;g.beginPath();g.ellipse(cx,bottom-4,vw*(app==='test'?0.4:0.8),6,0,0,7);g.fill();g.globalAlpha=1;
 }
 // медный налёт
 if(L.res&&L.res.copper&&t>0.5){g.fillStyle='#e07850';for(let i=0;i<14;i++){const a=i/14*Math.PI*2;g.beginPath();g.arc(cx+Math.cos(a)*vw*0.5*0.55,bottom-10+Math.sin(a)*4,PERF.eco?3:5,0,7);g.fill()}}
 // пузырьки
 if(L.res&&L.res.gas){
  g.fillStyle='rgba(255,255,255,.9)';
  for(const b of L.bub){b.y+=b.v*0.014;if(b.y>1){b.y=0;b.x=Math.random()}
   g.beginPath();g.arc(cx+(b.x-.5)*vw*1.2,bottom-(bottom-lvl)*b.y,PERF.eco?3:5,0,7);g.fill()}
 }
 // кусочки металла
 for(const k of L.items){const r=REAG[k];if(r.t==='металл'){g.fillStyle=r.c;g.beginPath();g.ellipse(cx+((k.length%3)-1)*vw*0.45,bottom-8,10,5,0,0,7);g.fill()}}
 g.restore();
 g.stroke();
 // пламя спиртовки
 if(L.heating){g.fillStyle='#f0a030';const fl=Math.sin(Date.now()/90)*3;
  g.beginPath();g.moveTo(cx-10,bottom+6);g.quadraticCurveTo(cx,bottom+26+fl,cx+10,bottom+6);g.fill();
  g.fillStyle='#f8d060';g.beginPath();g.moveTo(cx-5,bottom+6);g.quadraticCurveTo(cx,bottom+16+fl,cx+5,bottom+6);g.fill()}
 g.restore();
}


