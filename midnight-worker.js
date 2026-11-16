'use strict';
importScripts('midnight-engine.js');
self.onmessage=({data})=>{try{self.postMessage({board:data.board,path:MidnightEngine.solve(data.board)});}catch(e){self.postMessage({board:data.board,error:true});}};
