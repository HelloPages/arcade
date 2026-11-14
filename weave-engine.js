/* Original game engine. Classic Mines rules; no third-party source code. */
(function(root){
'use strict';
const LEVELS=[{cols:6,rows:8,mines:8,name:'初織'},{cols:8,rows:9,mines:14,name:'交織'},{cols:8,rows:12,mines:22,name:'密織'}];
function neighbors(s,i){const x=i%s.cols,y=Math.floor(i/s.cols),a=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if((dx||dy)&&xx>=0&&xx<s.cols&&yy>=0&&yy<s.rows)a.push(yy*s.cols+xx);}return a;}
function create(level=0,seed=1){if(!Number.isInteger(level)||!LEVELS[level]||!Number.isInteger(seed)||seed<1||seed>4294967295)throw Error('Invalid game');return {...LEVELS[level],level,seed,minesAt:[],counts:[],open:[],flags:[],actions:[],hints:0,started:false,status:'playing'};}
function plant(s,first){let seed=s.seed>>>0;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};const avoid=new Set([first,...neighbors(s,first)]),a=Array.from({length:s.cols*s.rows},(_,i)=>i).filter(i=>!avoid.has(i));for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}s.minesAt=a.slice(0,s.mines);s.counts=Array.from({length:s.cols*s.rows},(_,i)=>neighbors(s,i).filter(n=>s.minesAt.includes(n)).length);s.started=true;}
function reveal(s,i){const queue=[i];while(queue.length){const n=queue.pop();if(s.open.includes(n)||s.flags.includes(n))continue;s.open.push(n);if(s.minesAt.includes(n)){s.status='lost';return;}if(!s.counts[n])queue.push(...neighbors(s,n).filter(v=>!s.open.includes(v)));}if(s.open.length===s.cols*s.rows-s.mines)s.status='won';}
function act(s,type,i){if(s.status!=='playing'||s.actions.length>=4000)return false;if(type==='hint'){if(!s.started){i=Math.floor(s.rows/2)*s.cols+Math.floor(s.cols/2);plant(s,i);}else i=Array.from({length:s.cols*s.rows},(_,i)=>i).find(n=>!s.open.includes(n)&&!s.minesAt.includes(n));if(i===undefined)return false;s.flags=s.flags.filter(n=>n!==i);s.hints++;reveal(s,i);s.actions.push(['hint']);return true;}
if(!Number.isInteger(i)||i<0||i>=s.cols*s.rows)return false;
if(type==='flag'){if(s.open.includes(i))return false;if(s.flags.includes(i))s.flags=s.flags.filter(n=>n!==i);else {if(s.flags.length>=s.mines)return false;s.flags.push(i);}s.actions.push([type,i]);return true;}
if(type==='open'){if(s.open.includes(i)||s.flags.includes(i))return false;if(!s.started)plant(s,i);reveal(s,i);s.actions.push([type,i]);return true;}
return false;}
function save(s){return {v:1,level:s.level,seed:s.seed,actions:s.actions};}
function restore(d){try{if(!d||d.v!==1||!Array.isArray(d.actions)||d.actions.length>4000)return null;const s=create(d.level,d.seed);for(const a of d.actions){if(!Array.isArray(a)||!(a.length===1&&a[0]==='hint'||a.length===2&&(a[0]==='flag'||a[0]==='open'))||!act(s,a[0],a[1]))return null;}return s;}catch{return null;}}
function view(s){return {level:s.level,seed:s.seed,cols:s.cols,rows:s.rows,mines:s.mines,status:s.status,started:s.started,hints:s.hints,moves:s.actions.length,flags:[...s.flags],visible:Array.from({length:s.cols*s.rows},(_,i)=>s.open.includes(i)?(s.minesAt.includes(i)?'knot':s.counts[i]):null),revealed:s.open.length,remaining:s.cols*s.rows-s.mines-s.open.filter(i=>!s.minesAt.includes(i)).length};}
const api={LEVELS,neighbors,create,act,save,restore,view};if(typeof module!=='undefined')module.exports=api;else root.WeaveEngine=api;
})(typeof window==='undefined'?globalThis:window);
