/* Tactical support UI. No autonomous attacks or calibration changes. */
(()=>{
"use strict";
const oldRender=tacRender,oldClick=tacClick,oldFinish=tacFinishUI;
const css=document.createElement("style");css.textContent=`
#tacSupport{grid-column:1/-1;border:1px solid var(--line);border-radius:10px;padding:8px;margin-top:8px}
#tacSupport summary{cursor:pointer;min-height:32px;font-weight:bold}
.ts-row{display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px solid var(--line)}
.ts-row canvas{width:40px;height:48px;image-rendering:pixelated;flex:none}
.ts-row span{flex:1;min-width:0;overflow-wrap:anywhere;font-size:12px}
.ts-row button,.ts-row select{min-height:44px;max-width:48%;font:inherit}
#tacActs .ts-back{grid-column:1/-1;min-height:44px}
`;document.head.append(css);
const eligible=n=>n&&n.alive&&n.role==="동료"&&n.aff===myAff()&&n.age>=16&&!n.dispatched&&!n.mission&&!n.severeInjury&&!(n.dispatchUntil>=p.age)&&!(n.injuredUntil>=p.age)&&!(n.health!=null&&n.health<30)&&!p.flags.impelDown;
const list=()=> (p.npcs||[]).filter(eligible);
const power=n=>Math.max(0,Math.min(100,Number(n.power)||0));
function options(n){
 const j=[n.job,n.title,n.rank,...(Array.isArray(n.abilities)?n.abilities:[])].join(" ");
 const out=[];
 if(/의사|의술/.test(j))out.push(["응급 처치","heal"]);
 if(/저격|사격/.test(j))out.push(["엄호 사격","break"]);
 if(/항해/.test(j))out.push(["퇴로 확보","escape"]);
 if(/요리/.test(j))out.push(["보급 식사","recover"]);
 if(/검사|검술|격투|무투/.test(j))out.push([/검사|검술/.test(j)?"지원 검격":"연계 타격","hit"]);
 if(n.fruit){const [name,t]=tacFruitDef(n.fruit);out.push([name,({heal:"heal",guard:"guard",evade:"guard",stun:"break",buff:"recover",drain:"hit"})[t]||"hit"]);}
 if((Array.isArray(n.haki)&&n.haki.length)||/패기/.test(j))out.push(["패기 엄호","guard"]);
 if(!out.length)out.push(["엄호 공격","hit"]);return out;
}
function init(st){if(st.support)return;st.support={ids:[],used:{},last:0,total:0,logs:[],locked:false,open:false};}
function use(st,n,opt){
 const q=st.support;if(st!==tacCur||st.busy||st.over||st.acted||!eligible(n)||!q.ids.includes(n.id)||q.used[n.id]||q.last===st.turn||q.total>=2)return;
 const [name,t]=opt,v=power(n),scale=.5+v/200;let msg="";
 if(t==="heal"){const d=Math.min(st.pmax-st.php,Math.round(st.pmax*.12*scale));if(!d)return;st.php+=d;msg="체력 "+d+" 회복";}
 else if(t==="recover"){const keys=Object.keys(st.cd).filter(k=>st.cd[k]>0);if(!keys.length)return;keys.sort((a,b)=>st.cd[b]-st.cd[a]);const k=keys[0],d=Math.min(st.cd[k],v>=70?2:1);st.cd[k]-=d;msg="기술 재사용 대기 "+d+"턴 감소";}
 else if(t==="escape"){st.supportEscape=.15+.1*v/100;msg="도주 확률 +"+Math.round(st.supportEscape*100)+"%";}
 else if(t==="break"){const d=Math.min(st.eblock,Math.round(st.A0*.45*scale));st.eblock-=d;st.eWeak=Math.max(st.eWeak,.12*scale);msg="방어 "+d+" 감소 · 이번 적 공격 약화";}
 else if(t==="guard"){st.eWeak=Math.max(st.eWeak,.2*scale);msg="이번 적 공격 약화";}
 else {const d=tacDamageFoe(st,Math.min(Math.max(0,st.ehp-1),Math.round(st.A0*.4*scale*tacFoeTakeMult(st,{pierce:false,slash:/검격/.test(name)}))),false);msg=d+" 피해";}
 q.used[n.id]=true;q.last=st.turn;q.total++;q.locked=true;const line=n.name+" — "+name+" · "+msg;q.logs.push(line);tacLog(st,line);tacRender(st);
}
function button(label,fn,disabled=false){const b=document.createElement("button");b.className="tac-act";b.textContent=label;b.disabled=disabled;b.onclick=fn;return b;}
function supportUI(st){
 const q=st.support,acts=document.getElementById("tacActs"),old=document.getElementById("tacSupport");if(old)old.remove();if(st.over||!list().length)return;
 const d=document.createElement("details");d.id="tacSupport";d.open=q.open;d.ontoggle=()=>q.open=d.open;const sum=document.createElement("summary");sum.textContent="동료 지원 · "+q.ids.length+"/3명 · "+(2-q.total)+"회 남음";d.append(sum);
 for(const n of list()){
 const selected=q.ids.includes(n.id);if(q.locked&&!selected)continue;
 const row=document.createElement("div");row.className="ts-row";
 if(window.drawCompanionSD){try{row.append(window.drawCompanionSD(n));}catch(e){}}
 const label=document.createElement("span");label.textContent=n.name+" · "+(n.job||n.title||"동료")+" · 전투력 "+power(n);row.append(label);
 if(!q.locked){const b=button(selected?"참여 해제":"참여",()=>{q.ids=selected?q.ids.filter(x=>x!==n.id):[...q.ids,n.id];tacRender(st);},!selected&&q.ids.length>=3);row.append(b);}
 d.append(row);
 if(selected){for(const opt of options(n)){const r=document.createElement("div");r.className="ts-row";const l=document.createElement("span");l.textContent=opt[0];r.append(l,button(q.used[n.id]?"사용 완료":"지원 사용",()=>use(st,n,opt),st.busy||st.acted||q.used[n.id]||q.last===st.turn||q.total>=2));d.append(r);}}
 }
 acts.after(d);
}
tacRender=function(st){oldRender(st);init(st);const acts=document.getElementById("tacActs");if(!st.over){
 const children=[...acts.children],actions=tacActionList(st);const map=new Map(actions.map((a,i)=>[a.id,children[i]]));acts.replaceChildren();
 if(st.menu==="skills"){for(const a of actions)if(!["strong","guard"].includes(a.id)&&map.get(a.id))acts.append(map.get(a.id));const back=button("뒤로",()=>{st.menu=null;tacRender(st);});back.classList.add("ts-back");acts.append(back);}
 else {acts.append(button("일반 공격",()=>tacClick(st,"strong"),st.busy||st.acted),button("기술 사용",()=>{st.menu="skills";tacRender(st);},st.busy||st.acted),button("방어",()=>tacClick(st,"guard"),st.busy||st.acted),button("도주",()=>flee(st),st.busy||st.acted||st.boss));}
 }supportUI(st);};
tacClick=function(st,id){if(st===tacCur&&!st.busy&&!st.over&&!st.acted){init(st);st.support.locked=true;st.menu=null;}return oldClick(st,id);};
function flee(st){if(st!==tacCur||st.busy||st.over||st.acted||st.boss)return;init(st);st.support.locked=true;const chance=Math.min(.8,.35+(st.supportEscape||0));st.supportEscape=0;if(Math.random()<chance){st.fled=true;st.over=true;st.won=false;tacLog(st,"전투에서 도주했습니다.");tacFinishUI(st);}else{tacLog(st,"도주 실패 — 적의 공격에 노출됩니다.");st.acted=true;st.mods=tacModsIf(st,null);tacEnemyAct(st,Math.random);if(st.over)tacFinishUI(st);else tacRender(st);}}
tacFinishUI=function(st){oldFinish(st);const b=document.getElementById("tacDone");if(b)b.onclick=()=>{if(st.resolved)return;st.resolved=true;st.done({won:!!st.won,fled:!!st.fled,foe:st.foe,base:st.base,note:"[전략 전투] "+st.turn+"턴 · "+(st.fled?"도주":st.won?"승리":"패배")+(st.support?.logs.length?"\n"+st.support.logs.join("\n"):"")});};};
})();
