(function(root){
'use strict';
const names=['菊石','三葉蟲','蕨葉','魚骨','螺殼','扇貝','蜻蜓','珊瑚'];
function create(level=0,seed=1){
 if(!Number.isInteger(level)||level<0||level>2||!Number.isInteger(seed)||seed<1||seed>4294967295)throw Error('invalid seed or level');
 let x=seed>>>0;const random=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
 const pairs=[4,6,8][level],deck=Array.from({length:pairs*2},(_,i)=>i%pairs);
 for(let i=deck.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
 return{level,seed,deck,found:[],open:[],seen:{},moves:0,actions:[],won:false};
}
function act(s,a){
 if(s.won||s.actions.length>=5000)return false;
 if(a==='close'){if(s.open.length!==2)return false;s.open=[];s.actions.push(a);return true;}
 if(!Number.isInteger(a)||a<0||a>=s.deck.length||s.open.length===2||s.open.includes(a)||s.found.includes(a))return false;
 s.open.push(a);s.seen[a]=s.deck[a];s.actions.push(a);
 if(s.open.length===2){s.moves++;let [i,j]=s.open;if(s.deck[i]===s.deck[j]){s.found.push(i,j);s.open=[];s.won=s.found.length===s.deck.length;}}
 return true;
}
function restore(v){try{if(!v||v.v!==1||!Array.isArray(v.actions)||v.actions.length>5000)return null;let s=create(v.level,v.seed);for(const a of v.actions)if(!act(s,a))return null;return s;}catch{return null;}}
function save(s){return{v:1,level:s.level,seed:s.seed,actions:s.actions};}
const api={names,create,act,restore,save};if(typeof module!=='undefined')module.exports=api;else root.Fossil=api;
})(globalThis);
