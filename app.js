'use strict';
/* app.js — точка входа: утилиты, состояние, геймификация, навигация, запуск. Загружается последним. */

/* ============ 1. УТИЛИТЫ ============ */
/* ============ 1. УТИЛИТЫ ============ */
const $=s=>document.querySelector(s);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function fmt(n){if(!isFinite(n))return '—';const a=Math.abs(n);if(a!==0&&(a<0.01||a>=1e6)){return n.toExponential(2).replace('.',',')}return (Math.round(n*100)/100).toString().replace('.',',')}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};


/* ============ 2. СОСТОЯНИЕ ============ */
/* ============ 2. СОСТОЯНИЕ ============ */
const SKEY='nauka_karman_v3';
const DEF={xp:0,streak:0,last:'',qday:'',qp:{},qd:{},badges:{},stats:{tests:0,right:0,wrong:0,lab:0,demo:0,calc:0,elems:0},best:null};
let S=loadState();
function loadState(){try{const r=JSON.parse(localStorage.getItem(SKEY));if(!r)return JSON.parse(JSON.stringify(DEF));const o=Object.assign({},JSON.parse(JSON.stringify(DEF)),r);o.stats=Object.assign({},DEF.stats,r.stats||{});return o}catch(e){return JSON.parse(JSON.stringify(DEF))}}
function save(){try{localStorage.setItem(SKEY,JSON.stringify(S))}catch(e){}}
const dayKey=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const lvlOf=xp=>Math.floor(Math.sqrt(xp/50))+1;
const xpNeed=l=>50*(l-1)*(l-1);
function addXP(n){S.xp+=n;const before=lvlOf(S.xp-n);const after=lvlOf(S.xp);save();updHeader();if(after>before){toast('🎉 Новый уровень '+after+'!')}checkBadges()}
function updHeader(){$('#hd-streak').textContent='🔥 '+S.streak;$('#hd-lvl').textContent='⭐ '+lvlOf(S.xp)+' ур. · '+S.xp+' XP'}


/* ============ 3. СТРИК И КВЕСТЫ ============ */
/* ============ 3. СТРИК И КВЕСТЫ ============ */
function checkStreak(){const t=dayKey();if(S.last===t)return;const y=new Date(Date.now()-864e5);const yk=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();S.streak=(S.last===yk)?S.streak+1:1;S.last=t;if(S.streak>1)toast('🔥 Стрик: '+S.streak+' дн.!');save();checkBadges()}function makeQuests(){if(S.qday!==dayKey()){S.qday=dayKey();S.qp={};S.qd={};save()}}
function bump(k){makeQuests();const q=QUESTS.find(x=>x.k===k);if(!q)return;S.qp[k]=(S.qp[k]||0)+1;if(S.qp[k]>=q.goal&&!S.qd[k]){S.qd[k]=1;toast('✅ Квест выполнен: '+q.t);addXP(15)}else save()}


/* ============ 4. ДОСТИЖЕНИЯ ============ */
/* ============ 4. ДОСТИЖЕНИЯ ============ */
function give(id){if(S.badges[id])return;S.badges[id]=1;const b=BADGES.find(x=>x.id===id);if(b)toast('🏆 Достижение: '+b.t);addXP(25)}
function checkBadges(){if(S.stats.lab>=1)give('lab1');if(S.stats.lab>=10)give('lab10');if(S.streak>=7)give('streak7');if(S.best===5)give('perfect');if(lvlOf(S.xp)>=5)give('lvl5');if(S.stats.demo>=3)give('demo3');if(S.stats.calc>=10)give('calc10')}


/* ============ 5. ТОСТ ============ */
/* ============ 5. ТОСТ ============ */
let toastT=null;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600)}



/* ============ УЧЕБНИК ============ */
/* ============ 20. УЧЕБНИК ============ */
const TOPICS=[
 {t:'Строение атома',cls:'Химия · 8 класс',txt:'Атом состоит из ядра (протоны и нейтроны) и электронных оболочек. Число протонов = порядковый номер элемента. Электроны заполняют уровни: 2, 8, 18…',act:'Откройте элемент в справочнике — модель атома вращается и показывает оболочки',link:'chem'},
 {t:'Типы химических связей',cls:'Химия · 8–9 класс',txt:'Ковалентная неполярная (H₂), ковалентная полярная (H₂O), ионная (NaCl) — ион отдаёт электрон, а другой принимает.',act:'Смотрите раздел «Процессы»: анимация образования всех трёх типов связи',link:'chem'},
 {t:'Кислоты и основания',cls:'Химия · 8 класс',txt:'Кислоты содержат H⁺, основания — OH⁻. Индикаторы: фенолфталеин малиновый в щёлочи, метилоранж красный в кислоте. Нейтрализация: H⁺ + OH⁻ → H₂O.',act:'Проведите реакцию NaOH + фенолфталеин в лаборатории',link:'chem'},
 {t:'Скорость и движение',cls:'Физика · 7 класс',txt:'Равномерное движение: v = S/t. График пути от времени — прямая: чем круче, тем больше скорость.',act:'Включите демонстрацию «Движение» в физике',link:'phys'},
 {t:'Закон Ома',cls:'Физика · 8 класс',txt:'I = U/R: сила тока прямо пропорциональна напряжению и обратно пропорциональна сопротивлению. Мощность P = U·I.',act:'Соберите цепь в демонстрации «Электричество»',link:'phys'},
 {t:'Преломление света',cls:'Физика · 9 класс',txt:'На границе сред луч меняет направление: n₁·sin α = n₂·sin β. При переходе из менее плотной среды под большим углом возможно полное внутреннее отражение.',act:'Покрутите угол в демонстрации «Преломление»',link:'phys'}];
function renderBook(host){
 const v=host||$('#v-home');
 const box=el('div','card');
 box.appendChild(el('h2',null,'📖 Интерактивный учебник'));
 TOPICS.forEach(t=>{
  const it=el('div');
  it.innerHTML='<h3>'+esc(t.t)+' <span class="muted">· '+esc(t.cls)+'</span></h3><p>'+esc(t.txt)+'</p>';
  const b=el('button','btn',esc(t.act));
  b.addEventListener('click',()=>{switchView(t.link);if(t.link==='chem')CTC.tab='ref';if(t.link==='phys'){PH.demo=(t.t.indexOf('Ом')>=0?'circuit':t.t.indexOf('Скорость')>=0?'motion':t.t.indexOf('Преломление')>=0?'refraction':'motion')}render()});
  it.appendChild(b);box.appendChild(it);
 });
 v.appendChild(box);
}


/* ============ ТРЕНАЖЁР ============ */
/* ============ 21. ТРЕНАЖЁР: ЗАДАНИЯ ============ */
const TASKS=[
 {id:'f1',sub:'ф',gr:7,tp:'Давление',ty:'test',q:'Как изменится давление тела на опору, если площадь опоры уменьшить в 2 раза при той же силе?',o:['Увеличится в 2 раза','Уменьшится в 2 раза','Не изменится','Уменьшится в 4 раза'],a:0,s:'p = F/S — давление обратно пропорционально площади опоры.'},
 {id:'f2',sub:'ф',gr:7,tp:'Скорость',ty:'calc',q:'Велосипедист проехал 900 м за 3 мин. Найдите скорость в м/с.',a:5,sol:'v = S/t = 900 м / 180 с = 5 м/с.',s:'Переводим 3 мин = 180 с, затем v = S/t.'},
 {id:'f3',sub:'ф',gr:7,tp:'Сила тяжести',ty:'calc',q:'Чему равна сила тяжести, действующая на тело массой 5 кг? Ответ в ньютонах.',a:49,sol:'F = m·g = 5 кг · 9,8 м/с² = 49 Н.',s:'F = m·g, g ≈ 9,8 м/с².'},
 {id:'f4',sub:'ф',gr:7,tp:'Давление',ty:'test',q:'В трёх сосудах разной формы вода налита до одной высоты. Где давление на дно наибольшее?',o:['Одинаково во всех','В самом широком','В самом узком','Зависит от объёма'],a:0,s:'Гидростатическое давление зависит только от плотности и высоты столба: p = ρ·g·h.'},
 {id:'f5',sub:'ф',gr:7,tp:'Плотность',ty:'calc',q:'Тело объёмом 0,001 м³ имеет массу 2,7 кг. Найдите плотность в кг/м³. Какой это металл?',a:2700,sol:'ρ = m/V = 2,7/0,001 = 2700 кг/м³ — это алюминий.',s:'ρ = m/V.'},
 {id:'f6',sub:'ф',gr:8,tp:'Электричество',ty:'calc',q:'Через резистор 20 Ом идёт ток при напряжении 12 В. Найдите силу тока в амперах.',a:0.6,sol:'I = U/R = 12/20 = 0,6 А.',s:'Закон Ома: I = U/R.'},
 {id:'f7',sub:'ф',gr:8,tp:'Электричество',ty:'test',q:'Чему равно общее сопротивление при последовательном соединении 10 Ом и 15 Ом?',o:['25 Ом','5 Ом','6 Ом','150 Ом'],a:0,s:'При последовательном соединении R = R₁ + R₂.'},
 {id:'f8',sub:'ф',gr:8,tp:'Теплота',ty:'calc',q:'Сколько теплоты нужно, чтобы нагреть 2 кг воды от 20 до 70 °C? c воды = 4200 Дж/(кг·°C). Ответ в кДж.',a:420,sol:'Q = c·m·Δt = 4200·2·50 = 420 000 Дж = 420 кДж.',s:'Q = c·m·Δt, Δt = 50 °C.'},
 {id:'f9',sub:'ф',gr:8,tp:'Электричество',ty:'calc',q:'Лампа подключена к 220 В, ток 0,45 А. Найдите мощность в ваттах.',a:99,sol:'P = U·I = 220·0,45 = 99 Вт.',s:'P = U·I.'},
 {id:'f10',sub:'ф',gr:9,tp:'Оптика',ty:'test',q:'Луч переходит из воздуха в стекло. Как изменится угол преломления по сравнению с углом падения?',o:['Меньше угла падения','Больше угла падения','Равен ему','Не зависит от сред'],a:0,s:'n₂ > n₁ → sinβ < sinα — луч прижимается к нормали.'},
 {id:'f11',sub:'ф',gr:9,tp:'Оптика',ty:'calc',q:'Предмет находится на расстоянии 30 см от собирающей линзы с F = 10 см. Чему равно расстояние до изображения в сантиметрах?',a:15,sol:'1/f = 1/F − 1/d = 1/10 − 1/30 = 2/30 → f = 15 см.',s:'Формула тонкой линзы.'},
 {id:'f12',sub:'ф',gr:10,tp:'Квантовая физика',ty:'test',q:'Энергия фотона увеличивается, если...',o:['Увеличивается частота','Увеличивается длина волны','Свет становится краснее','Свет замедляется'],a:0,s:'E = h·ν — энергия пропорциональна частоте.'},
 {id:'f13',sub:'ф',gr:11,tp:'Квантовая физика',ty:'test',q:'Какое явление подтверждает корпускулярную (частичную) природу света?',o:['Фотоэффект','Интерференция','Дифракция','Отражение'],a:0,s:'Фотоэффект объясняется только частицами — фотонами с энергией hν.'},
 {id:'c1',sub:'х',gr:8,tp:'Периодический закон',ty:'test',q:'Что показывает порядковый номер элемента в таблице Менделеева?',o:['Число протонов в ядре','Число нейтронов','Атомную массу','Число электронов на внешнем уровне'],a:0,s:'Порядковый номер = заряд ядра = число протонов.'},
 {id:'c2',sub:'х',gr:8,tp:'Строение атома',ty:'test',q:'Сколько электронов на внешнем энергетическом уровне атома кислорода?',o:['6','8','2','4'],a:0,s:'Кислород: 2s²2p⁴ → на внешнем уровне 2+4 = 6 электронов.'},
 {id:'c3',sub:'х',gr:8,tp:'Признаки реакций',ty:'test',q:'Какой признак говорит о реакции с выделением газа?',o:['Пузырьки','Изменение цвета раствора','Нагревание пробирки','Выпадение осадка'],a:0,s:'Газ — это пузырьки; осадок — муть, цвет — окраска.'},
 {id:'c4',sub:'х',gr:8,tp:'Моль и масса',ty:'calc',q:'Какое количество вещества (моль) составляют 4 г водорода H₂? M(H₂) = 2 г/моль.',a:2,sol:'n = m/M = 4/2 = 2 моль.',s:'n = m/M.'},
 {id:'c5',sub:'х',gr:9,tp:'Классы веществ',ty:'test',q:'Какое из веществ относится к кислотам?',o:['HCl','NaOH','NaCl','CaO'],a:0,s:'HCl — соляная кислота; NaOH — основание, NaCl — соль, CaO — оксид.'},
 {id:'c6',sub:'х',gr:9,tp:'Качественные реакции',ty:'test',q:'При смешивании растворов AgNO₃ и HCl образуется...',o:['Белый осадок AgCl','Газ без цвета','Малиновая окраска','Ничего не происходит'],a:0,s:'AgCl — белый творожистый осадок, качественная реакция на хлорид-ион.'},
 {id:'c7',sub:'х',gr:9,tp:'Ряд активности',ty:'input',q:'Какой металл активнее: цинк или медь? Напишите название металла.',a:'цинк',s:'Zn стоит левее Cu в ряду активности — значит, активнее.'},
 {id:'c8',sub:'х',gr:9,tp:'Типы связей',ty:'test',q:'Какой тип химической связи в соединении NaCl?',o:['Ионная','Ковалентная полярная','Ковалентная неполярная','Металлическая'],a:0,s:'Типичный металл + типичный неметалл → ионная связь.'},
 {id:'c9',sub:'х',gr:10,tp:'Органика',ty:'test',q:'Группа −OH характерна для класса...',o:['Спиртов','Альдегидов','Карбоновых кислот','Алканов'],a:0,s:'Гидроксогруппа −OH — признак спиртов.'},
 {id:'c10',sub:'х',gr:10,tp:'Органика',ty:'calc',q:'Вычислите молярную массу этанола C₂H₅OH в г/моль (C=12, H=1, O=16).',a:46,sol:'M = 2·12 + 6·1 + 16 = 46 г/моль.',s:'Складываем атомные массы: C₂H₆O.'},
 {id:'c11',sub:'х',gr:10,tp:'Органика',ty:'test',q:'Продукты спиртового брожения глюкозы:',o:['Этанол и CO₂','Метан и вода','Только вода','Углерод и водород'],a:0,s:'C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂.'},
 {id:'c12',sub:'х',gr:11,tp:'Моль и масса',ty:'calc',q:'Какова масса 3 моль углекислого газа CO₂ в граммах? M(CO₂) = 44 г/моль.',a:132,sol:'m = n·M = 3·44 = 132 г.',s:'m = n·M.'},
 {id:'c13',sub:'х',gr:11,tp:'Скорость реакции',ty:'test',q:'Что НЕ влияет на скорость химической реакции?',o:['Форма сосуда','Температура','Концентрация реагентов','Катализатор'],a:0,s:'Скорость зависит от температуры, концентрации, катализатора и площади соприкосновения — но не от формы сосуда.'}
];
const TR={sub:'все',gr:'все',ty:'все',run:null};
function renderTasks(){
 const v=$('#v-tasks');v.innerHTML='';
 if(TR.run)return renderRun(v);
 v.appendChild(el('h2',null,'🎯 Тренажёр ОГЭ / ЕГЭ'));
 v.appendChild(el('p','muted','Авторские задания в формате экзаменов. Выберите фильтры и начните прогон из 5 заданий.'));
 const card=el('div','card');
 const mk=(id,label,opts,cur)=>{const lab=el('label','ctl',label);const s=el('select');s.id=id;s.setAttribute('aria-label',label);opts.forEach(o=>{const e=el('option',null,o[0]);e.value=o[1];if(o[1]===cur)e.selected=true;s.appendChild(e)});lab.appendChild(s);return lab};
 card.appendChild(mk('f-sub','Предмет',[['все','все'],['х','Химия'],['ф','Физика']],TR.sub));
 card.appendChild(mk('f-gr','Класс',[['все','все'],['7','7'],['8','8'],['9','9'],['10','10'],['11','11']],TR.gr));
 card.appendChild(mk('f-ty','Тип задания',[['все','все'],['test','Тест'],['input','Короткий ответ'],['calc','Задача']],TR.ty));
 const go=el('button','btn pri','Начать тренировку');
 go.addEventListener('click',()=>{TR.sub=$('#f-sub').value;TR.gr=$('#f-gr').value;TR.ty=$('#f-ty').value;startRun();renderTasks()});
 card.appendChild(go);
 // статистика
 const st=el('div','statgrid');st.style.marginTop='12px';
 st.appendChild(el('div','stat','<b>'+S.stats.tests+'</b><span>прогонов</span>'));
 st.appendChild(el('div','stat','<b>'+(S.stats.tests?Math.round(S.stats.right/(S.stats.right+S.stats.wrong||1)*100):0)+'%</b><span>верных ответов</span>'));
 card.appendChild(st);
 v.appendChild(card);
 renderBook(v);
}
function filteredTasks(){return TASKS.filter(t=>(TR.sub==='все'||t.sub===TR.sub)&&(TR.gr==='все'||String(t.gr)===TR.gr)&&(TR.ty==='все'||t.ty===TR.ty))}
function startRun(){
 let pool=filteredTasks();
 if(pool.length<5)pool=pool.concat(pool).slice(0,Math.max(5,pool.length));
 TR.run={list:shuffle(pool.slice()).slice(0,Math.min(5,pool.length)),i:0,right:0,wrongTopics:[],log:[]};
}
function renderRun(v){
 const r=TR.run;
 if(r.i>=r.list.length)return renderResult(v);
 const t=r.list[r.i];
 const c=el('div','card');
 c.appendChild(el('p','muted','Задание '+(r.i+1)+' из '+r.list.length+' · '+t.sub==='х'?'Химия':'Физика'+' · '+t.gr+' класс'));
 c.appendChild(el('h3',null,esc(t.q)));
 const fb=el('div');
 if(t.ty==='test'){
  t.o.forEach((o,i)=>{const b=el('button','qopt',esc(o));b.dataset.i=i;
   b.addEventListener('click',()=>answer(b.dataset.i===String(t.a)?true:false,i,b));c.appendChild(b)});
  const done=(ok,idx)=>{c.querySelectorAll('.qopt').forEach((b,j)=>{b.disabled=true;if(j===t.a)b.classList.add('ok');else if(j===idx&&!ok)b.classList.add('err')})};
  c._done=done;
 }else{
  const inp=el('input');inp.type=typeof t.a==='string'?'text':'number';inp.step='any';inp.placeholder='Ваш ответ';inp.setAttribute('aria-label','Ответ');
  c.appendChild(inp);
  const go=el('button','btn pri','Ответить');
  go.addEventListener('click',()=>{
   let ok;
   if(typeof t.a==='string')ok=inp.value.trim().toLowerCase()===t.a;
   else{const n=parseFloat(inp.value.replace(',','.'));ok=isFinite(n)&&Math.abs(n-t.a)<=Math.max(Math.abs(t.a)*0.02,0.05)}
   answer(ok);});
  c.appendChild(go);
 }
 c.appendChild(fb);
 const next=el('button','btn','Далее →');next.style.marginTop='10px';
 next.addEventListener('click',()=>{r.i++;renderTasks()});
 next.style.visibility='hidden';c.appendChild(next);c._next=next;
 v.appendChild(c);
}
function answer(ok,idxOrVal,btn){
 const r=TR.run;if(!r)return;const t=r.list[r.i];
 if(t.ty==='test'&&btn&&btn._locked)return;btn&&(btn._locked=true);
 r.log.push({t,ok});
 if(ok){r.right++;S.stats.right++;addXP(10)}else{S.stats.wrong++;if(!r.wrongTopics.includes(t.tp))r.wrongTopics.push(t.tp)}
 S.stats.tests?0:S.stats.tests=0;
 const card=$('#v-tasks .card:last-child')||$('#v-tasks .card');
 if(t.ty==='test'&&card){if(card._done)card._done(ok,idxOrVal)}
 else{
  const inp=$('#v-tasks input');if(inp)inp.disabled=true;
  const btns=$('#v-tasks button.pri');if(btns)btns.disabled=true;
  if(!ok)card&&card.appendChild(el('div','bad','Правильный ответ: '+esc(typeof t.a==='string'?t.a:fmt(t.a))));
  if(ok)card&&card.appendChild(el('div','good','Верно!'));
 }
 if(card&&t.s)card.appendChild(el('div','steps','Разбор: '+esc(t.s)));
 if(card&&card._next)card._next.style.visibility='visible';
 save();
}
function renderResult(v){
 const r=TR.run;const total=r.list.length;const pct=Math.round(r.right/total*100);
 const grade=pct>=85?'5':pct>=66?'4':pct>=46?'3':'2';
 S.stats.tests++;save();bump('tests');checkBadges();
 if(r.right===total&&total===5){S.best=5;save()}
 const c=el('div','card');
 c.innerHTML='<h2>Результат: '+r.right+' из '+total+'</h2><div class="eq">Верных ответов: '+pct+'% → оценка «'+grade+'»</div>'
 +(pct>=85?'<div class="good">Отличный результат! Так держать.</div>':pct>=66?'<div class="good">Хороший результат, но есть что повторить.</div>':'<div class="warn">Стоит повторить темы ниже — и результат вырастет.</div>');
 if(r.wrongTopics.length){
  c.appendChild(el('h3',null,'📚 Повторите темы:'));
  r.wrongTopics.forEach(t=>c.appendChild(el('div','bad','• '+esc(t))));
 }
 const rep=el('button','btn pri','Новый прогон');rep.addEventListener('click',()=>{TR.run=null;renderTasks()});
 c.appendChild(rep);
 const again=el('button','btn');again.textContent='Изменить фильтры';again.addEventListener('click',()=>{TR.run=null;renderTasks()});
 c.appendChild(again);
 v.appendChild(c);
 TR.run.done=true;
}


/* ============ ГЛАВНАЯ И ПРОФИЛЬ ============ */
/* ============ 22. ГЛАВНАЯ И ПРОФИЛЬ ============ */
function renderHome(){
 const v=$('#v-home');v.innerHTML='';
 v.appendChild(el('p','muted','Офлайн-справочник, лаборатория и тренажёр по химии и физике для 7–11 классов. Без рекламы, интернета и платежей.'));
 const big=el('div','big');
 const mk=(ic,t,d,go)=>{const b=el('button');b.innerHTML='<span class="bi">'+ic+'</span><span><b>'+t+'</b><br><span class="muted">'+d+'</span></span>';b.addEventListener('click',()=>{switchView(go);if(go==='chem')CTC.tab=CTC.tab||'ref';render()});return b};
 big.appendChild(mk('⚡','Физика','6 тем · формулы · калькулятор','phys'));
 big.appendChild(mk('🧪','Химия','26 элементов · молекулы · лаборатория','chem'));
 big.appendChild(mk('🎯','Задания','тренажёр ОГЭ/ЕГЭ','tasks'));
 big.appendChild(mk('👤','Профиль','уровень, стрик, достижения','prof'));
 v.appendChild(big);
 renderBook(v);
 const q=el('div','card');q.appendChild(el('h2',null,'🔥 Задания на сегодня'));
 QUESTS.forEach(x=>{const p=Math.min(S.qp[x.k]||0,x.goal);const done=!!S.qd[x.k];
  q.appendChild(el('div','quest'+(done?' done':''),'<span style="flex:1">'+esc(x.t)+'</span><span class="bar" style="width:90px"><i style="width:'+Math.round(p/x.goal*100)+'%"></i></span><span class="muted">'+p+'/'+x.goal+'</span>'))});
 v.appendChild(q);
}
function renderProfile(){
 const v=$('#v-prof');v.innerHTML='';
 const l=lvlOf(S.xp);const cur=S.xp-xpNeed(l);const span=xpNeed(l+1)-xpNeed(l);
 const c=el('div','card');
 c.innerHTML='<h2>👤 Профиль · уровень '+l+'</h2>'
 +'<div class="bar" role="progressbar" aria-valuenow="'+Math.round(cur/span*100)+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+Math.round(cur/span*100)+'%"></i></div>'
 +'<p class="muted">До следующего уровня: '+fmt(span-cur)+' XP</p>';
 const st=el('div','statgrid');st.style.margin='12px 0';
 st.appendChild(el('div','stat','<b>🔥 '+S.streak+'</b><span>стрик, дней</span>'));
 st.appendChild(el('div','stat','<b>⭐ '+S.xp+'</b><span>очков опыта</span>'));
 st.appendChild(el('div','stat','<b>'+S.stats.lab+'</b><span>реакций</span>'));
 st.appendChild(el('div','stat','<b>'+S.stats.tests+'</b><span>прогонов</span>'));
 st.appendChild(el('div','stat','<b>'+S.stats.calc+'</b><span>расчётов</span>'));
 st.appendChild(el('div','stat','<b>'+S.stats.elems+'</b><span>элементов изучено</span>'));
 c.appendChild(st);v.appendChild(c);
 const bc=el('div','card');bc.appendChild(el('h2',null,'🏆 Достижения'));
 const bg=el('div','badgegrid');
 BADGES.forEach(b=>{bg.appendChild(el('div','badge'+(S.badges[b.id]?' got':''),'<span class="bi">'+b.ic+'</span><span><b>'+esc(b.t)+'</b><small>'+esc(b.d)+'</small></span>'))});
 bc.appendChild(bg);v.appendChild(bc);
 const rs=el('button','btn','Сбросить прогресс');
 rs.addEventListener('click',()=>{if(confirm('Сбросить весь прогресс?')){S=JSON.parse(JSON.stringify(DEF));save();updHeader();renderProfile();toast('Прогресс сброшен')}});
 v.appendChild(rs);
}


/* ============ НАВИГАЦИЯ И ЗАПУСК ============ */
/* ============ 23. НАВИГАЦИЯ И ЗАПУСК ============ */
let VIEW='home';
function switchView(id){VIEW=id;document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));$('#v-'+id).classList.add('active');
 document.querySelectorAll('.nav button').forEach(b=>{if(b.dataset.v===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 window.scrollTo(0,0)}
function render(){
 if(VIEW==='home')renderHome();
 else if(VIEW==='phys')renderPhys();
 else if(VIEW==='chem')renderChem();
 else if(VIEW==='tasks')renderTasks();
 else if(VIEW==='prof')renderProfile();
}
document.getElementById('mainnav').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;switchView(b.dataset.v);render()});
function showErr(e){const m=$('#loadmsg');if(m)m.innerHTML='Ошибка запуска: '+(e&&e.message?esc(e.message):e)+'<br>Перезагрузите страницу или сообщите текст ошибки разработчику.'}
window.onerror=function(msg){showErr({message:String(msg)});return false};
function boot(){
 try{
  checkStreak();makeQuests();updHeader();render();switchView('home');
 }catch(e){showErr(e)}
 setTimeout(()=>$('#loader').classList.add('hide'),400);
}
setTimeout(()=>{$('#loader').classList.add('hide')},2500);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

