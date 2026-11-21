'use strict';

const byId = id => document.getElementById(id);
const canvas = byId('field');
const ctx = canvas.getContext('2d', { alpha: false });
const station = byId('station');
const coarse = matchMedia('(pointer:coarse)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const labels = ['纜車月台', '冰谷貨梯', '站長決戰'];
const phases = ['震地', '滑軌衝撞', '過載'];
const locations = ['arena', 'lift', 'summit'];
const sprites = {};
const particles = [];
const measures = [];
const keys = new Set();
const pressed = { attack: false, dodge: false };
const layout = {};
const input = { x: 0, y: 0, attack: false, dodge: false };
const stick = byId('stick');
const recordKey = 'rea-frostline-record-v1';
let sim, mode = 'cover', pointer = null, stickX = 0, stickY = 0;
let attackBuffer = 0, dodgeBuffer = 0;
let audio, muted = true, record = 0, flash = 0, notice = 0, frameAt = 0, accumulator = 0;
let firstInputAt = 0, inputToPaint = null, entrance = 0;

if (new URLSearchParams(location.search).get('embed') === '1') document.documentElement.dataset.embed = '';
try { record = Number(localStorage.getItem(recordKey)) || 0; } catch {}
byId('record').textContent = record ? '最高紀錄 ' + record.toLocaleString('zh-TW') : '';
byId('health').replaceChildren(...Array.from({ length: 9 }, () => document.createElement('i')));

function resize() {
  const width = station.clientWidth;
  const height = station.clientHeight;
  if (!width || !height) return;
  const scale = Math.min(1.28, Math.max(.72, Math.min(width / 390, height / 610)));
  const ratio = Math.min(2, devicePixelRatio || 1);
  const top = Math.max(145, height * (sim?.wave > 1 ? .59 : .51));
  const bottom = height - (coarse.matches ? (height < 485 ? 82 : 111) : 42);
  Object.assign(layout, { width, height, ratio, scale, top, bottom, w: width / scale, h: Math.max(104, bottom - top) / scale });
  if (canvas.width !== Math.round(width * ratio)) canvas.width = Math.round(width * ratio);
  if (canvas.height !== Math.round(height * ratio)) canvas.height = Math.round(height * ratio);
  if (sim) Frostline.resize(sim, layout.w, layout.h);
  draw();
}
new ResizeObserver(resize).observe(station);

async function loadArt(names) {
  await Promise.all(names.map(async name => {
    const art = new Image();
    art.src = 'assets/frostline-' + name + '.webp';
    await art.decode();
    sprites[name] = art;
  }));
}

function tone(frequency, time, duration, volume, type = 'triangle', end = frequency) {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, time);
  oscillator.frequency.exponentialRampToValueAtTime(end, time + duration);
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(.001, time + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(time);
  oscillator.stop(time + duration);
}

function sound(type) {
  if (muted || audio?.state !== 'running') return;
  const at = audio.currentTime;
  if (type === 'wave' || type === 'phase' || type === 'heal' || type === 'won') {
    const chord = type === 'phase' ? [98, 117, 147] : [147, 220, 294, 392];
    chord.forEach((note, i) => tone(note, at + i * .062, .27, .095));
  } else {
    const hard = ['heavy', 'break', 'quake', 'hurt'].includes(type);
    tone(hard ? 124 : 240, at, hard ? .24 : .12, hard ? .16 : .085,
      type === 'dodge' ? 'sine' : 'triangle', hard ? 38 : 72);
    if (hard) tone(460, at + .015, .10, .07, 'square', 90);
  }
}

function clearInput() {
  keys.clear();
  pointer = null;
  stickX = stickY = 0;
  stick.firstElementChild.style.transform = '';
  pressed.attack = pressed.dodge = false;
  attackBuffer = dodgeBuffer = 0;
}

function updateStick(event) {
  const box = stick.getBoundingClientRect();
  const x = event.clientX - box.left - box.width / 2;
  const y = event.clientY - box.top - box.height / 2;
  const d = Math.max(box.width * .27, Math.hypot(x, y));
  stickX = x / d;
  stickY = y / d;
  stick.firstElementChild.style.transform = 'translate(' + stickX * 29 + 'px,' + stickY * 29 + 'px)';
  if (Math.abs(stickX) + Math.abs(stickY) >= .1 && !firstInputAt) firstInputAt = performance.now();
}

stick.addEventListener('pointerdown', event => {
  if (pointer !== null || mode !== 'playing') return;
  pointer = event.pointerId;
  stick.setPointerCapture(pointer);
  updateStick(event);
});
stick.addEventListener('pointermove', event => { if (event.pointerId === pointer) updateStick(event); });
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  stick.addEventListener(name, event => {
    if (event.pointerId !== pointer) return;
    pointer = null;
    stickX = stickY = 0;
    stick.firstElementChild.style.transform = '';
  });
}

for (const action of ['attack', 'dodge']) {
  const button = byId(action);
  button.addEventListener('pointerdown', event => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    pressed[action] = true;
    if (action === 'attack') attackBuffer = performance.now() + 115;
    else dodgeBuffer = performance.now() + 125;
    if (!firstInputAt) firstInputAt = performance.now();
  });
  for (const end of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(end, () => { pressed[action] = false; });
}

const gameKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'Space', 'KeyX', 'ShiftLeft', 'ShiftRight']);
window.addEventListener('keydown', event => {
  if (event.code === 'Escape') {
    if (mode === 'playing') pause();
    else if (mode === 'paused') resume();
    return;
  }
  if (mode !== 'playing' || !gameKeys.has(event.code)) return;
  event.preventDefault();
  keys.add(event.code);
  if (event.code === 'KeyZ' || event.code === 'Space') attackBuffer = performance.now() + 115;
  if (event.code === 'KeyX' || event.code.startsWith('Shift')) dodgeBuffer = performance.now() + 125;
  if (!firstInputAt) firstInputAt = performance.now();
});
window.addEventListener('keyup', event => keys.delete(event.code));
window.addEventListener('blur', clearInput);
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'playing') pause(); });

function announce(text) {
  byId('notice').textContent = text;
  notice = performance.now() + 1450;
}

function start() {
  clearInput();
  sim = Frostline.create(layout.w, layout.h);
  document.activeElement?.blur();
  resize();
  particles.length = 0;
  measures.length = 0;
  firstInputAt = 0;
  inputToPaint = null;
  entrance = 0;
  flash = 0;
  accumulator = 0;
  mode = 'playing';
  byId('menu').hidden = byId('cover').hidden = true;
  byId('hud').hidden = byId('controls').hidden = false;
  announce(labels[0]);
  sound('wave');
  syncHud();
}

function showMenu(title, details, paused) {
  clearInput();
  byId('controls').hidden = true;
  byId('menu-title').textContent = title;
  byId('result').textContent = details;
  byId('restart').hidden = paused;
  byId('resume').hidden = !paused;
  byId('menu').hidden = false;
  byId(paused ? 'resume' : 'restart').focus({ preventScroll: true });
}

function pause() {
  if (mode !== 'playing') return;
  mode = 'paused';
  showMenu('暫停', '', true);
}

function resume() {
  if (mode !== 'paused') return;
  document.activeElement?.blur();
  mode = 'playing';
  accumulator = 0;
  byId('menu').hidden = true;
  byId('controls').hidden = false;
}

function finish() {
  mode = sim.status;
  const best = sim.points > record;
  if (best) {
    record = sim.points;
    try { localStorage.setItem(recordKey, String(record)); } catch {}
    byId('record').textContent = '最高紀錄 ' + record.toLocaleString('zh-TW');
  }
  if (mode === 'won') sound('won');
  showMenu(mode === 'won' ? '纜車通行' : '突圍失敗',
    sim.points.toLocaleString('zh-TW') + '分・' + sim.bestChain + '連擊' + (best ? '・新紀錄' : ''), false);
}

byId('start-btn').addEventListener('click', start);
byId('restart').addEventListener('click', start);
byId('pause').addEventListener('click', pause);
byId('resume').addEventListener('click', resume);
byId('exit').addEventListener('click', () => {
  mode = 'cover';
  sim = null;
  byId('menu').hidden = byId('hud').hidden = true;
  byId('cover').hidden = false;
  byId('start-btn').focus({ preventScroll: true });
});
byId('audio').addEventListener('click', async () => {
  try {
    audio ??= new AudioContext();
    muted = !muted;
    if (!muted && audio.state === 'suspended') await audio.resume();
    byId('audio').setAttribute('aria-pressed', String(!muted));
    if (!muted) sound('heal');
  } catch { muted = true; }
});
byId('fullscreen').addEventListener('click', () => {
  const task = document.fullscreenElement ? document.exitFullscreen() : station.requestFullscreen?.();
  task?.catch(() => {});
});

function paintBg() {
  const { width, height } = layout;
  const art = sprites[locations[(sim?.wave || 1) - 1]] || sprites.arena;
  if (!art) {
    ctx.fillStyle = '#294752';
    ctx.fillRect(0, 0, width, height);
    return;
  }
  const fit = Math.max(width / art.width, height / art.height);
  const w = art.width * fit;
  const h = art.height * fit;
  ctx.drawImage(art, (width - w) / 2, (height - h) * .42, w, h);
  ctx.fillStyle = '#16334129';
  ctx.fillRect(0, 0, width, height);
}

function ellipse(x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function telegraph(e) {
  if (e.state !== 'wind') return;
  const hue = e.kind === 'boss' ? '#ffb075' : '#ffdda2';
  ctx.lineWidth = 2;
  ctx.strokeStyle = hue;
  ctx.fillStyle = '#e77c4b41';
  ctx.setLineDash([8, 4]);
  ctx.lineDashOffset = -sim.clock * 21;
  ctx.beginPath();
  if (e.pattern === 'ram') {
    ctx.moveTo(e.x, e.y);
    ctx.lineTo(e.tx, e.ty);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(e.tx, e.ty, 18, 0, 2 * Math.PI);
  } else {
    const r = e.pattern === 'quake' ? 126 : 45;
    ctx.ellipse(e.x + (e.pattern === 'quake' ? 0 : e.face * 36), e.y, r, r * .61, 0, 0, 2 * Math.PI);
  }
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawActor(actor, player) {
  const age = sim.clock;
  const flip = player ? actor.face : -actor.face;
  const stride = player ? actor.moving : actor.state === 'track' || actor.state === 'charge';
  const attacking = player && actor.attack > 0;
  const rolling = player && actor.dodge > 0;
  const boss = actor.kind === 'boss';
  const key = player ? attacking || rolling ? 'punch' : stride && Math.floor(age * 13) % 2 ? 'run' : 'ready' : actor.kind;
  const art = sprites[key];
  if (!art) return;
  const size = boss ? 181 : actor.kind === 'heavy' ? 134 : 119;
  const height = size * (.92 + .14 * actor.y / sim.h);
  const width = height * art.width / art.height;
  const bob = stride ? Math.abs(Math.sin(age * (player ? 22 : 18))) * 5 : Math.sin(age * 5) * 1.5;
  const warm = !player && actor.state === 'wind';
  const hit = !player && actor.hit > 0;
  ellipse(actor.x, actor.y + 3, (boss ? 53 : 30), boss ? 15 : 9, '#1025358f');
  ctx.save();
  ctx.translate(actor.x, actor.y - bob);
  ctx.scale(flip, 1);
  if (rolling) {
    ctx.globalAlpha = .25;
    ctx.drawImage(art, -width / 2 - 22, -height * .76, width, height * .79);
    ctx.globalAlpha = 1;
    ctx.rotate(.27);
    ctx.scale(1.07, .80);
  }
  if (player && actor.inv > 0 && !rolling && Math.floor(age * 23) % 2) ctx.globalAlpha = .56;
  if (!player && actor.state === 'enter') ctx.globalAlpha = 1 - actor.t / .27;
  if (warm) { ctx.translate(-5, 0); ctx.rotate(-.10); }
  if (!player && (actor.state === 'charge' || (actor.state === 'recover' && actor.t > .39))) ctx.rotate(.14);
  if (hit) { ctx.filter = 'brightness(1.65) saturate(.75)'; ctx.rotate(-.07); }
  ctx.drawImage(art, -width / 2 + (attacking ? 12 : 0), -height, width, height);
  ctx.filter = 'none';
  if (attacking && actor.attackMax - actor.attack < .15) {
    ctx.strokeStyle = actor.strike === 3 ? '#eaff9e' : '#fff4dc';
    ctx.globalAlpha = .83;
    ctx.lineWidth = actor.strike === 3 ? 5 : 3;
    ctx.beginPath();
    ctx.ellipse(46, -height * .58, actor.strike === 3 ? 40 : 25, 14, -.19, 4.1, 6.04);
    ctx.stroke();
  }
  ctx.restore();
  if (!player && !boss && actor.hp < actor.max) {
    ctx.fillStyle = '#26333b';
    ctx.fillRect(actor.x - 18, actor.y + 10, 36, 4);
    ctx.fillStyle = '#eead78';
    ctx.fillRect(actor.x - 18, actor.y + 10, 36 * actor.hp / actor.max, 4);
  }
}

function effect(event) {
  sound(event.type);
  const { type, x, y } = event;
  if (type === 'entrance' && !entrance) entrance = sim.clock;
  if (type === 'wave') {
    announce(labels[sim.wave - 1]);
    particles.length = 0;
    resize();
  }
  if (type === 'phase') announce('裝甲站長・' + phases[sim.phase - 1]);
  if (type === 'heavy' || type === 'hurt' || type === 'phase') flash = .13;
  if (type === 'wave' || type === 'entrance') return;
  const burst = type === 'heavy' || type === 'break' || type === 'phase' ? 22 : 11;
  const color = type === 'hurt' || type === 'quake' ? '#ff794a' : type === 'heal' ? '#bfff78' : '#f4edb0';
  if (type === 'quake' || type === 'break' || type === 'phase') {
    particles.push({ x, y, ring: event.radius || 111, life: .42, max: .42, color, vx: 0, vy: 0 });
  }
  for (let i = 0; i < burst; i++) {
    const angle = Math.PI * 2 * i / burst;
    const speed = 47 + ((i * 139) % 165);
    particles.push({ x, y: y - 43, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed * .72,
      life: .18 + (i % 5) * .06, max: .42, color });
  }
}

function draw() {
  if (!layout.width) return;
  const { ratio, width, height, top, scale } = layout;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  paintBg();
  if (!sim || mode === 'cover') return;
  const motion = reduced.matches ? 0 : sim.shake;
  ctx.translate(Math.sin(sim.clock * 140) * motion, top + Math.cos(sim.clock * 101) * motion * .66);
  ctx.scale(scale, scale);
  for (const enemy of sim.enemies) telegraph(enemy);
  for (const kit of sim.kits) {
    ellipse(kit.x, kit.y + 2, 13, 7, '#172a35aa');
    ctx.fillStyle = '#b8e0a4';
    ctx.fillRect(kit.x - 11, kit.y - 12, 22, 14);
    ctx.fillStyle = '#24432a';
    ctx.fillRect(kit.x - 5, kit.y - 7, 10, 3);
    ctx.fillRect(kit.x - 1.5, kit.y - 10.5, 3, 10);
  }
  const actors = [sim.player, ...sim.enemies].sort((a, b) => a.y - b.y);
  for (const actor of actors) drawActor(actor, actor === sim.player);
  for (const part of particles) {
    ctx.globalAlpha = Math.min(1, part.life / part.max * 1.8);
    ctx.strokeStyle = part.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (part.ring) {
      const radius = Math.max(3, part.ring * (1 - part.life / part.max));
      ctx.ellipse(part.x, part.y, radius, radius * .61, 0, 0, 2 * Math.PI);
    } else {
      ctx.moveTo(part.x, part.y);
      ctx.lineTo(part.x - part.vx * .041, part.y - part.vy * .041);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (flash > 0 && !reduced.matches) {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.strokeStyle = '#ffd2a9' + (Math.round(flash * 380)).toString(16).padStart(2, '0');
    ctx.lineWidth = 22;
    ctx.strokeRect(0, 0, width, height);
  }
}

function syncHud() {
  byId('wave').textContent = labels[sim.wave - 1];
  byId('score').textContent = String(sim.points).padStart(6, '0');
  byId('health').setAttribute('aria-valuenow', sim.player.hp);
  [...byId('health').children].forEach((cell, i) => cell.classList.toggle('full', i < sim.player.hp));
  const boss = sim.enemies.find(e => e.kind === 'boss');
  byId('boss').hidden = !boss;
  if (boss) {
    byId('boss-name').textContent = '裝甲站長・' + phases[sim.phase - 1];
    byId('boss-bar').style.setProperty('--remain', 100 * boss.hp / boss.max + '%');
  }
  byId('chain').hidden = sim.chain < 2;
  byId('chain').textContent = '×' + sim.chain;
  byId('dodge').style.setProperty('--charge', Math.round(100 * (1 - sim.player.cooldown / .83)) + '%');
}

function playFrame(now) {
  requestAnimationFrame(playFrame);
  const span = frameAt ? now - frameAt : 0;
  frameAt = now;
  if (mode !== 'playing') return;
  const before = performance.now();
  accumulator += Math.min(.075, span / 1000);
  input.x = Math.max(-1, Math.min(1, stickX + Number(keys.has('ArrowRight') || keys.has('KeyD')) - Number(keys.has('ArrowLeft') || keys.has('KeyA'))));
  input.y = Math.max(-1, Math.min(1, stickY + Number(keys.has('ArrowDown') || keys.has('KeyS')) - Number(keys.has('ArrowUp') || keys.has('KeyW'))));
  while (accumulator >= Frostline.tick && sim.status === 'playing') {
    input.attack = pressed.attack || attackBuffer > now || keys.has('KeyZ') || keys.has('Space');
    input.dodge = pressed.dodge || dodgeBuffer > now || keys.has('ShiftLeft') || keys.has('ShiftRight') || keys.has('KeyX');
    const was = sim.player.lastAttack;
    Frostline.step(sim, input);
    if (was !== sim.player.lastAttack) attackBuffer = 0;
    for (const event of sim.events) {
      if (event.type === 'dodge') dodgeBuffer = 0;
      effect(event);
    }
    accumulator -= Frostline.tick;
  }
  const dt = Math.min(.075, span / 1000);
  flash = Math.max(0, flash - dt);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
    else { p.x += p.vx * dt; p.y += p.vy * dt; }
  }
  if (notice && now > notice) { notice = 0; byId('notice').textContent = ''; }
  syncHud();
  draw();
  if (firstInputAt && inputToPaint === null && (sim.player.moving || sim.player.attack > 0 || sim.player.dodge > 0)) {
    inputToPaint = Math.round(performance.now() - firstInputAt);
  }
  if (span > 0) {
    measures.push({ span, cost: performance.now() - before });
    if (measures.length > 600) measures.shift();
  }
  if (sim.status !== 'playing') finish();
}

window.render_game_to_text = () => JSON.stringify(sim ? {
  mode, clock: sim.clock, wave: sim.wave, phase: sim.phase, entrance, points: sim.points,
  chain: sim.chain, bestChain: sim.bestChain, hits: sim.hits, hurt: sim.hurt,
  w: sim.w, h: sim.h, player: sim.player, enemies: sim.enemies, kits: sim.kits,
  record, inputToPaint,
} : { mode, record });
window.frostlineFrameStats = () => measures.slice();

loadArt(['arena', 'ready', 'run', 'punch', 'scout', 'heavy', 'boss']).then(() => {
  byId('start-btn').textContent = '開始戰鬥';
  byId('start-btn').disabled = false;
  resize();
  return loadArt(locations.slice(1)).catch(error => console.error(error));
}).catch(error => {
  byId('start-btn').textContent = '場地載入失敗，請重新整理';
  console.error(error);
});
requestAnimationFrame(playFrame);
