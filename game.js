import * as THREE from './node_modules/three/build/three.module.js';
let networkReplica=false,networkSettings=null,networkRound=-1;
const $=id=>document.getElementById(id), clamp=THREE.MathUtils.clamp;
const renderer=new THREE.WebGLRenderer({canvas:$('game'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.setClearColor(0x819eaa);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x819eaa,45,95);const camera=new THREE.PerspectiveCamera(52,1,.1,150);
scene.add(new THREE.HemisphereLight(0xe6f8ff,0x817052,2.4));const sun=new THREE.DirectionalLight(0xfff5da,3);sun.position.set(-12,24,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-24,right:24,top:26,bottom:-26});scene.add(sun);
const mat=(c,r=.75)=>new THREE.MeshStandardMaterial({color:c,roughness:r});const wood=mat(0xd8ad78),teal=mat(0x188e89),red=mat(0xee705c),white=mat(0xf9eed9),dark=mat(0x193845),gold=mat(0xffd35d),skin=mat(0xf4c3a2);
function box(w,h,d,m,x,y,z){let o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.receiveShadow=true;scene.add(o);return o}function sphere(r,m){const o=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),m);o.castShadow=true;return o}
const gymObjectsStart = scene.children.length;
box(36,.4,44,mat(0x345665),0,-.35,0);box(25,.18,33,wood,0,-.1,0);for(let i=-16;i<=16;i++)box(25,.006,.025,mat(i%3===0?0xb88758:0xc89a67),0,.004,i);
box(24,.012,15.5,mat(0xc8b58a),0,.008,8);box(24,.012,15.5,mat(0xdca582),0,.008,-8);
for(let x of [-12,12])box(.08,.025,32,white,x,.024,0);for(let z of [-16,0,16])box(24,.028,.1,white,0,.027,z);box(24,.03,.13,teal,0,.03,.22);box(24,.03,.13,red,0,.03,-.22);
let ring=new THREE.Mesh(new THREE.RingGeometry(2.7,2.76,80),white);ring.rotation.x=-Math.PI/2;ring.position.y=.035;scene.add(ring);
box(36,8,.5,mat(0xa4bac1),0,3.5,-22);box(.5,8,44,mat(0x7698a5),-18,3.5,0);box(.5,8,44,mat(0x7698a5),18,3.5,0);for(let x of [-18,18]){for(let z=-18;z<=18;z+=6){box(.15,2.7,4,mat(0xcde9e9),x*.988,5,z);box(.22,.12,4.2,white,x*.985,3.62,z)}for(let level=0;level<3;level++)box(2.1,.5,29,mat(level%2?0x345363:0x476e7d),x*.88,level*.55,0)}
for(let x of [-8,8]){box(.18,6,.2,dark,x,3,-20);box(3,1.8,.15,white,x,5.5,-19.8);box(1.15,.75,.18,red,x,5.25,-19.65);let hoop=new THREE.Mesh(new THREE.TorusGeometry(.6,.06,8,24),red);hoop.rotation.x=Math.PI/2;hoop.position.set(x,4.75,-19.05);scene.add(hoop)}
function sign(text,x,y,z,w,h){let c=document.createElement('canvas');c.width=1024;c.height=256;let ct=c.getContext('2d');ct.fillStyle='#173a48';ct.fillRect(0,0,1024,256);ct.fillStyle='#a3f4ce';ct.font='bold 125px sans-serif';ct.textAlign='center';ct.fillText(text,512,172);let m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}));m.position.set(x,y,z);scene.add(m)}sign('COURTSIDE',0,5.6,-21.7,10,2.5);
const gymStage = new THREE.Group();
for (const object of scene.children.slice(gymObjectsStart)) gymStage.add(object);
scene.add(gymStage);
const arenaStart = scene.children.length;
const arenaFloor = mat(0x172e4a), arenaNorth = mat(0x26616a), arenaSouth = mat(0x53426c);
const stadiumSteel = mat(0x142535), seatBlue = mat(0x275578), seatPurple = mat(0x675080);
const ledMint = new THREE.MeshBasicMaterial({color:0x83ffd3}), ledCoral = new THREE.MeshBasicMaterial({color:0xff937f});
box(56,.5,60,stadiumSteel,0,-.45,0);
box(25,.18,33,arenaFloor,0,-.1,0);
box(24,.012,15.8,arenaNorth,0,.008,8);
box(24,.012,15.8,arenaSouth,0,.008,-8);
for (const x of [-12,12]) box(.09,.025,32,white,x,.025,0);
for (const z of [-16,0,16]) box(24,.025,.1,white,0,.025,z);
const arenaCircle = new THREE.Mesh(new THREE.RingGeometry(2.7,2.78,80),white);
arenaCircle.rotation.x=-Math.PI/2;arenaCircle.position.y=.035;scene.add(arenaCircle);
for (const x of [-13,13]) {
  box(.16,.15,33,ledMint,x,.12,0);
  box(.4,.7,34,stadiumSteel,x*1.055,.2,0);
}
for (const z of [-17,17]) box(26,.15,.16,ledCoral,0,.12,z);
// Tiered seating wraps three sides, leaving the camera end open.
for (let tier=0;tier<7;tier++) {
  const y=.6+tier*.75;
  for (const side of [-1,1]) {
    box(1.5,.65,40,stadiumSteel,side*(15+tier*1.5),y,0);
    box(.9,.24,39,tier%2?seatPurple:seatBlue,side*(15+tier*1.5),y+.44,0);
  }
  box(48,.65,1.5,stadiumSteel,0,y,-20-tier*1.5);
  box(47,.24,.9,tier%2?seatBlue:seatPurple,0,y+.44,-20-tier*1.5);
}
const crowdGeometry=new THREE.SphereGeometry(.22,6,5);
const crowd=new THREE.InstancedMesh(crowdGeometry,mat(0xffffff),600);
const dummy=new THREE.Object3D(), crowdSeats=[];let spectator=0;
for(let tier=0;tier<7;tier++) {
  for(let n=0;n<24;n++) for(const side of [-1,1]) {
    dummy.position.set(side*(15+tier*1.5),1.5+tier*.75,-18+n*1.55);
    dummy.scale.set(.9,1.6,.9);dummy.updateMatrix();crowd.setMatrixAt(spectator,dummy.matrix);
    crowdSeats.push({position:dummy.position.clone(),team:side<0?0:1});
    crowd.setColorAt(spectator++,new THREE.Color(side<0?[0x6ce7c4,0x24998d,0xa7f7dc][n%3]:[0xffa18c,0xd86766,0xffccaa][n%3]));
  }
  for(let n=0;n<32;n++) {
    dummy.position.set(-22+n*1.42,1.5+tier*.75,-20-tier*1.5);dummy.updateMatrix();crowd.setMatrixAt(spectator,dummy.matrix);
    crowdSeats.push({position:dummy.position.clone(),team:n<16?0:1});
    crowd.setColorAt(spectator++,new THREE.Color(n<16?[0x6ce7c4,0x24998d,0xa7f7dc][n%3]:[0xffa18c,0xd86766,0xffccaa][n%3]));
  }
}
crowd.count=spectator;scene.add(crowd);
for(const x of [-15,15]) {
  box(.35,13,.35,stadiumSteel,x,6.5,-19);
  box(5,.7,.6,stadiumSteel,x,13,-19);
  for(let i=0;i<5;i++) box(.65,.4,.1,new THREE.MeshBasicMaterial({color:0xf0faff}),x-1.8+i*.9,13,-18.65);
}
box(15,3.5,.5,stadiumSteel,0,8,-25);
sign('THE ARENA',0,8,-24.7,14,3);
sign('NORTH FANS',-7,3,-19,8,1.1);sign('SOUTH FANS',7,3,-19,8,1.1);
const arenaStage=new THREE.Group();
for(const object of scene.children.slice(arenaStart)) arenaStage.add(object);
scene.add(arenaStage);arenaStage.visible=false;
const courseStart=scene.children.length,obstacles=[];
box(38,.4,44,mat(0x1e4445),0,-.35,0);box(25,.18,33,mat(0x436e67),0,-.1,0);
for(const z of [-16,0,16])box(24,.03,.1,white,0,.03,z);
for(const x of [-12,12])box(.1,.03,32,white,x,.03,0);
for(const side of [-1,1]){
  for(const x of [-5,5])obstacles.push({x,z:side*5.3,w:2.4,d:1.2,h:2.2,type:'cover'});
  obstacles.push({x:0,z:side*7,w:4,d:.6,h:.65,type:'hurdle'});
  for(const x of [-9,9])obstacles.push({x,z:side*3.6,w:1.2,d:1.2,h:2.8,type:'pillar'});
}
for(const o of obstacles){
  box(o.w,o.h,o.d,mat(o.type==='hurdle'?0xf5b84c:0x33495a),o.x,o.h/2,o.z);
  box(o.w+.04,.12,o.d+.04,mat(o.type==='hurdle'?0xffe7a0:0xff985a),o.x,o.h-.06,o.z);
  if(o.type!=='hurdle')box(o.w+.06,.09,o.d+.06,mat(0xa3e8ca),o.x,.25,o.z);
}
for(const x of [-16,16]){box(.25,3,36,mat(0x426360),x,1,0);for(let z=-16;z<=16;z+=4)box(.35,4,.35,dark,x,1.6,z)}
sign('THE GAUNTLET',0,5,-20,12,2.5);sign('JUMP LOW / USE COVER',0,2.5,-20,12,1);
const courseStage=new THREE.Group();for(const object of scene.children.slice(courseStart))courseStage.add(object);scene.add(courseStage);courseStage.visible=false;
function insideObstacle(x,z,o,pad=.45){return Math.abs(x-o.x)<o.w/2+pad&&Math.abs(z-o.z)<o.d/2+pad}
function safeBallPosition(point){if(stage==='course')for(let pass=0;pass<3;pass++)for(const o of obstacles)if(insideObstacle(point.x,point.z,o,.5))point.z=o.z+Math.sign(point.z-o.z||o.z)*(o.d/2+.65);return point}
function steerObstacles(p){
  if(stage!=='course')return;
  if(p.navPoint){const dx=p.navPoint.x-p.x,dz=p.navPoint.z-p.z;if(Math.hypot(dx,dz)<.4)p.navPoint=null;else{p.move.set(dx,0,dz).normalize();return}}
  if(p.move.lengthSq()<.01)return;
  const o=obstacles.find(o=>insideObstacle(p.x+p.move.x*1.8,p.z+p.move.z*1.8,o,.7));if(!o)return;
  if(Math.abs(p.move.z)>=Math.abs(p.move.x))p.navPoint={x:o.x+Math.sign(p.x-o.x||p.id%2-.5)*(o.w/2+1),z:o.z+Math.sign(p.move.z)*(o.d/2+1)};
  else p.navPoint={x:o.x+Math.sign(p.move.x)*(o.w/2+1),z:o.z+Math.sign(p.z-o.z||1)*(o.d/2+1)};
  p.move.set(p.navPoint.x-p.x,0,p.navPoint.z-p.z).normalize();
}
function resolveObstacles(p){if(stage!=='course')return;for(const o of obstacles){if(p.jumpY>=o.h+.05||!insideObstacle(p.x,p.z,o))continue;const dx=(o.w/2+.45)-Math.abs(p.x-o.x),dz=(o.d/2+.45)-Math.abs(p.z-o.z);if(dx<dz)p.x=o.x+Math.sign(p.x-o.x||1)*(o.w/2+.45);else p.z=o.z+Math.sign(p.z-o.z||1)*(o.d/2+.45)}}
function obstacleContact(start,end){
  if(stage!=='course')return null;let hit=null;
  for(const o of obstacles){let entry=0,leave=1,normal=new THREE.Vector3();let valid=true;
    for(const axis of ['x','y','z']){const center=axis==='x'?o.x:axis==='z'?o.z:o.h/2,half=(axis==='x'?o.w:axis==='z'?o.d:o.h)/2+.28,delta=end[axis]-start[axis];
      if(Math.abs(delta)<1e-8){if(start[axis]<center-half||start[axis]>center+half){valid=false;break}continue}
      let t1=(center-half-start[axis])/delta,t2=(center+half-start[axis])/delta;if(t1>t2)[t1,t2]=[t2,t1];if(t1>entry){entry=t1;normal.set(0,0,0);normal[axis]=delta>0?-1:1}leave=Math.min(leave,t2);if(entry>leave){valid=false;break}
    }
    if(valid&&entry>=0&&entry<=1&&normal.lengthSq()>0&&(!hit||entry<hit.t))hit={t:entry,normal};
  }return hit;
}
let stage='gym',infinityMode=false,bajillionMode=false,teamSize=3;
const spawnX=id=>teamSize===1?0:(id-(teamSize-1)/2)*(teamSize===2?8:teamSize===3?6:4.5);
const humanId=()=>Math.floor((teamSize-1)/2);
let crowdReactionTime=0,crowdLastTeam=null,crowdReactionCount=0,crowdAudioCount=0,crowdSources=[];
function stopCrowdAudio() {
  for(const node of crowdSources){try{node.stop()}catch{}try{node.disconnect()}catch{}}
  crowdSources=[];
}
function poseCrowd(time) {
  for(let i=0;i<crowdSeats.length;i++) {
    const seat=crowdSeats[i];
    const progress=clamp((.9-time-(i%7)*.012)/.68,0,1);
    const hop=time>0?Math.sin(progress*Math.PI)*(.4+(i%3)*.055):0;
    dummy.position.copy(seat.position);dummy.position.y+=hop;
    dummy.scale.set(.9,1.6,.9);dummy.updateMatrix();crowd.setMatrixAt(i,dummy.matrix);
  }
  crowd.instanceMatrix.needsUpdate=true;
}
function clearCrowd() {
  crowdReactionTime=0;crowdLastTeam=null;poseCrowd(0);stopCrowdAudio();$('crowdReaction').hidden=true;
}
function playCrowdAudio(eliminatedTeam) {
  stopCrowdAudio();
  if(muted)return;
  try {
    audio??=new AudioContext();audio.resume();const now=audio.currentTime;
    // One bounded pair of crowd voices: home fans on the left, away fans on the right.
    for(let team=0;team<2;team++) {
      const cheer=team!==eliminatedTeam, gain=audio.createGain(), pan=audio.createStereoPanner();
      pan.pan.value=team? .7:-.7;gain.gain.setValueAtTime(.001,now);gain.gain.linearRampToValueAtTime(cheer?.055:.045,now+.09);gain.gain.exponentialRampToValueAtTime(.001,now+.78);gain.connect(pan).connect(audio.destination);
      const noise=audio.createBuffer(1,Math.ceil(audio.sampleRate*.8),audio.sampleRate);const data=noise.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.6;
      const wash=audio.createBufferSource(),filter=audio.createBiquadFilter();wash.buffer=noise;filter.type='bandpass';filter.frequency.value=cheer?1400:380;filter.Q.value=.8;wash.connect(filter).connect(gain);wash.start(now);wash.stop(now+.8);crowdSources.push(wash,gain,pan,filter);
      for(let voice=0;voice<4;voice++) {
        const oscillator=audio.createOscillator(),level=audio.createGain(),vowel=audio.createBiquadFilter();
        oscillator.type='sawtooth';const pitch=(cheer?240:105)+voice*13;
        oscillator.frequency.setValueAtTime(pitch,now);oscillator.frequency.linearRampToValueAtTime(pitch*(cheer?1.65:.76),now+.55);
        vowel.type='lowpass';vowel.frequency.value=cheer?1100:420;level.gain.value=.22;
        oscillator.connect(vowel).connect(level).connect(gain);oscillator.start(now+voice*.014);oscillator.stop(now+.8);crowdSources.push(oscillator,level,vowel);
      }
    }
    crowdAudioCount++;
  } catch {}
}
function reactCrowd(team) {
  if(stage!=='arena')return;
  crowdReactionTime=.9;crowdLastTeam=team;crowdReactionCount++;
  $('crowdReaction').hidden=false;
  $('crowdReaction').textContent=team===0?'NORTH FANS: BOO! · SOUTH FANS: YEAH!':'NORTH FANS: YEAH! · SOUTH FANS: BOO!';
  playCrowdAudio(team);
}
function animateCrowd(dt) {
  if(stage!=='arena'||crowdReactionTime<=0||phase==='paused')return;
  crowdReactionTime=Math.max(0,crowdReactionTime-dt);poseCrowd(crowdReactionTime);
  if(crowdReactionTime===0){$('crowdReaction').hidden=true;stopCrowdAudio()}
}

function setInfinity(enabled){
  infinityMode=enabled;sudden=false;remaining=120;
  document.querySelectorAll('.infinity-toggle').forEach(input=>input.checked=enabled);
  $('timer').textContent=enabled?'∞':'2:00';
  message(enabled?'INFINITY ON · EVERYONE RETURNS · NO TIME LIMIT':'NORMAL MODE · 2 MINUTES · WIN CHECK ON RESUME',3);
  if(phase==='playing')checkWin();
}
document.querySelectorAll('.infinity-toggle').forEach(input=>input.addEventListener('change',()=>setInfinity(input.checked)));

function setBajillion(enabled){
  if(bajillionMode===enabled)return;bajillionMode=enabled;
  document.querySelectorAll('.bajillion-toggle').forEach(input=>input.checked=enabled);
  score=[0,0];round=0;keys={};reset();
  if(phase==='over'){
    phase='intro';document.querySelector('.eyebrow').textContent='NEW BALLS. NEW MATCH.';
    document.querySelector('h1').innerHTML='OWN THE<br><em>COURT.</em>';
    document.querySelector('.intro p').innerHTML=`${teamSize} versus ${teamSize}. One team left standing.<br>Grab a ball, line up a shot, and keep moving.`;
    document.querySelector('.eyebrow').textContent='PICK YOUR MOMENT. TAKE YOUR SHOT.';document.querySelector('.intro p').innerHTML='Grab a ball, line up a shot, and keep moving.';document.querySelector('.tips').style.display='flex';$('start').innerHTML='LET’S PLAY <span>↗</span>';
  }
  message(`${enabled?'BAJILLION BALLS ON':'NORMAL BALLS'} · ${balls.length} BALLS · MATCH RESET`,3);
}
document.querySelectorAll('.bajillion-toggle').forEach(input=>input.addEventListener('change',()=>setBajillion(input.checked)));
function initialBallPosition(i,count){
  if(!bajillionMode)return safeBallPosition(new THREE.Vector3((i-(count-1)/2)*Math.min(4,18/(count-1)),.28,0));
  const pair=Math.floor(i/2),half=count/2,cols=Math.min(6,half),row=Math.floor(pair/cols),rowCount=Math.min(cols,half-row*cols),col=pair%cols;
  return safeBallPosition(new THREE.Vector3((col-(rowCount-1)/2)*Math.min(4,18/Math.max(1,rowCount-1)),.28,(i%2?1:-1)*(1.6+row*2.3)));
}

function changeTeamSize(value){
  const next=Number(value);if(![1,2,3,5].includes(next)||next===teamSize)return;
  teamSize=next;document.querySelectorAll('.size-select').forEach(select=>select.value=String(next));
  score=[0,0];round=0;keys={};reset();
  if(phase==='over'){
    phase='intro';document.querySelector('.eyebrow').textContent='NEW TEAMS. NEW MATCH.';
    document.querySelector('h1').innerHTML='OWN THE<br><em>COURT.</em>';
    document.querySelector('.eyebrow').textContent='PICK YOUR MOMENT. TAKE YOUR SHOT.';document.querySelector('.intro p').innerHTML='Grab a ball, line up a shot, and keep moving.';document.querySelector('.tips').style.display='flex';$('start').innerHTML='LET’S PLAY <span>↗</span>';
  }
  if(phase==='intro')document.querySelector('.intro p').innerHTML=`${teamSize} versus ${teamSize}. One team left standing.<br>Grab a ball, line up a shot, and keep moving.`;
  message(`${next}v${next} SELECTED · MATCH RESET`,3);
}
document.querySelectorAll('.size-select').forEach(select=>select.addEventListener('change',()=>changeTeamSize(select.value)));

function switchStage(next) {
  if(!['gym','arena','course'].includes(next)||next===stage)return;
  stage=next;gymStage.visible=stage==='gym';arenaStage.visible=stage==='arena';courseStage.visible=stage==='course';
  const isArena=stage==='arena';
  scene.fog.color.set(isArena?0x15283e:stage==='course'?0x78958b:0x819eaa);renderer.setClearColor(scene.fog.color);
  sun.color.set(isArena?0xdbeaff:0xfff5da);
  document.querySelectorAll('.stage-select').forEach(select=>select.value=stage);document.querySelectorAll('.stage-card').forEach(card=>card.setAttribute('aria-pressed',String(card.dataset.stage===stage)));
  $('stageLabel').textContent=isArena?'THE ARENA / STADIUM':stage==='course'?'OBSTACLE COURSE / THE GAUNTLET':'THE GYM / CLASSIC';
  score=[0,0];round=0;keys={};reset();
  if(phase==='over') {
    phase='intro';document.querySelector('.eyebrow').textContent='NEW STAGE. NEW MATCH.';
    document.querySelector('h1').innerHTML='OWN THE<br><em>COURT.</em>';
    document.querySelector('.intro p').innerHTML=`${teamSize} versus ${teamSize}. One team left standing.<br>Grab a ball, line up a shot, and keep moving.`;
    document.querySelector('.eyebrow').textContent='PICK YOUR MOMENT. TAKE YOUR SHOT.';document.querySelector('.intro p').innerHTML='Grab a ball, line up a shot, and keep moving.';document.querySelector('.tips').style.display='flex';$('start').innerHTML='LET’S PLAY <span>↗</span>';
  }
  message(`${isArena?'ARENA':stage==='course'?'OBSTACLE COURSE':'GYM'} SELECTED · MATCH RESET`,3);
}
document.querySelectorAll('.stage-card').forEach(card=>{
  card.addEventListener('click',()=>switchStage(card.dataset.stage));
  card.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const cards=[...card.parentElement.querySelectorAll('.stage-card')],index=cards.indexOf(card),next=event.key==='Home'?0:event.key==='End'?cards.length-1:(index+(event.key==='ArrowRight'?1:cards.length-1))%cards.length;cards[next].focus();cards[next].click()});
});
document.querySelectorAll('.stage-select').forEach(select=>select.addEventListener('change',()=>switchStage(select.value)));

const SUPER_RADIUS=5,blueFireMaterial=new THREE.MeshBasicMaterial({color:0x23cfff});
const MAX_FIRE=512,fireMaterial=new THREE.MeshBasicMaterial({color:0xff722f}),fireGlowMaterial=new THREE.MeshBasicMaterial({color:0xffb12d,transparent:true,opacity:.55,side:THREE.DoubleSide});
const fireColumns=new THREE.InstancedMesh(new THREE.ConeGeometry(.4,1,6),new THREE.MeshBasicMaterial({color:0xffffff}),MAX_FIRE);
const fireGround=new THREE.InstancedMesh(new THREE.CircleGeometry(.5,12),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55,side:THREE.DoubleSide}),MAX_FIRE);
fireColumns.frustumCulled=fireGround.frustumCulled=false;fireColumns.count=fireGround.count=0;scene.add(fireColumns,fireGround);
let explosions=[],explosionCount=0;
let hazards=[],holdTime=0,fireClock=0,nextShotId=1;
function extinguish(b){b.homingTarget=null;b.homingTime=0;b.flaming=false;if(b.flame)b.flame.visible=false;b.mesh.material=gold}
function clearFire(){for(const fx of explosions){disposeExplosion(fx)}explosions=[];for(const b of balls){b.superShot=false;b.superOwner=null}hazards=[];fireColumns.count=fireGround.count=0;holdTime=0;for(const b of balls)extinguish(b);$('overcharge').style.width='0%';$('overchargeLabel').textContent='OVERCHARGE · HOLD 3s'}
function removeShotFire(id){hazards=hazards.filter(h=>h.shot!==id)}
function emitFire(b,end){
  while(b.fireLast.distanceTo(end)>=.45){
    const point=b.fireLast.clone().lerp(end,.45/b.fireLast.distanceTo(end));b.fireLast.copy(point);
    if(Math.abs(point.x)>11.5||Math.abs(point.z)>15.5)continue;
    if(hazards.length>=MAX_FIRE)hazards.shift();
    hazards.push({x:point.x,z:point.z,life:5,team:b.thrower.team,owner:b.thrower,super:b.superShot,shot:b.shot});
  }
}
function updateFire(dt){
  for(const h of hazards)h.life-=dt;
  hazards=hazards.filter(h=>h.life>0);
  for(const p of players){
    if(!p.alive||p.protection>0)continue;
    const touching=hazards.find(h=>h.team!==p.team&&(h.super||p.jumpY<.6)&&Math.hypot(p.x-h.x,p.z-h.z)<.8);
    if(touching){
      eliminate(p,touching.owner);message(`${p.team?'SOUTH':'NORTH'} 0${p.id+1} OUT · FIRE TRAIL`,2);
      if(sudden&&!infinityMode){finish(1-p.team);return}
      checkWin();if(phase!=='playing')return;
    }
  }
}
function armSuper(p){
  if(!p.alive||p.superMeter<100||!p.ball){if(p===controlled)message(!p.ball?'PICK UP A BALL TO ARM SUPER':'SUPER NEEDS 5 OPPONENT OUTS',1.5);return}
  p.superArmed=!p.superArmed;p.ball.flaming=p.superArmed;
  if(p===controlled){holdTime=p.superArmed?3:0;charge=p.superArmed?1:0;message(p.superArmed?'SUPER ARMED · THROW TO DETONATE ON BOUNCE':'SUPER DISARMED · METER SAVED',2)}
  sync();
}
function disposeExplosion(fx){scene.remove(fx.mesh);fx.mesh.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()})}
function explodeSuper(b,visualOnly=false){
  if(!b.superShot)return;
  const owner=b.superOwner;b.superShot=false;b.superOwner=null;explosionCount++;
  const center=new THREE.Vector3(clamp(b.pos.x,-12,12),.06,clamp(b.pos.z,-16,16));
  const clips=[new THREE.Plane(new THREE.Vector3(1,0,0),12),new THREE.Plane(new THREE.Vector3(-1,0,0),12),new THREE.Plane(new THREE.Vector3(0,0,1),16),new THREE.Plane(new THREE.Vector3(0,0,-1),16)];
  const fxMat=(color,opacity)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false,clippingPlanes:clips});
  renderer.localClippingEnabled=true;
  const mesh=new THREE.Group();mesh.position.copy(center);
  const disk=new THREE.Mesh(new THREE.CircleGeometry(SUPER_RADIUS,64),fxMat(0x168dff,.32));disk.rotation.x=-Math.PI/2;mesh.add(disk);
  const edge=new THREE.Mesh(new THREE.RingGeometry(SUPER_RADIUS-.1,SUPER_RADIUS,64),fxMat(0x8ef7ff,.9));edge.rotation.x=-Math.PI/2;edge.position.y=.02;mesh.add(edge);
  const wave=new THREE.Mesh(new THREE.RingGeometry(SUPER_RADIUS-.22,SUPER_RADIUS,64),fxMat(0xb9fdff,.95));wave.rotation.x=-Math.PI/2;wave.position.y=.05;wave.scale.setScalar(.08);mesh.add(wave);
  const flames=[],embers=[];
  for(let i=0;i<28;i++){
    const angle=i*2.39996,radius=Math.sqrt((i+.5)/28)*(SUPER_RADIUS-.6),height=1.2+(i%5)*.27;
    const flame=new THREE.Mesh(new THREE.ConeGeometry(.38,height,6),fxMat(i%2?0x28bbff:0x7afaff,.85));flame.position.set(Math.cos(angle)*radius,height/2,Math.sin(angle)*radius);mesh.add(flame);flames.push(flame);
  }
  for(let i=0;i<20;i++){
    const angle=i*2.39996,radius=Math.sqrt((i+.5)/20)*(SUPER_RADIUS-.4);
    const ember=new THREE.Mesh(new THREE.OctahedronGeometry(.11),fxMat(0xb3ffff,.9));ember.position.set(Math.cos(angle)*radius,.3,Math.sin(angle)*radius);mesh.add(ember);embers.push(ember);
  }
  scene.add(mesh);if(explosions.length>=8)disposeExplosion(explosions.shift());
  explosions.push({id:explosionCount,mesh,life:1.2,disk,edge,wave,flames,embers});beep(65,.25,'sawtooth',.09);
  if(visualOnly)return;
  for(const p of players){
    if(p.alive&&owner&&p.team!==owner.team&&p.protection<=0&&p.dash<=0&&Math.hypot(p.x-center.x,p.z-center.z)<=SUPER_RADIUS){
      eliminate(p,owner);
      if(sudden&&!infinityMode){finish(owner.team);return}
    }
  }
  checkWin();
}
function updateExplosions(dt){
  for(let i=explosions.length-1;i>=0;i--){
    const fx=explosions[i];fx.life-=dt;const age=1.2-fx.life,fade=Math.max(0,fx.life/1.2);
    fx.disk.material.opacity=fade*.32;fx.edge.material.opacity=fade*.9;
    fx.wave.scale.setScalar(Math.min(1,.08+age/.5));fx.wave.material.opacity=Math.max(0,1-age/.8);
    fx.flames.forEach((flame,n)=>{flame.scale.y=Math.max(.01,Math.min(1,fx.life/.75))*(1+Math.sin(age*20+n)*.12);flame.material.opacity=Math.max(0,1-age/1.05)*.85});
    fx.embers.forEach((ember,n)=>{ember.position.y+=dt*(1.1+n%3*.3);ember.material.opacity=fade*.9});
    if(fx.life<=0){disposeExplosion(fx);explosions.splice(i,1)}
  }
}

function drawFire(){
  fireColumns.count=fireGround.count=hazards.length;
  for(let i=0;i<hazards.length;i++){
    const h=hazards[i],fade=Math.min(1,h.life/.5),height=((h.super?1.1:.65)+Math.sin(fireClock*16+i)*.18)*fade;
    dummy.position.set(h.x,height/2+.04,h.z);dummy.rotation.set(0,i,0);dummy.scale.set(fade,height,fade);dummy.updateMatrix();fireColumns.setMatrixAt(i,dummy.matrix);fireColumns.setColorAt(i,new THREE.Color(h.super?0x29cfff:0xff722f));
    dummy.position.y=.045;dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.setScalar(fade);dummy.updateMatrix();fireGround.setMatrixAt(i,dummy.matrix);fireGround.setColorAt(i,new THREE.Color(h.super?0x72efff:0xffb12d));
  }
  dummy.rotation.set(0,0,0);fireColumns.instanceMatrix.needsUpdate=true;fireGround.instanceMatrix.needsUpdate=true;if(hazards.length){fireColumns.instanceColor.needsUpdate=true;fireGround.instanceColor.needsUpdate=true;}
}

let players=[],balls=[],particles=[],controlled,phase='intro',remaining=120,sudden=false,score=[0,0],round=0,charge=0,charging=false,keys={},mouse=new THREE.Vector2(0,0),aim=new THREE.Vector3(0,0,-7),msgTime=0,muted=false,audio,activeBeeps=0;
const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.9),clock={last:performance.now(),getDelta(){let now=performance.now(),dt=(now-this.last)/1000;this.last=now;return dt}};
function beep(freq=300,duration=.08,type='sine',volume=.06){if(muted||activeBeeps>=16)return;try{audio??=new AudioContext();audio.resume();let o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.55,audio.currentTime+duration);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);activeBeeps++;o.onended=()=>{activeBeeps--;o.disconnect();g.disconnect()};o.start();o.stop(audio.currentTime+duration)}catch{}}
function message(s,t=2){$('message').textContent=s;msgTime=t}
const jerseyTextures=new Map(),jerseyPrints=new Map();
const jerseyMaterials=[0,1].map(team=>({shirt:new THREE.MeshStandardMaterial({color:team?0xf47f68:0x249f95,roughness:.85}),trim:new THREE.MeshStandardMaterial({color:team?0x4d2932:0xffedbc,roughness:.85})}));
function jerseyTexture(team,id){
  const key=team+':'+id;if(jerseyTextures.has(key))return jerseyTextures.get(key);
  const c=document.createElement('canvas');c.width=256;c.height=320;const ctx=c.getContext('2d');
  ctx.fillStyle=team?'#f47f68':'#249f95';ctx.fillRect(0,0,256,320);
  ctx.fillStyle=team?'#4d2932':'#123e49';ctx.fillRect(0,270,256,16);
  ctx.fillStyle='#fff6df';ctx.textAlign='center';ctx.font='bold 29px sans-serif';ctx.fillText(team?'SOUTH':'NORTH',128,77);
  ctx.font='900 145px Arial';ctx.fillText(String(id+1).padStart(2,'0'),128,223);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;jerseyTextures.set(key,texture);return texture;
}
function addJersey(g,team,id){
  const {shirt,trim}=jerseyMaterials[team];
  const torso=new THREE.Mesh(new THREE.BoxGeometry(.84,.91,.59),shirt);torso.position.y=1.16;torso.castShadow=true;g.add(torso);
  const key=team+":"+id;if(!jerseyPrints.has(key))jerseyPrints.set(key,new THREE.MeshStandardMaterial({map:jerseyTexture(team,id),roughness:.85}));const print=jerseyPrints.get(key);
  for(const side of [-1,1]){const panel=new THREE.Mesh(new THREE.PlaneGeometry(.8,.88),print);panel.position.set(0,1.16,side*.301);if(side<0)panel.rotation.y=Math.PI;g.add(panel)}
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.205,.044,6,24),trim);collar.rotation.x=Math.PI/2;collar.position.y=1.63;g.add(collar);
  for(const x of [-.425,.425]){const edge=new THREE.Mesh(new THREE.TorusGeometry(.18,.035,6,20),trim);edge.rotation.y=Math.PI/2;edge.scale.y=1.22;edge.position.set(x,1.41,0);g.add(edge)}
  const shorts=new THREE.Mesh(new THREE.BoxGeometry(.78,.27,.57),dark);shorts.position.y=.65;shorts.castShadow=true;g.add(shorts);
  for(const x of [-.395,.395]){const stripe=new THREE.Mesh(new THREE.BoxGeometry(.025,.27,.45),trim);stripe.position.set(x,.65,0);g.add(stripe)}
}
function makePlayer(team,id){let g=new THREE.Group();let body=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.62,4,10),team?red:teal);body.position.y=1;body.castShadow=true;body.visible=false;g.add(body);addJersey(g,team,id);let head=sphere(.26,skin);head.position.y=1.85;g.add(head);let hair=sphere(.265,dark);hair.scale.y=.5;hair.position.set(0,2,0);g.add(hair);let limbs=[];for(let x of [-.23,.23]){let leg=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.38,3,8),dark);leg.position.set(x,.36,0);leg.castShadow=true;g.add(leg);limbs.push(leg);}for(let x of [-.48,.48]){let arm=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.5,3,8),skin);arm.position.set(x,1.13,0);g.add(arm);limbs.push(arm)}let marker=new THREE.Mesh(new THREE.RingGeometry(.65,.74,40),new THREE.MeshBasicMaterial({color:0xb8ffdb,side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.position.y=.055;g.add(marker);g.position.set(spawnX(id),0,team?-9:9);g.rotation.y=team?0:Math.PI;marker.visible=team===0&&id===humanId();scene.add(g);return{g,team,id,alive:true,lifeId:0,blockTime:0,jumpY:0,jumpV:0,jumpCd:0,superMeter:0,superArmed:false,outTime:0,protection:0,ball:null,cool:1+Math.random(),dodge:0,dash:0,catchCd:0,catchTime:0,wind:0,throwPlan:null,navPoint:null,target:null,limbs,marker,dir:new THREE.Vector3(0,0,-1),x:spawnX(id),z:team?-9:9,move:new THREE.Vector3(),seed:Math.random()*6}}
function reset(){clearCrowd();clearFire();for(let p of players){scene.remove(p.g);p.g.traverse(o=>o.geometry?.dispose())}for(let b of balls){scene.remove(b.mesh,b.trail,b.flame);b.flame.geometry.dispose();b.mesh.geometry.dispose();b.trail.geometry.dispose();b.trail.material.dispose()}for(let p of particles){scene.remove(p.m);p.m.geometry.dispose();p.m.material.dispose()}particles=[];players=[];balls=[];for(let t=0;t<2;t++)for(let i=0;i<teamSize;i++)players.push(makePlayer(t,i));controlled=players[humanId()];const ballCount=bajillionMode?teamSize*6:teamSize+2;for(let i=0;i<ballCount;i++){let mesh=sphere(.28,gold);mesh.position.copy(initialBallPosition(i,ballCount));scene.add(mesh);let trail=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0xffdc6c,transparent:true,opacity:.7}));scene.add(trail);let flame=new THREE.Mesh(new THREE.ConeGeometry(.38,1,6),fireMaterial);flame.visible=false;scene.add(flame);balls.push({mesh,trail,flame,flaming:false,homingTarget:null,homingTime:0,reflections:0,superShot:false,superOwner:null,shot:0,fireLast:new THREE.Vector3(),pos:initialBallPosition(i,ballCount),vel:new THREE.Vector3(),live:false,thrower:null,holder:null,lock:0})}remaining=120;sudden=false;charge=0;charging=false;round++;sync();$('timer').textContent=infinityMode?'∞':'2:00';$('charge').style.width='0%';$('ballStatus').textContent='WALK OVER A BALL TO PICK UP';$('jumpStatus').textContent='READY';$('dodgeStatus').textContent='READY';$('catchStatus').textContent='READY';$('returnNotice').hidden=true;}
function sync(){$('modeLabel').textContent=`${teamSize}v${teamSize}${bajillionMode?' / '+balls.length+' BALLS':''}`;$('homeAlive').textContent=players.filter(p=>p.team===0).map(p=>p.alive?'●':p.outTime>0?`${Math.ceil(p.outTime)}s`:'○').join(' ');$('awayAlive').textContent=players.filter(p=>p.team===1).map(p=>p.alive?'●':p.outTime>0?`${Math.ceil(p.outTime)}s`:'○').join(' ');$('series').textContent=score.join(' — ');$('playerName').textContent=`0${controlled.id+1} / YOU`;$('superFill').style.width=controlled.superMeter+'%';$('superLabel').textContent=controlled.superArmed?'SUPER ARMED · CLICK TO THROW':controlled.superMeter>=100?'SUPER READY · Q TO ARM':'SUPER · '+controlled.superMeter+'%';}
function burst(pos,color){for(let i=0;i<12;i++){let m=sphere(.06,mat(color));m.position.copy(pos);scene.add(m);particles.push({m,v:new THREE.Vector3((Math.random()-.5)*8,Math.random()*5,(Math.random()-.5)*8),life:.5})}}
function eliminate(p,credit=null) {
  if (!p || !p.alive) return;
  if(credit&&credit!==p&&credit.team!==p.team)credit.superMeter=Math.min(100,credit.superMeter+20);
  p.superArmed=false;p.netCharging=false;p.netCharge=0;p.netKeys={};
  reactCrowd(p.team);
  const hitPosition = new THREE.Vector3(p.x,1,p.z);
  p.alive=false;p.outTime=5;p.protection=0;
  if(p.ball){const b=p.ball;b.holder=null;b.pos.set(p.x,.3,p.z);b.vel.set(0,0,0);b.live=false;b.thrower=null;extinguish(b);b.lock=.25;p.ball=null}
  p.jumpY=0;p.jumpV=0;p.jumpCd=0;p.blockTime=0;p.catchTime=0;p.catchCd=0;p.dash=0;p.dodge=0;p.wind=0;p.throwPlan=null;p.navPoint=null;p.target=null;p.move.set(0,0,0);
  p.x=p.team?14:-14;p.z=(p.team?-8:8)+(p.id-(teamSize-1)/2)*2.3;
  p.g.position.set(p.x,0,p.z);p.g.rotation.y=p.team?-Math.PI/2:Math.PI/2;p.g.scale.setScalar(.85);
  p.marker.position.y=.055;p.marker.visible=true;p.marker.material.color.set(0xffd35d);p.marker.scale.setScalar(1);
  p.limbs.forEach(limb=>limb.rotation.x=0);
  burst(hitPosition,p.team?0xff9981:0x89ffcf);beep(120,.15,'sawtooth');
  if(p===controlled){charging=false;charge=0;holdTime=0;keys={};message('SIDELINED · YOU RETURN IN 5 SECONDS',3)}
  sync();
}
function returnPlayer(p) {
  p.alive=true;p.netCharging=false;p.netCharge=0;p.netKeys={};p.lifeId++;p.blockTime=0;p.jumpY=0;p.jumpV=0;p.jumpCd=0;p.outTime=0;p.protection=1.5;p.cool=1;p.dodge=0;p.catchCd=0;
  p.x=spawnX(p.id);p.z=p.team?-12:12;p.g.scale.setScalar(1);p.marker.position.y=.055;p.g.position.set(p.x,0,p.z);
  if(p===controlled){keys={};charging=false;charge=0;message('BACK IN · PROTECTED FOR 1.5 SECONDS',2);beep(700,.16)}
  sync();
}

const throwHistory=[];
function throwBall(p,power,target){if(!p.alive||!p.ball)return;let b=p.ball;if(p.superArmed&&p.superMeter>=100){p.superMeter=0;p.superArmed=false;b.superShot=true;b.superOwner=p;b.flaming=true;power=1}throwHistory.push({team:p.team,id:p.id,human:p===controlled,type:b.superShot?"super":b.flaming?"overcharge":"normal",wind:p.wind});if(throwHistory.length>80)throwHistory.shift();p.throwPlan=null;p.ball=null;b.holder=null;b.homingTarget=null;b.homingTime=0;b.reflections=0;b.thrower=p;b.live=true;b.shot=nextShotId++;b.fireLast.set(p.x,1.1+p.jumpY,p.z);b.lock=.2;b.pos.set(p.x,1.1+p.jumpY,p.z);let dir=new THREE.Vector3(target.x-p.x,0,target.z-p.z).normalize();if(dir.lengthSq()<.1)dir.set(0,0,p.team?1:-1);b.vel.copy(dir).multiplyScalar(17+power*14);b.vel.y=1.05+power*.4;p.cool=.8+Math.random()*.6;p.wind=0;beep(280+power*350,.13,'triangle');}
function finish(winner){if(infinityMode)return;phase='over';clearFire();for(const p of players){p.outTime=0;p.superArmed=false;p.catchTime=0;p.blockTime=0;p.jumpY=0;p.jumpV=0;p.jumpCd=0;p.g.position.y=0;}$('returnNotice').hidden=true;charging=false;charge=0;keys={};if(winner!==null)score[winner]++;sync();$('overlay').style.display='flex';document.querySelector('.eyebrow').textContent=`ROUND ${round} COMPLETE · NORTH ${score[0]} — ${score[1]} SOUTH`;document.querySelector('h1').innerHTML=winner===null?'ROUND<br><em>DRAW.</em>':winner===0?'COURT<br><em>CONQUERED.</em>':'NEXT<br><em>ROUND.</em>';document.querySelector('.intro p').innerHTML=winner===null?'Both teams are out. No point awarded.':winner===0?'North takes the win. Your court, your rules.':'South takes this one. Shake it off and go again.';document.querySelector('.tips').style.display='none';$('start').innerHTML='REMATCH <span>↗</span>';beep(winner===0?700:170,.4);}
function checkWin(){if(infinityMode)return;let a=players.filter(p=>p.alive&&!p.team).length,b=players.filter(p=>p.alive&&p.team).length;if(!a||!b){finish(!a&&!b?null:a?0:1);return}if(remaining<=0&&!sudden){if(a!==b)finish(a>b?0:1);else{sudden=true;message('SUDDEN DEATH · NEXT ELIMINATION WINS',5)}}}
function jump(p){if(!p.alive||p.jumpY>0||p.jumpCd>0)return;p.jumpV=7.4;p.jumpY=.001;p.jumpCd=1.05;beep(370,.09,'triangle',.035)}
function dodge(p){if(!p.alive||p.dodge>0)return;p.dodge=2.2;p.dash=.24;if(p.move.lengthSq()>.01)p.dir.copy(p.move).normalize();else p.dir.set(p.team?1:-1,0,0);beep(160,.12,'triangle')}
function catchBall(p){if(p.alive&&p.catchCd<=0){p.catchTime=p.ball?0:.24;p.blockTime=p.ball ? .24 : 0;p.catchCd=1.25;beep(p.ball?650:520,.06)}}
function reflectShot(b,p){
  const target=b.thrower;removeShotFire(b.shot);
  b.shot=nextShotId++;b.thrower=p;if(b.superShot)b.superOwner=p;
  b.reflections=(b.reflections||0)+1;b.homingTarget=target?.alive?target:null;b.homingLife=target?.lifeId;b.homingTime=2;
  const direction=target?.alive?new THREE.Vector3(target.x-p.x,target.jumpY-p.jumpY,target.z-p.z).normalize():b.vel.clone().negate().normalize();
  const speed=clamp(b.vel.length(),17,31);b.vel.copy(direction).multiplyScalar(speed);
  b.pos.set(p.x,p.jumpY+1.1,p.z).addScaledVector(direction,.9);b.fireLast.copy(b.pos);b.live=true;b.holder=null;b.lock=.15;
  p.blockTime=0;b.mesh.position.copy(b.pos);b.trail.visible=true;
  message(`${p.team?'SOUTH':'NORTH'} BLOCK · RETURN TO SENDER`,2);beep(800,.14,'triangle');burst(b.pos,0xb3eeff);
}
function steerHoming(b,dt){
  if(!b.live||!b.homingTarget)return;const target=b.homingTarget;b.homingTime-=dt;
  if(!target.alive||target.lifeId!==b.homingLife||b.homingTime<=0){b.homingTarget=null;return}
  const speed=clamp(b.vel.length(),17,31),direction=b.vel.clone().normalize(),wanted=new THREE.Vector3(target.x,target.jumpY+1,target.z).sub(b.pos).normalize(),angle=direction.angleTo(wanted);
  direction.lerp(wanted,Math.min(1,dt*5/Math.max(angle,.001))).normalize();b.vel.copy(direction).multiplyScalar(speed);
}
function update(dt){if(phase!=='playing')return;checkWin();if(phase!=='playing')return;if(!infinityMode)remaining-=dt;fireClock+=dt;for(let p of players){if(!p.alive){p.outTime=Math.max(0,p.outTime-dt);p.marker.scale.setScalar(.6+p.outTime/5);if(p.outTime<=0)returnPlayer(p);else continue;}p.jumpCd=Math.max(0,p.jumpCd-dt);if(p.jumpY>0||p.jumpV>0){p.jumpY+=p.jumpV*dt;p.jumpV-=19*dt;if(p.jumpY<=0){p.jumpY=0;p.jumpV=0;p.jumpCd=Math.max(p.jumpCd,.25)}}p.protection=Math.max(0,p.protection-dt);p.cool-=dt;p.dodge=Math.max(0,p.dodge-dt);p.catchCd=Math.max(0,p.catchCd-dt);p.catchTime=Math.max(0,p.catchTime-dt);p.blockTime=Math.max(0,p.blockTime-dt);p.dash=Math.max(0,p.dash-dt);p.move.set(0,0,0);
if(p.networkHuman){
 const k=p.netKeys||{},direction=p.team?-1:1;
 p.move.set(((k.KeyD?1:0)-(k.KeyA?1:0))*direction,0,((k.KeyS?1:0)-(k.KeyW?1:0))*direction);if(p.move.lengthSq())p.move.normalize();
 if(p.netCharging&&p.ball){p.netCharge=Math.min(3,(p.netCharge||0)+dt);if(p.netCharge>=3)p.ball.flaming=true}
}else if(p===controlled){p.move.set((keys.KeyD?1:0)-(keys.KeyA?1:0),0,(keys.KeyS?1:0)-(keys.KeyW?1:0));if(p.move.lengthSq()>0)p.move.normalize();if(charging&&p.ball){holdTime=Math.min(3,holdTime+dt);charge=Math.min(1,holdTime/1.1);if(holdTime>=3&&!p.ball.flaming){p.ball.flaming=true;message('OVERCHARGED · RELEASE TO LEAVE FIRE',2);beep(950,.2,'triangle')}}}else{
let threats=balls.filter(b=>b.live&&b.thrower?.team!==p.team&&b.pos.distanceTo(new THREE.Vector3(p.x,1,p.z))<4);if(threats.length&&Math.random()<dt*3){if(Math.random()<.4)catchBall(p);else{p.move.x=Math.random()<.5?-1:1;dodge(p)}}
if(p.ball){if(!p.target?.alive)p.target=players.filter(q=>q.alive&&q.team!==p.team).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];p.move.set(Math.sin(performance.now()*.0007+p.seed)*.7,0,((p.team?-5:5)-p.z)*.3);if(p.cool<=0&&p.target){
  if(!p.throwPlan)p.throwPlan=p.superMeter>=100?'super':Math.random()<.4?'overcharge':'normal';
  p.wind+=dt;
  if(p.throwPlan==='overcharge'&&p.wind>=3&&!p.ball.flaming){p.ball.flaming=true;beep(720,.12,'triangle',.035)}
  if(p.wind>=(p.throwPlan==='overcharge'?3.12:.52)){
    if(p.superMeter>=100&&!p.superArmed)armSuper(p);
    let t=p.target;throwBall(p,p.throwPlan==='overcharge'?1:.25+Math.random()*.6,{x:t.x+t.move.x*.7+(Math.random()-.5)*3,z:t.z+t.move.z*.7+(Math.random()-.5)*2})}}}else{let candidates=balls.filter(b=>!b.holder&&!b.live&&b.lock<=0&&(p.team?b.pos.z<.8:b.pos.z>-.8));candidates.sort((a,b)=>Math.hypot(a.pos.x-p.x,a.pos.z-p.z)-Math.hypot(b.pos.x-p.x,b.pos.z-p.z));let b=candidates[0];if(b){p.move.set(b.pos.x-p.x,0,b.pos.z-p.z);if(p.move.length()>.15)p.move.normalize();}else p.move.set((spawnX(p.id)-p.x)*.2,0,((p.team?-6:6)-p.z)*.2)}}
if(p!==controlled&&!p.networkHuman)steerObstacles(p);
let speed=p===controlled||p.networkHuman?7.5:4.7;if(p.ball&&p.wind>0)speed*=.45;if(p.networkHuman?p.netCharging:p===controlled&&charging)speed*=.68;if(p.dash>0){p.x+=p.dir.x*20*dt;p.z+=p.dir.z*20*dt}else{p.x+=p.move.x*speed*dt;p.z+=p.move.z*speed*dt}p.x=clamp(p.x,-11.3,11.3);p.z=clamp(p.z,p.team?-15.3:.48,p.team?-.48:15.3);
resolveObstacles(p);p.g.position.set(p.x,p.jumpY+(p.dash>0?.18:0),p.z);p.marker.position.y=.055-p.jumpY-(p.dash>0?.18:0);let tx=p.networkHuman?p.netAim.x:p===controlled?aim.x:p.target?.x??p.x,tz=p.networkHuman?p.netAim.z:p===controlled?aim.z:p.team?10:-10;p.g.rotation.y=Math.atan2(tx-p.x,tz-p.z);p.marker.visible=p===controlled||p.catchTime>0||p.blockTime>0||p.wind>.1||p.protection>0;p.marker.material.color.set(p.protection>0?0x6de8ff:p.blockTime>0?0x8ccfff:p.catchTime>0?0xffffff:p.throwPlan==='overcharge'&&p.wind>1.1?0xff793d:p.wind>.1?0xffca56:0xb8ffdb);p.marker.scale.setScalar(p.protection>0?1.2+Math.sin(performance.now()*.012)*.15:p.wind>0?1+Math.min(1,p.wind/3):1);p.g.scale.set(1,p.dash>0?.65:1,1);let stride=Math.sin(performance.now()*.014)*Math.min(1,p.move.length())*.45;p.limbs[0].rotation.x=stride;p.limbs[1].rotation.x=-stride;p.limbs[2].rotation.x=p.catchTime>0||p.blockTime>0?-1.5:0;p.limbs[3].rotation.x=p.blockTime>0?-1.5:p.ball?-(.7+(p.networkHuman?Math.min(1,(p.netCharge||0)/1.1):p===controlled?charge:Math.min(1,p.wind/1.1))*1.3):0;
}
for (const b of balls) {
  b.lock = Math.max(0, b.lock - dt);
  if (b.holder) {
    const p = b.holder;
    b.pos.set(p.x + Math.sin(p.g.rotation.y) * .65, 1.3 + p.jumpY + (p.networkHuman?Math.min(1,(p.netCharge||0)/1.1):p === controlled ? charge : Math.min(1,p.wind/1.1)) * .5, p.z + Math.cos(p.g.rotation.y) * .65);
  } else {
    steerHoming(b,dt);
    const prev = b.pos.clone();
    const next = prev.clone().addScaledVector(b.vel, dt);
    const obstacleHit=obstacleContact(prev,next);if(obstacleHit)next.lerpVectors(prev,next,obstacleHit.t).addScaledVector(obstacleHit.normal,.005);
    // Resolve contact only along the live flight, before the first floor/wall bounce.
    let flightEnd = 1;
    if (next.y < .28 && prev.y > .28) flightEnd = Math.min(flightEnd, (.28 - prev.y) / (next.y - prev.y));
    for (const axis of ['x', 'z']) {
      const bound = axis === 'x' ? 11.65 : 15.65;
      if (Math.abs(next[axis]) > bound) flightEnd = Math.min(flightEnd, (Math.sign(next[axis]) * bound - prev[axis]) / (next[axis] - prev[axis]));
    }
    b.pos.copy(next);
    b.vel.y -= 5 * dt;
    let contact = null;
    if (b.live && b.thrower) {
      const segment = next.clone().sub(prev).multiplyScalar(clamp(flightEnd, 0, 1));
      for (const p of players) {
        if (!p.alive || p.team === b.thrower.team || p.dash > 0 || p.protection > 0) continue;
        const center = new THREE.Vector3(p.x, 1+p.jumpY, p.z);
        const t = clamp(center.clone().sub(prev).dot(segment) / (segment.lengthSq() || 1), 0, 1);
        const canCatch = p.catchTime > 0 && !p.ball;
        const canBlock=p.blockTime>0&&!!p.ball&&(b.reflections||0)<8;
        // Extended hands catch a live ball before it reaches the body.
        if (prev.clone().addScaledVector(segment, t).distanceTo(center) < (canCatch||canBlock ? 1.15 : .74) && (!contact || t < contact.t)) contact = {p, t, canCatch,canBlock};
      }
    }
    if (contact) {
      const {p, canCatch,canBlock} = contact;
      if(canBlock){reflectShot(b,p);continue;}
      const originalThrower = b.thrower;
      if(canCatch)removeShotFire(b.shot);
      extinguish(b);
      b.live = false;
      b.thrower = null;
      if (canCatch) {
        b.superShot=false;b.superOwner=null;eliminate(originalThrower,p);
        b.holder = p;
        p.ball = b;
        p.cool = .65;
        p.catchTime = 0;
        b.vel.set(0, 0, 0);
        b.pos.set(p.x, 1.3+p.jumpY, p.z);
        b.mesh.position.copy(b.pos);
        b.trail.visible = false;
        message(`${p.team ? 'SOUTH' : 'NORTH'} CATCH · ${originalThrower.team ? 'SOUTH' : 'NORTH'} 0${originalThrower.id + 1} OUT`, 3);
        beep(900, .17);
        burst(new THREE.Vector3(p.x, 1+p.jumpY, p.z), 0xffe8a3);
      } else {
        eliminate(p,originalThrower);
        if (p.team === 1) message('SOUTH PLAYER OUT', 1.3);
      }
      if (sudden&&!infinityMode) { finish(canCatch ? p.team : 1 - p.team); return; }
      checkWin();
      if (phase !== 'playing') return;
    }
    if (!contact && b.live && b.flaming) emitFire(b,prev.clone().lerp(next,clamp(flightEnd,0,1)));
    if(!contact&&obstacleHit&&flightEnd>=.999){
      explodeSuper(b);if(phase!=='playing')return;
      b.vel.reflect(obstacleHit.normal).multiplyScalar(.55);if(obstacleHit.normal.y>.5&&Math.hypot(b.vel.x,b.vel.z)<1.5)b.vel.x=1.5;
      b.live=false;b.thrower=null;extinguish(b);beep(100,.06,'triangle',.025);
    }
    if (!b.holder) {
      if (b.pos.y < .28) {
        explodeSuper(b);if(phase!=='playing')return;
        b.pos.y = .28;
        if (b.live) beep(90, .05, 'sine', .025);
        b.live = false;
        extinguish(b);
        b.thrower = null;
        b.vel.y = Math.abs(b.vel.y) > .8 ? Math.abs(b.vel.y) * .35 : 0;
        b.vel.x *= Math.exp(-2 * dt);
        b.vel.z *= Math.exp(-2 * dt);
      }
      for (const axis of ['x', 'z']) {
        const bound = axis === 'x' ? 11.65 : 15.65;
        if (Math.abs(b.pos[axis]) > bound) {
          explodeSuper(b);if(phase!=='playing')return;
          b.pos[axis] = Math.sign(b.pos[axis]) * bound;
          b.vel[axis] *= -.6;
          b.live = false;
          extinguish(b);
          b.thrower = null;
        }
      }
      if (!b.live && !b.superShot && b.lock <= 0 && b.pos.y < .7) {
        for (const p of players) {
          if (!p.alive || p.ball || p.jumpY>.35 || Math.hypot(p.x - b.pos.x, p.z - b.pos.z) >= 1.05) continue;
          b.holder = p;
          b.superShot=false;b.superOwner=null;
          b.thrower = null;
          p.ball = b;
          b.vel.set(0, 0, 0);
          p.cool = .5 + Math.random() * .8;
          if (p === controlled) { beep(550, .06); message('BALL PICKED UP · NO ELIMINATION', 1.4); }
          break;
        }
      }
    }
  }
  const blue=b.superShot||b.holder?.superArmed;b.flame.material=blue?blueFireMaterial:fireMaterial;
  b.flame.visible=b.flaming;b.flame.position.copy(b.pos);b.flame.position.y+=.5;b.flame.scale.setScalar((blue?1.6:1)*(1+Math.sin(fireClock*18)*.12));b.mesh.material=b.flaming?(blue?blueFireMaterial:fireMaterial):gold;b.trail.material.color.set(blue?0x79f4ff:0xffdc6c);
  b.mesh.position.copy(b.pos);
  b.mesh.rotation.x += dt * b.vel.length();
  b.trail.visible = b.live;
  b.trail.geometry.setFromPoints([b.pos, b.pos.clone().addScaledVector(b.vel, -.065)]);
}
updateExplosions(dt);updateFire(dt);if(phase!=='playing')return;
for(let i=particles.length-1;i>=0;i--){let p=particles[i];p.life-=dt;p.m.position.addScaledVector(p.v,dt);p.v.y-=12*dt;p.m.scale.setScalar(Math.max(.01,p.life*2));if(p.life<=0){scene.remove(p.m);p.m.geometry.dispose();p.m.material.dispose();particles.splice(i,1)}}checkWin();msgTime-=dt;if(msgTime<=0)$('message').textContent='';$('timer').textContent=infinityMode?'∞':sudden?'NEXT OUT':`${Math.floor(Math.max(0,remaining)/60)}:${String(Math.floor(Math.max(0,remaining)%60)).padStart(2,'0')}`;sync();$('returnNotice').hidden=controlled.alive||phase!=='playing';$('returnNotice').textContent=`SIDELINED · BACK IN ${controlled.outTime.toFixed(1)}s`;$('ballStatus').textContent=!controlled.alive?'SIDELINED · SAME PLAYER RETURNS':controlled.protection>0?'RETURN SHIELD · '+controlled.protection.toFixed(1)+'s':controlled.ball?charging?'CHARGING SHOT':'BALL IN HAND · AIM & THROW':'WALK OVER A BALL TO PICK UP';$('charge').style.width=(charge*100)+'%';$('overcharge').style.width=(Math.max(0,(holdTime-1.1)/1.9)*100)+'%';$('overchargeLabel').textContent=controlled.ball?.flaming?'FIRE READY · RELEASE':holdTime>1.1?'OVERCHARGING · '+holdTime.toFixed(1)+' / 3s':'OVERCHARGE · HOLD 3s';$('jumpStatus').textContent=controlled.jumpY>.6?'AIRBORNE':controlled.jumpCd>0?controlled.jumpCd.toFixed(1)+'s':'READY';$('dodgeStatus').textContent=controlled.dodge>0?controlled.dodge.toFixed(1)+'s':'READY';$('defenseLabel').textContent=controlled.ball?'BLOCK':'CATCH';$('catchStatus').textContent=controlled.blockTime>0?'BLOCK!':controlled.catchTime>0?'CATCH!':controlled.catchCd>0?controlled.catchCd.toFixed(1)+'s':'READY';}
const aimRing=new THREE.Mesh(new THREE.RingGeometry(.35,.43,32),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85,side:THREE.DoubleSide}));aimRing.rotation.x=-Math.PI/2;scene.add(aimRing);const aimLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineDashedMaterial({color:0xffffff,transparent:true,opacity:.35,dashSize:.35,gapSize:.25}));scene.add(aimLine);
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}window.addEventListener('resize',resize);resize();
function pause(){if(networkReplica){window.dispatchEvent(new Event('online-pause'));return}if(phase==='playing'){phase='paused';for(const p of players){p.blockTime=0;p.catchTime=0}stopCrowdAudio();message('PAUSED · PRESS ESC OR RESUME',100);$('pause').innerHTML='▶ RESUME';$('pauseScreen').hidden=false;charging=false;charge=0;holdTime=0;controlled.superArmed=false;if(controlled.ball)extinguish(controlled.ball);keys={}}else if(phase==='paused'){phase='playing';$('pauseScreen').hidden=true;$('game').focus();message('BACK IN PLAY',1);$('pause').innerHTML='Ⅱ <span>PAUSE</span>'}}
$('start').onclick=()=>{reset();keys={};phase='playing';$('game').focus();$('overlay').style.display='none';beep(650,.12);message('GAME ON · COLLECT A BALL',3)};$('pause').onclick=pause;$('resume').onclick=pause;$('sound').onclick=()=>{muted=!muted;if(muted)stopCrowdAudio();$('sound').textContent=muted?'SOUND OFF':'SOUND ON'};
window.addEventListener('keydown',e=>{if(networkReplica)return;if(e.code!=='Escape'&&e.target.closest?.('button,select,input'))return;if(['Space','ShiftLeft','ShiftRight','KeyW','KeyA','KeyS','KeyD'].includes(e.code))e.preventDefault();if(e.code==='Escape'&&!e.repeat)pause();keys[e.code]=true;if(phase==='playing'&&!e.repeat){if(e.code==='Space')jump(controlled);if(e.code==='ShiftLeft'||e.code==='ShiftRight')dodge(controlled);if(e.code==='KeyE')catchBall(controlled);if(e.code==='KeyQ')armSuper(controlled)}});window.addEventListener('keyup',e=>{if(!networkReplica)keys[e.code]=false});window.addEventListener('blur',()=>{if(networkReplica)return;keys={};if(phase==='playing')pause()});window.addEventListener('mousemove',e=>{mouse.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1)});$('game').addEventListener('mousedown',e=>{if(networkReplica)return;if(e.button===0&&phase==='playing'&&controlled.ball){charging=true;charge=controlled.superArmed?1:0;holdTime=controlled.superArmed?3:0}});window.addEventListener('mouseup',e=>{if(networkReplica)return;if(e.button===0&&charging){if(phase==='playing')throwBall(controlled,charge,aim);charging=false;charge=0;holdTime=0}});window.addEventListener('contextmenu',e=>e.preventDefault());
reset();camera.position.set(13,21,30);let accumulator=0;
function frame(){requestAnimationFrame(frame);let dt=Math.min(clock.getDelta(),.05);accumulator+=dt;while(accumulator>=1/120){if(!networkReplica)update(1/120);accumulator-=1/120}let active=phase==='playing'||phase==='paused';let dest=active?new THREE.Vector3(controlled.alive?controlled.x*.35:0,18,controlled.alive?controlled.z+(controlled.team?-19:19):(controlled.team?-28:28)):new THREE.Vector3(13,21,30);camera.position.lerp(dest,1-Math.exp(-dt*3));camera.lookAt(active&&controlled.alive?controlled.x*.2:0,0,active&&controlled.alive?controlled.z+(controlled.team?8:-8):0);ray.setFromCamera(mouse,camera);ray.ray.intersectPlane(plane,aim);aim.x=clamp(aim.x,-12,12);aim.z=clamp(aim.z,-16,16);aimRing.position.set(aim.x,.06,aim.z);aimRing.visible=active&&controlled.alive;aimLine.visible=active&&!!controlled.ball;if(aimLine.visible){aimLine.geometry.setFromPoints([new THREE.Vector3(controlled.x,.08,controlled.z),new THREE.Vector3(aim.x,.08,aim.z)]);aimLine.computeLineDistances()}if(networkReplica){
  for(const p of players){if(p.renderTarget)p.g.position.lerp(p.renderTarget,1-Math.exp(-dt*22))}
  if(phase==='playing'){fireClock+=dt;updateExplosions(dt)}
}
animateCrowd(dt);drawFire();renderer.render(scene,camera)}frame();
// Read-only match snapshot for diagnostics.
window.courtside={getState:()=>({stage,teamSize,bajillionMode,infinityMode,throws:throwHistory.slice(),holdTime,explosions:{radius:SUPER_RADIUS,count:explosions.length,total:explosionCount},fire:{count:hazards.length,maxLife:Math.max(0,...hazards.map(h=>h.life))},crowd:{time:crowdReactionTime,eliminatedTeam:crowdLastTeam,reactions:crowdReactionCount,audioReactions:crowdAudioCount,audioNodes:crowdSources.length,north:crowdLastTeam===null?null:crowdLastTeam===0?"boo":"cheer",south:crowdLastTeam===null?null:crowdLastTeam===1?"boo":"cheer"},muted,phase,remaining,sudden,score:[...score],controlled:controlled.id,players:players.map(p=>({team:p.team,id:p.id,alive:p.alive,blockTime:p.blockTime,catchTime:p.catchTime,jumpY:p.jumpY,jumpCd:p.jumpCd,superMeter:p.superMeter,superArmed:p.superArmed,throwPlan:p.throwPlan,wind:p.wind,outTime:p.outTime,protection:p.protection,x:p.x,z:p.z,ball:!!p.ball,dodge:p.dodge,catchCd:p.catchCd})),balls:balls.map(b=>({live:b.live,homing:b.homingTarget?{team:b.homingTarget.team,id:b.homingTarget.id}:null,reflections:b.reflections,flaming:b.flaming,superShot:b.superShot,thrower:b.thrower?{team:b.thrower.team,id:b.thrower.id}:null,held:!!b.holder,x:b.pos.x,y:b.pos.y,z:b.pos.z}))})};

// The authoritative server and browser replica share one rules implementation.
const netFields=['alive','lifeId','x','z','jumpY','jumpV','jumpCd','outTime','protection','superMeter','superArmed','catchTime','blockTime','catchCd','dodge','dash','wind','netCharge','netCharging'];
export const onlineEngine={
 start(stageName='gym',fresh=false){
  networkReplica=false;teamSize=1;infinityMode=false;bajillionMode=false;if(fresh){score=[0,0];round=0}switchStage(stageName);reset();phase='playing';muted=!!globalThis.__COURTSIDE_SERVER__;
  for(const p of players){p.networkHuman=true;p.netKeys={};p.netAim={x:0,z:p.team?9:-9};p.netCharge=0;p.netCharging=false}
  controlled=players[0];$('overlay').style.display='none';return this.snapshot();
 },
 pause(value){if(value){if(phase==='playing')phase='paused';for(const p of players){p.netKeys={};p.netCharging=false;p.netCharge=0;p.catchTime=0;p.blockTime=0;p.superArmed=false;if(p.ball)extinguish(p.ball)}}else if(phase==='paused')phase='playing'},
 input(team,data){const p=players[team];if(!p||phase!=='playing')return;p.netKeys=data.keys;p.netAim=data.aim},
 action(team,action){const p=players[team];if(!p||!p.alive||phase!=='playing')return;
  if(action==='jump')jump(p);if(action==='dodge')dodge(p);if(action==='defend')catchBall(p);if(action==='super')armSuper(p);
  if(action==='down'&&p.ball){p.netCharging=true;p.netCharge=p.superArmed?3:0}
  if(action==='up'&&p.netCharging){if(p.ball)throwBall(p,Math.min(1,p.netCharge/1.1),p.netAim);p.netCharging=false;p.netCharge=0}
 },
 step(dt){update(dt)},
 snapshot(){return {round,stage,phase,remaining,sudden,score:[...score],message:$('message').textContent,fireClock,crowd:{count:crowdReactionCount,team:crowdLastTeam},
  players:players.map(p=>({...Object.fromEntries(netFields.map(k=>[k,p[k]??0])),team:p.team,id:p.id,ball:balls.indexOf(p.ball),rotation:p.g.rotation.y,scale:p.g.scale.toArray(),limbs:p.limbs.map(l=>l.rotation.x)})),
  balls:balls.map(b=>({pos:b.pos.toArray(),vel:b.vel.toArray(),live:b.live,flaming:b.flaming,superShot:b.superShot,holder:players.indexOf(b.holder),owner:players.indexOf(b.thrower),homing:players.indexOf(b.homingTarget)})),
  hazards:hazards.map(h=>({x:h.x,z:h.z,life:h.life,team:h.team,super:h.super})),explosions:explosions.map(f=>({id:f.id,x:f.mesh.position.x,z:f.mesh.position.z,life:f.life}))}},
 beginReplica(team,s){if(!networkReplica)networkSettings={stage,teamSize,infinityMode,bajillionMode};teamSize=1;infinityMode=false;bajillionMode=false;switchStage(s.stage);reset();networkReplica=true;networkRound=-1;controlled=players[team];$('overlay').style.display='none';$('pauseScreen').hidden=true;this.apply(s,team)},
 apply(s,team){
  if(networkRound!==s.round){teamSize=1;reset();controlled=players[team];networkRound=s.round}
  networkReplica=true;phase=s.phase;remaining=s.remaining;sudden=s.sudden;score=[...s.score];fireClock=s.fireClock;
  for(let i=0;i<players.length;i++){let p=players[i],v=s.players[i];if(p.alive&&!v.alive)burst(new THREE.Vector3(p.x,1,p.z),p.team?0xff9981:0x89ffcf);for(const k of netFields)p[k]=v[k];p.ball=v.ball<0?null:balls[v.ball];p.g.visible=true;p.g.rotation.y=v.rotation;p.g.scale.fromArray(v.scale);p.renderTarget=new THREE.Vector3(v.x,v.jumpY+(v.dash>0?.18:0),v.z);if(p.g.position.distanceTo(p.renderTarget)>5)p.g.position.copy(p.renderTarget);p.limbs.forEach((l,j)=>l.rotation.x=v.limbs[j]);p.marker.visible=p===controlled||!p.alive||p.protection>0||p.catchTime>0||p.blockTime>0;p.marker.position.y=.055-v.jumpY;p.marker.material.color.set(!p.alive?0xffd35d:p.blockTime>0?0x8ccfff:p.protection>0?0x6de8ff:0xb8ffdb)}
  for(let i=0;i<balls.length;i++){const b=balls[i],v=s.balls[i];b.pos.fromArray(v.pos);b.vel.fromArray(v.vel);b.live=v.live;b.flaming=v.flaming;b.superShot=v.superShot;b.holder=v.holder<0?null:players[v.holder];b.thrower=v.owner<0?null:players[v.owner];b.homingTarget=v.homing<0?null:players[v.homing];b.mesh.position.copy(b.pos);const blue=b.superShot||b.holder?.superArmed;b.mesh.material=b.flaming?(blue?blueFireMaterial:fireMaterial):gold;b.flame.material=blue?blueFireMaterial:fireMaterial;b.flame.visible=b.flaming;b.flame.position.copy(b.pos).add(new THREE.Vector3(0,.5,0));b.trail.visible=b.live;b.trail.material.color.set(blue?0x79f4ff:0xffdc6c);b.trail.geometry.setFromPoints([b.pos,b.pos.clone().addScaledVector(b.vel,-.065)])}
  hazards=s.hazards.map(h=>({...h}));
  for(const f of s.explosions){let fx=explosions.find(e=>e.id===f.id);if(!fx){explodeSuper({superShot:true,superOwner:null,pos:new THREE.Vector3(f.x,.28,f.z)},true);fx=explosions.at(-1);fx.id=f.id}fx.life=f.life}
  for(let i=explosions.length-1;i>=0;i--)if(!s.explosions.some(f=>f.id===explosions[i].id)){disposeExplosion(explosions[i]);explosions.splice(i,1)}
  if(s.crowd.count>crowdReactionCount&&s.crowd.team!==null)reactCrowd(s.crowd.team);crowdReactionCount=s.crowd.count;
  if($('message').textContent!==s.message)$('message').textContent=s.message;
  sync();$('timer').textContent=sudden?'NEXT OUT':Math.floor(Math.max(0,remaining)/60)+':'+String(Math.floor(Math.max(0,remaining)%60)).padStart(2,'0');
  $('returnNotice').hidden=controlled.alive||phase!=='playing';$('returnNotice').textContent='BACK IN '+controlled.outTime.toFixed(1)+'s';
  $('ballStatus').textContent=controlled.ball?'BALL IN HAND · HOLD TO CHARGE':'FIND A BALL';$('defenseLabel').textContent=controlled.ball?'BLOCK':'CATCH';
  $('charge').style.width=Math.min(100,controlled.netCharge/1.1*100)+'%';$('overcharge').style.width=Math.max(0,(controlled.netCharge-1.1)/1.9*100)+'%';$('overchargeLabel').textContent=controlled.ball?.flaming?'FIRE READY':'OVERCHARGE · HOLD 3s';
  $('jumpStatus').textContent=controlled.jumpCd>0?controlled.jumpCd.toFixed(1)+'s':'READY';$('dodgeStatus').textContent=controlled.dodge>0?controlled.dodge.toFixed(1)+'s':'READY';$('catchStatus').textContent=controlled.catchCd>0?controlled.catchCd.toFixed(1)+'s':'READY';
  document.querySelector('.playercard small').textContent='ONLINE / '+(team?'SOUTH':'NORTH');
 },
 aim(){return {x:aim.x,z:aim.z}},
 leave(){networkReplica=false;for(const p of players)p.networkHuman=false;phase='intro';if(networkSettings){const saved=networkSettings;teamSize=saved.teamSize;infinityMode=saved.infinityMode;bajillionMode=saved.bajillionMode;switchStage(saved.stage)}reset();$('overlay').style.display='flex';$('pauseScreen').hidden=true;document.querySelector('h1').innerHTML='OWN THE<br><em>COURT.</em>';document.querySelector('.eyebrow').textContent='PICK YOUR MOMENT. TAKE YOUR SHOT.';document.querySelector('.intro p').innerHTML='Grab a ball, line up a shot, and keep moving.';document.querySelector('.tips').style.display='flex';$('start').innerHTML='LET’S PLAY <span>↗</span>';document.querySelector('.playercard small').textContent='ON COURT / NORTH';document.querySelectorAll('.size-select').forEach(e=>e.value=String(teamSize));document.querySelectorAll('.infinity-toggle').forEach(e=>e.checked=infinityMode);document.querySelectorAll('.bajillion-toggle').forEach(e=>e.checked=bajillionMode)}
};
