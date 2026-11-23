import './node_modules/peerjs/dist/peerjs.min.js';
const roomCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(4)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n&31]).join('');
// PeerJS Cloud only introduces peers. Match state and inputs use WebRTC data channels.
export class DuelPeer {
 constructor(command){
  this.readyState=0;this.host=command.type==='create';this.code=this.host?roomCode():command.code;
  this.stage=command.stage||'gym';this.mode='waiting';this.ready=[false,false];this.guestToken=null;this.closed=false;this.codeAttempts=0;this.openPeer();
 }
 openPeer(){
  this.peer=new window.Peer(this.host?'courtside-'+this.code:undefined,{debug:0,config:{iceServers:[{urls:'stun:stun.l.google.com:19302'}]}});
  this.peer.on('open',()=>{this.readyState=1;this.onopen?.()});
  this.peer.on('connection',c=>this.accept(c));
  this.peer.on('disconnected',()=>{if(!this.closed)setTimeout(()=>{if(!this.closed&&this.peer.disconnected)this.peer.reconnect()},1000)});
  this.peer.on('error',e=>{if(this.closed)return;if(this.host&&e.type==='unavailable-id'&&this.codeAttempts++<5){this.peer.removeAllListeners();this.peer.destroy();this.code=roomCode();this.openPeer();return}if(this.conn?.open)return;this.emit({type:'error',message:e.type==='peer-unavailable'?'Host not found. Ask your friend to keep their room open and check the code.':'Could not connect the players. Try again on the same Wi-Fi; some networks block direct connections.'});this.close()});
 }
 emit(m){if(!this.closed)this.onmessage?.({data:JSON.stringify(m)})}
 remote(m,c=this.conn){if(c?.open&&(!c.dataChannel||c.dataChannel.bufferedAmount<1000000))c.send(m)}
 room(){const m={type:'room',code:this.code,stage:this.stage,mode:this.mode,seats:[{connected:true,ready:this.ready[0]},{connected:!!this.conn?.open,ready:this.ready[1]}]};this.emit(m);this.remote(m)}
 pause(){if(this.mode==='playing'){this.mode='paused';this.worker?.postMessage({type:'pause',value:true})}this.ready=[false,false];this.room()}
 accept(c){
  if(!this.host||this.conn?.open){c.on('open',()=>{this.remote({type:'error',message:'This room already has two players.'},c);setTimeout(()=>c.close(),200)});return}
  let accepted=false,count=0,stamp=Date.now();
  const handshake=setTimeout(()=>{if(!accepted)c.close()},15000);
  c.on('data',m=>{
   if(!m||typeof m!=='object')return;if(Date.now()-stamp>1000){stamp=Date.now();count=0}if(++count>100||JSON.stringify(m).length>8192){c.close();return}
   if(!accepted){
    if(m.type!=='hello')return;
    if(this.conn?.open||(this.guestToken&&m.token!==this.guestToken)){this.remote({type:'error',message:'This room is full or reserved for the reconnecting player.'},c);setTimeout(()=>c.close(),200);return}
    accepted=true;clearTimeout(handshake);clearTimeout(this.expiry);this.conn=c;this.guestToken ||= crypto.randomUUID();
    this.remote({type:'joined',code:this.code,team:1,token:this.guestToken});this.room();if(this.state)this.remote({type:'state',state:this.state});return;
   }
   this.command(1,m);
  });
  c.on('close',()=>{clearTimeout(handshake);if(this.conn!==c||this.closed)return;this.conn=null;this.pause();this.expiry=setTimeout(()=>{this.emit({type:'ended',message:'Your friend did not reconnect. Create a new room.'});this.close()},60000)});
  c.on('error',()=>c.close());
 }
 send(raw){if(this.closed)return;let m;try{m=JSON.parse(raw)}catch{return}
  if(m.type==='create'&&this.host){
   this.worker=new Worker(new URL('./peer-simulation.js?v=26',import.meta.url),{type:'module'});
   this.worker.onerror=()=>{this.remote({type:'ended',message:'The host simulation stopped.'});this.emit({type:'ended',message:'The match could not start. Refresh and create a new room.'});this.close()};
   this.worker.onmessage=e=>{const m=e.data;if(m.type!=='state')return;this.state=m.state;if(m.state.phase==='playing')this.starting=false;if(m.state.phase==='over'&&this.mode==='playing'&&!this.starting){this.mode='over';this.ready=[false,false];this.room()}this.emit(m);this.remote(m)};
   this.emit({type:'joined',code:this.code,team:0,token:crypto.randomUUID()});this.room();return;
  }
  if(m.type==='join'&&!this.host){
   this.conn=this.peer.connect('courtside-'+this.code,{reliable:true,serialization:'json'});
   const timeout=setTimeout(()=>{if(!this.joined){this.emit({type:'error',message:'Direct connection timed out. Keep both games open and try the same Wi-Fi. Some networks require a relay.'});this.close()}},20000);this.joinTimer=timeout;
   this.conn.on('open',()=>this.remote({type:'hello',token:m.token}));
   this.conn.on('data',m=>{if(!m||typeof m!=='object')return;if(m.type==='joined'){this.joined=true;clearTimeout(timeout)}this.emit(m)});
   this.conn.on('close',()=>{clearTimeout(timeout);if(!this.closed){this.readyState=3;this.onclose?.()}});
   this.conn.on('error',()=>this.conn.close());return;
  }
  if(this.host)this.command(0,m);else this.remote(m);
 }
 command(team,m){
  if(m.type==='leave'){this.remote({type:'ended',message:'A player left the room.'});if(team===1)this.emit({type:'ended',message:'Your friend left. Create a new room.'});return}
  if(m.type==='pause'){this.pause();return}
  if(m.type==='ready'){if(this.mode==='playing')return;this.ready[team]=m.ready===true;if(this.conn?.open&&this.ready.every(Boolean)){const resume=this.mode==='paused';this.mode='playing';this.ready=[false,false];this.starting=!resume;this.worker.postMessage(resume?{type:'pause',value:false}:{type:'start',stage:this.stage,fresh:!this.state})}this.room();return}
  if(this.mode!=='playing')return;
  if(m.type==='input'){
   if(!Number.isFinite(m.aim?.x)||!Number.isFinite(m.aim?.z))return;
   const keys={};for(const k of ['KeyW','KeyA','KeyS','KeyD'])keys[k]=m.keys?.[k]===true;
   const bound=(n,max)=>Math.max(-max,Math.min(max,n));
   this.worker.postMessage({type:'input',team,data:{keys,aim:{x:bound(m.aim.x,12),z:bound(m.aim.z,16)},move:Number.isFinite(m.move?.x)&&Number.isFinite(m.move?.y)?{x:bound(m.move.x,1),y:bound(m.move.y,1)}:null}});
  }
  if(m.type==='action'&&['jump','dodge','defend','super','down','up','cancel'].includes(m.action))this.worker.postMessage({type:'action',team,action:m.action});
 }
 close(){if(this.closed)return;this.closed=true;this.readyState=3;clearTimeout(this.expiry);clearTimeout(this.joinTimer);this.worker?.terminate();const peer=this.peer;setTimeout(()=>peer.destroy(),150);this.onclose?.()}
}
