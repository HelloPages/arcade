/* Two-colour club print, drawn at the display's pixel density. The court and its screen tone are static. */
(() => {
  "use strict";
  const paper = "#f4e8c9", ink = "#202a31", red = "#db452e";
  function polygon(ctx, pts, fill, stroke, line = 1) {
    ctx.beginPath();
    pts.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = line; ctx.stroke(); }
  }
  function ellipse(ctx,x,y,rx,ry,color) {
    ctx.beginPath(); ctx.ellipse(x,y,Math.max(.0001,rx),Math.max(.0001,ry),0,0,Math.PI*2);
    ctx.fillStyle = color; ctx.fill();
  }
  function stroke(ctx,x,y,ex,ey,color,width=1) {
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(ex,ey); ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke();
  }
  class PrintCourt {
    constructor(canvas) {
      this.canvas=canvas; this.ctx=canvas.getContext("2d",{alpha:false});
      this.scene=document.createElement("canvas"); this.trail=[]; this.rings=[];
      this.chargeUi = null; // { x, y, power }
      this.observer=new ResizeObserver(()=>this.resize()); this.observer.observe(canvas);
      this.resize();
    }
    project(x,y,z=0) {
      const d=(1-y)/(1+.72*y);
      const half=this.w*(.41+.095*d);
      return [this.w/2+x*half,this.h*(.106+.844*d)-z*Math.min(this.h*.48,this.w*.48)*(.70+.46*d)];
    }
    unproject(clientX, clientY) {
      const r = this.canvas.getBoundingClientRect();
      const px = clientX - r.left;
      const py = clientY - r.top;
      const d = (py / this.h - .106) / .844;
      const y = (1 - d) / (1 + .72 * d);
      const half = this.w * (.41 + .095 * d);
      const x = (px - this.w / 2) / half;
      const legal = y <= .50 && y >= -.18 && Math.abs(x) <= 1.22;
      return { x, y, legal };
    }
    resize() {
      const box=this.canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const dpr=Math.min(devicePixelRatio||1,2);
      if(this.w===box.width && this.h===box.height && this.dpr===dpr)return;
      this.w=box.width; this.h=box.height; this.dpr=dpr;
      this.canvas.width=this.scene.width=Math.round(this.w*this.dpr);
      this.canvas.height=this.scene.height=Math.round(this.h*this.dpr);
      this.scene.getContext("2d").setTransform(this.dpr,0,0,this.dpr,0,0);
      this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
      this.background(); this.trail=[]; this.rings=[];
      if(this.latestMatch)this.draw(this.latestMatch,0);
      else this.ctx.drawImage(this.scene,0,0,this.w,this.h);
    }
    background() {
      const c=this.scene.getContext("2d"),w=this.w,h=this.h;
      c.fillStyle=paper;c.fillRect(0,0,w,h);
      ellipse(c,w*.24,h*.045,h*.245,h*.245,red);
      for(let i=-4;i<17;i++){
        const x=w*.46+i*w*.042;
        stroke(c,x,0,x-h*.23,h*.22,i%4===0?ink:"#506773",i%4===0?4:1.3);
      }
      c.fillStyle=ink;c.fillRect(0,h*.133,w,h*.867);
      polygon(c,[[0,h*.22],[w*.12,h*.13],[w*.01,h],[0,h]],"#344b54");
      polygon(c,[[w,h*.20],[w*.9,h*.14],[w*.995,h],[w,h]],"#344b54");
      const p=(x,y)=>this.project(x,y);
      const surface=[p(-1,1),p(1,1),p(1,0),p(-1,0)];
      polygon(c,[...surface.slice(2),[surface[3][0],h*.985],[surface[2][0],h*.985]],"#182e48");
      const blue=c.createLinearGradient(0,h*.10,0,h);
      blue.addColorStop(0,"#3c76b0");blue.addColorStop(.45,"#195594");blue.addColorStop(1,"#164787");
      polygon(c,surface,blue,paper,Math.max(2,w*.0035));
      c.save();c.clip();
      c.save();
      polygon(c,[[w*.82,0],[w,0],[w,h],[w*.31,h]],"#ffffff08");
      c.clip();
      for(let y=0;y<h;y+=7)for(let x=(y%2)*3;x<w;x+=7){c.fillStyle="#f4e8c916";c.fillRect(x,y,1.25,1.25);}
      c.restore();
      stroke(c,...p(0,1),...p(0,0),"#e1e6d9",Math.max(1.3,w*.0018));
      c.restore();
      for(let i=0;i<12;i++){
        const [x,y]=p(-1,i/12); stroke(c,x-8,y,x-3,y,"#a9a896",1.5);
      }
    }
    net(c) {
      const [lx,base]=this.project(-1.025,.5),[rx,top]=this.project(1.025,.5,.075);
      c.fillStyle="#182f48aa";c.fillRect(lx,top,rx-lx,base-top);
      for(let x=lx;x<rx;x+=Math.max(6,this.w*.009))stroke(c,x,top,x,base,"#cad6cc9c");
      for(let y=top+4;y<base;y+=4)stroke(c,lx,y,rx,y,"#cad6cc75");
      stroke(c,lx,top,rx,top,paper,Math.max(2,this.w*.002));
      for(const x of [lx,rx]){
        stroke(c,x,top-2,x,base+5,ink,5);stroke(c,x-2,top-2,x+2,top-2,red,4);
      }
    }
    paddle(c,x,y,size,angle,rival) {
      c.save(); c.translate(x,y);c.rotate(angle);c.scale(size,size);
      polygon(c,[[-.16,.48],[.17,.45],[.20,1.42],[.15,1.5],[-.16,1.49],[-.19,1.40]],"#dba76b",ink,.055);
      stroke(c,-.062,.55,-.062,1.43,"#875331",.038);stroke(c,.08,.54,.08,1.42,paper,.03);
      ellipse(c,.045,.06,.70,.82,ink);ellipse(c,.009,.005,.68,.81,"#e0a36e");
      ellipse(c,-.02,-.04,.655,.78,rival?"#263943":red);
      c.save();c.clip();
      for(let i=-5;i<=5;i++)for(let j=-6;j<=6;j++)
        ellipse(c,i*.134+(j%2)*.04,j*.13,.016,.016,rival?"#56636a":"#b23228");
      stroke(c,-.65,.43,.59,.43,rival?"#c3bda1":"#f0a56f",.034);
      c.restore();c.restore();
    }
    bounce(b) {this.rings.push({x:b.x,y:b.y,t:0,kind:"bounce"});}
    markHit(x,y) {this.rings.push({x,y,t:0,kind:"hit"});}
    markWhiff(x,y) {this.rings.push({x,y,t:0,kind:"whiff"});}
    draw(m,dt) {
      const c=this.ctx,w=this.w,h=this.h;if(!w)return;
      this.latestMatch=m;
      c.save();
      if(m.swing>.86 && m.lastContact){const k=(m.swing-.86)*6;c.translate(k,-k);}
      c.drawImage(this.scene,0,0,w,h);
      const size=Math.min(w*.125,h*.14);
      const [cx,cy]=this.project(m.cpuX,.965,.17);
      this.paddle(c,cx+size*.12,cy,size*.54,-2.65+m.cpuSwing*.95,true);
      const ball=m.phase==="flight"?m.ball:{
        x:m.server==="player"?m.playerX:m.cpuX,y:m.server==="player"?m.playerY:.92,z:.23+.02*Math.sin(m.clock*3)};
      const [bx,by]=this.project(ball.x,ball.y,ball.z),[gx,gy]=this.project(ball.x,ball.y);
      const depth=Math.max(0,1-ball.y),radius=Math.max(4,Math.min(w,h)*(.009+.007*depth));
      ellipse(c,gx+radius*.5,gy,radius*(1.15+ball.z),radius*.34,"#0c2b4888");
      const drawBall=()=>{
        if(m.phase==="flight"){
          this.trail.push([bx,by]);if(this.trail.length>5)this.trail.shift();
          this.trail.forEach(([x,y],i)=>ellipse(c,x,y,radius*(.22+i*.095),radius*(.22+i*.095),"#fff5bc48"));
        }else this.trail=[];
        ellipse(c,bx+.7,by+1,radius+1,radius+1,"#303e45");
        ellipse(c,bx,by,radius,radius,"#ffcf67");
        ellipse(c,bx-radius*.16,by-radius*.2,radius*.79,radius*.74,"#fff6ca");
        ellipse(c,bx-radius*.32,by-radius*.40,radius*.24,radius*.18,"#fff");
      };
      this.rings=this.rings.filter(r=>r.t<.42);
      for(const r of this.rings){
        r.t+=dt;
        const [x,y]=this.project(r.x,r.y);
        if(r.kind==="whiff"){
          const a=Math.max(0,1-r.t/.42);
          c.strokeStyle=`rgba(255,95,86,${a})`; c.lineWidth=2.6;
          c.beginPath(); c.moveTo(x-9,y-9); c.lineTo(x+9,y+9); c.moveTo(x+9,y-9); c.lineTo(x-9,y+9); c.stroke();
        } else if(r.kind==="hit"){
          const a=Math.max(0,1-r.t/.36);
          c.strokeStyle=`rgba(110,255,175,${a})`; c.lineWidth=2.5;
          c.beginPath(); c.ellipse(x,y,8+r.t*65,4+r.t*26,0,0,2*Math.PI); c.stroke();
        } else {
          c.strokeStyle="rgba(255,234,167,"+Math.max(0,1-r.t/.37)+")";c.lineWidth=2;c.beginPath();
          c.ellipse(x,y,5+r.t*70,2+r.t*21,0,0,2*Math.PI);c.stroke();
        }
      }
      if(ball.y>.5)drawBall();
      this.net(c);

      // 球拍直接對位到玩家點擊的 (playerX, playerY)
      const [px,py]=this.project(m.playerX, m.playerY, .11);
      const pScale = .72 + (1 - Math.min(.5, Math.max(0, m.playerY))) * .24;
      this.paddle(c, px + size*.18, py, size * pScale, .46 - m.swing * 1.15, false);

      // 即時虛擬力道回饋條（依按壓時間＋短滑動映射）
      if (this.chargeUi) {
        const [tx, ty] = this.project(this.chargeUi.x, this.chargeUi.y, 0);
        const pwr = this.chargeUi.power;
        const pct = Math.min(1, Math.max(0, (pwr - .2) / 1.15));
        const over = pwr > 1.02;
        c.save();
        c.strokeStyle = over ? "#ff5a52" : pwr > .8 ? "#fbbf24" : "#4ade80";
        c.lineWidth = 2.4;
        c.beginPath(); c.ellipse(tx, ty, 18, 9, 0, 0, Math.PI * 2); c.stroke();
        const bw = 54, bh = 7, bx0 = Math.max(8, Math.min(w - bw - 8, tx - bw / 2)), by0 = Math.max(16, ty - 34);
        c.fillStyle = "rgba(18, 28, 38, 0.82)";
        c.fillRect(bx0 - 1, by0 - 1, bw + 2, bh + 2);
        c.fillStyle = over ? "#ef4444" : pwr > .8 ? "#f59e0b" : "#22c55e";
        c.fillRect(bx0, by0, bw * pct, bh);
        c.restore();
      }

      if(ball.y<=.5)drawBall();
      c.restore();
    }
  }
  window.PrintCourt=PrintCourt;
})();
