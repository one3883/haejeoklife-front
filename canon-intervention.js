/* 원작 개입: 연대기 뉴스와 독립적으로 실제 발생 연도에만 실행. */
(()=>{
"use strict";
const added=[["발라티에","이스트 블루"],["스릴러 바크","그랜드 라인 전반부"],["아마존 릴리","그랜드 라인 전반부"],["펑크 해저드","신세계"],["에그헤드","신세계"]];
for(const [name,sea] of added)if(!places.some(x=>x.name===name))places.push({name,country:name,sea,canon:"본편",w:1});
/* id, year, location, title, context, minor foe, major foe, ally, rescue, loot, hostile foe */
const arcs=[
["orange",1522,"오렌지 마을","버기 일당의 습격","버기 일당이 마을을 점거하고 대포를 겨눕니다.","모디","버기","나미","슈슈와 주민들을 피신시킨다","버기 일당의 보급품","롤로노아 조로"],
["syrup",1522,"겟코 제도","시롭 마을의 새벽","쿠로의 계획을 알아챈 우솝이 해안으로 달려갑니다.","샴","캡틴 쿠로","우솝","카야를 안전한 곳으로 안내한다","검은 고양이 해적단의 물자","우솝"],
["baratie",1522,"발라티에","해상 레스토랑의 결전","크리크 함대가 레스토랑을 빼앗으려 합니다.","파알","돈 크리크","상디","부상당한 요리사들을 돕는다","크리크 함대의 잔여 물자","상디"],
["arlong",1522,"코노미 제도","아론 파크의 붕괴","나미의 마을을 해방하기 위한 싸움이 시작됩니다.","츄","아론","나미","상납금 창고에 갇힌 주민들을 구한다","아론 일당의 상납금","롤로노아 조로"],
["loguetown",1522,"로그타운","처형대 위의 밀짚모자","버기 일당과 해군이 광장으로 몰려듭니다.","해군 타시기","해군 스모커","몽키 D. 루피","폭풍 속 주민들을 대피시킨다","항구의 버려진 화물","버기"],
["drum",1522,"드럼 왕국","눈 덮인 왕국의 결전","와포루가 왕좌를 되찾으려 성으로 돌아옵니다.","체스","와포루","토니토니 쵸파","눈보라 속 환자들을 옮긴다","와포루의 보급품","상디"],
["alabasta",1522,"알라바스타 왕국","다시 내리는 비","알바나에서 내전이 격화되고 폭탄의 위협이 다가옵니다.","Mr. 4","크로커다일","네펠타리 비비","광장의 시민들을 대피시킨다","바로크 워크스의 물자","Mr. 2 봉쿠레"],
["sky",1522,"스카이피아","황금종을 향한 싸움","에넬의 심판으로 하늘섬이 위기에 빠집니다.","사토리","에넬","와이퍼","엔젤 아일랜드 주민들을 구한다","버려진 황금 조각","와이퍼"],
["water",1522,"워터 세븐","워터 세븐의 영웅들","아쿠아 라그나가 다가오고 CP9의 정체가 드러납니다.","CP9 블루노","CP9 롭 루치","프랑키","침수된 조선소의 시민들을 구한다","버려진 조선 자재","프랑키"],
["thriller",1522,"스릴러 바크","그림자를 되찾는 밤","모리아의 좀비 군단이 그림자를 빼앗습니다.","압살롬","겟코 모리아","브룩","그림자를 잃은 사람들을 숨긴다","모리아의 보물 일부","브룩"],
["sabaody",1522,"샤본디 제도","봉쇄된 섬","천룡인 폭행 사건 뒤 해군이 상륙합니다.","해군 센토마루","해군 키자루","실버즈 레일리","경매장 주변의 사람들을 구한다","경매장의 버려진 재물","유스타스 키드"],
["amazon",1522,"아마존 릴리","여인섬의 소동","외부인이 여인섬에 나타나 쿠자 전사들이 경계합니다.","보아 마리골드","보아 썬더소니아","몽키 D. 루피","혼란에 휘말린 주민을 돕는다",null,"몽키 D. 루피"],
["fish",1524,"어인섬","어인섬의 소동","호디 존스가 왕궁을 점거하고 광장에 군대를 모읍니다.","다루마","호디 존스","징베","광장에 갇힌 주민들을 구한다","신 어인 해적단의 물자","징베"],
["punk",1524,"펑크 해저드","얼음과 불의 연구소","시저의 실험 시설에서 아이들이 위험에 빠집니다.","모네","시저 클라운","트라팔가 로","실험실의 아이들을 구한다","연구소의 버려진 물자","트라팔가 로"],
["dress",1524,"드레스로자","드레스로자를 덮은 '새장'","새장이 조여 오고 돈키호테 패밀리와의 전투가 벌어집니다.","델린저","돈키호테 도플라밍고","레베카","새장 안 주민들을 대피시킨다","패밀리의 무기 창고","퀴로스"],
["cake",1524,"토트랜드","엉망이 된 다과회","결혼식이 무너지고 빅맘 해적단이 추격을 시작합니다.","샬롯 오븐","샬롯 카타쿠리","상디","다과회 주변의 주민들을 피신시킨다","홀케이크 성의 물자","상디"],
["wano",1524,"와노쿠니","와노쿠니의 새벽","오니가시마 결전이 시작되고 백수 해적단이 움직입니다.","페이지원","킹","야마토","꽃의 도읍 주민들을 지킨다","백수 해적단의 무기","로로노아 조로"],
["egg",1524,"에그헤드","에그헤드의 포위","버스터 콜이 발동되고 연구섬이 포위됩니다.","CP0 카쿠","해군 키자루","프랑키","연구원들을 탈출선으로 안내한다","버려진 연구 물자","프랑키"],
["elbaf",1524,"엘바프","거인들의 술렁임","밀짚모자 일당의 도착 소식에 거인들이 움직입니다.",null,null,"도리","항구의 방문객들을 돕는다",null,null]
];
const oldTitles=new Set(arcs.map(a=>a[3]));
const state=()=>p.flags.canonIntervention||(p.flags.canonIntervention={done:{},ties:{}});
const blocked=()=>!p||!p.flags||p.job==="노예"||p.job==="수감자"||p.flags.impelDown||p.fruit==="고무고무 열매"||p.status==="천룡인";
const here=a=>p.place&&(p.place.name===a[2]||p.place.country===a[2]||(a[0]==="dress"&&p.place.name==="그린 비트"));
const alive=name=>!(p.npcs||[]).some(n=>n.name===name&&!n.alive)&&!(name==="몽키 D. 루피"&&p.flags.luffyDead);
const wanted=()=>["해적","혁명군"].includes(p.status);
const choice=(title,desc,run)=>({title,desc,run});
function tie(name,delta,a){
 if(!name||!alive(name))return;
 const t=state().ties[name]||(state().ties[name]={score:0,age:p.age,arc:a[0],place:a[2],followed:false});
 t.score=Math.max(-100,Math.min(100,t.score+delta));t.age=p.age;
 const n=(p.npcs||[]).find(n=>n.name===name&&n.alive);
 if(n){n.rel=clamp(n.rel+delta);npcStory(n,a[3]+"에서 인연을 맺음");}
 log(name+"와 "+(delta>0?"우호":"적대")+" 관계를 맺음");
}
function reward(amount,crime){
 p.reputation+=2;gainStanding(2);p.money+=amount;
 if(crime&&wanted()){p.bountyIssued=true;p.bounty=(p.bounty||0)+amount*4;}
}
function crewResult(members,won,a){
 for(const n of members){
 if(!n.alive)continue;
 if(won){n.power=Math.min(100,n.power+2);n.rel=clamp(n.rel+3);if(n.aff==="해적")n.bounty=(n.bounty||0)+ri(100000,600000);npcStory(n,a[3]+"에서 활약함");}
 else if(Math.random()<.08){npcDie(n,a[3]+"에서 전사");log(n.name+"이 전사함");}
 else {n.power=Math.max(1,n.power-2);npcStory(n,a[3]+"에서 부상당함");log(n.name+"이 부상당함");}
 }
}
function fight(a,foe,ally,withCrew,hostile){
 const members=withCrew?npcsBy(n=>n.role==="동료"&&n.aff===myAff()).slice(0,3):[];
 const strong=foe===a[6];const base=strong?-.25:.18;
 const won=battle({foe,base,extra:Math.min(.12,members.reduce((s,n)=>s+n.power*.0007,0)),loseHp:strong?[22,45]:[10,25],win:()=>reward(strong?ri(300000,900000):ri(80000,300000),true)});
 crewResult(members,won,a);tie(foe,-12,a);tie(ally,won?20:8,a);
 if(won)log(a[3]+"에서 "+foe+"와의 국지전 승리 — 원작 결말은 유지됨");
}
function scene(a){
 const [id,year,loc,title,body,minor,major,ally,rescue,loot,enemy]=a;
 const cs=[];const adult=realAge()>=16;const fighter=adult&&p.combat>=15;
 const foe=p.combat>=65&&alive(major)?major:alive(minor)?minor:null;
 if(fighter&&foe&&p.status!=="해군"&&alive(ally)){
 cs.push(choice("밀짚모자 일행과 협력한다 — "+foe,"국지전 · 승리 시 명성 및 보상 · 패배 시 부상 또는 사망",()=>fight(a,foe,ally,false,false)));
 if(npcsBy(n=>n.role==="동료"&&n.aff===myAff()).length)cs.push(choice("동료들과 함께 싸운다 — "+foe,"동료 지원 · 동료도 부상이나 사망 위험",()=>fight(a,foe,ally,true,false)));
 }
 if(fighter&&enemy&&alive(enemy)&&["해군","해적","현상금 사냥꾼"].includes(myAff())&&id!=="amazon")
 cs.push(choice("밀짚모자 측을 저지한다 — "+enemy,"적대 세력 협력 · 원작 결말은 유지",()=>fight(a,enemy,foe,false,true)));
 if(realAge()>=8)cs.push(choice(rescue,"건강 감소 · 주민과 인연 및 명성 증가",()=>{p.health-=ri(2,7);p.relationship+=3;gainStanding(1);tie(ally,8,a);log(rescue);}));
 if(adult&&loot&&wanted())cs.push(choice("혼란을 틈타 "+loot+"을 확보한다","재산과 현상금 증가 · 주민 관계 감소",()=>{reward(ri(100000,400000),true);p.relationship-=5;p.health-=ri(1,8);tie(ally,-8,a);}));
 cs.push(choice("관여하지 않고 몸을 숨긴다","전투 위험 회피 · 개입 기회 포기",()=>{p.happiness-=1;log(title+"을 멀리서 지켜봄");}));
 for(const c of cs){const run=c.run;c.run=()=>{state().done[id]=true;run();};}
 return {key:"intervention_"+id,essential:true,title,body:body+" 당신은 이 사건에 직접 개입할 수 있습니다. 원작의 큰 결말은 바뀌지 않습니다.",choices:cs,callbackValid:()=>!blocked()&&canonYear()===year&&here(a)&&!state().done[id]};
}
const oldCanon=canonScenes;
canonScenes=function(){return oldCanon.apply(this,arguments).filter(s=>!oldTitles.has(s.title));};
const oldBuild=buildYearScenes;
buildYearScenes=function(){
 const r=oldBuild.apply(this,arguments);if(blocked()||p.health<=0)return r;
 const st=state();
 const matches=arcs.filter(a=>a[1]===canonYear()&&here(a)&&!st.done[a[0]]);
 scenes.unshift(...matches.map(scene));
 if(!matches.length&&realAge()>=16){
 const pair=Object.entries(st.ties).find(([name,t])=>!t.followed&&alive(name)&&p.age-t.age>=3&&(p.place.name===t.place||p.place.country===t.place)&&Math.abs(t.score)>=8);
 if(pair){const [name,t]=pair;const friendly=t.score>0;const done=()=>{t.followed=true;};
 scenes.unshift({key:"intervention_reunion_"+t.arc+"_"+name,essential:true,title:name+"와의 인연",body:friendly?"과거 사건에서 맺은 인연이 다시 이어집니다. 연락을 통해 도움을 주고받을 기회가 생겼습니다.":"과거의 적대 관계 때문에 경계와 갈등이 이어집니다.",choices:[choice(friendly?"협력 관계를 이어간다":"갈등을 피하고 화해를 시도한다","재산 감소 · 관계 개선",()=>{done();p.money-=Math.min(Math.max(0,p.money),100000);t.score+=10;gainStanding(1);}),choice("거리를 둔다","관계 유지 · 위험 회피",done)]});}
 }
 return r;
};
})();
