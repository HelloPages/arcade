/* Original network puzzle engine; no runtime dependencies. N E S W = 1 2 4 8. */
(function(root){
'use strict';
const bits=[1,2,4,8],dx=[0,1,0,-1],dy=[-1,0,1,0];
function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function rotate(m,r=1){for(let i=0;i<((r%4)+4)%4;i++)m=((m<<1)&15)|(m>>3);return m;}
function neighbor(i,d,n){const x=i%n+dx[d],y=Math.floor(i/n)+dy[d];return x<0||y<0||x>=n||y>=n?-1:y*n+x;}
function generate(level,seed){
 const n=[4,5,6][level];if(!n||!Number.isInteger(seed))throw Error('invalid puzzle');
 const random=rng(seed),base=Array(n*n).fill(0),root=Math.floor(n/2)*n+Math.floor(n/2),seen=new Set([root]),frontier=[];
 function add(i){for(let d=0;d<4;d++){const j=neighbor(i,d,n);if(j>=0&&!seen.has(j))frontier.push([i,j,d]);}}
 add(root);while(frontier.length){const k=Math.floor(random()*frontier.length),[i,j,d]=frontier.splice(k,1)[0];if(seen.has(j))continue;seen.add(j);base[i]|=bits[d];base[j]|=bits[(d+2)%4];add(j);}
 const rotations=base.map(()=>Math.floor(random()*4));if(analyze({n,root,base,rotations}).solved)rotations[0]=(rotations[0]+1)%4;
 return {level,seed:seed>>>0,n,root,base,rotations};
}
function analyze(p){
 const masks=p.base.map((m,i)=>rotate(m,p.rotations[i])),live=new Set([p.root]),queue=[p.root];let dangling=0;
 for(let i=0;i<masks.length;i++)for(let d=0;d<4;d++)if(masks[i]&bits[d]){const j=neighbor(i,d,p.n);if(j<0||!(masks[j]&bits[(d+2)%4]))dangling++;}
 for(let k=0;k<queue.length;k++){const i=queue[k];for(let d=0;d<4;d++)if(masks[i]&bits[d]){const j=neighbor(i,d,p.n);if(j>=0&&(masks[j]&bits[(d+2)%4])&&!live.has(j)){live.add(j);queue.push(j);}}}
 return {masks,live:[...live],dangling,solved:live.size===masks.length&&dangling===0};
}
function restore(s){
 if(!s||s.v!==1||![0,1,2].includes(s.level)||!Number.isInteger(s.seed)||s.seed<0||s.seed>4294967295||!Array.isArray(s.actions)||s.actions.length>10000)return null;
 const p=generate(s.level,s.seed);let moves=0,hints=0;
 for(const a of s.actions){if(!Array.isArray(a)||a.length!==2||!Number.isInteger(a[0])||a[0]<0||a[0]>=p.base.length||![1,-1].includes(a[1])||analyze(p).solved)return null;p.rotations[a[0]]=(p.rotations[a[0]]+a[1]+4)%4;moves++;}
 if(!Array.isArray(s.locks)||s.locks.length!==p.base.length||s.locks.some(x=>typeof x!=='boolean')||!Number.isInteger(s.hints)||s.hints<0||s.hints>10000)return null;
 return {p,moves,hints:s.hints,actions:s.actions.map(x=>x.slice()),locks:s.locks.slice()};
}
const api={bits,rotate,neighbor,generate,analyze,restore};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AmberEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
