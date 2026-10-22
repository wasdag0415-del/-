/* Keep handheld chat within the visible viewport when the soft keyboard opens. */
(()=>{
 const root=document.documentElement;
 const handheld=window.matchMedia('(max-width:900px), (hover:none) and (pointer:coarse)');
 let frame=0,lastHeight=0,lastTop=-1,baseline=0;
 function update(){frame=0;
  if(!handheld.matches){root.style.removeProperty('--app-height');root.style.removeProperty('--viewport-top');delete root.dataset.keyboard;baseline=0;return;}
  const viewport=window.visualViewport;
  // Respect pinch zoom instead of resizing the app to the zoomed viewport.
  if(viewport&&Math.abs(viewport.scale-1)>.05)return;
  const height=Math.max(1,Math.round(viewport?.height||window.innerHeight));
  const top=Math.max(0,Math.round(viewport?.offsetTop||0));
  if(height!==lastHeight){root.style.setProperty('--app-height',height+'px');lastHeight=height;}
  if(top!==lastTop){root.style.setProperty('--viewport-top',top+'px');lastTop=top;}
  const focused=document.activeElement;
  const inputFocused=!!focused&&/^(INPUT|TEXTAREA|SELECT)$/.test(focused.tagName);
  if(!inputFocused)baseline=Math.max(height,window.innerHeight);
  const keyboard=inputFocused&&Math.max(baseline,window.innerHeight)-height>120;
  const changed=root.dataset.keyboard!==(keyboard?'open':'closed');
  root.dataset.keyboard=keyboard?'open':'closed';
  if(changed&&keyboard){const messages=document.getElementById('messages');if(messages)messages.scrollTop=messages.scrollHeight;}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 window.visualViewport?.addEventListener('resize',schedule);
 window.visualViewport?.addEventListener('scroll',schedule);
 window.addEventListener('resize',schedule);
 window.addEventListener('orientationchange',()=>{baseline=0;lastHeight=0;lastTop=-1;schedule();});
 document.addEventListener('focusin',schedule);
 document.addEventListener('focusout',schedule);
 if(handheld.addEventListener)handheld.addEventListener('change',()=>{lastHeight=0;lastTop=-1;schedule();});
 else handheld.addListener(()=>{lastHeight=0;lastTop=-1;schedule();});
 update();
})();
