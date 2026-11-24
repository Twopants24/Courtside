import './node_modules/peerjs/dist/peerjs.min.js';
const roomCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(4)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n&31]).join('');
// An optional same-origin endpoint can supply short-lived TURN credentials.
async function iceConfig() {
  const iceServers = [{urls:'stun:stun.l.google.com:19302'}];
  try {
    const response = await fetch(new URL('./turn-config.json', import.meta.url), {
      cache:'no-store', signal:AbortSignal.timeout(2500),
    });
    if (response.ok) {
      const config = await response.json();
      if (Array.isArray(config.iceServers)) iceServers.push(...config.iceServers);
    }
  } catch {
    // Direct connections remain available when the relay is unconfigured or unreachable.
  }
  return {iceServers};
}
// PeerJS Cloud introduces peers. Match state and inputs use WebRTC data channels.
export class DuelPeer {
 constructor(command){
  this.readyState=0;this.host=command.type==='create';this.customCode=this.host&&!!command.code;this.code=this.host?(command.code||roomCode()):command.code;
  this.stage=command.stage||'gym';this.capacity=command.capacity===2?2:4;this.mode='waiting';this.ready=Array(this.capacity).fill(false);this.seats=Array.from({length:this.capacity},()=>({conn:null,token:null,expiry:null}));this.closed=false;this.codeAttempts=0;
  iceConfig().then(config=>{if(!this.closed){this.config=config;this.openPeer()}});
 }
 openPeer(){
  this.peer=new window.Peer(this.host?'courtside-v36-'+this.code:undefined,{debug:0,config:this.config});
  this.peer.on('open',()=>{this.readyState=1;this.onopen?.()});
  this.peer.on('connection',c=>this.accept(c));
  this.peer.on('disconnected',()=>{if(!this.closed)setTimeout(()=>{if(!this.closed&&this.peer.disconnected)this.peer.reconnect()},1000)});
  this.peer.on('error',e=>{if(this.closed)return;if(this.host&&e.type==='unavailable-id'&&this.customCode){this.emit({type:'error',message:'That room code is already in use. Choose another code or leave it blank for a random one.'});this.close();return}if(this.host&&e.type==='unavailable-id'&&this.codeAttempts++<5){this.peer.removeAllListeners();this.peer.destroy();this.code=roomCode();this.openPeer();return}if(this.conn?.open||this.seats.some(s=>s.conn?.open))return;this.emit({type:'error',message:e.type==='peer-unavailable'?'Host not found. Ask your friend to keep their room open and check the code.':'Could not connect the players. Try again on the same Wi-Fi; some networks block direct connections.'});this.close()});
 }
 emit(m){if(!this.closed)this.onmessage?.({data:JSON.stringify(m)})}
 remote(m,c){if(c===undefined){if(this.host){for(const s of this.seats)this.remote(m,s.conn);return}c=this.conn}if(c?.open&&(!c.dataChannel||c.dataChannel.bufferedAmount<1000000))c.send(m)}
 connected(){return this.seats.every((s,i)=>i===0||s.conn?.open)}
 room(){const m={type:'room',code:this.code,stage:this.stage,capacity:this.capacity,mode:this.mode,seats:this.seats.map((s,i)=>({team:Math.floor(i/(this.capacity/2)),number:i%(this.capacity/2)+1,connected:i===0||!!s.conn?.open,ready:this.ready[i]}))};this.emit(m);this.remote(m)}
 pause(){if(this.mode==='playing'){this.mode='paused';this.worker?.postMessage({type:'pause',value:true})}this.ready.fill(false);this.room()}
 end(message){if(this.ending||this.closed)return;this.ending=true;this.remote({type:'ended',message});this.emit({type:'ended',message});this.close()}
 accept(c){
  if(!this.host){c.on('open',()=>c.close());return}
  let player=-1,count=0,stamp=Date.now();
  const handshake=setTimeout(()=>{if(player<0)c.close()},15000);
  c.on('data',m=>{
   if(!m||typeof m!=='object')return;if(Date.now()-stamp>1000){stamp=Date.now();count=0}if(++count>100||JSON.stringify(m).length>8192){c.close();return}
   if(player<0){
    if(m.type!=='hello')return;
    let slot=typeof m.token==='string'?this.seats.findIndex((s,i)=>i>0&&s.token===m.token):-1;
    if(slot<0&&!this.state)slot=(this.capacity===4?[2,1,3]:[1]).find(i=>!this.seats[i].token)??-1;
    if(slot<0||this.seats[slot].conn?.open){this.remote({type:'error',message:'This room is full or reserved for reconnecting players.'},c);setTimeout(()=>c.close(),200);return}
    player=slot;const seat=this.seats[player];clearTimeout(handshake);clearTimeout(seat.expiry);seat.conn=c;seat.token ||= crypto.randomUUID();
    this.remote({type:'joined',code:this.code,player,team:Math.floor(player/(this.capacity/2)),token:seat.token},c);this.room();if(this.state)this.remote({type:'state',state:this.state},c);return;
   }
   this.command(player,m);
  });
  c.on('close',()=>{clearTimeout(handshake);if(player<0||this.seats[player].conn!==c||this.closed)return;const seat=this.seats[player];seat.conn=null;this.pause();seat.expiry=setTimeout(()=>this.end('A player did not reconnect. Create a new room.'),60000)});
  c.on('error',()=>c.close());
 }
 send(raw){if(this.closed)return;let m;try{m=JSON.parse(raw)}catch{return}
  if(m.type==='create'&&this.host){
   this.worker=new Worker(new URL('./peer-simulation.js?v=36',import.meta.url),{type:'module'});
   this.worker.onerror=()=>{this.remote({type:'ended',message:'The host simulation stopped.'});this.emit({type:'ended',message:'The match could not start. Refresh and create a new room.'});this.close()};
   this.worker.onmessage=e=>{const m=e.data;if(m.type!=='state')return;this.state=m.state;if(m.state.phase==='playing')this.starting=false;if(m.state.phase==='over'&&this.mode==='playing'&&!this.starting){this.mode='over';this.ready.fill(false);this.room()}this.emit(m);this.remote(m)};
   this.emit({type:'joined',code:this.code,player:0,team:0,token:crypto.randomUUID()});this.room();return;
  }
  if(m.type==='join'&&!this.host){
   this.conn=this.peer.connect('courtside-v36-'+this.code,{reliable:true,serialization:'json'});
   const timeout=setTimeout(()=>{if(!this.joined){this.emit({type:'error',message:'Direct connection timed out. Keep both games open and try the same Wi-Fi. Some networks require a relay.'});this.close()}},20000);this.joinTimer=timeout;
   this.conn.on('open',()=>this.remote({type:'hello',token:m.token}));
   this.conn.on('data',m=>{if(!m||typeof m!=='object')return;if(m.type==='joined'){this.joined=true;clearTimeout(timeout)}this.emit(m)});
   this.conn.on('close',()=>{clearTimeout(timeout);if(!this.closed){this.readyState=3;this.onclose?.()}});
   this.conn.on('error',()=>this.conn.close());return;
  }
  if(this.host)this.command(0,m);else this.remote(m);
 }
 command(team,m){
  if(m.type==='leave'){this.end('A player left the room. Create a new room.');return}
  if(m.type==='pause'){this.pause();return}
  if(m.type==='ready'){if(this.mode==='playing')return;this.ready[team]=m.ready===true;if(this.connected()&&this.ready.every(Boolean)){const resume=this.mode==='paused';this.mode='playing';this.ready.fill(false);this.starting=!resume;this.worker.postMessage(resume?{type:'pause',value:false}:{type:'start',stage:this.stage,fresh:!this.state,size:this.capacity/2})}this.room();return}
  if(this.mode!=='playing')return;
  if(m.type==='input'){
   if(!Number.isFinite(m.aim?.x)||!Number.isFinite(m.aim?.z))return;
   const keys={};for(const k of ['KeyW','KeyA','KeyS','KeyD'])keys[k]=m.keys?.[k]===true;
   const bound=(n,max)=>Math.max(-max,Math.min(max,n));
   this.worker.postMessage({type:'input',team,data:{keys,aim:{x:bound(m.aim.x,this.stage==='range'?14:12),z:bound(m.aim.z,this.stage==='range'?18.4:16)},move:Number.isFinite(m.move?.x)&&Number.isFinite(m.move?.y)?{x:bound(m.move.x,1),y:bound(m.move.y,1)}:null}});
  }
  if(m.type==='action'&&['jump','dodge','defend','super','down','up','cancel'].includes(m.action))this.worker.postMessage({type:'action',team,action:m.action});
 }
 close(){if(this.closed)return;this.closed=true;this.readyState=3;for(const s of this.seats)clearTimeout(s.expiry);clearTimeout(this.joinTimer);this.worker?.terminate();const peer=this.peer;if(peer)setTimeout(()=>peer.destroy(),150);this.onclose?.()}
}
