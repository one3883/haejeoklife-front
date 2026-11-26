/* Presentation only: no combat state, RNG or turn timing changes. */
(()=>{
"use strict";
const style=document.createElement("style");style.textContent=`
#tacArt.battle-stage{position:relative;overflow:hidden;isolation:isolate;min-height:130px;max-height:220px;aspect-ratio:2.5;background:linear-gradient(#243c52,#637b83 65%,#3d4546 66%);display:block}
#tacArt .battle-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.75;pointer-events:none}
#tacArt .battle-floor{position:absolute;inset:0;background:linear-gradient(transparent 45%,rgba(0,0,0,.5))}
#tacArt .battle-actor{position:absolute;bottom:5%;width:27%;height:82%;display:flex;align-items:end;justify-content:center;pointer-events:none}
#tacArt .battle-player{left:8%;--dash:85%}
#tacArt .battle-enemy{right:8%;--dash:-85%}
#tacArt .battle-actor canvas{width:100%;height:100%;object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 4px 2px #0007)}
#tacArt .battle-enemy canvas{transform:scaleX(-1)}
#tacArt .battle-name{position:absolute;bottom:0;left:50%;transform:translateX(-50%);white-space:nowrap;max-width:145%;overflow:hidden;text-overflow:ellipsis;color:white;font-size:11px;text-shadow:0 1px 3px black;background:#0008;padding:2px 5px;border-radius:4px}
#tacArt .battle-dash{animation:bs-dash 360ms ease-in-out}
#tacArt .battle-hurt{animation:bs-hurt 320ms ease-out}
#tacArt .battle-guard:after{content:"";position:absolute;inset:10%;border:3px solid #8beaff;border-radius:50%;box-shadow:0 0 14px #70cfff;animation:bs-shield 400ms ease-out both}
#tacArt .battle-support{left:28%;z-index:3;animation:bs-support 420ms ease-in-out both}
#tacArt .battle-effect{position:absolute;top:12%;left:50%;transform:translateX(-50%);color:#fff;background:#172330dd;padding:4px 8px;border-radius:6px;font-size:12px;z-index:5;max-width:90%;text-align:center}
@keyframes bs-dash{0%,100%{transform:translateX(0)}45%{transform:translateX(var(--dash))}}
@keyframes bs-hurt{0%,100%{transform:translateX(0);opacity:1}25%{transform:translateX(-6px);opacity:.35}50%{transform:translateX(6px);opacity:1}75%{transform:translateX(-3px);opacity:.5}}
@keyframes bs-shield{0%{opacity:0;transform:scale(.7)}30%{opacity:1}100%{opacity:0;transform:scale(1.2)}}
@keyframes bs-support{0%{transform:translateX(-100%);opacity:0}25%,75%{transform:translateX(0);opacity:1}100%{transform:translateX(-100%);opacity:0}}
@media(prefers-reduced-motion:reduce){#tacArt .battle-actor,#tacArt .battle-actor:after{animation:none!important}}
`;document.head.append(style);
let stage=null;
function actor(canvas,cls,name){const el=document.createElement("div");el.className="battle-actor "+cls;el.append(canvas);const label=document.createElement("span");label.className="battle-name";label.textContent=name;el.append(label);return el;}
function setup(st){
 const dst=document.getElementById("tacArt");if(!dst||!window.drawBattleSD)return;
 const src=document.getElementById("sceneArt"),img=src?.querySelector("img");
 const bg=img&&showArt?img.cloneNode(false):null;
 const me=actor(window.drawBattleSD(p.name,true),"battle-player",p.name),foe=actor(window.drawBattleSD(st.foe,false),"battle-enemy",st.foe);
 dst.replaceChildren();dst.classList.add("battle-stage");
 if(bg){bg.className="battle-bg";bg.removeAttribute("style");bg.alt="";dst.append(bg);}
 else if(showArt&&src){const b=getComputedStyle(src).backgroundImage;if(b!=="none"){const el=document.createElement("div");el.className="battle-bg";el.style.backgroundImage=b;el.style.backgroundSize="cover";dst.append(el);}}
 const floor=document.createElement("div");floor.className="battle-floor";dst.append(floor,me,foe);stage={st,dst,me,foe};
}
function pulse(el,cls){el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);const token=Symbol();el[cls]=token;setTimeout(()=>{if(el[cls]===token)el.classList.remove(cls)},430);}
const open=tacOpenFight;tacOpenFight=function(){const r=open.apply(this,arguments);try{if(tacCur)setup(tacCur);}catch(e){console.warn("Battle art",e);}return r;};
const fx=tacFx;tacFx=function(st){try{if(stage?.st===st){const f=st.fx||[];if(f.some(x=>["hit","slash","crit"].includes(x))){pulse(stage.me,"battle-dash");pulse(stage.foe,"battle-hurt");}if(f.includes("hurt")){pulse(stage.foe,"battle-dash");pulse(stage.me,"battle-hurt");}if(f.some(x=>["guard","evade","haki"].includes(x)))pulse(stage.me,"battle-guard");}}catch(e){}return fx.apply(this,arguments);};
window.battleSupportVisual=function(st,n,t,msg){try{if(stage?.st!==st||!window.drawCompanionSD)return;const el=actor(window.drawCompanionSD(n),"battle-support",n.name);const effect=document.createElement("span");effect.className="battle-effect";effect.textContent=n.name+" · "+msg;stage.dst.append(el,effect);if(t==="hit"||t==="break")pulse(stage.foe,"battle-hurt");if(t==="heal"||t==="guard")pulse(stage.me,"battle-guard");setTimeout(()=>{el.remove();effect.remove()},450);}catch(e){}};
})();
