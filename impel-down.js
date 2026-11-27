/* 임펠다운: 수감 상태는 p.flags.impelDown에 저장. 일반 사건과 분리한다. */
(() => {
"use strict";
const prison=()=>p && p.flags && p.flags.impelDown;
const place={name:"임펠다운",country:"세계정부",sea:"그랜드라인"};
const names=["","홍련지옥","맹수지옥","기아지옥","초열지옥","극한지옥","무한지옥"];
const hazards=["","칼날 나무 사이의 노동","맹수의 울음","물 한 모금","끓어오르는 열기","얼어붙은 감방","빛 없는 독방"];
const fields=["job","status","careerTrack","careerStartAge","rankTitle","rankLevel","place","sea","ship","crew","focus"];
const event=(key,title,body,choices)=>({key:"impel_"+key,essential:true,tags:[["arrival","escaped"].includes(key)?"Impel Down":"prison"],title,body,choices});
const choice=(title,desc,run)=>({title,desc,run});
const note=(key,title,body)=>event(key,title,body,null);
const hp=n=>{p.health+=n;};
const happy=n=>{p.happiness+=n;};
const active=()=>!!prison();
function level(){
 const b=p.bounty||0;
 return p.flags.emperor||b>=500000000||p.combat>=90?6:b>=100000000||p.combat>=75?5:b>=50000000?4:b>=30000000?3:b>=10000000?2:1;
}
function enter(foe){
 const old={};for(const k of fields)old[k]=p[k]??null;
 const s={old,level:level(),age:p.age,plan:0,allies:0,hidden:false,seen:{},foe};
 p.flags.impelDown=s;
 p.job=p.status=p.rankTitle="수감자";p.careerTrack=null;p.rankLevel=0;p.careerStartAge=null;
 p.place={...place};p.sea=place.sea;p.ship=null;p.crew=null;p.focus="감옥에서 단련";
 p.health=Math.max(12,p.health);delete p.flags.deathCause;
 scenes.splice(sceneIndex+2);
 scenes.push(note("arrival","임펠다운 수감 — LEVEL "+s.level,foe+"에게 붙잡혀 "+names[s.level]+"에 수감되었습니다. 동료와 이전 경력은 보존됩니다."));
 log("임펠다운 LEVEL "+s.level+"에 수감됨");
}
function escape(route){
 const s=prison();if(!s)return;
 for(const k of fields)p[k]=s.old[k];
 if(p.place) p.place=places.find(x=>x.name===p.place.name)||p.place;
 p.bountyIssued=true;p.bounty=Math.max(1000000,Math.floor((p.bounty||0)*1.2)+s.level*2000000);
 delete p.flags.impelDown;
 achieve("임펠다운 탈옥");log(route+"로 임펠다운 탈옥");
 scenes.splice(sceneIndex+1, scenes.length, note("escaped","임펠다운 탈옥 성공","자유를 되찾았습니다. 기존 직업과 소속으로 돌아가며 현상금이 상승했습니다."));
}
function attempt(route,bonus){
 const s=prison();const chance=Math.max(.05,Math.min(.85,.38-s.level*.055+p.combat*.003+s.plan*.055+s.allies*.035+bonus));
 if(Math.random()<chance){escape(route);return;}
 hp(-8-s.level*3);happy(-5);s.plan=Math.max(0,s.plan-2);
 scenes.splice(sceneIndex+1,0,note("failed","탈옥 실패","간수에게 발각되어 다시 감방으로 끌려왔습니다."));
 log("임펠다운 탈옥 실패");
}
window.attemptSignalEscape=()=>{if(active())attempt("동료와의 암호 탈옥",.24);};
const oldBattle=battle;
battle=function(info){
 const eligible=p&&!active()&&["해적","혁명군"].includes(p.status)&&!worldFreed()&&!info.nonFatal;
 const foe=String(info.foe||"");
 const arrest=/해군|세계정부|현상금 사냥꾼|사이퍼 폴|CP[0-9]|아카이누|키자루|후지토라|아오키지|센고쿠|스모커|롭 루치|사카즈키|볼사리노|잇쇼/.test(foe)||/해군·정부/.test(info.death?.type||"");
 const won=oldBattle.apply(this,arguments);
 if(eligible&&arrest&&won===false&&["해적","혁명군"].includes(p.status)&&p.health>0&&Math.random()<.6)enter(foe);
 return won;
};
function pool(s){
 const n=s.level, list=[
 event("training","감방에서의 단련","좁은 감방에서도 몸을 단련하는 죄수들이 있습니다.",[
 choice("몸을 단련한다","전투력과 무투술 증가 · 건강 감소",()=>{p.combat+=2;sk("무투술",3);hp(-3-n);}),
 choice("휴식을 취한다","건강 회복 · 탈옥 준비 지연",()=>{hp(5);s.plan=Math.max(0,s.plan-1);})]),
 event("inmate","죄수들의 다툼","배급을 두고 죄수들이 싸움을 벌입니다.",[
 choice("맞서 싸운다","전투 경험 · 부상 위험",()=>{hp(-3-n);if(Math.random()<.35+p.combat*.004){p.combat+=3;s.allies++;}else hp(-8);}),
 choice("중재한다","동료 확보 · 식량을 나눔",()=>{s.allies++;hp(-4);}),
 choice("물러난다","안전하지만 행복 감소",()=>happy(-4))]),
 event("guard","간수의 횡포","간수가 죄수들에게 가혹한 노동을 명령합니다.",[
 choice("저항한다","탈옥 의지 · 큰 부상",()=>{s.plan++;hp(-7-n);}),
 choice("조용히 따른다","건강 감소 · 간수의 의심을 피함",()=>{hp(-3);happy(-2);})]),
 event("level"+n,hazards[n],"LEVEL "+n+" "+names[n]+"의 혹독한 환경을 견뎌야 합니다.",[
 choice("다른 죄수와 서로 돕는다","인연 증가 · 체력 소모",()=>{s.allies++;hp(-n-2);}),
 choice("혼자 버틴다","체력 보존 · 행복 감소",()=>{hp(-Math.ceil(n/2));happy(-n);})]),
 event("plan","감옥 밖을 향한 꿈","오랜 수감 생활 끝에 탈옥을 고민합니다.",[
 choice("탈옥을 준비한다","준비도 증가 · 건강 감소",()=>{s.plan=Math.min(8,s.plan+2);hp(-3);}),
 choice("죄수들을 설득한다","협력자 증가 · 발각 위험",()=>{s.allies=Math.min(8,s.allies+2);if(Math.random()<.3)hp(-7);}),
 choice("때를 기다린다","건강 회복 · 준비 기회 포기",()=>hp(3))])
 ];
 if(s.plan>=2)list.push(event("solo","홀로 탈옥할 기회","감옥의 혼란 속에서 자유를 되찾을 기회가 찾아왔습니다.",[
 choice("혼자 탈옥한다","실패 시 부상",()=>attempt("개인 탈옥",0)),choice("기회를 미룬다","준비도 증가 · 행복 감소",()=>{s.plan=Math.min(8,s.plan+1);happy(-2);})]));
 if(s.allies>=2)list.push(event("group","죄수들의 집단 탈옥","뜻을 함께하는 죄수들이 탈옥을 제안합니다.",[
 choice("함께 탈옥한다","협력 보정 · 실패 시 부상",()=>attempt("집단 탈옥",.12)),choice("거절한다","협력자 감소 · 안전",()=>{s.allies--;happy(2);})]));
 if(s.old.crew||s.old.status==="혁명군")list.push(event("rescue",s.old.status==="혁명군"?"혁명군의 구출":"동료의 구출","감옥 밖에서 당신을 구하려는 움직임이 포착됩니다.",[
 choice("구출에 응한다","성공률 증가 · 실패 시 부상",()=>attempt("동료의 구출",.22)),choice("동료의 안전을 우선한다","구출 포기 · 행복 감소",()=>{happy(-4);s.plan++;})]));
 if(n>=4&&!s.hidden)list.push(event("newkama","뉴커머 랜드 발견","감옥 깊은 곳에서 숨겨진 LEVEL 5.5의 존재를 알게 됩니다.",[
 choice("뉴커머 랜드에 합류한다","건강 회복 · 탈옥 준비",()=>{s.hidden=true;hp(10);s.plan+=2;s.allies++;happy(-2);}),
 choice("감방으로 돌아간다","기회 포기 · 건강 감소",()=>hp(-3))]));
 if(n>=5&&p.age-s.age>=4&&!s.executionSeen&&Math.random()<.035)list.push(event("execution","사형 선고","세계정부가 당신의 처형을 결정했습니다.",[
 choice("마지막 탈옥을 시도한다","실패하면 사형",()=>{attempt("사형 직전 탈옥",.1);if(active()){p.health=0;p.flags.deathCause={type:"임펠다운에서 처형",detail:"탈옥에 실패하여 처형되었습니다."};}}),
 choice("운명을 받아들인다","사망",()=>{p.health=0;p.flags.deathCause={type:"임펠다운에서 처형",detail:"세계정부의 사형 선고가 집행되었습니다."};})]));
 return list;
}
const oldBuild=buildYearScenes;
buildYearScenes=function(){
 const s=prison();if(!s)return oldBuild.apply(this,arguments);
 scenes=[];sceneIndex=0;
 if(canonYear()===1522&&p.canonSeen?.marineford===undefined&&!p.flags.impelLuffySeen){
 p.flags.impelLuffySeen=true;
 scenes.push(event("luffy","밀짚모자 루피의 침입","에이스를 구하려는 루피의 침입으로 임펠다운이 혼란에 빠졌습니다.",[
 choice("혼란을 틈타 탈옥한다","특별 탈옥 기회",()=>attempt("루피의 침입",.42)),choice("감방에 남는다","안전 · 기회 포기",()=>happy(-3))]));
 }
 if(canonYear()===1522&&p.canonSeen?.marineford===undefined&&!p.flags.impelTeachSeen){
 p.flags.impelTeachSeen=true;
 scenes.push(event("teach","검은수염의 방문","검은수염 해적단이 임펠다운에 나타났습니다. LEVEL 6의 죄수들 사이에서 소동이 일어납니다.",[
 choice("소동을 이용한다","탈옥 기회 · 부상 위험",()=>attempt("검은수염의 방문",.25)),choice("몸을 숨긴다","안전 · 행복 감소",()=>happy(-2))]));
 }
 const signal=p.arcs?.signal;
 if(signal && !signal.done && signal.node==="song" && npcById(signal.npc)?.alive){
   const knock=window.__arcScene(window.__ARCS.signal,signal);
   knock.key="impel_arc_signal";scenes.push(knock);
 }
 s.seen=s.seen||{};
 const candidates=pool(s).filter(x=>x.key!==s.last&&(s.seen[x.key]===undefined||p.age-s.seen[x.key]>=4));
 if(candidates.length){const e=candidates[Math.floor(Math.random()*candidates.length)];s.last=e.key;s.seen[e.key]=p.age;if(e.key==="impel_execution")s.executionSeen=true;scenes.push(e);}
 else scenes.push(note("quiet_"+p.age,"수감 "+(p.age-s.age)+"년째","당신은 감방에서 배급을 기다리며 하루하루를 견딥니다."));
};
const oldFit=fitScene;
fitScene=function(s){if(active())return s&&(/^(impel_|battle_)/.test(String(s.key)))?s:null;return oldFit.apply(this,arguments);};
const oldDrift=annualDrift;
annualDrift=function(){if(!active())return oldDrift.apply(this,arguments);hp(-Math.max(2,3+prison().level-(prison().hidden?2:0)-(p.focus==="휴식"?1:0)));if(p.focus==="감옥에서 단련"){p.combat+=1;hp(-1);}happy(-2);normalize();};
const oldFocus=focusOptions;
focusOptions=function(){if(!active())return oldFocus.apply(this,arguments);return {"감옥에서 단련":{desc:"감옥 사건에서 단련",effect:()=>{}},"휴식":{desc:"감옥에서 휴식",effect:()=>{}}};};
const oldSalary=annualSalary;
annualSalary=function(job=p.job){return job==="수감자"?0:oldSalary.apply(this,arguments);};
})();
