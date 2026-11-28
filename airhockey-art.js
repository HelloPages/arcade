/* The printed table is cached at display resolution. Only moving pieces and reflections redraw. */
(() => {
  'use strict';
  const {MALLET,PUCK,MOUTH,POST}=AirHockey;
  function createTable(canvas, art) {
    const ctx=canvas.getContext('2d',{alpha:false}), plate=document.createElement('canvas');
    const bg=plate.getContext('2d',{alpha:false});
    let w,h,dpr,short,L,wide,trail=[],rings=[],flash=0;
    const inset=5;
    function point(x,y) {
      return wide ? {x:w-inset-y*short,y:inset+x*short} : {x:inset+x*short,y:inset+y*short};
    }
    function inverse(x,y) {
      return wide ? {x:(y-inset)/short,y:(w-inset-x)/short} : {x:(x-inset)/short,y:(y-inset)/short};
    }
    function line(a,b,color,width=1) {
      bg.beginPath();bg.moveTo(a.x,a.y);bg.lineTo(b.x,b.y);bg.strokeStyle=color;bg.lineWidth=width;bg.stroke();
    }
    function arc(x,y,r,start,end,color,width) {
      bg.beginPath();bg.arc(x,y,r,start,end);bg.strokeStyle=color;bg.lineWidth=width;bg.stroke();
    }
    function paintPlate() {
      const cx=w/2,cy=h/2, r=short*.13;
      const ice=bg.createLinearGradient(0,0,w*.7,h);
      ice.addColorStop(0,'#91c9c6');ice.addColorStop(.38,'#d4ede3');ice.addColorStop(.66,'#c4e3dc');ice.addColorStop(1,'#90c9c6');
      bg.fillStyle=ice;bg.fillRect(0,0,w,h);
      // A panoramic lithograph is printed under the clear perforated playing surface.
      const scenic=document.createElement('canvas');scenic.width=plate.width;scenic.height=plate.height;
      const g=scenic.getContext('2d');g.scale(dpr,dpr);
      const band=Math.min(h*.39,w*.49), photo=art.fjord;
      const k=Math.max(w/photo.width,band/photo.height);
      g.drawImage(photo,(w-photo.width*k)/2,(band-photo.height*k)*.4,photo.width*k,photo.height*k);
      g.globalCompositeOperation='destination-in';
      const fade=g.createLinearGradient(0,0,0,band);fade.addColorStop(0,'rgba(255,255,255,.96)');fade.addColorStop(.52,'rgba(255,255,255,.76)');fade.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle=fade;g.fillRect(0,0,w,h);bg.drawImage(scenic,0,0,w,h);
      const pitch=Math.max(8,Math.round(short*.022));
      for(let y=inset+pitch;y<h-inset;y+=pitch) {
        for(let x=inset+pitch;x<w-inset;x+=pitch) {
          bg.fillStyle='rgba(36,102,109,.21)';bg.fillRect(x,y,1.25,1.25);
          bg.fillStyle='rgba(255,255,235,.57)';bg.fillRect(x,y+1.2,1.25,.9);
        }
      }
      // Fine bathymetric contours screen-printed into the ice at the lower corners.
      for(let j=0;j<11;j++) {
        bg.beginPath();
        for(let k=0;k<=60;k++){
          const t=k/60, x=t*w, height=h*(.91+.08*Math.sin(t*6.2+.7)+.045*Math.sin(t*13)) + j*3.7;
          if(k===0)bg.moveTo(x,height);else bg.lineTo(x,height);
        }
        bg.strokeStyle='rgba(40,108,113,.17)';bg.lineWidth=1;bg.stroke();
      }
      const ink='rgba(29,103,111,.53)', copper='rgba(180,86,53,.63)';
      for (const frac of [.25,.75]) {
        bg.setLineDash([4,5]);line(point(0,L*frac),point(1,L*frac),ink,1.2);bg.setLineDash([]);
      }
      line(point(0,L*.5),point(1,L*.5),copper,2);
      const centerWash=bg.createRadialGradient(cx,cy,0,cx,cy,r*1.18);
      centerWash.addColorStop(0,'#d7eade');centerWash.addColorStop(.8,'#c7e4d8');centerWash.addColorStop(1,'rgba(195,224,217,0)');
      bg.fillStyle=centerWash;bg.beginPath();bg.arc(cx,cy,r*1.19,0,Math.PI*2);bg.fill();
      arc(cx,cy,r,0,Math.PI*2,ink,2);arc(cx,cy,r*.92,0,Math.PI*2,ink,.8);
      for(let i=0;i<48;i++){
        const a=i*Math.PI/24, l=i%4===0?.10:.045;
        line({x:cx+Math.cos(a)*r*.96,y:cy+Math.sin(a)*r*.96},{x:cx+Math.cos(a)*r*(.96-l),y:cy+Math.sin(a)*r*(.96-l)},ink,1);
      }
      bg.textAlign='center';bg.fillStyle='#477e7f';
      bg.font='italic bold '+Math.round(r*.46)+'px Georgia,serif';bg.fillText('Floe',cx,cy+r*.11);
      bg.font='bold '+Math.max(8,Math.round(r*.14))+'px Trebuchet MS,sans-serif';bg.fillText('C L U B',cx,cy+r*.36);
      for(const y of [0,L]){
        const pos=point(.5,y);
        for(const radius of [.28,.32])arc(pos.x,pos.y,radius*short,0,2*Math.PI,y===0?ink:copper,radius===.28?2:1);
      }
      for(const x of [.18,.82]) for(const y of [L*.25,L*.75]) {
        const a=point(x,y);arc(a.x,a.y,short*.035,0,Math.PI*2,ink,1);
        line({x:a.x-3,y:a.y},{x:a.x+3,y:a.y},ink,1.5);
        line({x:a.x,y:a.y-3},{x:a.x,y:a.y+3},ink,1.5);
      }
      bg.strokeStyle='#234e55';bg.lineWidth=7;bg.strokeRect(2,2,w-4,h-4);
      bg.strokeStyle='#f4cf8e';bg.lineWidth=1;bg.strokeRect(4.5,4.5,w-9,h-9);
      for(const y of [0,L]){
        const a=point(MOUTH,y),b=point(1-MOUTH,y);
        line(a,b,'#143344',9);line(a,b,y===0?'#8fe5ed':'#fd9a71',3.4);
        for(const at of [a,b]){
          bg.beginPath();bg.arc(at.x,at.y,Math.max(3,short*POST),0,Math.PI*2);
          bg.fillStyle='#e7bc79';bg.fill();bg.strokeStyle='#624936';bg.lineWidth=1.7;bg.stroke();
        }
      }
    }
    function resize(){
      w=canvas.clientWidth;h=canvas.clientHeight;dpr=Math.min(2,devicePixelRatio||1);
      if (!w||!h) return L||2;
      wide=w>h;short=Math.min(w,h)-2*inset;L=(Math.max(w,h)-2*inset)/short;
      canvas.width=plate.width=Math.round(w*dpr);canvas.height=plate.height=Math.round(h*dpr);
      bg.setTransform(dpr,0,0,dpr,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);
      trail=[];rings=[];paintPlate();return L;
    }
    function sprite(b,img,r,kind,spin=0){
      const a=point(b.x,b.y), size=short*r, sw=size*2, sh=sw*img.height/img.width;
      // Align the felt base, rather than the raised mascot's forehead, with the contact circle.
      const dy=kind==='puck'?0:Math.max(inset+sh/2-a.y,-sh*.12);
      ctx.save();ctx.translate(a.x,a.y);
      ctx.fillStyle='rgba(21,62,70,.24)';ctx.beginPath();ctx.ellipse(1,3,size*1.03,size*.87,0,0,2*Math.PI);ctx.fill();
      if(spin)ctx.rotate(spin);
      ctx.drawImage(img,-sw/2,-sh/2+dy,sw,sh);
      ctx.restore();
    }
    function effect(type,s){
      if(type==='drop'){trail=[];return;}
      if(type==='hit'||type==='bank'){
        const a=point(s.puck.x,s.puck.y);rings.push({x:a.x,y:a.y,t:.20,hit:type==='hit'});
        if(rings.length>9)rings.shift();
      }
      if(type==='goal'){flash=.28;trail=[];}
    }
    function draw(s,dt,spin){
      ctx.drawImage(plate,0,0,w,h);
      const p=point(s.puck.x,s.puck.y);
      if(s.phase==='playing' && dt>0){trail.push(p);if(trail.length>7)trail.shift();}
      for(let i=1;i<trail.length;i++){
        ctx.beginPath();ctx.moveTo(trail[i-1].x,trail[i-1].y);ctx.lineTo(trail[i].x,trail[i].y);
        ctx.lineCap='round';ctx.lineWidth=short*PUCK*1.38*i/trail.length;
        ctx.strokeStyle='rgba(255,173,62,'+(.34*i/trail.length)+')';ctx.stroke();
      }
      for(const e of rings){
        e.t-=dt; if(e.t<=0)continue;
        ctx.beginPath();ctx.arc(e.x,e.y,short*(.038+(.2-e.t)*.34),0,Math.PI*2);
        ctx.lineWidth=e.hit?3:2;ctx.strokeStyle='rgba(255,250,211,'+(e.t*4)+')';ctx.stroke();
      }
      rings=rings.filter(e=>e.t>0);
      sprite(s.cpu,art.seal,MALLET,'cpu');sprite(s.player,art.otter,MALLET,'player');
      if (s.phase==='ready'||s.phase==='playing')sprite(s.puck,art.puck,PUCK,'puck',spin);
      if(flash>0){ctx.fillStyle='rgba(255,213,137,'+(flash*.6)+')';ctx.fillRect(0,0,w,h);flash=Math.max(0,flash-dt);}
    }
    return {resize,inverse,point,draw,effect,clear(){trail=[];rings=[];flash=0;},
      bounds:()=>({width:w-2*inset,height:h-2*inset,wide})};
  }
  window.createAirTable=createTable;
})();
