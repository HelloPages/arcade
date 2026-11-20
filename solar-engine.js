(function (root) {
  'use strict';
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const duration = 26;
  const armor = 7;
  const bossArmor = 54;
  const tick = 1 / 120;

  function create(width = 390) {
    return { width, time: 0, distance: 0, health: armor, score: 0, streak: 0, comboTime: 0,
      player: { x: width * .22, y: 0, vy: 0, facing: 1, grace: 0, dash: 0, charge: 0, fire: 0 },
      enemies: [], rounds: [], foes: [], events: [], sequence: 0, next: .22,
      boss: null, phase: 1, state: 'playing', freeze: 0, shotCount: 0 };
  }

  function impact(game, type, x, y) { game.events.push({ type, x, y }); }

  function enemy(game) {
    const wave = game.sequence++;
    const air = wave % 4 === 2 || (wave > 8 && wave % 4 === 0);
    const armored = !air && wave > 5 && wave % 3 === 0;
    return { kind: air ? 'drone' : 'walker', x: Math.min(game.width + 30, game.player.x + Math.max(260, game.width * .6)),
      y: air ? 106 : 26, hp: armored ? 6 : air ? 3 : 4, radius: air ? 27 : 30,
      fire: armored ? .8 : 1.05, age: 0, armored, flash: 0 };
  }

  function hurt(game) {
    const pilot = game.player;
    if (pilot.grace > 0 || pilot.dash > 0) return;
    pilot.grace = 1.15;
    game.health -= 1;
    game.streak = game.comboTime = 0;
    impact(game, 'damage', pilot.x, pilot.y + 24);
    game.freeze = .047;
    if (game.health <= 0) game.state = 'lost';
  }

  function hostile(game, x, y, vx, vy, kind) {
    game.foes.push({ x, y, vx, vy, kind, age: 0 });
  }

  function fireBoss(game, boss) {
    const direction = Math.sign(game.player.x - boss.x) || -1;
    const launch = boss.x + direction * 36;
    if (game.phase === 1) {
      hostile(game, launch, 19, direction * 370, 0, 'wave');
    } else if (game.phase === 2) {
      for (const velocity of [-110, -33, 52]) hostile(game, launch, 99, direction * 330, velocity, 'spark');
    } else {
      hostile(game, launch, 19, direction * 420, 0, 'wave');
      hostile(game, launch, 131, direction * 285, -64, 'spark');
      const strike = clamp(game.player.x + direction * 12, 29, game.width - 29);
      hostile(game, strike, 0, 0, 0, 'strike');
    }
    impact(game, 'burst', launch, 54);
  }

  function step(game, input = {}, delta = tick) {
    if (game.state !== 'playing') return;
    if (game.freeze > 0) { game.freeze -= delta; return; }
    const pilot = game.player;
    game.time += delta;
    game.comboTime -= delta;
    if (game.comboTime <= 0) game.streak = 0;
    const axis = Number(Boolean(input.right)) - Number(Boolean(input.left));
    if (axis && pilot.dash <= 0) pilot.facing = axis;
    pilot.charge = Math.max(0, pilot.charge - delta);
    pilot.grace -= delta;
    if (input.jump && !pilot.jumpHeld && pilot.y <= 0) {
      pilot.vy = 525;
      impact(game, 'jump', pilot.x, 4);
    }
    pilot.jumpHeld = Boolean(input.jump);
    if (input.dash && !pilot.dashHeld && !pilot.charge) {
      pilot.dash = .18;
      pilot.charge = 1.12;
      impact(game, 'dash', pilot.x, pilot.y + 21);
    }
    pilot.dashHeld = Boolean(input.dash);
    pilot.x = clamp(pilot.x + (pilot.dash > 0 ? pilot.facing * 640 : axis * 242) * delta, 31, game.width - 31);
    pilot.vy -= (pilot.dash > 0 && pilot.y > 0 ? 430 : 1320) * delta;
    pilot.y += pilot.vy * delta;
    if (pilot.y <= 0) { pilot.y = 0; pilot.vy = 0; }
    pilot.dash -= delta;
    game.distance += (game.boss ? 0 : 110 + axis * 25) * delta;
    pilot.fire -= delta;
    if (pilot.fire <= 0) {
      pilot.fire += .154;
      game.shotCount += 1;
      const barrel = pilot.y + (pilot.y > 0 ? 33 : 28);
      const closest = game.boss || game.enemies.reduce((nearest, target) => !nearest || Math.abs(target.x - pilot.x) < Math.abs(nearest.x - pilot.x) ? target : nearest, null);
      pilot.aim = closest ? Math.sign(closest.x - pilot.x) || pilot.facing : pilot.facing;
      const round = { x: pilot.x + pilot.aim * 30, y: barrel, vx: pilot.aim * 690,
        vy: 0, age: 0, charged: game.streak >= 3 && game.shotCount % 3 === 0 };
      game.rounds.push(round);
      impact(game, 'shot', round.x, round.y);
    }

    if (!game.boss && game.time >= duration) {
      game.enemies.length = 0;
      game.foes.length = 0;
      game.health = Math.min(armor, game.health + 3);
      game.boss = { kind: 'boss', x: game.width + 94, y: 53, hp: bossArmor, radius: 54, flash: 0, age: 0, fire: 2.65 };
      impact(game, 'alarm', game.width * .76, 68);
    } else if (!game.boss && game.time >= game.next) {
      game.enemies.push(enemy(game));
      game.next += game.time < 12 ? 2.02 : 1.32;
    }
    if (!game.boss) game.phase = game.time < 12 ? 1 : 2;
    else {
      const boss = game.boss;
      const phase = boss.hp > bossArmor * 2 / 3 ? 1 : boss.hp > bossArmor / 3 ? 2 : 3;
      if (phase !== boss.phase) {
        boss.phase = phase; boss.fire = 1.25;
        if (phase > 1) game.health = Math.min(armor, game.health + 1);
        impact(game, 'alarm', boss.x, 75);
      }
      game.phase = phase;
      boss.age += delta;
      const anchor = game.width * (.77 + Math.sin(boss.age * 1.38) * (phase === 3 ? .13 : .04));
      boss.x += clamp((anchor - boss.x) * 2.5, -196, 196) * delta;
      boss.y = phase === 2 ? 78 + 12 * Math.sin(boss.age * 3.2) : 51;
      boss.flash -= delta;
      boss.fire -= delta;
      if (boss.fire <= 0) { fireBoss(game, boss); boss.fire = [0, 1.58, 1.48, 1.24][phase]; }
      if (boss.age > 55) hurt(game);
    }

    for (const target of game.enemies) {
      target.age += delta;
      target.flash -= delta;
      target.x -= (target.armored ? 112 : target.kind === 'drone' ? 124 : 153) * delta;
      if (target.kind === 'drone') target.y = 97 + Math.sin(target.age * 4) * 19;
      target.fire -= delta;
      if (target.fire <= 0 && target.x > 22 && target.x < game.width + 10) {
        const direction = Math.sign(pilot.x - target.x) || -1;
        const lift = target.kind === 'drone' ? -92 : 0;
        hostile(game, target.x + direction * 16, target.y - 7, direction * 245, lift, 'spark');
        target.fire = target.armored ? .78 : 1.6;
      }
    }

    const targets = game.boss ? [game.boss] : game.enemies;
    for (const round of game.rounds) {
      round.age += delta;
      round.x += round.vx * delta;
      round.y += round.vy * delta;
      for (const target of targets) {
        if (target.hp <= 0 || Math.abs(target.x - round.x) > target.radius) continue;
        const hitHeight = target.kind === 'boss' ? target.y : target.y - 1;
        const tolerance = target.kind === 'boss' ? game.phase === 2 ? 29 : 34 : 24;
        if (Math.abs(hitHeight - round.y) > tolerance) continue;
        target.hp -= round.charged ? 3 : target.kind === 'boss' && game.phase === 2 && round.y > 55 ? 2 : 1;
        target.flash = .08;
        round.spent = true;
        impact(game, 'hit', round.x, round.y);
        if (target.hp <= 0) {
          game.streak += 1;
          game.comboTime = 3.1;
          game.score += (target.kind === 'boss' ? 2000 : 130) * Math.min(5, game.streak);
          game.freeze = target.kind === 'boss' ? .095 : .031;
          impact(game, 'boom', target.x, target.y);
          if (target.kind === 'boss') game.state = 'won';
        }
        break;
      }
    }

    if (game.state === 'playing') {
      for (const target of targets) {
        if (target.hp > 0 && Math.abs(target.x - pilot.x) < target.radius * .72 && Math.abs(target.y - pilot.y - 20) < 39) hurt(game);
      }
      for (const round of game.foes) {
        round.age += delta;
        round.x += round.vx * delta;
        round.y += round.vy * delta;
        if (round.kind === 'strike') {
          if (round.age > .72 && round.age < .87 && Math.abs(round.x - pilot.x) < 31) hurt(game);
        } else if (Math.abs(round.x - pilot.x) < 18 && Math.abs(round.y - pilot.y - 18) < 20) {
          if (pilot.dash > 0) { game.score += 35; impact(game, 'hit', round.x, round.y); }
          else hurt(game);
          round.spent = true;
        }
      }
    }
    game.enemies = game.enemies.filter(target => target.x > -60 && target.hp > 0);
    game.rounds = game.rounds.filter(round => !round.spent && round.age < 1.7 && round.x > -40 && round.x < game.width + 50);
    game.foes = game.foes.filter(round => !round.spent && round.x > -60 && round.x < game.width + 60 && round.y > -25 && round.age < (round.kind === 'strike' ? 1.05 : 4));
  }

  const engine = { create, step, clamp, armor, bossArmor, duration, tick };
  if (typeof module !== 'undefined') module.exports = engine;
  else root.Solar = engine;
})(globalThis);
