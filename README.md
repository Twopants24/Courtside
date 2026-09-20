# COURTSIDE — Dodgeball

A playable 3D dodgeball game with single-player and private online 1v1. Matching North and South teams face each other on the selected stage. You control the highlighted North player; teammates and opponents use AI. Everyone wears a team jersey with stable front/back numbers (01–05), contrasting collar/arm trim, and matching shorts.

## Quick start

Install Node.js 24 with npm, then run:

```sh
git clone https://github.com/Twopants24/Courtside.git
cd Courtside
npm ci
npm start
```

Open [COURTSIDE locally](http://localhost:8124/?v=19) in a desktop browser. Keep the terminal running. Press Ctrl+C to stop the server. No build step, API keys, or accounts are needed for local play. The server listens on all network interfaces; localhost links only work on the computer running it.

## Stages

Use the **Choose your stage** picture cards on the start screen, pause screen (Escape), or round-end screen. Each card shows an actual rendered screenshot. Click a card, or focus it and use arrow keys/Home/End; Enter/Space also select. **The Gym** is the classic indoor court; **The Arena** adds tiered spectator stands, stadium lights, and a teal/purple court. Switching resets both teams, the timer, balls, cooldowns, and match score. The core rules and controls are shared across stages. Arena spectators wear their team colors: mint North fans and coral South fans. Every elimination makes the crowd hop; the eliminated player’s fans boo and their rivals cheer. Crowd audio respects Sound Off and stops on pause or stage change.

## Obstacle Course

Select **The Gauntlet** for The Gauntlet. Tall barriers and pillars block players and bounce shots; low gold hurdles block grounded movement but can be cleared with Space. Obstacle bounces make ordinary balls harmless and detonate super balls once. AI steers around blocked lanes. Spawns, return spots, and initial balls remain clear of cover at every team size.

## Team sizes

Choose **1v1**, **2v2**, **3v3**, or **5v5** before play, on pause, or between rounds. You control one North player; other North players are AI teammates. Each side has the selected count. Ball counts are 3, 4, 5, and 7 respectively. Changing size resets the match, meters, hazards, and returns, while preserving the stage and Infinity setting.

## Bajillion Balls

Toggle **Bajillion Balls** before play, in pause, or between rounds. It gives three balls per total player: **6 / 12 / 18 / 30** for 1v1 / 2v2 / 3v3 / 5v5. Balls start in spaced, symmetric rows. Turning it off restores **3 / 4 / 5 / 7** balls. Changing this setting resets the match while retaining stage, team size, and Infinity Mode. It stays selected across size/stage changes and recalculates the ball count.

## Infinity Mode

Toggle **Infinity Mode** before play or on the pause screen. The clock shows ∞ and rounds never end from eliminations or time: even if all players are out, their five-second returns continue. Super meters persist throughout continuous play. Pause freezes countdowns. Turning Infinity off starts a fresh two-minute clock and checks normal win conditions on resume; if both teams are already out, the round is a draw. Stage changes/new rounds still reset players and meters while keeping the selected mode.

## Play

Run `npm ci` once, then `npm start` in this folder and open http://localhost:8124/?v=19. Node.js 24 is recommended. This serves both the game and authoritative WebSocket match server. `PORT` overrides 8124. For single-player static serving only, `npm run single` uses Python 3 on port 8123. Requires a desktop browser with WebGL, a keyboard, and a mouse. Fonts use an optional Google Fonts connection and fall back to system fonts offline.

- **WASD:** Move. Walk over a safe ball to pick it up.
- **Mouse:** Aim at the court.
- **Left click:** Quick throw. Hold and release for a faster charged throw; charging slows movement.
- **Overcharge:** Keep holding for 3 seconds total. The orange meter fills after normal charge, then the ball ignites. Release to lay a fire trail: each section lasts 5 seconds of active play and sidelines opposing players who touch it. Jumping with your feet at least 0.6 units above the floor clears orange fire. Blue super fire hits at any jump height. Dodging never protects from either fire type; return shields still do. Catching the live flaming ball sidelines its thrower and extinguishes that shot’s trail. The bounced ball itself is harmless; previously laid fire persists until expiry. Pause freezes trail expiry; round end, reset, and stage switching clear fire.
- **Super (Q):** Each credited opposing out adds 20%, including throws, catches, fire trails, and explosions. At 100%, press Q with a ball to arm (Q again cancels), then click to fire an instantly overcharged super shot. Meter is spent only when firing. The first floor or wall bounce produces a 5-unit blue-fire blast with a cyan shockwave against opponents; dodge and return protection apply. A live catch cancels the bomb and its fire trail. AI earns and uses the same super. Meter survives sideline returns and resets on each new round or stage change; pausing disarms without spending.
- **Space:** Jump. No double jump; land before jumping again. You can aim, charge, and throw in the air.
- **Shift:** Short dodge dash, with a 2.2-second cooldown. Protects from direct balls and explosions, never from fire trails.
- **E:** A 0.24-second defense window with a shared 1.25-second cooldown. Empty-handed: catch and sideline the thrower. Holding a ball: block, keep your ball, and reflect the incoming live shot toward its thrower. The blocker gets credit. Orange fire/blue super payloads transfer to the blocker; the previous trail is extinguished. Homing lasts up to two seconds and ends when the target goes out or the ball hits the world. Super detonation still happens only on the first world bounce.
- **Escape:** Pause or resume.

A live direct hit sends a player to the sidelines for five seconds. Ground or wall bounces make a ball harmless. You keep the same player and return after five seconds of active play, with 1.5 seconds of protection shown by a cyan ring. AI players follow the same return rule. Both teams also mix quick throws with orange overcharges: AI holds at least 3 seconds, visibly ignites the ball, then releases after a brief ignition cue. Orange windup rings signal an overcharge. Earned blue supers remain separate. Sidelined players cannot move, throw, catch, or collect balls. Pausing freezes the countdown. Get all opponents out simultaneously to win; round ends and stage switches cancel pending returns. At two minutes, the team with more survivors wins; a tie enters sudden death, where the next elimination decides the round. Rematches keep the match score.

Gold rings under AI players signal a throw windup. White rings indicate an active catch. The mint ring identifies your player.

## Verification

Verified in Chromium: movement, keyboard dodge/catch, pause/resume, mouse hold/release, pickup, charged velocity, hit elimination, same-player sideline return, safe bounced balls, catch ownership and thrower elimination, dash protection and cooldown, timer decisions, sudden death, team wipe, and rematch reset. Gameplay uses a fixed 120 Hz physics step.


## Online private 1v1 (v19)

Choose a stage, click **Play Online**, then **Create Room**. Copy the invite link to your friend, or have them enter the six-character code. Both players click **Ready to Play**. North hosts; South joins, with the camera and WASD oriented toward the opposing half. Both are human controlled. Online uses normal 1v1 rules and three balls. Existing single-player sizes, Infinity Mode, and Bajillion Balls are restored when leaving online.

Escape or the online menu pauses both players. Both must ready up to resume. At round end, both ready for a rematch; series scores persist. Disconnects pause the match and reserve the seat for 60 seconds. Reconnecting or refreshing the same browser tab restores its seat with a private session token; both players then ready up. Explicitly leaving ends the room for both players. There are no accounts or public matchmaking.

The Node server runs the shared game rules in a worker per room at 120 Hz and sends snapshots at 20 Hz. Clients send only bounded movement, aim, and actions; the server resolves throws, catches, blocks, cooldowns, collisions, and wins. Rendering interpolates player positions. This initial version has no latency prediction or lag compensation, so a nearby host gives better timing. Eight simultaneous rooms are supported. Rooms are in memory and end if the server restarts.

## Hosting

GitHub stores this source code; pushing it does not deploy a running game. GitHub Pages cannot run the Node multiplayer server.

For temporary internet play, start the game with `npm start`, then run `cloudflared tunnel --url http://localhost:8124` after installing Cloudflare's `cloudflared` CLI. Share the HTTPS address printed by the tunnel, then use the game's invite links. This free Quick Tunnel needs no account, but its address changes on restart and it only works while the computer, game server, and tunnel remain running and connected. It is not durable hosting.

For persistent deployment, use a Node/container host that supports WebSockets and long-running workers. The supplied Dockerfile runs as a non-root user. Build with `docker build -t courtside .`, then `docker run --rm -p 8124:8124 courtside`. Terminate HTTPS at the host's proxy and forward `/ws` upgrades to the same process as HTTP. `/health` provides a health check. Use one instance; rooms are not shared across multiple server processes. The static server only exposes game assets, not server code or local files. No paid service or account has been configured.

Verification: two independent WebSocket clients passed create/join, both-ready start, independent movement, authoritative hit/win, pause, token-based reconnect, and rematch through both localhost and the public WSS endpoint. Browser contexts passed invite entry, guest controls, refresh/rejoin, and return to restored single-player settings. Additional local checks cover an authoritative catch, rejecting client-submitted scores, and a full room.
