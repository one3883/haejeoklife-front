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
 return [visit,leave];
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
