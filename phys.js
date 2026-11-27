'use strict';
/* phys.js — вся логика физики: каталог, калькулятор, демонстрации. */

/* ============ 17. РЕШАТЕЛЬ ============ */
function powStr(k,p){return p===1?k:(p===2?k+'²':k+'^'+p)}
function exprParts(f,unk){
 const p=f.eq[unk],c=f.c||1;const num=[],den=[];let sq=false;
 for(const k in f.eq){if(k===unk)continue;const kp=f.eq[k];if(kp<0)num.push({k,pow:-kp});else den.push({k,pow:kp})}
 let coef=1;
 if(p===1)coef=1/c;else if(p===-1)coef=c;else if(p===2){sq=true;coef=1/c}else if(p===-2){sq=true;coef=c}
 return{sq,num,den,coef,p}}
function exprText(parts){let num=parts.num.map(x=>powStr(x.k,x.pow)).join('·')||'1';let den=parts.den.map(x=>powStr(x.k,x.pow)).join('·');
 if(Math.abs(parts.coef-1)>1e-9){const cs=fmt(Math.abs(parts.coef));num=(parts.coef<1?'':'(')+num+(parts.coef<1?')':'');if(parts.coef!==1)num=(fmt(parts.coef))+'·'+num}
 return (parts.sq?'√(':'')+(num+(den?' / ('+den+')':''))+(parts.sq?')':'')}
function substText(parts,vals,f){const N=k=>{const vr=f.v.find(x=>x.k===k);return fmt(vals[k])+' '+vr.u[0]};
 let num=parts.num.map(x=>N(x.k)).join(' · ')||'1';let den=parts.den.map(x=>N(x.k)).join(' · ');
 if(Math.abs(parts.coef-1)>1e-9)num=fmt(parts.coef)+'·'+num;
 return (parts.sq?'√(':'')+(num+(den?' / ('+den+')':''))+(parts.sq?')':'')}
function solveGeneric(f,unk,vals){
 if(!(unk in f.eq))return{err:'Эта величина не входит в формулу.'};
 for(const k in f.eq){if(k===unk)continue;if(vals[k]==null||!isFinite(vals[k]))return{err:'Заполните все известные значения.'}}
 const parts=exprParts(f,unk);
 let denom=(f.c||1);
 for(const o of parts.den)denom*=Math.pow(vals[o.k],o.pow);
 for(const o of parts.num)denom/=Math.pow(vals[o.k],o.pow);
 const val=Math.pow(1/denom,1/parts.p);
 if(!isFinite(val)||isNaN(val))return{err:'Не удалось вычислить — проверьте значения (ноль в знаменателе?).'};
 const unkVar=f.v.find(x=>x.k===unk);
 return{val,steps:['Формула: '+f.tx,'Выражаем '+unkVar.n+': '+exprText(parts),'Подстановка: '+substText(parts,vals,f),'Результат: '+fmt(val)+' '+unkVar.u[0]+' (в СИ)']}}
function solveSpecial(f,unk,vals){
 const sp=f.special;
 if(sp==='vel'){
  const {v,v0,a,t}=vals;const tv=v==null?v0==null?null:v0==null?v:null:null;
  if(unk==='a'){if(!t)return{err:'Время не может быть нулём.'};const val=(v-v0)/t;return{val,steps:['a = (v − v₀) / t','a = ('+fmt(v)+' − '+fmt(v0)+') м/с / '+fmt(t)+' с','a = '+fmt(val)+' м/с²']}}
  if(unk==='v'){const val=v0+a*t;return{val,steps:['v = v₀ + a·t','v = '+fmt(v0)+' + '+fmt(a)+'·'+fmt(t),'v = '+fmt(val)+' м/с']}}
  if(unk==='v0'){const val=v-a*t;return{val,steps:['v₀ = v − a·t','v₀ = '+fmt(v)+' − '+fmt(a)+'·'+fmt(t),'v₀ = '+fmt(val)+' м/с']}}
  if(unk==='t'){if(a===0)return{err:'При нулевом ускорении время нельзя найти из этой формулы.'};const val=(v-v0)/a;return{val,steps:['t = (v − v₀) / a','t = ('+fmt(v)+' − '+fmt(v0)+') / '+fmt(a),'t = '+fmt(val)+' с']}}
 }
 if(sp==='quad'){
  const {S,v0,a,t}=vals;
  if(unk==='S'){const val=v0*t+a*t*t/2;return{val,steps:['S = v₀·t + a·t²/2','S = '+fmt(v0)+'·'+fmt(t)+' + '+fmt(a)+'·'+fmt(t)+'²/2','S = '+fmt(val)+' м']}}
  if(unk==='v0'){if(!t)return{err:'Время не может быть нулём.'};const val=(S-a*t*t/2)/t;return{val,steps:['v₀ = (S − a·t²/2) / t','v₀ = ('+fmt(S)+' − '+fmt(a)+'·'+fmt(t)+'²/2) / '+fmt(t),'v₀ = '+fmt(val)+' м/с']}}
  if(unk==='a'){if(!t)return{err:'Время не может быть нулём.'};const val=2*(S-v0*t)/(t*t);return{val,steps:['a = 2(S − v₀·t) / t²','a = 2·('+fmt(S)+' − '+fmt(v0)+'·'+fmt(t)+') / '+fmt(t)+'²','a = '+fmt(val)+' м/с²']}}
  if(unk==='t'){
   if(Math.abs(a||0)<1e-12){if(!v0)return{err:'При a=0 нужно v₀ ≠ 0: t = S/v₀.'};const val=S/v0;return{val,steps:['При a = 0: t = S / v₀','t = '+fmt(S)+' / '+fmt(v0),'t = '+fmt(val)+' с']}}
   const disc=v0*v0+2*a*S;if(disc<0)return{err:'Дискриминант отрицателен — таких значений не бывает.'};
   const val=(-v0+Math.sqrt(disc))/a;return{val,steps:['Квадратное уравнение: (a/2)·t² + v₀·t − S = 0','t = (−v₀ + √(v₀² + 2aS)) / a','t = ('+fmt(-v0)+' + √'+fmt(disc)+') / '+fmt(a),'t = '+fmt(val)+' с']}}
 }
 if(sp==='series'){
  const {R,R1,R2}=vals;
  if(unk==='R'){const val=R1+R2;return{val,steps:['R = R₁ + R₂','R = '+fmt(R1)+' + '+fmt(R2),'R = '+fmt(val)+' Ом']}}
  if(unk==='R1'){const val=R-R2;return{val,steps:['R₁ = R − R₂','R₁ = '+fmt(R)+' − '+fmt(R2),'R₁ = '+fmt(val)+' Ом']}}
  if(unk==='R2'){const val=R-R1;return{val,steps:['R₂ = R − R₁','R₂ = '+fmt(R)+' − '+fmt(R1),'R₂ = '+fmt(val)+' Ом']}}
 }
 if(sp==='snell'){
  const {n1,n2,alpha,beta}=vals;const D=Math.PI/180;
  if(unk==='beta'){const s=n1*Math.sin(alpha*D)/n2;if(s>1)return{val:90,warn:'Полное внутреннее отражение: луч не выходит во вторую среду.',steps:['sinβ = n₁·sinα / n₂ = '+fmt(s)+' > 1 — преломлённого луча нет','β = 90° — луч отражается полностью']};const val=Math.asin(s)/D;return{val,steps:['sinβ = n₁·sinα / n₂','sinβ = '+fmt(s),'β = arcsin('+fmt(s)+') = '+fmt(val)+'°']}}
  if(unk==='alpha'){const s=n2*Math.sin(beta*D)/n1;if(s>1)return{err:'Получился sinα > 1 — такие значения невозможны.'};const val=Math.asin(s)/D;return{val,steps:['sinα = n₂·sinβ / n₁','sinα = '+fmt(s),'α = arcsin('+fmt(s)+') = '+fmt(val)+'°']}}
  if(unk==='n1'){if(alpha===0)return{err:'Угол падения не может быть нулём.'};const val=n2*Math.sin(beta*D)/Math.sin(alpha*D);return{val,steps:['n₁ = n₂·sinβ / sinα','n₁ = '+fmt(n2)+'·'+fmt(Math.sin(beta*D))+' / '+fmt(Math.sin(alpha*D)),'n₁ = '+fmt(val)]}}
  if(unk==='n2'){if(beta===0)return{err:'Угол преломления не может быть нулём.'};const val=n1*Math.sin(alpha*D)/Math.sin(beta*D);if(val<1)return{val,warn:'Получился n₂ < 1 — для реальных сред так не бывает, проверьте углы.'};return{val,steps:['n₂ = n₁·sinα / sinβ','n₂ = '+fmt(n1)+'·'+fmt(Math.sin(alpha*D))+' / '+fmt(Math.sin(beta*D)),'n₂ = '+fmt(val)]}}
 }
 if(sp==='lens'){
  const {F,d,f_}=vals;
  const fin=(x,k)=>x==null?null:x;
  if(unk==='F'){const dd=vals.d,ff=vals.f;if(!dd||!ff)return{err:'Расстояния не могут быть нулевыми.'};if(Math.abs(dd-ff)<1e-9)return{err:'Предмет в фокусе (d = F): изображения не существует.'};const val=1/(1/dd+1/ff);return{val,steps:['1/F = 1/d + 1/f','F = 1 / (1/d + 1/f)','F = 1 / ('+fmt(1/dd)+' + '+fmt(1/ff)+')','F = '+fmt(val)+' м']}}
  if(unk==='d'){if(!F||!f_)return{err:'Расстояния не могут быть нулевыми.'};const inv=1/F-1/f_;if(Math.abs(inv)<1e-12)return{err:'Изображение на бесконечности.'};const val=1/inv;return{val,steps:['1/d = 1/F − 1/f','d = 1 / (1/F − 1/f)','d = '+fmt(val)+' м']}}
  if(unk==='f'){if(!F||!d)return{err:'Расстояния не могут быть нулевыми.'};if(Math.abs(d-F)<1e-9)return{err:'Предмет в фокусе (d = F): изображения не существует.'};const inv=1/F-1/d;const val=1/inv;if(val<0)return{val,warn:'f < 0 — изображение мнимое (предмет ближе фокуса).'};return{val,steps:['1/f = 1/F − 1/d','f = 1 / (1/F − 1/d)','f = '+fmt(val)+' м']}}
 }
 return{err:'Неизвестная величина не найдена в этом решателе.'}
}
function solve(f,unk,vals){
 if(!unk)return{err:'Выберите, что найти.'};
 if(vals[unk]!=null&&!isFinite(vals[unk]))delete vals[unk];
 const bad=f.v.filter(x=>x.k&&vals[x.k]!=null&&!isFinite(vals[x.k]));
 if(bad.length)return{err:'Проверьте числовые значения.'};
 for(const x of f.v){if(!x.k)continue;if(x.k===unk)continue;if(vals[x.k]==null)return{err:'Заполните значение: '+x.n+'.'};if(vals[x.k]<0&&!(x.an||x.k==='v0'||x.k==='a'||x.k==='dt'||x.k==='F'))return{err:'«'+x.n+'» не может быть отрицательной величиной.'}}
 if(f.special)return solveSpecial(f,unk,vals);
 return solveGeneric(f,unk,vals);
}

/* ============ 18. ФИЗИКА: КАТАЛОГ И КАЛЬКУЛЯТОР ============ */
const PH={theme:null,mode:'calc',fid:null,unk:null,demo:null};
function renderPhys(){
 const v=$('#v-phys');v.innerHTML='';
 const cr=el('div','crumbs');
 if(PH.theme||PH.demo){
  const b=el('button',null,'🏠 Главная › ⚡ Физика');
  b.addEventListener('click',()=>{PH.theme=null;PH.demo=null;renderPhys()});
  cr.appendChild(b);
  if(PH.theme)cr.appendChild(document.createTextNode(' › '+THEMES.find(t=>t.id===PH.theme).n));
 }else cr.appendChild(document.createTextNode('🏠 Главная › ⚡ Физика'));
 v.appendChild(cr);
 if(PH.demo)return renderDemo(v,PH.demo);
 if(PH.theme)return renderTheme(v,PH.theme);
 v.appendChild(el('h2',null,'Каталог тем'));
 v.appendChild(el('p','muted','Выберите тему — внутри формулы с калькулятором и интерактивные демонстрации. Калькулятор работает полностью офлайн.'));
 THEMES.forEach(t=>{
  const c=el('div','card');
  c.innerHTML='<h2>'+t.n+' <span class="muted">· '+t.cls+'</span></h2><p class="muted">'+t.d+'</p>';
  const row=el('div','row');
  const b1=el('button','btn pri','Формулы и калькулятор');b1.addEventListener('click',()=>{PH.theme=t.id;PH.mode='calc';renderPhys()});
  const b2=el('button','btn','Демонстрация');b2.addEventListener('click',()=>{PH.demo=DEMO_BY_THEME[t.id]||'motion';renderPhys()});
  row.appendChild(b1);row.appendChild(b2);c.appendChild(row);
  v.appendChild(c);
 });
}
const DEMO_BY_THEME={kin:'motion',dyn:'incline',hyd:'incline',elec:'circuit',opt:'refraction',heat:'circuit'};
function renderTheme(v,tid){
 const t=THEMES.find(x=>x.id===tid);
 v.appendChild(el('h2',null,t.n+' <span class="muted">· '+t.cls+'</span>'));
 const fs=FORMULAS.filter(x=>x.th===tid);
 fs.forEach(f=>{
  const c=el('div','card');
  c.innerHTML='<h3>'+f.n+'</h3><div class="eq">'+f.tx+'</div><p class="muted">'+f.i+'</p>';
  const b=el('button','btn pri','🧮 Решить в калькуляторе');
  b.addEventListener('click',()=>{PH.fid=f.id;PH.mode='calc';renderPhys()});
  c.appendChild(b);v.appendChild(c);
 });
}
function renderCalc(v){
 const f=FORMULAS.find(x=>x.id===PH.fid)||FORMULAS[0];PH.fid=f.id;
 if(!PH.unk||!f.v.some(x=>x.k===PH.unk))PH.unk=f.v[0].k;
 const card=el('div','card');
 card.appendChild(el('h3',null,f.n+' — '+f.tx));
 card.appendChild(el('p','muted',f.i));
 const unkSel=el('select');unkSel.setAttribute('aria-label','Что найти');
 f.v.filter(x=>x.k).forEach(x=>{const o=el('option',null,'Найти: '+x.n+' ('+x.u[0]+')');o.value=x.k;if(x.k===PH.unk)o.selected=true;unkSel.appendChild(o)});
 card.appendChild(el('label','ctl','Что найти'));card.appendChild(unkSel);
 const ins=el('div');
 f.v.filter(x=>x.k&&x.k!==PH.unk).forEach(x=>{
  const lab=el('label','ctl',esc(x.n));
  const row=el('div','row');
  const inp=el('input');inp.type='number';inp.step='any';inp.placeholder='значение';inp.dataset.k=x.k;
  const uSel=el('select');uSel.setAttribute('aria-label','Единица для '+x.n);
  x.u.forEach(u=>{const o=el('option',null,u);uSel.appendChild(o)});
  if(x.def!=null){inp.value=x.def;inp.disabled=true}
  row.appendChild(inp);row.appendChild(uSel);lab.appendChild(row);ins.appendChild(lab);
 });
 card.appendChild(ins);
 const res=el('div');card.appendChild(res);
 const go=el('button','btn pri','Рассчитать');
 go.addEventListener('click',()=>{
  const vals={};let ok=true;
  f.v.filter(x=>x.k&&x.k!==PH.unk).forEach(x=>{
   const inp=ins.querySelector('input[data-k="'+x.k+'"]');const usel=inp.parentNode.querySelector('select');
   let s=inp.value.replace(',','.');
   if(x.def!=null){vals[x.k]=x.def;return}
   const n=parseFloat(s);
   if(s===''||!isFinite(n)){ok=false;return}
   vals[x.k]=n*U[usel.value];
  });
  res.innerHTML='';
  if(!ok){res.appendChild(el('div','bad','Заполните все поля числами.'));return}
  S.stats.calc++;save();bump('calc');checkBadges();
  const r=solve(f,PH.unk,vals);
  if(r.err){res.appendChild(el('div','bad',esc(r.err)));return}
  if(r.warn)res.appendChild(el('div','warn','⚠️ '+esc(r.warn)));
  const st=el('div','steps');r.steps.forEach(s=>st.appendChild(el('div',null,esc(s))));res.appendChild(st);
  const unkVar=f.v.find(x=>x.k===PH.unk);
  res.appendChild(el('p','muted','Все значения приведены к СИ перед вычислением — единицы совместимы автоматически. Прибавка +2 XP за расчёт.'));
  addXP(2);
 });
 card.appendChild(go);
 v.appendChild(card);
}
function renderDemo(v,id){
 v.appendChild(el('h2',null,'Демонстрация'));
 const box=el('div','card');box.id='demo-box';
 const back=el('button','btn','← К темам');back.addEventListener('click',()=>{PH.demo=null;renderPhys()});
 box.appendChild(back);
 v.appendChild(box);
 DEMOS[id](box);
 S.stats.demo++;save();checkBadges();
}

/* ============ 19. ДЕМОНСТРАЦИИ ФИЗИКИ ============ */
const DEMOS={};
DEMOS.motion=function(box){
 box.appendChild(el('p','muted','Равномерное движение: тело едет со скоростью v, внизу строится график пути S(t) — прямая линия.'));
 const st={v:4,t:0};let cv=el('canvas','scene');cv.setAttribute('aria-label','Анимация равномерного движения');box.appendChild(cv);
 const lab=el('div','eq','v = 4 м/с · S(t) — прямая линия');box.appendChild(lab);
 const sl=el('input');sl.type='range';sl.min=1;sl.max=10;sl.step=.5;sl.value=4;sl.setAttribute('aria-label','Скорость, м/с');
 sl.addEventListener('input',()=>{st.v=+sl.value;lab.textContent='v = '+fmt(st.v)+' м/с · S(t) — прямая линия'});
 box.appendChild(sl);
 new Scene(cv,{spin:false,draw:(sc,w,h,g)=>{
  st.t=(st.t%20);
  const sx=w*0.06+((st.t*st.v*6)%(w*0.86));
  g.strokeStyle='#2f6fd8';g.lineWidth=4;g.beginPath();g.moveTo(0,h*0.42);g.lineTo(w,h*0.42);g.stroke();
  g.fillStyle='#2f6fd8';g.beginPath();g.arc(sx,h*0.42-12,12,0,7);g.fill();
  g.fillStyle='#5f6f81';g.font='12px system-ui';g.fillText('t = '+fmt(st.t)+' с',10,18);
  g.fillText('S = '+fmt(st.t*st.v)+' м',10,34);
  // график S(t)
  const gx=w*0.08,gy=h*0.82,gl=w*0.84,gh=h*0.3;
  g.strokeStyle='#9aa8ba';g.lineWidth=1;g.strokeRect(gx,gy-gl,gl,gh);
  g.beginPath();g.strokeStyle='#1fa9a0';g.lineWidth=3;g.moveTo(gx,gy);
  for(let i=0;i<=40;i++){const tt=i/40*20;g.lineTo(gx+gl*i/40,gy-clamp(tt*st.v/((20*10)),0,1)*gh)}
  g.stroke();
  g.fillStyle='#5f6f81';g.fillText('S,м',gx+4,gy-gl+12);g.fillText('t,с',gx+gl-20,gy+14);
 }});
};
DEMOS.incline=function(box){
 box.appendChild(el('p','muted','Наклонная плоскость: чем больше угол, тем больше ускорение a = g·sin α. Трение не учитываем.'));
 const st={a:20};
 const cv=el('canvas','scene');cv.setAttribute('aria-label','Демонстрация наклонной плоскости');box.appendChild(cv);
 const lab=el('div','eq','a = g·sin α');box.appendChild(lab);
 const sl=el('input');sl.type='range';sl.min=5;sl.max=45;sl.value=20;sl.setAttribute('aria-label','Угол наклона, градусов');
 sl.addEventListener('input',()=>{st.a=+sl.value});
 box.appendChild(sl);
 new Scene(cv,{spin:false,draw:(sc,w,h,g)=>{
  const D=Math.PI/180;const ang=st.a*D;
  const ox=w*0.12,oy=h*0.8,olen=w*0.72;
  const tx=ox+olen,ty=oy-Math.tan(ang)*olen;
  g.fillStyle='#c8d4e4';g.beginPath();g.moveTo(ox,oy);g.lineTo(tx,ty);g.lineTo(tx,oy);g.closePath();g.fill();
  g.strokeStyle='#7a8ba0';g.lineWidth=2;g.stroke();
  const mx=(ox+tx)/2,my=(oy+ty)/2;
  g.save();g.translate(mx,my);g.rotate(-ang);
  g.fillStyle='#e08a3c';g.fillRect(-18,-14,36,26);g.fillStyle='#5f6f81';g.fillRect(-18,-14,36,4);
  g.restore();
  // силы
  const gx=Math.sin(ang)*9.8,gy=Math.cos(ang)*9.8;
  g.strokeStyle='#c0392b';g.lineWidth=3;
  g.beginPath();g.moveTo(mx,my);g.lineTo(mx+gx*8,my+gy*8);g.stroke();
  g.fillStyle='#c0392b';g.beginPath();g.arc(mx+gx*8,my+gy*8,4,0,7);g.fill();
  g.fillStyle='#1c2733';g.font='13px system-ui';
  g.fillText('α = '+st.a+'° · a = g·sin α = '+fmt(gx)+' м/с²',10,20);
 }});
};
DEMOS.circuit=function(box){
 box.appendChild(el('p','muted','Цепь: источник, лампа и резистор. Закон Ома I = U/R, мощность лампы P = U·I — чем больше ток, тем ярче свет.'));
 const st={u:6,r:20};
 const cv=el('canvas','scene');cv.setAttribute('aria-label','Демонстрация электрической цепи');box.appendChild(cv);
 const l1=el('label','ctl','Напряжение U = 6 В');const s1=el('input');s1.type='range';s1.min=1;s1.max=12;s1.value=6;
 s1.addEventListener('input',()=>{st.u=+s1.value;l1.firstChild.textContent='Напряжение U = '+st.u+' В'});
 l1.appendChild(s1);box.appendChild(l1);
 const l2=el('label','ctl','Сопротивление R = 20 Ом');const s2=el('input');s2.type='range';s2.min=5;s2.max=100;s2.value=20;
 s2.addEventListener('input',()=>{st.r=+s2.value;l2.firstChild.textContent='Сопротивление R = '+st.r+' Ом'});
 l2.appendChild(s2);box.appendChild(l2);
 new Scene(cv,{spin:false,draw:(sc,w,h,g)=>{
  const I=st.u/st.r;const P=st.u*I;
  const bri=clamp(P/7.2,0.06,1);
  g.strokeStyle='#5a6a7a';g.lineWidth=4;
  g.strokeRect(w*0.15,h*0.2,w*0.7,h*0.55);
  // батарея
  g.fillStyle='#2f6fd8';g.fillRect(w*0.13,h*0.42,w*0.04,h*0.12);g.fillStyle='#9fc0f0';g.fillRect(w*0.155,h*0.45,w*0.015,h*0.06);
  // лампа
  const lx=w*0.5,ly=h*0.22;
  g.fillStyle='rgba(248,210,90,'+(0.25+bri*0.7)+')';g.beginPath();g.arc(lx,ly,26+bri*16,0,7);g.fill();
  g.fillStyle='#e8d060';g.beginPath();g.arc(lx,ly,14,0,7);g.fill();
  g.strokeStyle='#7a8ba0';g.lineWidth=2;g.stroke();
  // резистор
  g.fillStyle='#e08a3c';g.fillRect(w*0.46,h*0.68,w*0.08,20);g.strokeStyle='#5a6a7a';g.strokeRect(w*0.46,h*0.68,w*0.08,20);
  // электроны движутся по контуру
  const n=PERF.eco?6:14;
  g.fillStyle='#1fa9a0';
  for(let i=0;i<n;i++){const p=((sc.t*I*0.6)+i/n)%1;let x,y;
   const per=w*0.7+h*0.55;const d=p*per;
   if(d<w*0.7){x=w*0.15+d;y=h*0.75}else if(d<w*0.7+h*0.55){x=w*0.85;y=h*0.2+(d-w*0.7)}else{x=w*0.85-(d-w*0.7-h*0.55);y=h*0.2}
   g.beginPath();g.arc(x,y,3.5,0,7);g.fill()}
  g.fillStyle='#1c2733';g.font='13px system-ui';
  g.fillText('I = U/R = '+fmt(I)+' А · P = U·I = '+fmt(P)+' Вт',10,20);
 }});
};
DEMOS.refraction=function(box){
 box.appendChild(el('p','muted','Преломление света на границе двух сред. Увеличьте угол падения — во второй среде луч прижмётся к нормали (закон Снеллиуса).'));
 const st={a:45,n1:1.0,n2:1.5};
 const cv=el('canvas','scene');cv.setAttribute('aria-label','Демонстрация преломления света');box.appendChild(cv);
 const l1=el('label','ctl','Угол падения: 45°');const s1=el('input');s1.type='range';s1.min=10;s1.max=85;s1.value=45;
 s1.addEventListener('input',()=>{st.a=+s1.value;l1.firstChild.textContent='Угол падения: '+st.a+'°'});
 l1.appendChild(s1);box.appendChild(l1);
 const l2=el('label','ctl','Среда 2: стекло (n = 1,5)');
 const sel=el('select');[['Воздух (n = 1,0)',1],['Вода (n = 1,33)',1.33],['Стекло (n = 1,5)',1.5],['Алмаз (n = 2,42)',2.42]].forEach(o=>{const e=el('option',null,o[0]);e.value=o[1];if(o[1]===1.5)e.selected=true;sel.appendChild(e)});
 sel.addEventListener('change',()=>{st.n2=+sel.value});
 l2.appendChild(sel);box.appendChild(l2);
 new Scene(cv,{spin:false,draw:(sc,w,h,g)=>{
  const D=Math.PI/180;const a=st.a;
  const ix=w*0.5,iy=h*0.5;
  g.fillStyle='rgba(240,244,252,.6)';g.fillRect(0,0,w,iy);
  g.fillStyle='rgba(200,230,244,.6)';g.fillRect(0,iy,w,h-iy);
  g.strokeStyle='#9aa8ba';g.setLineDash([6,5]);g.beginPath();g.moveTo(ix,iy-h*0.45);g.lineTo(ix,iy+h*0.45);g.stroke();g.setLineDash([]);
  // падающий луч
  const rl=w*0.42;
  const dx=-Math.sin(a*D),dy=-Math.cos(a*D);
  g.strokeStyle='#c0392b';g.lineWidth=3;g.beginPath();g.moveTo(ix,iy);g.lineTo(ix+dx*rl,iy+dy*rl);g.stroke();
  const s=n1*Math.sin(a*D)/st.n2;let txt='';
  if(s>1){
   const dx2=-dx,dy2=dy;
   g.strokeStyle='#e08a3c';g.beginPath();g.moveTo(ix,iy);g.lineTo(ix+dx2*rl,iy-dy2*rl);g.stroke();
   txt='sinβ = '+fmt(s)+' > 1 → полное внутреннее отражение';
  }else{
   const b=Math.asin(s)/D;
   const dx2=Math.sin(b*D),dy2=Math.cos(b*D);
   g.strokeStyle='#2f6fd8';g.beginPath();g.moveTo(ix,iy);g.lineTo(ix+dx2*rl,iy+dy2*rl);g.stroke();
   g.fillStyle='#2f6fd8';g.font='13px system-ui';g.fillText('β = '+fmt(b)+'°',ix+dx2*rl*0.6,iy+dy2*rl*0.6);
   txt='sinβ = n₁·sinα/n₂ = '+fmt(s)+' → β = '+fmt(b)+'°';
  }
  g.fillStyle='#1c2733';g.font='13px system-ui';
  g.fillText('α = '+a+'°',ix+dx*rl*0.7,iy+dy*rl*0.7);
  g.fillText(txt,10,h-10);
  g.fillStyle='#5f6f81';g.fillText('n₁ = '+st.n1+' (воздух) · n₂ = '+st.n2,10,16);
 }});
};


