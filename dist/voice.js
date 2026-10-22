/* Microphone recordings remain in IndexedDB. Synthetic voices use browser TTS. */
globalThis.PocketVoice=(()=>{
 let database,playing=null,playEpoch=0;
 const db=()=>database??=(new Promise((resolve,reject)=>{
  if(!globalThis.indexedDB)return reject(new Error('当前浏览器不支持保存录音，请使用文字转语音。'));
  const request=indexedDB.open('pocket-star-audio',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('clips');
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error('无法打开录音存储。'));
 })).catch(e=>{database=null;throw e;});
 async function storage(mode,operation){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('clips',mode),req=operation(tx.objectStore('clips'));tx.oncomplete=()=>resolve(req?.result);tx.onerror=tx.onabort=()=>reject(new Error('录音保存失败，浏览器空间可能不足。'));});}
 const put=(id,blob)=>storage('readwrite',s=>s.put(blob,id));
 const get=id=>storage('readonly',s=>s.get(id));
 const remove=id=>storage('readwrite',s=>s.delete(id));
 const clear=()=>storage('readwrite',s=>s.clear());
 function stop(){playEpoch++;if(playing){const old=playing;playing=null;old.dispose();old.button?.classList.remove('playing');old.button?.setAttribute('aria-pressed','false');}globalThis.speechSynthesis?.cancel();}
 async function play(message,button,language,onError){const same=playing?.id===message.id;stop();if(same)return;const epoch=playEpoch;
 const mark=dispose=>{playing={id:message.id,button,dispose};button.classList.add('playing');button.setAttribute('aria-pressed','true');};
 try{if(message.audioId){const blob=await get(message.audioId);if(epoch!==playEpoch)return;if(!blob)throw new Error('这段录音已被清除或不在当前浏览器中。');const url=URL.createObjectURL(blob),audio=new Audio(url);mark(()=>{audio.onended=null;audio.onerror=null;audio.pause();audio.src='';URL.revokeObjectURL(url);});audio.onended=()=>stop();audio.onerror=()=>{stop();onError('录音播放失败。');};await audio.play();}
 else{if(!globalThis.speechSynthesis)throw new Error('当前浏览器不支持系统语音，请查看文字内容。');const u=new SpeechSynthesisUtterance(message.text);u.lang=language||'zh-CN';const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>v.lang.toLowerCase()===u.lang.toLowerCase())||voices.find(v=>v.lang.startsWith(u.lang.split('-')[0]))||null;u.rate=.97;mark(()=>{});u.onend=()=>{if(epoch===playEpoch)stop();};u.onerror=e=>{if(epoch===playEpoch){stop();if(e.error!=='interrupted'&&e.error!=='canceled')onError('系统声音暂不可用，请查看文字或切换浏览器。');}};speechSynthesis.speak(u);}}
 catch(e){if(epoch===playEpoch){stop();onError(e.message||'语音播放失败。');}}
 }
 function createRecorder({onTime,onReady,onError}){let stream,recorder,timer,start=0,disposed=false,chunks=[];
 const cleanup=()=>{clearInterval(timer);stream?.getTracks().forEach(t=>t.stop());};
 return {async start(){try{if(!navigator.mediaDevices?.getUserMedia||!globalThis.MediaRecorder)throw new Error('当前浏览器无法录音，可以使用文字转语音。');stream=await navigator.mediaDevices.getUserMedia({audio:true});if(disposed){cleanup();return;}const mime=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(t=>MediaRecorder.isTypeSupported(t));recorder=new MediaRecorder(stream,{...(mime?{mimeType:mime}:{}),audioBitsPerSecond:24000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onerror=()=>{disposed=true;cleanup();onError('录音中断，请再试一次。');};recorder.onstop=()=>{cleanup();if(disposed)return;const duration=Math.min(60,Math.max(1,Math.round((Date.now()-start)/1000))),blob=new Blob(chunks,{type:recorder.mimeType});if(!blob.size){onError('没有录到声音，请检查麦克风。');return;}onReady(blob,duration);};start=Date.now();recorder.start();onTime(0);timer=setInterval(()=>{const seconds=Math.floor((Date.now()-start)/1000);onTime(Math.min(seconds,60));if(seconds>=60&&recorder.state==='recording')recorder.stop();},250);}catch(e){cleanup();if(!disposed)onError(e.name==='NotAllowedError'?'麦克风权限未开启。请在浏览器中允许录音，或使用文字转语音。':e.message||'无法启动麦克风。');}},stop(){if(recorder?.state==='recording')recorder.stop();},cancel(){disposed=true;if(recorder?.state==='recording')recorder.stop();cleanup();}};
 }
 return {put,get,remove,clear,play,stop,createRecorder};
})();
