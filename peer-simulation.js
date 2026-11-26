const elements=new Map();
function element(id=''){if(elements.has(id))return elements.get(id);const e={style:{},dataset:{},textContent:'',innerHTML:'',hidden:false,value:'',checked:false,addEventListener(){},setAttribute(){},focus(){},closest(){return null},getContext(){return {fillRect(){},fillText(){},clearRect(){}}}};elements.set(id,e);return e}
globalThis.document={getElementById:element,querySelector:element,querySelectorAll:()=>[],createElement:()=>element('canvas'+Math.random())};
globalThis.window={addEventListener(){},dispatchEvent(){}};globalThis.devicePixelRatio=1;globalThis.innerWidth=1280;globalThis.innerHeight=800;globalThis.requestAnimationFrame=()=>{};globalThis.__COURTSIDE_SERVER__=true;
const pending=[];
self.onmessage=({data})=>pending.push(data);
let source=await (await fetch(new URL('./game.js?v=46',import.meta.url))).text();source=source.replace("'./node_modules/three/build/three.module.js'",JSON.stringify(new URL('./peer-headless.js',import.meta.url).href));
const {onlineEngine:engine}=await import(URL.createObjectURL(new Blob([source],{type:'text/javascript'})));
let active=false,tick=0,last=performance.now(),acc=0;
function handle(m){
 if(m.type==='start'){engine.start(m.stage,m.fresh,m.size,m.humans,m.rules);active=true;last=performance.now();acc=0}
 if(m.type==='human')engine.setHuman(m.team,m.value);
 if(m.type==='pause')engine.pause(m.value);
 if(m.type==='input')engine.input(m.team,m.data);
 if(m.type==='action')engine.action(m.team,m.action);
}
self.onmessage=({data})=>handle(data);
for(const message of pending)handle(message);
setInterval(()=>{if(!active)return;const now=performance.now();acc+=Math.min((now-last)/1000,.1);last=now;let steps=0;while(acc>=1/120&&steps++<12){engine.step(1/120);acc-=1/120}if(++tick%3===0)self.postMessage({type:'state',state:engine.snapshot()})},1000/60);
self.postMessage({type:'loaded'});
