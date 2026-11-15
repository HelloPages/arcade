(function(root){'use strict';
const DIR=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const W=[100,-25,12,6,6,12,-25,100,-25,-45,-3,-3,-3,-3,-45,-25,12,-3,5,2,2,5,-3,12,6,-3,2,1,1,2,-3,6,6,-3,2,1,1,2,-3,6,12,-3,5,2,2,5,-3,12,-25,-45,-3,-3,-3,-3,-45,-25,100,-25,12,6,6,12,-25,100];
function initial(){const b=Array(64).fill(0);b[27]=b[36]=-1;b[28]=b[35]=1;return b;}
function flips(b,p,i){if(!Number.isInteger(i)||i<0||i>=64||b[i]!==0)return [];const out=[];for(const [dy,dx]of DIR){let y=(i/8|0)+dy,x=i%8+dx,line=[];while(y>=0&&y<8&&x>=0&&x<8&&b[y*8+x]===-p){line.push(y*8+x);y+=dy;x+=dx;}if(line.length&&y>=0&&y<8&&x>=0&&x<8&&b[y*8+x]===p)out.push(...line);}return out;}
function legal(b,p){return b.flatMap((v,i)=>v===0&&flips(b,p,i).length?[i]:[]);}
function play(b,p,i){const f=flips(b,p,i);if(!f.length)return null;const n=b.slice();n[i]=p;for(const j of f)n[j]=p;let turn=-p,pass=0,over=false;if(!legal(n,turn).length){pass=turn;turn=p;if(!legal(n,p).length){turn=0;over=true;}}return {board:n,turn,pass,over,flipped:f};}
function count(b){return {black:b.filter(x=>x===1).length,white:b.filter(x=>x===-1).length};}
function value(b,p){const a=legal(b,p).length,c=legal(b,-p).length;if(!a&&!c)return b.reduce((s,v)=>s+v*p,0)*10000;return b.reduce((s,v,i)=>s+v*p*W[i],0)+9*(a-c);}
function search(b,p,depth,alpha,beta){const m=legal(b,p);if(!depth||(!m.length&&!legal(b,-p).length))return value(b,p);if(!m.length)return -search(b,-p,depth-1,-beta,-alpha);let best=-Infinity;for(const i of m.sort((a,b)=>W[b]-W[a])){const n=play(b,p,i),v=n.over?value(n.board,p):n.turn===p?search(n.board,p,depth-1,alpha,beta):-search(n.board,-p,depth-1,-beta,-alpha);best=Math.max(best,v);alpha=Math.max(alpha,v);if(alpha>=beta)break;}return best;}
function choose(b,p,depth=2){const m=legal(b,p);let best=-Infinity,pick=null;for(const i of m){const n=play(b,p,i),v=n.over?value(n.board,p):n.turn===p?search(n.board,p,depth-1,-Infinity,Infinity):-search(n.board,-p,depth-1,-Infinity,Infinity);if(v>best){best=v;pick=i;}}return pick;}
function greedy(b,p){return legal(b,p).sort((a,c)=>flips(b,p,c).length-flips(b,p,a).length)[0]??null;}
function replay(moves){if(!Array.isArray(moves)||moves.length>60)return null;let board=initial(),turn=1,result;for(const i of moves){result=play(board,turn,i);if(!result)return null;board=result.board;turn=result.turn;}return {board,turn,over:turn===0,pass:result?.pass||0};}
const api={initial,flips,legal,play,count,choose,greedy,replay};if(typeof module!=='undefined')module.exports=api;root.LacquerEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
