/* Coordinates: x is across the table (-1..1), y runs from the player (0) to the CPU (1). */
(() => {
  "use strict";
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const profiles = [
    { pace: 1.02, cpuStep: 1.35, reach: .33, spread: .55, delay: .30, hitX: .30, hitY: .26 },
    { pace: 1.20, cpuStep: 1.72, reach: .34, spread: .72, delay: .22, hitX: .27, hitY: .24 },
    { pace: 1.40, cpuStep: 2.22, reach: .35, spread: .85, delay: .14, hitX: .24, hitY: .21 }
  ];
  const gravity = 2.85;

  class Match {
    constructor(level = 1, random = Math.random) {
      this.random = random;
      this.level = [0, 1, 2].includes(level) ? level : 1;
      this.player = this.cpu = this.rally = this.bestRally = 0;
      this.playerX = this.cpuX = this.aim = this.clock = this.swing = this.cpuSwing = 0;
      this.playerY = .06;
      this.phase = "ready";
      this.server = this.receiver = "player";
      this.events = [];
      this.ball = { x: 0, y: .06, z: .19 };
      this.queued = null;
      this.pointTime = 0;
      this.lastShot = "drive";
      this.lastMissReason = "";
      this.lastContact = null;
      this.lastWhiff = null;
    }
    get profile() { return profiles[this.level]; }

    setPaddlePos(x, y) {
      this.playerX = clamp(x, -1.08, 1.08);
      this.playerY = clamp(y, -.08, .48);
      this.aim = clamp(x, -1, 1);
    }

    action(tapX = this.playerX, tapY = this.playerY, spin = 0, lift = 0, power = .62) {
      const px = clamp(tapX, -1.08, 1.08);
      const py = clamp(tapY, -.08, .48);
      const pwr = clamp(power, .20, 1.45);
      this.lastMissReason = "";

      if (this.phase === "ready") {
        this.rally = 0;
        this.phase = "flight";
        if (this.server === "cpu") {
          this.launch("cpu", (this.random() - .5) * 1.12, .16, .08, true, .62);
        } else {
          this.playerX = clamp(px, -.94, .94);
          this.playerY = clamp(py, .02, .42);
          this.aim = clamp(this.playerX, -1, 1);
          const serveTargetX = clamp(this.playerX * .72 + spin * .55, -1.15, 1.15);
          this.lastContact = { x: this.playerX, y: this.playerY, tapX: this.playerX, tapY: this.playerY, power: pwr, serve: true };
          this.launch("player", serveTargetX, spin, lift, true, pwr);
        }
        return true;
      }

      if (this.phase === "flight" && this.receiver === "player") {
        this.playerX = px;
        this.playerY = py;
        this.aim = clamp(px, -1, 1);
        this.swing = 1;

        // 嚴格時機檢查：球尚未在我方桌面彈起就揮拍 → 太早揮拍（不排隊自動等球！）
        if (this.bounces === 0) {
          this.queued = null;
          this.lastMissReason = "early";
          this.lastWhiff = { x: px, y: py, reason: "early", t: this.clock };
          this.events.push("whiff");
          return false;
        }
        // 球已飛過擊球點後方太多 → 太晚揮拍
        if (this.ball.y < py - this.profile.hitY - .08) {
          this.queued = null;
          this.lastMissReason = "late";
          this.lastWhiff = { x: px, y: py, reason: "late", t: this.clock };
          this.events.push("whiff");
          return false;
        }

        // 短暫真實揮拍接觸窗（0.11s），球必須真正進入所點位置才可回擊
        this.queued = { tapX: px, tapY: py, spin, lift, power: pwr, until: this.clock + .11 };
        const hit = this.tryReturn();
        if (!hit) {
          const dx = Math.abs(px - this.ball.x);
          const dy = Math.abs(py - this.ball.y);
          this.lastMissReason = (dx > this.profile.hitX || dy > this.profile.hitY) ? "position" : "timing";
          this.lastWhiff = { x: px, y: py, reason: this.lastMissReason, t: this.clock };
          this.events.push("whiff");
        }
        return hit;
      }
      return false;
    }

    launch(side, targetX, spin, lift, serve = false, power = .62) {
      const dir = side === "player" ? 1 : -1;
      this.receiver = dir === 1 ? "cpu" : "player";
      this.bounces = 0;
      this.serveBounce = serve;
      this.age = 0;
      this.queued = null;
      const pwr = clamp(power, .20, 1.45);
      const pace = (this.profile.pace + Math.min(this.rally, 12) * .022) * (dir === 1 ? (.78 + pwr * .38) : 1);
      // 球必須從實際接觸點擊出（發球由玩家所點發球點出發；回擊由實際撞球點出發）
      const x = serve ? (dir === 1 ? this.playerX : this.cpuX) : this.ball.x;
      const y = serve ? (dir === 1 ? this.playerY : .955) : this.ball.y;
      const z = serve ? .22 : clamp(this.ball.z, .12, .38);

      // 虛擬力道映射落點：一般力道 (<=1.02) 落在對手桌內；用力過頭 (>1.02) 會飛過對手底線出界！
      let targetY;
      if (dir === 1) {
        if (serve) {
          targetY = pwr <= 1.12 ? (.64 + pwr * .26) : (.93 + (pwr - 1.12) * .95);
        } else {
          targetY = pwr <= 1.02 ? (.58 + pwr * .37) : (.957 + (pwr - 1.02) * .92);
        }
      } else {
        targetY = .24;
      }

      const duration = Math.max(.26, Math.abs(targetY - y) / pace + (serve ? .12 : .10 * lift));
      const ax = clamp(spin, -1, 1) * 1.75;
      const endX = dir === 1 ? clamp(targetX, -1.28, 1.28) : clamp(targetX, -.83, .83);
      const t = serve ? duration * .30 : duration;

      this.ball = {
        x, y, z,
        vx: (endX - x) / duration - .5 * ax * duration,
        vy: (targetY - y) / duration,
        vz: (.5 * gravity * t * t - z) / t,
        ax, spin, lift, power: pwr,
        startX: x, startY: y,
        targetX: endX, targetY, duration
      };
      this.lastShot = pwr > 1.05 ? "overpower" : Math.abs(spin) > .24 ? "hook" : lift > .27 ? "loop" : "drive";
      if (dir === 1) this.swing = 1;
      else this.cpuSwing = 1;
      this.events.push(serve ? "serve" : this.lastShot);
    }

    tryReturn() {
      if (!this.queued || this.clock > this.queued.until) {
        this.queued = null;
        return false;
      }
      if (this.bounces !== 1 || this.ball.y > .50 || this.ball.y < -.10 || this.ball.z > .50) return false;
      const { tapX, tapY, spin, lift, power } = this.queued;
      if (Math.abs(tapX - this.ball.x) > this.profile.hitX || Math.abs(tapY - this.ball.y) > this.profile.hitY) return false;

      this.rally++;
      this.bestRally = Math.max(this.rally, this.bestRally);
      this.lastMissReason = "";
      this.lastContact = { x: this.ball.x, y: this.ball.y, tapX, tapY, power, serve: false };
      const targetX = clamp(this.ball.x * .62 + spin * .68 + (tapX - this.ball.x) * .8, -1.25, 1.25);
      this.launch("player", targetX, spin, lift, false, power);
      return true;
    }

    point(side, reason = "") {
      this[side]++;
      this.winner = side;
      if (reason) this.lastMissReason = reason;
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
      if (this.queued && this.clock > this.queued.until) this.queued = null;
      if (this.phase === "point" && (this.pointTime += dt) >= .86) this.phase = "ready";
      const flying = this.phase === "flight";
      const incoming = flying && this.receiver === "player";

      // 禁止任何難度自動瞬移跟球作弊：球拍維持在玩家實際移動／點擊位置
      const defending = flying && !incoming && this.age > this.profile.delay;
      const cpuTarget = defending ? clamp(this.ball.x + this.ball.vx * .09, -.92, .92) : this.cpuX * .97;
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
      // 觸網判定
      if ((prevY - .5) * (b.y - .5) <= 0 && b.z < .055) {
        this.point(this.receiver, "net");
        return;
      }
      // 落地／落桌判定
      if (b.z <= 0 && b.vz < 0) {
        b.z = 0;
        const onTable = Math.abs(b.x) <= 1 && b.y >= 0 && b.y <= 1;
        const onCorrectHalf = this.serveBounce
          ? (hitter === "player" ? b.y <= .5 : b.y >= .5)
          : (this.receiver === "cpu" ? b.y >= .5 : b.y <= .5);

        if (!onTable || !onCorrectHalf || this.bounces) {
          if (this.bounces) {
            // 兩跳未接 → 接球方失分（擊球方得分）
            this.point(hitter, incoming ? "missed" : "winner");
          } else {
            // 首跳出界或沒落在對手桌面 → 擊球方失分（接球方得分）
            this.point(this.receiver, "out");
          }
          return;
        }
        if (this.serveBounce) {
          this.serveBounce = false;
          const remaining = Math.max(.18, Math.abs((b.targetY - b.y) / b.vy));
          b.vz = remaining * gravity * .5;
        } else {
          this.bounces++;
          b.vz = .96 + .22 * b.lift;
          b.vx += .22 * b.spin;
          b.vy *= 1 + b.lift * .10;
        }
        this.events.push("bounce");
      }

      if (incoming) {
        this.tryReturn();
      } else if (this.bounces === 1 && b.y >= .86 && Math.abs(this.cpuX - b.x) <= this.profile.reach) {
        const pressure = Math.abs(b.spin) * .16 + Math.min(this.rally, 12) * .014 + Math.max(0, (b.power || .6) - .75) * .15;
        if (this.rally && this.random() < (.08 + pressure) / (1 + this.level)) {
          this.cpuSwing = 1;
          this.point("player", "winner");
          return;
        }
        this.rally++;
        this.bestRally = Math.max(this.rally, this.bestRally);
        const opening = this.playerX > .06 ? -1 : this.playerX < -.06 ? 1 : this.random() > .5 ? 1 : -1;
        const lane = (.46 + this.random() * .54) * this.profile.spread * opening;
        this.launch("cpu", lane, (this.random() - .5) * (.5 + this.level * .26), this.random() * .50, false, .65);
      }

      // 飛離球桌邊界
      if (this.phase === "flight" && this.ball === b && (b.y < -.16 || b.y > 1.16 || Math.abs(b.x) > 1.35)) {
        if (this.bounces) {
          this.point(hitter, incoming ? "missed" : "winner");
        } else {
          this.point(this.receiver, "out");
        }
      }
    }
  }
  if (typeof module !== "undefined" && module.exports) module.exports = Match;
  else window.TableTennisMatch = Match;
})();
