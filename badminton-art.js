(() => {
  'use strict';
  globalThis.mapleRenderer = canvas => {
    const ctx=canvas.getContext('2d',{alpha:false}), backdrop=document.createElement('canvas');
    let width=0,height=0,portrait=false,scale=1,trail=[],lastEvent=-1;
    const path=(brush,points,fill,stroke,weight=1)=>{brush.beginPath();points.forEach(([left,top],index)=>index?brush.lineTo(left,top):brush.moveTo(left,top));if(fill){brush.closePath();brush.fillStyle=fill;brush.fill();}if(stroke){brush.strokeStyle=stroke;brush.lineWidth=weight;brush.stroke();}};
    const ellipse=(brush,left,top,rx,ry,color)=>{brush.beginPath();brush.ellipse(left,top,rx,ry,0,0,Math.PI*2);brush.fillStyle=color;brush.fill();};
    function position(depth,alt=0,lane=0){
      if(portrait){const near=1-depth;return [width*(.54-.09*near+lane*(.32+.2*near)),height*(.205+.745*near)-alt*height*(.18+.24*near)];}
      return [width*(.015+.97*depth)+lane*width*.04,height*(.86+lane*.085)-alt*height*1.02];
    }
    function drawHall(){
      const brush=backdrop.getContext('2d');brush.setTransform(scale,0,0,scale,0,0);
      const floorY=height*(portrait?.17:.65),rim=Math.max(4,width*.006);
      const sky=brush.createLinearGradient(0,0,0,floorY);sky.addColorStop(0,'#35574b');sky.addColorStop(.3,'#779487');sky.addColorStop(1,'#e0cfa2');brush.fillStyle=sky;brush.fillRect(0,0,width,height);
      const bays=portrait?4:9,span=width/bays;
      for(let bay=0;bay<=bays;bay++){
        const left=bay*span;
        brush.fillStyle='#e6d9a9';brush.fillRect(left+rim,floorY*.14,span-rim*1.8,floorY*.58);
        brush.fillStyle='#b8d9ca';brush.fillRect(left+rim,floorY*.18,span-rim*1.8,floorY*.37);
        path(brush,[[left+rim,floorY*.55],[left+span*.28,floorY*.42],[left+span*.48,floorY*.49],[left+span*.7,floorY*.34],[left+span-rim,floorY*.52],[left+span-rim,floorY*.65],[left+rim,floorY*.65]],'#89a597');
        brush.fillStyle='#567669';brush.fillRect(left+span*.48,floorY*.14,rim*.5,floorY*.59);brush.fillRect(left+rim,floorY*.49,span-rim*2,rim*.48);
        path(brush,[[left-rim,0],[left+span*.52,floorY*.13],[left+span,0]],null,'#594f38',rim);brush.fillStyle='#835d3c';brush.fillRect(left,floorY*.12,rim,floorY*.88);
      }
      brush.fillStyle='#9c7047';brush.fillRect(0,floorY*.76,width,floorY*.23);
      for(let row=0;row<3;row++){brush.fillStyle=row%2?'#c59256':'#deb27a';brush.fillRect(0,floorY*(.78+row*.073),width,floorY*.035);}
      const wood=brush.createLinearGradient(0,floorY,0,height);wood.addColorStop(0,'#c19764');wood.addColorStop(1,'#e7bd7a');brush.fillStyle=wood;brush.fillRect(0,floorY,width,height-floorY);
      for(let row=0;row<30;row++){const top=floorY+(height-floorY)*(row/30)**1.5;path(brush,[[0,top],[width,top+(row%2)]],null,'#aa80544a');for(let joint=row%3;joint<12;joint+=3)path(brush,[[joint*width/11,top],[joint*width/11,top+5]],null,'#976a424a');}
      const court=(a,b,c,d,color)=>path(brush,[position(a,0,c),position(b,0,c),position(b,0,d),position(a,0,d)],color);
      court(-.03,1.03,-1.14,1.14,'#376d63');court(.015,.985,-1,1,'#467f70');
      for(const depth of [.02,.09,.345,.5,.655,.91,.98])path(brush,[position(depth,0,-1),position(depth,0,1)],null,'#efe6bc',2);
      for(const lane of [-1,-.86,.86,1])path(brush,[position(.02,0,lane),position(.98,0,lane)],null,'#efe6bc',2);
      for(const range of [[.02,.345],[.655,.98]])path(brush,[position(range[0]),position(range[1])],null,'#efe6bc',1.5);
      for(let beam=0;beam<3;beam++){const left=width*(beam*.47-.18);path(brush,[[left,floorY*.71],[left+width*.105,floorY*.71],[left+width*.48,height],[left+width*.26,height]],'#fff4c818');}
      const signW=portrait?87:136,signH=portrait?24:39;brush.fillStyle='#193f35';brush.fillRect(width-signW-12,10,signW,signH);brush.fillStyle='#f6dfa4';brush.font=`bold ${portrait?10:15}px Georgia`;brush.textAlign='center';brush.fillText('MAPLE HALL',width-signW/2-12,10+signH*.65);
    }
    function resize(){width=canvas.clientWidth;height=canvas.clientHeight;portrait=height>width*1.13;scale=Math.min(devicePixelRatio||1,2);canvas.width=backdrop.width=Math.round(width*scale);canvas.height=backdrop.height=Math.round(height*scale);trail=[];drawHall();}
    function mesh(){const poles=[-1.04,1.04];for(let row=0;row<=6;row++)path(ctx,poles.map(lane=>position(.5,.13+row*.0225,lane)),null,row===6?'#fff1cb':'#38564a99',row===6?3:1);for(let col=0;col<=32;col++){const lane=-1.04+col*2.08/32;path(ctx,[position(.5,.13,lane),position(.5,.265,lane)],null,'#314a4199');}for(const lane of poles)path(ctx,[position(.5,0,lane),position(.5,.28,lane)],null,'#47534c',3);}
    function person(who,side,clock){
      const [footX,footY]=position(who.x,0,side?.14:-.14),unit=portrait?Math.min(width*.185,height*(.124-.055*who.x)):Math.min(width*.13,height*.247);
      const swing=Math.sin(Math.PI*Math.min(1,who.anim/(who.pose==='dive'?.46:.34))),stride=Math.abs(who.target-who.x)>.014?Math.sin(clock*15)*.17:0;
      const jump=who.pose==='smash'?unit*swing*.42:0,lean=who.pose==='dive'?swing*.59:swing*.09;
      ellipse(ctx,footX,footY+1,unit*.28,unit*.055,'#163b3955');ctx.save();ctx.translate(footX,footY-jump);ctx.scale(unit*(side?-1:1),unit);ctx.rotate(lean);
      const ink='#273c37',skin=side?'#ba7953':'#e1a276',jersey=side?'#a6463e':'#17645e',trim=side?'#ffcf76':'#e3ce6d';
      const limb=(coords,color,weight)=>{ctx.lineCap='round';ctx.lineJoin='round';path(ctx,coords,null,ink,weight+.026);path(ctx,coords,null,color,weight);};
      const shoe=(left,top)=>{path(ctx,[[left-.08,top-.052],[left+.04,top-.047],[left+.13,top],[left+.135,top+.025],[left-.084,top+.025]],'#f5e5b8',ink,.019);};
      limb([[-.09,-.43],[-.17-stride,-.23],[-.27-stride,-.033]],skin,.09);shoe(-.25-stride,-.03);
      limb([[.07,-.43],[.2+stride,-.27],[.125+stride,-.035]],skin,.095);shoe(.13+stride,-.03);
      limb([[-.12,-.71],[-.24,-.52],[-.11,-.47]],skin,.065);
      path(ctx,[[-.13,-.53],[.11,-.55],[.16,-.38],[.025,-.36],[-.015,-.41],[-.075,-.35],[-.2,-.38]],'#253f49',ink,.025);
      path(ctx,[[-.08,-.80],[.064,-.80],[.158,-.7],[.11,-.50],[-.15,-.495],[-.17,-.69]],jersey,ink,.024);
      path(ctx,[[-.16,-.67],[.118,-.75],[.148,-.7],[-.14,-.60]],trim);
      ellipse(ctx,.02,-.88,.113,.132,skin);path(ctx,[[-.105,-.87],[-.13,-.99],[-.055,-1.046],[.075,-1.04],[.16,-.982],[.09,-.951],[-.014,-.968],[-.063,-.873]],ink);path(ctx,[[-.09,-.94],[.119,-.954]],null,trim,.028);ellipse(ctx,.097,-.895,.014,.012,ink);
      const hand=[.30+swing*.13,-.68-swing*.24];limb([[.105,-.725],[.22,-.57-swing*.1],hand],skin,.072);
      ctx.translate(...hand);ctx.rotate(-.30+swing*(who.pose==='smash'?1.98:1.35));path(ctx,[[0,.035],[.042,-.27]],null,ink,.027);ctx.translate(.065,-.385);ctx.rotate(.17);ctx.beginPath();ctx.ellipse(0,0,.096,.146,0,0,Math.PI*2);ctx.fillStyle='#f6edce96';ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=.022;ctx.stroke();for(let strand=-1;strand<=1;strand++){path(ctx,[[strand*.045,-.11],[strand*.045,.11]],null,'#687f72',.009);path(ctx,[[-.08,strand*.055],[.08,strand*.055]],null,'#687f72',.009);}ctx.restore();
    }
    function shuttle(ball){const [left,top]=position(ball.x,ball.z);const future=position(ball.x+ball.vx*.008,ball.z+ball.vz*.008);ctx.save();ctx.translate(left,top);ctx.rotate(Math.atan2(future[1]-top,future[0]-left));const size=portrait?1:1.25;ctx.scale(size,size);path(ctx,[[2,-2],[-9,-5],[-11,-3],[-11,3],[-9,5],[2,2]],'#fff9da','#364640',1);for(const offset of [-3,0,3])path(ctx,[[0,0],[-9,offset]],null,'#acc4b4',.85);ellipse(ctx,2,0,3,2.7,'#f2b45a');ctx.restore();}
    function draw(state){if(canvas.clientWidth!==width||canvas.clientHeight!==height)resize();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(backdrop,0,0);ctx.setTransform(scale,0,0,scale,0,0);
      if(state.event!==lastEvent){trail=[];lastEvent=state.event;}
      if(state.label==='smash'&&state.ball&&state.phase==='play'&&Math.max(state.player.anim,state.cpu.anim)>.28)ctx.translate(Math.sin(state.clock*100)*1.7,0);
      person(state.cpu,1,state.clock);mesh();person(state.player,0,state.clock);
      if(state.phase==='play'){
        const [landX,landY]=position(state.aim);ctx.strokeStyle='#fff3bb';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.ellipse(landX,landY,portrait?14:23,portrait?5:7,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
        if(trail.length>1)path(ctx,trail,null,state.lastShot==='smash'?'#ffd263bb':'#faf3d780',2.1);const ball=state.ball;trail.push(position(ball.x,ball.z));if(trail.length>7)trail.shift();shuttle(ball);
      }else if(state.phase==='serve')shuttle({x:(state.server?state.cpu.x-.035:state.player.x+.035),z:.28,vx:0,vz:-1});
    }
    resize();return {draw,portrait:()=>portrait,depth:(left,top)=>portrait?(1-(top/height-.205)/.745):(left/width-.015)/.97};
  };
})();
