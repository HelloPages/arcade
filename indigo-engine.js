(function(root){
'use strict';
const sizes=[4,5,5];
function neighbors(i,n){return [i,...(i%n?[i-1]:[]),...(i%n<n-1?[i+1]:[]),...(i>=n?[i-n]:[]),...(i<n*(n-1)?[i+n]:[])];}
function flip(a,i,n){const b=a.slice();for(const j of neighbors(i,n))b[j]^=1;return b;}
// Gaussian elimination over GF(2). Enumerate the small null space to find a shortest completion.
function solve(a,n){const m=n*n,rows=Array.from({length:m},(_,r)=>[...Array.from({length:m},(_,c)=>+neighbors(c,n).includes(r)),1-a[r]]);let rank=0;const piv=[];
 for(let c=0;c<m;c++){let k=rows.findIndex((r,i)=>i>=rank&&r[c]);if(k<0)continue;[rows[k],rows[rank]]=[rows[rank],rows[k]];for(let r=0;r<m;r++)if(r!==rank&&rows[r][c])for(let j=c;j<=m;j++)rows[r][j]^=rows[rank][j];piv.push(c);rank++;}
 for(let r=rank;r<m;r++)if(rows[r][m])return null;
 const free=Array.from({length:m},(_,i)=>i).filter(i=>!piv.includes(i));let best=null;
 for(let mask=0;mask<2**free.length;mask++){const x=Array(m).fill(0);free.forEach((c,j)=>x[c]=(mask>>j)&1);for(let r=rank-1;r>=0;r--){let v=rows[r][m];for(const c of free)v^=rows[r][c]&x[c];x[piv[r]]=v;}const out=x.flatMap((v,i)=>v?[i]:[]);if(!best||out.length<best.length)best=out;}
 return best;
}
function generate(level,seed){const n=sizes[level];let s=seed>>>0||1;const rnd=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};let board,solution;for(let t=0;t<400;t++){board=Array(n*n).fill(1);for(let i=0;i<n*n;i++)if(rnd()<.5)board=flip(board,i,n);solution=solve(board,n);if(solution.length>=[4,7,10][level])break;}return {n,board};}
function restore(v){if(!v||v.v!==1||!Number.isInteger(v.level)||v.level<0||v.level>2||!Number.isInteger(v.seed)||v.seed<1||v.seed>4294967295||!Array.isArray(v.actions)||v.actions.length>10000||!Number.isInteger(v.hints)||v.hints<0||v.hints>10000)return null;const p=generate(v.level,v.seed);for(const i of v.actions){if(!Number.isInteger(i)||i<0||i>=p.n*p.n||p.board.every(Boolean))return null;p.board=flip(p.board,i,p.n);}return {...p,level:v.level,seed:v.seed,actions:v.actions.slice(),hints:v.hints};}
const api={sizes,neighbors,flip,solve,generate,restore};if(typeof module!=='undefined')module.exports=api;root.Indigo=api;
})(typeof globalThis!=='undefined'?globalThis:this);
