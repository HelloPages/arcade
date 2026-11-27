/* Coordinates: x is across the table (-1..1), y runs from the player (0) to the CPU (1). */
(() => {
  "use strict";
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const profiles = [
    { pace: 1.05, cpuStep: 1.35, reach: .34, spread: .57, delay: .30 },
    { pace: 1.22, cpuStep: 1.72, reach: .34, spread: .74, delay: .22 },
    { pace: 1.43, cpuStep: 2.25, reach: .35, spread: .86, delay: .14 }
  ];
  const gravity = 2.85;

  class Match {
    constructor(level = 0, random = Math.random) {
      this.random = random;
      this.level = level;
      this.player = this.cpu = this.rally = this.bestRally = 0;
      this.playerX = this.cpuX = this.aim = this.clock = this.swing = this.cpuSwing = 0;
      this.phase = "ready";
      this.server = this.receiver = "player";
      this.events = [];
      this.ball = {x: 0, y: .05, z: .19};
      this.queued = null;
      this.pointTime = 0;
      this.lastShot = "drive";
    }
    get profile() { return profiles[this.level]; }
    action(aim = 0, spin = 0, lift = 0) {
      if (this.phase === "ready") {
        this.rally = 0;
        this.phase = "flight";
        if (this.server === "cpu") this.launch("cpu", (this.random() - .5) * 1.12, .16, .08, true);
        else this.launch("player", aim, spin, lift, true);
      } else if (this.phase === "flight" && this.receiver === "player") {
        this.queued = {aim, spin, lift, until: this.clock + .51};
        this.tryReturn();
      }
    }
    launch(side, target, spin, lift, serve = false) {
      const dir = side === "player" ? 1 : -1;
      this.receiver = dir === 1 ? "cpu" : "player";
      this.bounces = 0;
      this.serveBounce = serve;
      this.age = 0;
      this.queued = null;
      const pace = this.profile.pace + Math.min(this.rally, 12) * .023;
      const x = serve ? (dir === 1 ? this.playerX : this.cpuX) : this.ball.x;
      const y = serve ? (dir === 1 ? .045 : .955) : this.ball.y;
      const z = serve ? .23 : clamp(this.ball.z, .14, .36);
      // A serve bounces on both halves. During a rally the first bounce is deep on the receiver's half.
      const targetY = dir === 1 ? .76 : .24;
      const duration = Math.abs(targetY - y) / pace + (serve ? .13 : .13 * lift);
      const ax = clamp(spin, -1, 1) * 1.85;
      const endX = clamp(target, -.83, .83);
      const t = serve ? duration * .29 : duration;
      this.ball = {x,y,z, vx: (endX - x) / duration - .5 * ax * duration,
        vy: (targetY - y) / duration, vz: (.5 * gravity * t * t - z) / t,
        ax, spin, lift, targetX: endX, targetY, duration};
      this.lastShot = Math.abs(spin) > .24 ? "hook" : lift > .27 ? "loop" : "drive";
      if (dir === 1) this.swing = 1;
      else this.cpuSwing = 1;
      this.events.push(serve ? "serve" : this.lastShot);
    }
    tryReturn() {
      if (!this.queued || this.clock > this.queued.until || this.bounces !== 1 ||
          this.ball.y > .25 || this.ball.z > .45 || Math.abs(this.playerX - this.ball.x) > .39) return;
      const {aim, spin, lift} = this.queued;
      this.rally++;
      this.bestRally = Math.max(this.rally, this.bestRally);
      this.launch("player", aim, spin, lift);
    }
    point(side) {
      this[side]++;
      this.winner = side;
      this.phase = this[side] >= 7 && Math.abs(this.player - this.cpu) >= 2 ? "over" : "point";
      this.pointTime = 0;
      this.queued = null;
      this.events.push(this.phase === "over" ? "match" : "point");
      const total = this.player + this.cpu;
      const serviceTurn = total >= 12 ? total - 12 : Math.floor(total / 2);
      this.server = serviceTurn % 2 ? "cpu" : "player";
    }
    step(dt) {
      this.clock += dt;
      this.swing = Math.max(0, this.swing - dt * 4.4);
      this.cpuSwing = Math.max(0, this.cpuSwing - dt * 4.4);
      if (this.phase === "point" && (this.pointTime += dt) >= .86) this.phase = "ready";
      const flying = this.phase === "flight";
      const incoming = flying && this.receiver === "player";
      const tracking = incoming && this.level === 0 ? this.ball.x + this.ball.vx * .07 : this.aim;
      this.playerX += clamp(tracking - this.playerX, -dt * 4.6, dt * 4.6);
      const defending = flying && !incoming && this.age > this.profile.delay;
      const cpuTarget = defending ? this.ball.x + this.ball.vx * .09 : this.cpuX * .97;
      this.cpuX += clamp(cpuTarget - this.cpuX, -this.profile.cpuStep * dt, this.profile.cpuStep * dt);
      if (!flying) return;
      this.age += dt;
      const b = this.ball;
      const prevY = b.y;
      b.x += b.vx * dt + .5 * b.ax * dt * dt;
      b.vx += b.ax * dt;
      b.y += b.vy * dt;
      b.z += b.vz * dt - .5 * gravity * dt * dt;
      b.vz -= gravity * dt;
      const hitter = incoming ? "cpu" : "player";
      if ((prevY - .5) * (b.y - .5) <= 0 && b.z < .055) {
        this.point(this.receiver);
        return;
      }
      if (b.z <= 0 && b.vz < 0) {
        b.z = 0;
        if (Math.abs(b.x) > 1 || b.y < 0 || b.y > 1 || this.bounces) {
          this.point(this.bounces ? hitter : this.receiver);
          return;
        }
        if (this.serveBounce) {
          this.serveBounce = false;
          const remaining = Math.abs((b.targetY - b.y) / b.vy);
          b.vz = remaining * gravity * .5;
        } else {
          this.bounces++;
          b.vz = .96 + .24 * b.lift;
          b.vx += .24 * b.spin;
          b.vy *= 1 + b.lift * .12;
        }
        this.events.push("bounce");
      }
      if (incoming) this.tryReturn();
      else if (this.bounces === 1 && b.y >= .86 && Math.abs(this.cpuX - b.x) <= this.profile.reach) {
        // A rushed or heavily spun return can beat the CPU even from the centre lane.
        const pressure = Math.abs(b.spin) * .16 + Math.min(this.rally, 12) * .014;
        if (this.rally && this.random() < (.08 + pressure) / (1 + this.level)) {
          this.cpuSwing = 1;
          this.point("player");
          return;
        }
        this.rally++;
        this.bestRally = Math.max(this.rally, this.bestRally);
        const opening = this.playerX > .06 ? -1 : this.playerX < -.06 ? 1 : this.random() > .5 ? 1 : -1;
        const lane = (.46 + this.random() * .54) * this.profile.spread * opening;
        this.launch("cpu", lane, (this.random() - .5) * (.5 + this.level * .26), this.random() * .55);
      }
      if (this.phase === "flight" && this.ball === b && (b.y < -.12 || b.y > 1.12)) {
        this.point(this.bounces ? hitter : this.receiver);
      }
    }
  }
  if (typeof module !== "undefined" && module.exports) module.exports = Match;
  else window.TableTennisMatch = Match;
})();
