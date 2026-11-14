/* Original 3x3 sliding-picture engine. Rule reference: Xpaid/Sliding-Puzzle (MIT).
 * No original art, audio or DOM implementation is reused. */
(function(root){
  'use strict';
  const GOAL='123456780';
  function adjacent(z){return [z-3,z+3,z%3?z-1:-1,z%3<2?z+1:-1].filter(i=>i>=0&&i<9);}
  function swap(s,i,j){const a=s.split('');[a[i],a[j]]=[a[j],a[i]];return a.join('');}
  function valid(s){return typeof s==='string'&&s.length===9&&s.split('').sort().join('')==='012345678';}
  function solvable(s){if(!valid(s))return false;const a=s.replace('0','');let n=0;for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)n+=a[i]>a[j];return n%2===0;}
  function manhattan(s){let n=0;for(let i=0;i<9;i++){const v=+s[i]-1;if(v>=0)n+=Math.abs(i%3-v%3)+Math.abs((i/3|0)-(v/3|0));}return n;}
  function rng(seed){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
  function shuffle(seed,level){const random=rng(seed),steps=[12,32,64][level];let s=GOAL,prev=-1;
    for(let i=0;i<steps;i++){const z=s.indexOf('0'),a=adjacent(z).filter(x=>x!==prev);const j=a[Math.floor(random()*a.length)];s=swap(s,z,j);prev=z;}
    return s===GOAL?swap(s,8,7):s;
  }
  // A* with admissible Manhattan distance; only public board information is used.
  function solve(start){
    if(!solvable(start))return null;
    const heap=[],cost=new Map([[start,0]]),parent=new Map();
    function push(n){let i=heap.length;heap.push(n);while(i){let p=(i-1)>>1;if(heap[p].f<=n.f)break;heap[i]=heap[p];i=p;}heap[i]=n;}
    function pop(){const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let j=i*2+1;if(j+1<heap.length&&heap[j+1].f<heap[j].f)j++;if(heap[j].f>=last.f)break;heap[i]=heap[j];i=j;}heap[i]=last;}return first;}
    push({s:start,g:0,f:manhattan(start)});
    while(heap.length){const n=pop();if(cost.get(n.s)!==n.g)continue;
      if(n.s===GOAL){const path=[];let s=n.s;while(s!==start){const p=parent.get(s);path.push(p.tile);s=p.s;}return path.reverse();}
      const z=n.s.indexOf('0');for(const i of adjacent(z)){const s=swap(n.s,z,i),g=n.g+1;if(g<(cost.get(s)??Infinity)){cost.set(s,g);parent.set(s,{s:n.s,tile:+n.s[i]});push({s,g,f:g+manhattan(s)});}}
    }return null;
  }
  const api={GOAL,adjacent,swap,valid,solvable,manhattan,rng,shuffle,solve};
  if(typeof module!=='undefined')module.exports=api;else root.MidnightEngine=api;
})(typeof self!=='undefined'?self:this);
