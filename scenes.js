'use strict';
/* scenes.js — 3D-движок на Canvas 2D. Загружается вторым. */

/* ============ 11. 3D-ДВИЖОК (Canvas 2D) ============ */
const PERF={eco:false,lowT:0,highT:0,lastT:0};
const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SPRITE={};
function sprite(color,rad){const q=Math.max(4,Math.round(rad));const key=color+q;if(SPRITE[key])return SPRITE[key];const c=document.createElement('canvas');const sz=q*2+4;c.width=sz;c.height=sz;const g=c.getContext('2d');const grad=g.createRadialGradient(sz/2-q*.35,sz/2-q*.35,q*.1,sz/2,sz/2,q);grad.addColorStop(0,'#ffffff');grad.addColorStop(.25,color);grad.addColorStop(1,shade(color,-.45));g.fillStyle=grad;g.beginPath();g.arc(sz/2,sz/2,q,0,7);g.fill();SPRITE[key]=c;return c}
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=(n>>16)&255,g=(n>>8)&255,b=n&255;r=clamp(Math.round(r*(1+f)),0,255);g=clamp(Math.round(g*(1+f)),0,255);b=clamp(Math.round(b*(1+f)),0,255);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
function dpr(){return PERF.eco?1:Math.min(window.devicePixelRatio||1,2)}
const SCENES=[];
class Scene{
 constructor(cv,opt){this.cv=cv;this.g=cv.getContext('2d');this.rotY=0.5;this.rotX=-0.32;this.zoom=1;this.spin=!reduced&&!!(opt&&opt.spin);this.drawFn=opt.draw;this.t=0;this.pts=new Map();
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);this.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});this.spin=false});
  cv.addEventListener('pointermove',e=>{if(!this.pts.has(e.pointerId))return;const prev=this.pts.get(e.pointerId);
   if(this.pts.size===1){this.rotY+=(e.clientX-prev.x)*.008;this.rotX=clamp(this.rotX+(e.clientY-prev.y)*.008,-1.4,1.4);this.pts.set(e.pointerId,{x:e.clientX,y:e.clientY})}
   else if(this.pts.size===2){const arr=[...this.pts.values()];const d0=Math.hypot(arr[0].x-arr[1].x,arr[0].y-arr[1].y);this.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});const arr2=[...this.pts.values()];const d1=Math.hypot(arr2[0].x-arr2[1].x,arr2[0].y-arr2[1].y);if(d0>0)this.zoom=clamp(this.zoom*d1/d0,.4,3)}
  });
  const end=e=>{this.pts.delete(e.pointerId)};
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);cv.addEventListener('pointerleave',end);
  cv.addEventListener('wheel',e=>{e.preventDefault();this.zoom=clamp(this.zoom*(e.deltaY<0?1.08:0.92),.4,3)},{passive:false});
  this.fit();SCENES.push(this)}
 fit(){if(!this.cv.isConnected)return;const w=this.cv.clientWidth||300,h=this.cv.clientHeight||200;const r=dpr();if(this.cv.width!==Math.round(w*r)||this.cv.height!==Math.round(h*r)){this.cv.width=Math.round(w*r);this.cv.height=Math.round(h*r)}}
 project(x,y,z,w,h){const cy=Math.cos(this.rotY),sy=Math.sin(this.rotY),cx=Math.cos(this.rotX),sx=Math.sin(this.rotX);let x1=x*cy+z*sy,z1=-x*sy+z*cy;let y1=y*cx-z1*sx;z1=y*sx+z1*cx;const d=4.5,zcam=d+z1;const k=(this.zoom*w*0.22)/Math.max(zcam,.8);return{x:w/2+x1*k,y:h/2-y1*k,s:k,z:z1}}
 tick(dt){if(!this.cv.isConnected||!this.cv.offsetParent)return;this.fit();if(this.spin)this.rotY+=dt*.5;this.t+=dt;const g=this.g,w=this.cv.width,h=this.cv.height;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,w,h);g.setTransform(dpr(),0,0,dpr(),0,0);this.drawFn(this,this.cv.clientWidth,this.cv.clientHeight,this.g)}
}
function drawBall(sc,x,y,z,r,color,depthSort,list){(list||[]).push({x,y,z,r,color})}
function renderSpheres(sc,list,w,h){list.sort((a,b)=>a.z-b.z);for(const p of list){const pr=sc.project(p.x,p.y,p.z,w,h);const rad=Math.max(2,p.r*pr.s);const sp=sprite(p.color,rad);const g=sc.g;g.globalAlpha=p.a!=null?p.a:1;g.drawImage(sp,pr.x-rad-2,pr.y-rad-2,rad*2+4,rad*2+4);g.globalAlpha=1}}
function drawLine(sc,x1,y1,z1,x2,y2,z2,color,width,w,h){const a=sc.project(x1,y1,z1,w,h),b=sc.project(x2,y2,z2,w,h);const g=sc.g;g.strokeStyle=color;g.lineWidth=width||2;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
function drawLabel(sc,x,y,z,text,w,h,size,color){const p=sc.project(x,y,z,w,h);const g=sc.g;g.font='bold '+(size||12)+'px system-ui';g.fillStyle=color||'#1c2733';g.textAlign='center';g.fillText(text,p.x,p.y-Math.max(6,p.s*0.35)+ -8)}
/* главный цикл: только видимые сцены, delta-time, контроль FPS */
let prevT=0;
function loop(t){requestAnimationFrame(loop);if(document.hidden)return;const dt=Math.min((t-prevT)/1000||0.016,0.05);prevT=t;
 if(dt>0){const fps=1/dt;if(fps<38){PERF.lowT+=dt;PERF.highT=0;if(PERF.lowT>3&&!PERF.eco){PERF.eco=true;toast('⚡ Экономный режим графики');SPRITE.clear&&0;for(const k in SPRITE)delete SPRITE[k]}}else if(fps>55){PERF.highT+=dt;PERF.lowT=0;if(PERF.highT>5&&PERF.eco){PERF.eco=false;toast('✨ Обычный режим графики');for(const k in SPRITE)delete SPRITE[k]}}else{PERF.lowT=Math.max(0,PERF.lowT-dt);PERF.highT=Math.max(0,PERF.highT-dt)}}
 for(let i=SCENES.length-1;i>=0;i--){const s=SCENES[i];if(!s.cv.isConnected){SCENES.splice(i,1);continue}s.tick(dt)}}
requestAnimationFrame(loop);


