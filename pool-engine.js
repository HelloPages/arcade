(function (root) {
  'use strict';

  const RADIUS = 14;
  const STEP = 1 / 360;
  const MIN_POWER = 0.15;
  const MAX_SPEED = 1960;
  const DIFFICULTY = [
    { error: 3.2, wait: 0.78, power: 0.09 },
    { error: 1.4, wait: 0.72, power: 0.045 },
    { error: 0.5, wait: 0.62, power: 0.018 },
  ];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const direction = (from, to) => {
    const length = distance(from, to) || 1;
    return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
  };

  function tableGeometry(width, height) {
    const vertical = height > width;
    const corner = 26;
    const middle = 25;
    const pockets = [
      { x: 0, y: 0, size: corner }, { x: width, y: 0, size: corner },
      { x: 0, y: height, size: corner }, { x: width, y: height, size: corner },
      ...(vertical ? [{ x: -4, y: height / 2, size: middle }, { x: width + 4, y: height / 2, size: middle }]
        : [{ x: width / 2, y: -4, size: middle }, { x: width / 2, y: height + 4, size: middle }]),
    ];
    const split = (span, hasMiddle) => hasMiddle
      ? [[27, span / 2 - 25], [span / 2 + 25, span - 27]] : [[27, span - 27]];
    const rails = [];
    for (const [start, end] of split(width, !vertical)) {
      rails.push({ axis: 'x', wall: 0, sign: 1, start, end }, { axis: 'x', wall: height, sign: -1, start, end });
    }
    for (const [start, end] of split(height, vertical)) {
      rails.push({ axis: 'y', wall: 0, sign: 1, start, end }, { axis: 'y', wall: width, sign: -1, start, end });
    }
    return { width, height, vertical, pockets, rails };
  }

  function ball(id, x, y) {
    return { id, x, y, vx: 0, vy: 0, roll: 0, inPlay: true };
  }

  function pointFromHead(table, across, down) {
    return table.vertical ? { x: table.width * across, y: table.height * down }
      : { x: table.width * (1 - down), y: table.height * across };
  }

  function clearPath(start, end, balls, ignored, clearance = 2 * RADIUS + 0.6) {
    const length = distance(start, end);
    const dir = direction(start, end);
    return balls.every(other => {
      if (!other.inPlay || ignored.includes(other.id)) return true;
      const along = clamp((other.x - start.x) * dir.x + (other.y - start.y) * dir.y, 0, length);
      return Math.hypot(other.x - start.x - along * dir.x, other.y - start.y - along * dir.y) > clearance;
    });
  }

  function firstContact(origin, angle, balls) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    let nearest = null;
    for (const target of balls) {
      if (!target.inPlay || !target.id) continue;
      const x = target.x - origin.x;
      const y = target.y - origin.y;
      const along = x * dx + y * dy;
      const offset = Math.abs(x * dy - y * dx);
      if (along <= 0 || offset >= 2 * RADIUS) continue;
      const time = along - Math.sqrt(4 * RADIUS ** 2 - offset ** 2);
      if (nearest && time >= nearest.time) continue;
      const ghost = { x: origin.x + time * dx, y: origin.y + time * dy };
      nearest = { time, target, ghost, aim: direction(ghost, target) };
    }
    return nearest;
  }

  class Match {
    constructor(width, height, level = 0, rng = Math.random, emit = () => {}) {
      this.table = tableGeometry(width, height);
      this.level = level;
      this.rng = rng;
      this.emit = emit;
      this.reset();
    }

    reset() {
      this.score = [0, 0];
      this.turn = 0;
      this.phase = 'aim';
      this.clock = 0;
      this.combo = 0;
      this.shots = 0;
      this.pocketed = [];
      this.ballInHand = false;
      this.break = true;
      this.suddenDeath = false;
      this.dryShots = 0;
      this.winner = null;
      this.plan = null;
      this.shot = null;
      const cue = pointFromHead(this.table, 0.5, 0.77);
      const apex = pointFromHead(this.table, 0.5, 0.32);
      this.balls = [ball(0, cue.x, cue.y)];
      for (let row = 0, id = 1; row < 3; row++) {
        for (let col = 0; col <= row; col++, id++) {
          const depth = row * (RADIUS * Math.sqrt(3) + 0.8);
          const spread = (col - row / 2) * (2 * RADIUS + 0.9);
          this.balls.push(this.table.vertical ? ball(id, apex.x + spread, apex.y - depth)
            : ball(id, apex.x + depth, apex.y + spread));
        }
      }
      this.angle = Math.atan2(apex.y - cue.y, apex.x - cue.x);
    }

    get cue() { return this.balls[0]; }

    resize(width, height) {
      const old = this.table;
      const next = tableGeometry(width, height);
      const rotated = old.vertical !== next.vertical;
      for (const b of this.balls) {
        const u = b.x / old.width;
        const v = b.y / old.height;
        const x = rotated ? (old.vertical ? 1 - v : v) : u;
        const y = rotated ? (old.vertical ? u : 1 - u) : v;
        b.x = x * width;
        b.y = y * height;
        if (rotated) [b.vx, b.vy] = old.vertical ? [-b.vy, b.vx] : [b.vy, -b.vx];
      }
      if (rotated) this.angle += old.vertical ? Math.PI / 2 : -Math.PI / 2;
      this.table = next;
      if (this.phase === 'cpu') this.plan = this.chooseShot();
    }

    canPlace(point) {
      const { width, height, pockets } = this.table;
      return point.x >= RADIUS && point.x <= width - RADIUS && point.y >= RADIUS && point.y <= height - RADIUS
        && pockets.every(p => distance(point, p) > p.size + RADIUS * 0.4)
        && this.balls.every(b => !b.id || !b.inPlay || distance(b, point) > 2 * RADIUS + 0.5);
    }

    placeCue(point) {
      if (!this.ballInHand || !this.canPlace(point)) return false;
      Object.assign(this.cue, point, { inPlay: true, vx: 0, vy: 0 });
      this.ballInHand = false;
      this.emit('place');
      return true;
    }

    shoot(angle, power, spin = { x: 0, y: 0 }) {
      if (this.ballInHand || !['aim', 'cpu'].includes(this.phase) || !this.cue.inPlay) return false;
      const speed = MAX_SPEED * clamp(power, MIN_POWER, 1);
      this.cue.vx = Math.cos(angle) * speed;
      this.cue.vy = Math.sin(angle) * speed;
      this.angle = angle;
      this.phase = 'rolling';
      this.clock = 0;
      this.shots++;
      this.plan = null;
      this.shot = { first: false, rail: false, dropped: [], spin: { ...spin } };
      this.emit('stroke', power);
      return true;
    }

    chooseShot() {
      const { width, height, pockets } = this.table;
      const cue = this.cue;
      const targets = this.balls.filter(b => b.id && b.inPlay);
      const plans = [];
      for (const target of targets) {
        const ignored = [0, target.id];
        for (const pocket of pockets) {
          const into = direction(target, pocket);
          const ghost = { x: target.x - into.x * 2 * RADIUS, y: target.y - into.y * 2 * RADIUS };
          const approach = direction(cue, ghost);
          const cosine = into.x * approach.x + into.y * approach.y;
          if (cosine < 0.37 || ghost.x < RADIUS || ghost.x > width - RADIUS || ghost.y < RADIUS || ghost.y > height - RADIUS) continue;
          if (!clearPath(cue, ghost, this.balls, ignored) || !clearPath(target, pocket, this.balls, ignored)) continue;
          const near = distance(cue, ghost);
          const far = distance(target, pocket);
          plans.push({ target: target.id, ghost, pocket, angle: Math.atan2(approach.y, approach.x),
            power: clamp(0.29 + (near + far / cosine) / 2300, 0.38, 0.92), merit: cosine * 2.1 - near / 840 - far / 720 });
        }
      }
      if (plans.length) return plans.sort((a, b) => b.merit - a.merit)[0];
      for (const target of targets.sort((a, b) => distance(cue, a) - distance(cue, b))) {
        const angle = Math.atan2(target.y - cue.y, target.x - cue.x);
        const hit = firstContact(cue, angle, this.balls);
        if (hit?.target.id === target.id) return { angle, target: target.id, ghost: hit.ghost, power: this.break ? 0.88 : 0.72 };
      }
      return { angle: this.angle + Math.PI, power: 0.69 };
    }

    update(dt) {
      this.clock += dt;
      if (this.phase === 'cpu' && this.clock >= this.cpuWait) {
        const tune = DIFFICULTY[this.level];
        // The opponent takes more care after several scoreless visits.
        const focus = this.dryShots >= 5 ? 0.45 : this.dryShots >= 3 ? 0.71 : 1;
        const error = (this.rng() * 2 - 1) * tune.error * focus * Math.PI / 180;
        const power = this.plan.power + (this.rng() * 2 - 1) * tune.power;
        this.shoot(this.plan.angle + error, power);
      } else if (this.phase === 'rolling') {
        this.moveBalls(dt);
        if (this.balls.every(b => !b.inPlay || (!b.vx && !b.vy))) this.finishShot();
      }
    }

    moveBalls(dt) {
      for (const b of this.balls) {
        if (!b.inPlay) continue;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        const speed = Math.hypot(b.vx, b.vy);
        b.roll += speed * dt / RADIUS;
        const slowDrag = 105 * Math.max(0, 1 - speed / 155);
        const friction = speed > 2.2 ? Math.max(0, 1 - (49 + speed * 0.47 + slowDrag) * dt / speed) : 0;
        b.vx *= friction;
        b.vy *= friction;
        const pocket = this.table.pockets.find(p => distance(b, p) < p.size - 2);
        if (pocket) {
          b.inPlay = false;
          b.vx = b.vy = 0;
          this.shot.dropped.push(b.id);
          this.emit('pocket', b.id, pocket);
          continue;
        }
        this.collideRails(b);
      }
      for (let i = 0; i < this.balls.length; i++) {
        const a = this.balls[i];
        if (!a.inPlay) continue;
        for (let j = i + 1; j < this.balls.length; j++) {
          const b = this.balls[j];
          if (b.inPlay) this.collideBalls(a, b);
        }
      }
    }

    collideRails(b) {
      for (const rail of this.table.rails) {
        const cross = rail.axis === 'x' ? 'y' : 'x';
        const edge = clamp(b[rail.axis], rail.start, rail.end);
        const along = b[rail.axis] - edge;
        const inside = (b[cross] - rail.wall) * rail.sign;
        if (inside >= RADIUS || Math.abs(along) >= RADIUS) continue;
        const depth = Math.hypot(along, Math.max(inside, 0));
        if (depth >= RADIUS) continue;
        const tangent = depth > 0 ? along / depth : 0;
        const normal = Math.sqrt(1 - tangent ** 2) * rail.sign;
        const axisVelocity = rail.axis === 'x' ? 'vx' : 'vy';
        const crossVelocity = rail.axis === 'x' ? 'vy' : 'vx';
        b[rail.axis] = edge + tangent * (RADIUS + 0.01);
        b[cross] = rail.wall + normal * (RADIUS + 0.01);
        const impact = b[axisVelocity] * tangent + b[crossVelocity] * normal;
        if (impact >= 0) continue;
        b[axisVelocity] -= 1.72 * impact * tangent;
        b[crossVelocity] -= 1.72 * impact * normal;
        if (this.shot.first) this.shot.rail = true;
        if (!b.id) b[axisVelocity] += this.shot.spin.x * Math.min(145, -impact * 0.25) * rail.sign;
        if (impact < -60) this.emit('rail', -impact);
      }
      // A ball crossing the mouth at a grazing angle still falls off the slate.
      const { width, height } = this.table;
      if (b.x < -RADIUS || b.x > width + RADIUS || b.y < -RADIUS || b.y > height + RADIUS) {
        const pocket = this.table.pockets.reduce((a, p) => distance(b, p) < distance(b, a) ? p : a);
        b.inPlay = false;
        b.vx = b.vy = 0;
        this.shot.dropped.push(b.id);
        this.emit('pocket', b.id, pocket);
      }
    }

    collideBalls(a, b) {
      const gap = distance(a, b);
      if (gap >= 2 * RADIUS) return;
      const n = gap ? direction(a, b) : { x: 1, y: 0 };
      const overlap = (2 * RADIUS - gap + 0.02) / 2;
      a.x -= n.x * overlap; a.y -= n.y * overlap;
      b.x += n.x * overlap; b.y += n.y * overlap;
      const closing = (a.vx - b.vx) * n.x + (a.vy - b.vy) * n.y;
      if (closing <= 0) return;
      const impulse = 0.98 * closing;
      a.vx -= impulse * n.x; a.vy -= impulse * n.y;
      b.vx += impulse * n.x; b.vy += impulse * n.y;
      if (!a.id && !this.shot.first) {
        this.shot.first = true;
        const carry = clamp(closing * 0.23, 0, 270);
        a.vx += carry * (this.shot.spin.y * n.x - this.shot.spin.x * n.y * 0.42);
        a.vy += carry * (this.shot.spin.y * n.y + this.shot.spin.x * n.x * 0.42);
      }
      if (closing > 26) this.emit('impact', closing);
    }

    openSpot(useHead) {
      for (const depth of (useHead ? [0.76, 0.62, 0.45, 0.25] : [0.32, 0.45, 0.6, 0.75])) {
        for (const across of [0.5, 0.34, 0.66, 0.18, 0.82]) {
          const point = pointFromHead(this.table, across, depth);
          if (this.canPlace(point)) return point;
        }
      }
      for (let y = 2 * RADIUS; y < this.table.height - RADIUS; y += RADIUS) {
        for (let x = 2 * RADIUS; x < this.table.width - RADIUS; x += RADIUS) {
          if (this.canPlace({ x, y })) return { x, y };
        }
      }
      throw new Error('No legal spot on the table');
    }

    finishShot() {
      const { first, rail, dropped } = this.shot;
      const foul = dropped.includes(0) ? 'scratch' : !first ? 'miss' : !rail && !dropped.length ? 'noRail' : null;
      const pots = dropped.filter(Boolean);
      this.dryShots = !foul && pots.length ? 0 : this.dryShots + 1;
      this.break = false;
      this.ballInHand = Boolean(foul);
      if (foul) {
        for (const id of pots) Object.assign(this.balls.find(b => b.id === id), this.openSpot(false), { inPlay: true });
        this.cue.inPlay = false;
      } else if (pots.length) {
        this.score[this.turn] += pots.length;
        this.combo += pots.length;
        this.pocketed.push(...pots);
        if (this.score[this.turn] >= 4) {
          this.winner = this.turn;
          this.phase = 'end';
          this.emit('end', this.winner);
          return;
        }
        if (this.score[0] === 3 && this.score[1] === 3 && !this.suddenDeath) {
          const spot = this.openSpot(false);
          this.balls.push(ball(7, spot.x, spot.y));
          this.suddenDeath = true;
          this.emit('tiebreak');
        } else {
          this.emit('point', this.combo);
        }
      }
      if (!pots.length || foul) {
        this.combo = 0;
        this.turn = 1 - this.turn;
        this.emit(foul || 'turn');
      }
      this.clock = 0;
      this.phase = this.turn ? 'cpu' : 'aim';
      if (this.turn) {
        if (this.ballInHand) this.placeCue(this.openSpot(true));
        this.plan = this.chooseShot();
        this.cpuWait = DIFFICULTY[this.level].wait;
        this.angle = this.plan.angle;
      } else if (this.cue.inPlay) {
        const target = this.balls.find(b => b.id && b.inPlay);
        this.angle = Math.atan2(target.y - this.cue.y, target.x - this.cue.x);
      }
    }
  }

  const api = { Match, STEP, RADIUS, MIN_POWER, DIFFICULTY, firstContact, clearPath, distance, clamp };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PoolEngine = api;
})(typeof globalThis === 'object' ? globalThis : this);
