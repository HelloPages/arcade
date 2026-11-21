'use strict';

const Frostline = (() => {
  const tick = 1 / 120;
  const waves = [
    ['scout', 'scout', 'scout'],
    ['heavy', 'scout', 'heavy', 'scout'],
    ['boss'],
  ];
  const kinds = {
    scout: { hp: 3, speed: 116, range: 64, wind: .51, rest: .39, score: 150 },
    heavy: { hp: 6, speed: 83, range: 73, wind: .68, rest: .52, score: 250 },
    boss: { hp: 51, speed: 96, range: 90, wind: .76, rest: .69, score: 1800 },
  };
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function create(w, h, seed = 19) {
    return {
      w, h, seed, status: 'playing', clock: 0, wave: 1, spawnClock: .18, spawned: 0,
      points: 0, chain: 0, chainAt: 0, bestChain: 0, phase: 0, hits: 0, hurt: 0,
      pause: 0, shake: 0, enemies: [], kits: [], events: [],
      player: { x: w * .44, y: h * .55, dx: 1, dy: 0, face: 1, hp: 9, attack: 0,
        attackMax: .28, strike: 0, dodge: 0, cooldown: 0, inv: 0, vx: 0, vy: 0, moving: false },
    };
  }

  function resize(s, w, h) {
    for (const e of [s.player, ...s.enemies, ...s.kits]) {
      e.x *= w / s.w;
      e.y *= h / s.h;
      if (e.tx !== undefined) { e.tx *= w / s.w; e.ty *= h / s.h; }
    }
    s.w = w;
    s.h = h;
  }

  function spawn(s) {
    s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
    const i = s.spawned++;
    const kind = waves[s.wave - 1][i];
    const stats = kinds[kind];
    const side = i === 0 ? 1 : (i + s.wave + (s.seed >>> 31)) % 2 ? 1 : -1;
    const p = s.player;
    const x = i === 0 ? clamp(p.x + (s.wave === 3 ? 175 : 113), 32, s.w - (s.wave === 3 ? 76 : 29)) : side === 1 ? s.w - 27 : 27;
    const y = clamp(i === 0 ? p.y : 33 + ((s.seed >>> 8) % 1000) / 1000 * (s.h - 72), 23, s.h - 16);
    s.enemies.push({ id: s.wave * 10 + i, kind, x, y, hp: stats.hp, max: stats.hp,
      face: side, state: 'enter', t: .26, hit: 0, tx: x, ty: y,
      pattern: 'punch', cycle: 0, chargeX: 0, chargeY: 0 });
    if (kind === 'boss') s.phase = 1;
    s.events.push({ type: 'entrance', x, y });
  }

  function strike(s) {
    const p = s.player;
    const finisher = p.strike === 3;
    const reach = finisher ? 118 : 99;
    for (const e of s.enemies) {
      if (e.hp <= 0 || e.state === 'enter' || distance(p, e) > reach || Math.abs(e.y - p.y) > (finisher ? 59 : 46)) continue;
      if ((e.x - p.x) * p.face < (finisher ? -37 : -17)) continue;
      const armored = e.kind === 'boss' && ['wind', 'charge'].includes(e.state);
      e.hp = Math.max(0, e.hp - (finisher ? 2 : 1));
      e.hit = .16;
      if (!armored) {
        e.state = 'recover';
        e.t = e.kind === 'boss' ? .15 : finisher ? .39 : .21;
        const gap = e.kind === 'boss' ? 70 : 25;
        e.x = clamp(e.x + p.face * (finisher ? 22 : 7), gap, s.w - gap);
      }
      s.hits++;
      s.chain++;
      s.bestChain = Math.max(s.bestChain, s.chain);
      s.chainAt = s.clock;
      s.points += 15 * Math.min(s.chain, 12);
      s.pause = Math.max(s.pause, finisher ? .038 : .019);
      s.shake = finisher ? 9 : 4;
      s.events.push({ type: finisher ? 'heavy' : 'hit', x: e.x, y: e.y });
      if (e.hp === 0) {
        s.points += kinds[e.kind].score;
        s.events.push({ type: 'break', x: e.x, y: e.y });
        if (e.kind === 'heavy') s.kits.push({ x: e.x, y: e.y, life: 12 });
      }
    }
  }

  function hitPlayer(s, e) {
    const p = s.player;
    if (p.inv > 0) return;
    p.hp--;
    p.inv = .83;
    p.attack = 0;
    p.vx = Math.sign(p.x - e.x) * 210;
    p.vy = Math.sign(p.y - e.y) * 94;
    s.hurt++;
    s.chain = 0;
    s.pause = .036;
    s.shake = 9;
    s.events.push({ type: 'hurt', x: p.x, y: p.y });
  }

  function think(s, e, dt) {
    const p = s.player;
    const stats = kinds[e.kind];
    e.t -= dt;
    e.hit = Math.max(0, e.hit - dt);
    const boss = e.kind === 'boss';
    const phase = boss ? (e.hp > 34 ? 1 : e.hp > 16 ? 2 : 3) : 0;
    if (phase > s.phase) {
      s.phase = phase;
      s.shake = 10;
      s.events.push({ type: 'phase', x: e.x, y: e.y });
    }
    if (e.state === 'enter' || e.state === 'recover') {
      if (e.t <= 0) e.state = 'track';
      return;
    }
    if (e.state === 'charge') {
      e.x = clamp(e.x + e.chargeX * dt, 70, s.w - 70);
      e.y = clamp(e.y + e.chargeY * dt, 18, s.h - 13);
      if (distance(e, p) < 62) hitPlayer(s, e);
      if (e.t <= 0) { e.state = 'recover'; e.t = .71; }
      return;
    }
    if (e.state === 'wind') {
      if (e.t > 0) return;
      if (e.pattern === 'ram') {
        const dx = e.tx - e.x;
        const dy = e.ty - e.y;
        const len = Math.hypot(dx, dy) || 1;
        e.chargeX = 490 * dx / len;
        e.chargeY = 490 * dy / len;
        e.state = 'charge';
        e.t = Math.min(.48, len / 490 + .14);
      } else {
        const radius = e.pattern === 'quake' ? 126 : stats.range + (boss ? 22 : 9);
        const facing = (p.x - e.x) * e.face > -18;
        if (distance(e, p) < radius && (e.pattern === 'quake' || (facing && Math.abs(p.y - e.y) < 49))) hitPlayer(s, e);
        s.events.push({ type: e.pattern, x: e.x, y: e.y, face: e.face, radius });
        e.state = 'recover';
        e.t = stats.rest;
      }
      return;
    }
    e.face = p.x < e.x ? -1 : 1;
    const gap = distance(e, p);
    const pattern = boss ? phase === 1 ? 'quake' : phase === 2 ? 'ram' : ['quake', 'ram', 'punch'][e.cycle % 3] : 'punch';
    if (gap <= (pattern === 'ram' ? Math.min(270, s.w * .53) : stats.range) &&
        (pattern !== 'punch' || Math.abs(p.y - e.y) < 34)) {
      e.state = 'wind';
      e.pattern = pattern;
      e.tx = p.x;
      e.ty = p.y;
      e.t = stats.wind - (phase === 3 ? .08 : 0);
      e.cycle++;
      return;
    }
    let dx = p.x - e.x;
    let dy = p.y - e.y;
    for (const peer of s.enemies) {
      if (peer === e || peer.hp <= 0) continue;
      const separation = distance(e, peer);
      if (separation > 0 && separation < 52) {
        dx += (e.x - peer.x) * (52 - separation) / separation;
        dy += (e.y - peer.y) * (52 - separation) / separation * 2;
      }
    }
    const length = Math.hypot(dx, dy) || 1;
    const speed = stats.speed + (phase === 3 ? 28 : 0);
    const edge = boss ? 70 : 23;
    e.x = clamp(e.x + dx / length * speed * dt, edge, s.w - edge);
    e.y = clamp(e.y + dy / length * speed * dt, 17, s.h - 12);
  }

  function step(s, input, dt = tick) {
    s.events.length = 0;
    if (s.status !== 'playing') return;
    s.shake = Math.max(0, s.shake - 38 * dt);
    if (s.pause > 0) { s.pause -= dt; return; }
    s.clock += dt;
    if (s.clock - s.chainAt > 1.9) s.chain = 0;
    const p = s.player;
    p.cooldown = Math.max(0, p.cooldown - dt);
    p.inv = Math.max(0, p.inv - dt);
    p.dodge = Math.max(0, p.dodge - dt);
    const length = Math.max(1, Math.hypot(input.x, input.y));
    const dx = input.x / length;
    const dy = input.y / length;
    p.moving = length > 1 || Math.abs(dx) + Math.abs(dy) > .1;
    if (p.moving && p.dodge === 0) {
      p.dx = dx; p.dy = dy;
      if (Math.abs(dx) > .15) p.face = Math.sign(dx);
    }
    if (input.dodge && p.cooldown === 0) {
      p.dodge = .24;
      p.cooldown = .83;
      p.inv = Math.max(p.inv, .33);
      p.attack = 0;
      s.events.push({ type: 'dodge', x: p.x, y: p.y });
    }
    if (!p.dodge && p.attack <= 0 && input.attack) {
      p.strike = s.clock - (p.lastAttack ?? -10) < .63 ? p.strike % 3 + 1 : 1;
      p.lastAttack = s.clock;
      p.attackMax = p.strike === 3 ? .36 : .25;
      p.attack = p.attackMax;
    }
    if (p.dodge > 0) {
      p.x += p.dx * 458 * dt;
      p.y += p.dy * 415 * dt;
    } else {
      const speed = p.attack > 0 ? 119 : 224;
      p.x += (dx * speed + p.vx) * dt;
      p.y += (dy * speed + p.vy) * dt;
    }
    p.vx *= .92; p.vy *= .92;
    p.x = clamp(p.x, 26, s.w - 26);
    p.y = clamp(p.y, 18, s.h - 12);
    if (p.attack > 0) {
      const mark = p.attackMax - .075;
      const next = p.attack - dt;
      if (p.attack >= mark && next < mark) strike(s);
      p.attack = next;
    }

    const count = waves[s.wave - 1].length;
    s.spawnClock -= dt;
    if (s.spawned < count && s.spawnClock <= 0) {
      spawn(s);
      s.spawnClock = s.wave === 1 ? .72 : .60;
    }
    for (const enemy of s.enemies) if (enemy.hp > 0) think(s, enemy, dt);
    s.enemies = s.enemies.filter(e => e.hp > 0);
    for (const kit of s.kits) {
      kit.life -= dt;
      if (p.hp < 9 && distance(kit, p) < 42) {
        kit.life = 0;
        p.hp = Math.min(9, p.hp + 2);
        s.events.push({ type: 'heal', x: kit.x, y: kit.y });
      }
    }
    s.kits = s.kits.filter(k => k.life > 0);
    if (p.hp <= 0 || s.clock > 115) s.status = 'lost';
    else if (!s.enemies.length && s.spawned === count) {
      if (s.wave === waves.length) s.status = 'won';
      else {
        s.wave++;
        s.spawned = 0;
        s.spawnClock = s.wave === 3 ? 1.46 : .88;
        p.hp = Math.min(9, p.hp + 1);
        s.events.push({ type: 'wave', x: p.x, y: p.y });
      }
    }
  }

  return { tick, create, resize, step };
})();

if (typeof module === 'object') module.exports = Frostline;
