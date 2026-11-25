import {onlineEngine as engine,touchControls} from './game.js?v=41';
import {DuelPeer} from './peer-transport.js?v=41';
const $=id=>document.getElementById(id);
const panel=document.createElement('div');panel.id='onlinePanel';panel.hidden=true;panel.innerHTML=`<div class="online-card" role="dialog" aria-modal="true" aria-label="Private multiplayer room"><div class="eyebrow">FRIENDS · ONE COURT</div><h2>PRIVATE MATCH.</h2><p id="onlineStatus" role="status">Create a room, then invite your friends.</p><div id="onlineSetup"><label class="stage-picker">PLAYERS<select id="onlineCapacity"><option value="4">4 players · 2v2</option><option value="2">2 players · 1v1</option><option value="6">6 players · 3v3</option></select></label><label class="stage-picker">YOUR ROOM CODE (OPTIONAL)<input id="customRoomCode" placeholder="BLANK = RANDOM" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false"><small>Choose 4 letters or numbers.</small></label><button id="createRoom">CREATE ROOM ↗</button><div class="online-join"><input id="roomCode" autocapitalize="characters" spellcheck="false" aria-label="Invite code" placeholder="4-CHARACTER CODE" maxlength="4" autocomplete="off"><button id="joinRoom">JOIN</button></div><small>1v1, 2v2 or 3v3 · hosted by your browser · keep this tab open<br>Keyboard + mouse or mobile touch controls.</small></div><div id="onlineLobby" hidden><div class="room-code" id="inviteCode"></div><button id="copyInvite">COPY INVITE LINK</button><p id="seatStatus"></p><p id="rosterCount" hidden></p><button id="goRoom" hidden>GO WITH CPU PLAYERS ↗</button><button id="readyRoom">READY TO PLAY ↗</button></div><button id="leaveRoom" class="online-secondary">BACK TO SINGLE PLAYER</button></div>`;document.body.append(panel);
const launch=document.createElement('button');launch.id='onlineLaunch';launch.className='online-secondary';launch.textContent='PLAY ONLINE · PEER TO PEER';$('start').after(launch);
const badge=document.createElement('button');badge.id='onlineBadge';badge.hidden=true;document.body.append(badge);
let ws=null,seat=null,room=null,replica=false,keys={},manual=false,reconnectUntil=0,retry=null;
let connecting=false;
function setConnecting(active){
 connecting=active;
 $('joinRoom').disabled=active;$('createRoom').disabled=active;
 $('joinRoom').textContent=active?'WAIT…':'JOIN';
}
const seatKey='courtside-peer-seat-v37';
function saveSeat(value){
 try{if(value)sessionStorage.setItem(seatKey,JSON.stringify(value));else sessionStorage.removeItem(seatKey)}catch{}
}
const send=m=>{if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify(m))};
const notice=text=>$('onlineStatus').textContent=text;
function show(){$('overlay').inert=true;panel.hidden=false;$('onlineSetup').hidden=!!seat;$('onlineLobby').hidden=!seat}
function leave(message){setConnecting(false);$('overlay').inert=false;manual=true;clearTimeout(retry);send({type:'leave'});ws?.close();ws=null;if(seat)saveSeat(null);seat=null;room=null;keys={};if(replica)engine.leave();replica=false;badge.hidden=true;panel.hidden= !message;$('onlineSetup').hidden=false;$('onlineLobby').hidden=true;if(message)notice(message)}
function renderRoom(){if(!room||!seat)return;$('readyRoom').disabled=false;badge.hidden=false;badge.textContent=`ONLINE · ${seat.code} · ${seat.team?'SOUTH':'NORTH'} · MENU`;const playing=room.mode==='playing';
const humans=room.seats.filter(s=>s.connected).length,missing=room.capacity-humans;
const canGo=seat.player===0&&room.capacity>2&&missing>0&&['waiting','over'].includes(room.mode);
$('goRoom').hidden=!canGo;$('goRoom').disabled=false;
$('rosterCount').hidden=room.capacity<=2;
$('rosterCount').textContent=missing?`${humans} human${humans===1?'':'s'} + ${missing} CPU${room.mode==='waiting'?' if the host starts now':''}`:`${humans} humans`;
panel.hidden=playing;$('onlineSetup').hidden=true;$('onlineLobby').hidden=false;$('inviteCode').textContent=seat.code;$('seatStatus').textContent=room.seats.map((s,i)=>`${s.team?'SOUTH':'NORTH'} ${s.number}${i===seat.player?' (YOU)':''}: ${s.cpu?(s.reserved?'CPU · seat held for rejoin':'CPU'):!s.connected?'open seat':s.ready?'ready':'not ready'}`).join(' · ');notice(room.mode==='over'?'ROUND OVER · Ready up for a rematch.':room.mode==='paused'?'MATCH PAUSED · All players ready up to resume.':playing?'GAME ON':room.capacity>2&&missing?'Share the invite or start with CPU players.':humans<room.capacity?'Waiting for your friend to join. Share the invite link or room code.':'Everyone is in. Each player needs to press Ready.');$('readyRoom').textContent=room.seats[seat.player].ready?'CANCEL READY':room.mode==='over'?'READY FOR REMATCH ↗':room.mode==='paused'?'READY TO RESUME ↗':'READY TO PLAY ↗';if(playing){keys={};$('game').focus()}}
function connect(command){
 if(ws){ws.onclose=null;ws.close()}
 manual=false;room=null;setConnecting(true);$('readyRoom').disabled=true;
 notice(command.type==='create'?'Opening your room…':'Finding the host room…');
 if(!window.RTCPeerConnection||!window.isSecureContext){
  leave('This browser cannot open a game connection. Open the HTTPS game link in Safari, Chrome, or Firefox.');
  return;
 }
 const socket=ws=new DuelPeer(command);
 let signalingTimedOut=false;
 const connectTimeout=setTimeout(()=>{
  if(socket.readyState===WebSocket.CONNECTING){
   signalingTimedOut=true;
   notice('The matchmaking service did not respond. Check your internet connection and try again.');
   socket.close();
  }
 },12000);
 socket.onopen=()=>{
  clearTimeout(connectTimeout);
  if(command.type==='join')notice('Connecting to the host… Keep both game tabs open.');
  send(command);
 };
 socket.onmessage=e=>{
  let m;try{m=JSON.parse(e.data)}catch{return}
  if(m.type==='joined'){
   seat={code:m.code,team:m.team,player:m.player,token:m.token};
   saveSeat(seat);reconnectUntil=0;setConnecting(false);show();
  }
  if(m.type==='status')notice(m.message);
  if(m.type==='room'){room=m;renderRoom()}
  if(m.type==='state'&&seat){
   if(!replica){engine.beginReplica(seat.player,m.state);replica=true}else engine.apply(m.state,seat.player);
  }
  if(m.type==='error'){
   if(seat){leave(m.message)}else{notice(m.message);manual=true;setConnecting(false);socket.close();saveSeat(null)}
  }
  if(m.type==='ended')leave(m.message);
 };
 socket.onclose=()=>{
  clearTimeout(connectTimeout);
  if(socket!==ws||manual)return;
  setConnecting(false);keys={};show();
  if(seat){
   if(seat.player===0){leave('The host connection ended. Create a new room.');return}
   if(!reconnectUntil)reconnectUntil=Date.now()+60000;
   if(Date.now()<reconnectUntil){
    notice('Connection lost. Trying to reclaim your seat…');
    retry=setTimeout(()=>connect({type:'join',...seat}),1500);
   }else leave('Unable to reconnect. Create or join a new room.');
  }else if(!signalingTimedOut)notice('Connection closed. Ask the host to keep the room open and try again.');
 };
}
launch.onclick=()=>{show();notice('Create a room, then invite your friends.')};$('createRoom').onclick=()=>{const code=$('customRoomCode').value.trim().toUpperCase();if(code&&!/^[A-Z0-9]{4}$/.test(code)){notice('Choose exactly four letters or numbers, or leave the code blank.');return}if(connecting)return;connect({type:'create',code,stage:['triangle','square'].includes(window.courtside.getState().stage)?'gym':window.courtside.getState().stage,capacity:Number($('onlineCapacity').value)})};$('joinRoom').onclick=()=>{const code=$('roomCode').value.trim().toUpperCase();if(!/^[A-Z0-9]{4}$/.test(code)){notice('Enter the four-character invite code.');return}if(connecting)return;connect({type:'join',code})};$('customRoomCode').onkeydown=e=>{if(e.key==='Enter')$('createRoom').click()};$('roomCode').onkeydown=e=>{if(e.key==='Enter')$('joinRoom').click()};$('goRoom').onclick=()=>{if(!room||seat?.player!==0)return;$('goRoom').disabled=true;send({type:'go'})};$('readyRoom').onclick=()=>{if(!room||!seat)return;$('readyRoom').disabled=true;send({type:'ready',ready:!room.seats[seat.player].ready})};$('leaveRoom').onclick=()=>leave();$('copyInvite').onclick=async()=>{const url=new URL(location.href);url.search='?v=41&room='+seat.code;try{await navigator.clipboard.writeText(url.href);notice('Invite link copied. Send it to your friend.')}catch{notice('Invite: '+url.href)}};badge.onclick=()=>{send({type:'pause'});show()};window.addEventListener('online-pause',()=>{send({type:'pause'});show()});
window.addEventListener('keydown',e=>{if(!seat||e.target.closest?.('input,button'))return;if(e.code==='Escape'&&!e.repeat){send({type:'pause'});return}if(room?.mode!=='playing')return;if(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();keys[e.code]=true;const action={Space:'jump',ShiftLeft:'dodge',ShiftRight:'dodge',KeyE:'defend',KeyQ:'super'}[e.code];if(action&&!e.repeat)send({type:'action',action})});window.addEventListener('keyup',e=>keys[e.code]=false);$('game').addEventListener('mousedown',e=>{if(seat&&e.button===0&&room?.mode==='playing'){send({type:'input',keys,move:touchControls.vector(keys),aim:engine.aim()});send({type:'action',action:'down'})}});window.addEventListener('mouseup',e=>{if(seat&&e.button===0){send({type:'input',keys,move:touchControls.vector(keys),aim:engine.aim()});send({type:'action',action:'up'})}});function onBackground(){
 keys={};
 if(!seat||room?.mode!=='playing')return;
 if(room.capacity>2&&seat.player!==0){
  touchControls.cancel();
  send({type:'input',keys,move:null,aim:engine.aim()});
 }else send({type:'pause'});
}
window.addEventListener('blur',onBackground);setInterval(()=>{if(seat&&room?.mode==='playing')send({type:'input',keys,move:touchControls.vector(keys),aim:engine.aim()})},1000/30);
const invite=new URLSearchParams(location.search).get('room');let saved;try{saved=JSON.parse(sessionStorage.getItem(seatKey))}catch{}if(saved?.player>0&&(!invite||invite.toUpperCase()===saved.code)){seat=saved;show();connect({type:'join',...seat})}else if(invite){$('roomCode').value=invite.toUpperCase();show();notice('Tap Join to enter the room. The host needs to keep their game open.')}

window.addEventListener('touch-action',e=>{if(!seat)return;send({type:'input',keys,move:touchControls.vector(keys),aim:engine.aim()});send({type:'action',action:e.detail})});

document.addEventListener('visibilitychange',()=>{if(document.hidden)onBackground()});
