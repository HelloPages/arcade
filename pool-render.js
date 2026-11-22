(() => {
  'use strict';

  const { RADIUS, firstContact } = window.PoolEngine;
  const finishes = [
    ['#fff9e9', '#e2d1a7', '#5d4d37'], ['#ffdc60', '#ce8d08', '#674006'], ['#5daaf6', '#215193', '#102145'],
    ['#ff7953', '#ba3828', '#4b1710'], ['#bc8cef', '#744aab', '#2b1c45'], ['#ffbd69', '#da681f', '#5b2a0c'],
    ['#7fd58b', '#30794d', '#183428'], ['#808487', '#2e3337', '#101212'],
  ];

  const makeCanvas = () => document.createElement('canvas');
  function rounded(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }

  function rng(seed) {
    return () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function grain(type) {
    const canvas = makeCanvas();
    const size = 256;
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const pixels = ctx.createImageData(size, size);
    const random = rng(type === 'felt' ? 7901 : 1746);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = (y * size + x) * 4;
        const noise = random();
        const fiber = type === 'felt' ? Math.sin((x + y) * 1.7) * 0.14 + noise * 0.85
          : Math.sin(y * 0.43 + 3 * Math.sin(x * 0.025) + Math.sin(y * 0.12 + x * 0.013) * 2.4) * 0.36
            + Math.sin(y * 1.9 + x * 0.029) * 0.14 + noise * 0.24 + 0.38;
        pixels.data[index] = fiber > 0.49 ? 242 : 12;
        pixels.data[index + 1] = fiber > 0.49 ? 222 : 9;
        pixels.data[index + 2] = fiber > 0.49 ? 183 : 5;
        pixels.data[index + 3] = Math.abs(fiber - 0.49) * (type === 'felt' ? 45 : 122);
      }
    }
    ctx.putImageData(pixels, 0, 0);
    return canvas;
  }

  function ballSprite(id) {
    const canvas = makeCanvas();
    canvas.width = canvas.height = 112;
    const ctx = canvas.getContext('2d');
    const [light, mid, dark] = finishes[id];
    const diffuse = ctx.createRadialGradient(37, 27, 3, 56, 55, 57);
    diffuse.addColorStop(0, light);
    diffuse.addColorStop(0.58, mid);
    diffuse.addColorStop(0.94, dark);
    diffuse.addColorStop(1, '#281d14');
    ctx.fillStyle = diffuse;
    circle(ctx, 56, 56, 52);
    ctx.fill();
    if (id) {
      ctx.save();
      ctx.translate(55, 58);
      ctx.rotate(-0.14);
      const ivory = ctx.createLinearGradient(-8, -20, 9, 21);
      ivory.addColorStop(0, '#fff9e0');
      ivory.addColorStop(1, '#c6ac82');
      ctx.fillStyle = ivory;
      circle(ctx, 0, 0, 22);
      ctx.fill();
      ctx.strokeStyle = '#74634d72';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = '#242019';
      ctx.font = '700 33px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(id, 0, 2);
      if (id === 6) ctx.fillRect(-7, 16, 14, 1.3);
      ctx.restore();
    }
    const shine = ctx.createRadialGradient(36, 25, 1, 36, 25, 22);
    shine.addColorStop(0, '#ffffffdf');
    shine.addColorStop(0.34, '#ffffff8c');
    shine.addColorStop(1, '#ffffff00');
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.ellipse(36, 25, 22, 15, -0.45, 0, Math.PI * 2);
    ctx.fill();
    return canvas;
  }

  class Renderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false });
      this.board = makeCanvas();
      this.wood = grain('wood');
      this.felt = grain('felt');
      this.sprites = finishes.map((_, id) => ballSprite(id));
      this.effects = [];
    }

    resize(rect, world, dpr) {
      this.rect = rect;
      this.world = world;
      this.scale = rect.width / world.width;
      this.dpr = dpr;
      this.board.width = this.canvas.width;
      this.board.height = this.canvas.height;
      this.paintBoard();
    }

    paintBoard() {
      const ctx = this.board.getContext('2d');
      const { x, y, width: w, height: h } = this.rect;
      const W = this.board.width / this.dpr;
      const H = this.board.height / this.dpr;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.fillStyle = '#382116';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = ctx.createPattern(this.wood, 'repeat');
      ctx.fillRect(0, 0, W, H);

      const woodTone = ctx.createLinearGradient(0, y - 16, 0, H - y);
      woodTone.addColorStop(0, '#7b4628');
      woodTone.addColorStop(0.29, '#4c2c1e');
      woodTone.addColorStop(0.68, '#643d25');
      woodTone.addColorStop(1, '#3d2419');
      rounded(ctx, x - 10, y - 11, w + 20, h + 22, 9);
      ctx.fillStyle = woodTone;
      ctx.fill();
      ctx.fillStyle = ctx.createPattern(this.wood, 'repeat');
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#a17048';
      ctx.stroke();
      rounded(ctx, x - 7, y - 8, w + 14, h + 16, 7);
      ctx.strokeStyle = '#3b2015';
      ctx.stroke();

      const lit = ctx.createRadialGradient(x + w * 0.44, y + h * 0.36, 0, x + w * 0.49, y + h * 0.48, Math.max(w, h) * 0.73);
      lit.addColorStop(0, '#3f7954');
      lit.addColorStop(0.52, '#2b6347');
      lit.addColorStop(1, '#164032');
      rounded(ctx, x, y, w, h, 5);
      ctx.fillStyle = lit;
      ctx.fill();
      ctx.fillStyle = ctx.createPattern(this.felt, 'repeat');
      ctx.fill();
      const horizontalShadow = ctx.createLinearGradient(x, 0, x + w, 0);
      horizontalShadow.addColorStop(0, '#08271b70');
      horizontalShadow.addColorStop(0.043, '#072a1b00');
      horizontalShadow.addColorStop(0.957, '#072a1b00');
      horizontalShadow.addColorStop(1, '#08271b70');
      ctx.fillStyle = horizontalShadow;
      ctx.fill();

      const s = this.scale;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      for (const rail of this.world.rails) this.paintRail(ctx, rail);
      for (const pocket of this.world.pockets) this.paintPocket(ctx, pocket);
      const vertical = this.world.vertical;
      const span = vertical ? this.world.height : this.world.width;
      const cross = vertical ? this.world.width : this.world.height;
      const head = span * (vertical ? 0.77 : 0.23);
      ctx.strokeStyle = '#ddcda744';
      ctx.lineWidth = 1.1;
      ctx.setLineDash([3, 7]);
      ctx.beginPath();
      ctx.moveTo(vertical ? 34 : head, vertical ? head : 34);
      ctx.lineTo(vertical ? cross - 34 : head, vertical ? head : cross - 34);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#e3d5ab91';
      for (const depth of [0.32, 0.77]) {
        circle(ctx, this.world.width * (vertical ? 0.5 : 1 - depth), this.world.height * (vertical ? depth : 0.5), 2.4);
        ctx.fill();
      }
      ctx.restore();
    }

    paintRail(ctx, rail) {
      ctx.save();
      if (rail.axis === 'y') ctx.transform(0, 1, 1, 0, 0, 0);
      ctx.translate(0, rail.wall);
      ctx.scale(1, rail.sign);
      const railColor = ctx.createLinearGradient(0, -10, 0, 3);
      railColor.addColorStop(0, '#15362b');
      railColor.addColorStop(0.35, '#65835a');
      railColor.addColorStop(0.67, '#254d37');
      railColor.addColorStop(1, '#0e3123');
      ctx.fillStyle = railColor;
      ctx.beginPath();
      ctx.moveTo(rail.start - 6, -11);
      ctx.lineTo(rail.end + 6, -11);
      ctx.lineTo(rail.end, 0);
      ctx.lineTo(rail.start, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d0ae6f';
      const ticks = rail.end - rail.start > 315 ? 4 : 2;
      for (let index = 1; index <= ticks; index++) {
        const x = rail.start + (rail.end - rail.start) * index / (ticks + 1);
        ctx.beginPath();
        ctx.moveTo(x - 4, -18); ctx.lineTo(x, -20); ctx.lineTo(x + 4, -18); ctx.lineTo(x, -16);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    paintPocket(ctx, pocket) {
      const { x, y, size } = pocket;
      const brass = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
      brass.addColorStop(0, '#493117');
      brass.addColorStop(0.35, '#eac588');
      brass.addColorStop(0.57, '#8f6438');
      brass.addColorStop(0.86, '#dab17a');
      brass.addColorStop(1, '#321f12');
      ctx.fillStyle = brass;
      circle(ctx, x, y, size + 1);
      ctx.fill();
      const leather = ctx.createRadialGradient(x + 2, y + 5, 1, x, y, size - 2);
      leather.addColorStop(0, '#090e0a');
      leather.addColorStop(0.67, '#10100e');
      leather.addColorStop(1, '#503821');
      ctx.fillStyle = leather;
      circle(ctx, x, y, size - 2.6);
      ctx.fill();
      ctx.strokeStyle = '#e5bd7c68';
      ctx.lineWidth = 0.85;
      circle(ctx, x, y, size - 0.8);
      ctx.stroke();
    }

    line(ctx, start, end, color, width, dashes = []) {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.setLineDash(dashes);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawAim(match, power, pulling) {
      const ctx = this.ctx;
      const { cue, angle, table, phase } = match;
      const player = phase === 'aim';
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const ray = (length, origin = cue) => ({ x: origin.x + dx * length, y: origin.y + dy * length });
      const sides = [dx > 0 ? (table.width - RADIUS - cue.x) / dx : (RADIUS - cue.x) / dx,
        dy > 0 ? (table.height - RADIUS - cue.y) / dy : (RADIUS - cue.y) / dy];
      const travel = Math.min(...sides.filter(value => Number.isFinite(value) && value >= 0));
      const contact = firstContact(cue, angle, match.balls);
      if (player) {
        const hit = contact && contact.time <= travel + 0.1 ? contact : null;
        this.line(ctx, ray(RADIUS + 4), hit?.ghost || ray(Math.min(travel, 380)), '#e4eee5d4', 1.85, [7, 6]);
        if (hit) {
          circle(ctx, hit.ghost.x, hit.ghost.y, RADIUS - 0.5);
          ctx.strokeStyle = '#fcf4d6cc';
          ctx.lineWidth = 1.6;
          ctx.stroke();
          this.line(ctx, { x: hit.target.x + hit.aim.x * (RADIUS + 3), y: hit.target.y + hit.aim.y * (RADIUS + 3) },
            { x: hit.target.x + hit.aim.x * 135, y: hit.target.y + hit.aim.y * 135 }, '#f4cb7bd0', 2.2, [5, 6]);
        }
      } else if (contact) {
        const radius = RADIUS + 4 + 2 * Math.sin(match.clock * 12);
        circle(ctx, contact.target.x, contact.target.y, radius);
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = '#efb472ca';
        ctx.stroke();
      }

      const pull = player ? (pulling ? power * 27 : 0) : Math.sin(Math.PI * Math.min(1, match.clock / match.cpuWait)) * 24;
      ctx.save();
      ctx.translate(cue.x, cue.y);
      ctx.rotate(angle);
      const tip = -RADIUS - 7 - pull;
      const butt = tip - 234;
      const shaft = ctx.createLinearGradient(0, -6, 0, 6);
      shaft.addColorStop(0, '#674122');
      shaft.addColorStop(0.36, '#f2d49d');
      shaft.addColorStop(0.51, '#e9bc78');
      shaft.addColorStop(1, '#69401f');
      ctx.fillStyle = '#0a211b76';
      ctx.fillRect(butt, 2, 235, 6);
      ctx.fillStyle = shaft;
      ctx.beginPath();
      ctx.moveTo(butt, -6); ctx.lineTo(tip - 2, -2.5); ctx.lineTo(tip - 2, 2.5); ctx.lineTo(butt, 6);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#482019';
      ctx.fillRect(butt + 5, -5.4, 64, 10.8);
      ctx.fillStyle = '#dcb87d';
      ctx.fillRect(butt + 12, -5.7, 2, 11.4);
      ctx.fillRect(butt + 63, -5.4, 2, 10.8);
      ctx.fillStyle = '#e8d8bc'; ctx.fillRect(tip - 10, -2.6, 7, 5.2);
      ctx.fillStyle = '#456b70'; ctx.fillRect(tip - 3, -2.8, 3, 5.6);
      ctx.restore();
    }

    effect(kind, point) {
      this.effects.push({ kind, x: point.x, y: point.y, age: 0 });
    }

    draw(match, power, pulling, placement, dt) {
      const ctx = this.ctx;
      const { x, y, width, height } = this.rect;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(this.board, 0, 0);
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 9, y - 12, width + 18, height + 24);
      ctx.clip();
      ctx.translate(x, y);
      ctx.scale(this.scale, this.scale);
      if (match.cue.inPlay && (match.phase === 'aim' || match.phase === 'cpu')) this.drawAim(match, power, pulling);
      for (const b of match.balls) {
        if (!b.inPlay) continue;
        const shadow = ctx.createRadialGradient(b.x + 3, b.y + 5, RADIUS * 0.43, b.x + 3, b.y + 5, RADIUS * 1.38);
        shadow.addColorStop(0, '#0b2119ca');
        shadow.addColorStop(1, '#081e1600');
        ctx.fillStyle = shadow;
        circle(ctx, b.x + 3, b.y + 5, RADIUS * 1.38);
        ctx.fill();
        const size = RADIUS * 2.15;
        ctx.drawImage(this.sprites[b.id], b.x - size / 2, b.y - size / 2, size, size);
      }
      if (placement && match.ballInHand) {
        ctx.globalAlpha = match.canPlace(placement) ? 0.85 : 0.32;
        ctx.drawImage(this.sprites[0], placement.x - RADIUS, placement.y - RADIUS, RADIUS * 2, RADIUS * 2);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = match.canPlace(placement) ? '#e0f8dd' : '#ffa69a';
        ctx.lineWidth = 1.5;
        circle(ctx, placement.x, placement.y, RADIUS + 3);
        ctx.stroke();
      }
      this.effects = this.effects.filter(effect => effect.age < 0.38);
      for (const effect of this.effects) {
        effect.age += dt;
        const progress = Math.min(1, effect.age / 0.38);
        ctx.strokeStyle = effect.kind === 'pocket' ? `rgba(249,205,122,${1 - progress})` : `rgba(255,246,207,${0.54 * (1 - progress)})`;
        ctx.lineWidth = 2.5 * (1 - progress);
        circle(ctx, effect.x, effect.y, (effect.kind === 'pocket' ? 21 : 13) + progress * 21);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  window.PoolRenderer = Renderer;
})();
