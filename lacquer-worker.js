importScripts('lacquer-engine.js');
onmessage=e=>{const {board,turn,depth,token}=e.data;postMessage({move:depth===0?LacquerEngine.greedy(board,turn):LacquerEngine.choose(board,turn,depth),token});};
