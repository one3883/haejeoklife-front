/* 출생 금지 장소: 전용 사건만 표시하고 정상적인 출항 경로를 유지한다. */
(()=>{
"use strict";
const data={
 "발라티에":["baratie","해상 레스토랑의 식탁","주방에서 주문이 밀려들고 요리사들이 분주하게 움직입니다.","식사 비용을 내고 식사한다","주방의 일손을 돕는다"],
 "스릴러 바크":["thriller","안개 속의 거대한 배","짙은 안개 속에서 기묘한 저택과 움직이는 그림자가 보입니다.","조심스럽게 주변을 살핀다","안전한 선착장으로 물러난다"],
 "아마존 릴리":["amazon","쿠자 전사들의 경계","섬의 경계를 지키는 쿠자 전사들이 외부인의 움직임을 살핍니다.","거리를 두고 통행 허가를 요청한다","해안에서 조용히 기다린다"],
 "펑크 해저드":["punk","위험한 연구섬","극단적인 기후와 버려진 시설 때문에 이동하기 어렵습니다.","안전한 통로를 조사한다","위험 구역을 피한다"],
 "에그헤드":["egg","미래섬의 시설","첨단 시설이 늘어선 섬에서 출입이 통제된 구역을 발견합니다.","허용된 구역을 둘러본다","통제 구역에서 물러난다"]
};
const current=()=>p&&p.place&&data[p.place.name];
const oldFit=fitScene;
function allowedSpecialScene(s,d){
 const k=String(sceneKey(s));
 if(s.specialPlace)return s.specialPlace===p.place.name;
 if(k.startsWith("special_"))return k.startsWith("special_"+d[0]+"_");
 if(k.startsWith("intervention_"))return k==="intervention_"+d[0];
 if(/^(battle_|impel_)/.test(k))return true;
 // 세계적 사건은 어느 지역에서든 전달된다. 일반 섬 사건은 계속 차단한다.
 if((s.tags||[]).includes("world-news") || (s.tags||[]).includes("world") || /^세계의 소식/.test(String(s.title||"")))return true;
 return false;
}
fitScene=function(s){
 if(!s)return null;
 const d=current(),k=String(sceneKey(s));
 if(d&&!allowedSpecialScene(s,d))return null;
 if(p&&p.place&&!birthAllowed(p.place)&&!d&&!p.flags.impelDown&&!/^(impel_|battle_)/.test(k))return null;
 if(s.specialPlace&&p.place.name!==s.specialPlace)return null;
 return oldFit.apply(this,arguments);
};

const extraEvents={
 baratie:[
 ["바다 위의 밀린 주문","폭풍을 피해 몰려온 손님들 때문에 주방이 마비될 지경입니다.","설거지와 배식을 돕는다","조용히 식사를 마친다","money",15000,"health",-2],
 ["굶주린 표류자","식당 앞에 굶주린 표류자가 나타났습니다. 식사값을 낼 형편이 아닙니다.","자기 돈으로 식사를 사 준다","요리사에게 사정을 전한다","happiness",5,"money",-10000],
 ["요리사의 손놀림","요리사가 남은 재료로 훌륭한 음식을 만들어 냅니다.","조리법을 배운다","맛을 음미한다","knowledge",4,"health",2]],
 thriller:[
 ["그림자 없는 발자국","안개 속에서 발자국만 남고 그림자는 보이지 않습니다.","흔적을 조사한다","등불을 들고 돌아간다","knowledge",4,"health",-3],
 ["저택의 움직이는 갑옷","낡은 갑옷이 복도를 가로막고 움직이기 시작합니다.","빈틈을 찾아 지나간다","다른 통로로 돌아간다","combat",3,"health",-4],
 ["안개 속 조난선","안개에 갇힌 배에서 구조 신호가 들려옵니다.","밧줄을 던져 돕는다","안전한 항로를 표시한다","reputation",4,"health",-2]],
 amazon:[
 ["쿠자의 활쏘기","멀리서 쿠자 전사들이 활쏘기를 연습합니다. 외부인은 허가 없이 접근할 수 없습니다.","허락을 받아 관찰한다","경계를 존중해 물러난다","knowledge",3,"happiness",-1],
 ["해안의 맹수","해안 가까이에서 거대한 짐승이 모습을 드러냅니다.","멀리서 움직임을 살핀다","즉시 배로 돌아간다","combat",3,"health",-3],
 ["뱀과 함께하는 항해","해안에서 쿠자 전사들이 뱀을 다루는 모습을 봅니다.","안전한 거리에서 기술을 관찰한다","해안의 물길을 조사한다","knowledge",4,"health",-1]],
 punk:[
 ["얼어붙은 통로","얼음으로 막힌 연구시설 통로에서 오래된 장비가 보입니다.","안전 장비를 갖추고 회수한다","위험을 피해 돌아간다","knowledge",4,"health",-4],
 ["불타는 대지","뜨거운 지면을 피해 이동할 수 있는 길을 찾아야 합니다.","우회로를 개척한다","기온이 내려갈 때까지 기다린다","combat",3,"health",-3],
 ["폐쇄된 연구실","깨진 관측창 너머로 낡은 연구 기록이 보입니다.","외부에서 기록을 살핀다","시설을 건드리지 않는다","knowledge",5,"health",-2]],
 egg:[
 ["미래의 음식","자동 조리 장치가 눈앞에서 음식을 만들어 냅니다.","사용법을 익힌다","완성된 음식을 맛본다","knowledge",4,"health",2],
 ["홀로그램 거리","실물처럼 보이는 영상이 길을 가로막습니다.","영상과 실물을 구별해 본다","안내 표지판을 따라간다","knowledge",4,"happiness",2],
 ["연구시설의 운반 작업","허가된 구역에서 장비 운반을 도울 사람을 찾습니다.","운반 작업을 돕는다","시설 안내를 읽는다","money",20000,"health",-2]]
};
function extraScene(d,name,valid){
 const rows=extraEvents[d[0]]||[];
 if(!rows.length)return null;
 const seen=p.flags.specialEventSeen||(p.flags.specialEventSeen={});
 const pool=rows.map((r,i)=>({r,i})).filter(x=>!seen[d[0]+"_"+x.i]);
 if(!pool.length)return null;
 const {r,i}=rand(pool), id=d[0]+"_"+i;
 return {key:"special_"+id,specialPlace:name,essential:true,title:r[0],body:r[1],callbackValid:valid,choices:[
 {title:r[2],desc:"직접 경험한다",run:()=>{seen[id]=true;p[r[4]]=(p[r[4]]||0)+r[5];p[r[6]]=(p[r[6]]||0)+r[7];if(r[6]==="money")p.money=Math.max(0,p.money);log(r[0]+" — "+r[2]);}},
 {title:r[3],desc:"위험을 줄이고 주변을 살핀다",run:()=>{seen[id]=true;p.happiness+=1;log(r[0]+" — "+r[3]);}}
 ]};
}

function dedicated(){
 const d=current();if(!d)return [];
 const name=p.place.name, key="special_"+d[0]+"_", valid=()=>p.place.name===name&&!p.flags.impelDown;
 const options=travelPlaces().filter(x=>birthAllowed(x)&&x.name!==name&&x.sea===p.sea);
 const fallback=travelPlaces().filter(x=>birthAllowed(x)&&x.name!==name);
 const dest=rand(options.length?options:fallback);
 const visit={key:key+"visit",specialPlace:name,essential:true,title:d[1],body:d[2],callbackValid:valid,choices:[
 {title:d[3],desc:"장소를 경험한다",run:()=>{if(d[0]==="baratie"){p.money-=Math.min(Math.max(0,p.money),10000);p.health+=2;}else p.knowledge+=2;log(name+"에서 주변을 살핌");}},
 {title:d[4],desc:"무리하지 않는다",run:()=>{p.happiness+=1;log(name+"에서 조심스럽게 행동함");}}
 ]};
 const leave={key:key+"leave",specialPlace:name,essential:true,title:name+"을 떠날 기회",body:dest?dest.name+"으로 향할 수 있는 배편을 발견했습니다.":"아직 출항할 배편이 없습니다.",callbackValid:valid,choices:[
 ...(dest?[{title:dest.name+"으로 떠난다",desc:"다른 장소로 이동",run:()=>arrive(dest)}]:[]),
 {title:"이곳에 더 머문다",desc:"현재 장소 유지",run:()=>log(name+"에 머무름")}
 ]};
 return [visit,extraScene(d,name,valid),leave].filter(Boolean);
}
const oldBuild=buildYearScenes;
buildYearScenes=function(){
 if(!current()||p.flags.impelDown)return oldBuild.apply(this,arguments);
 const r=oldBuild.apply(this,arguments);
 scenes=scenes.filter(s=>fitScene(s));
 const own=dedicated();
 scenes.push(...own.filter(s=>!scenes.some(x=>sceneKey(x)===s.key)));
 sceneIndex=0;return r;
};
const oldArrive=arrive;
arrive=function(dest){
 const r=oldArrive.apply(this,arguments);
 if(current()&&!p.flags.impelDown){
 const own=dedicated();
 scenes.splice(sceneIndex+1,0,...own.filter(s=>!scenes.slice(sceneIndex+1).some(x=>sceneKey(x)===s.key)));
 }
 return r;
};
})();
