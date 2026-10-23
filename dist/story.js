/* Pocket Story Chapter 01. Isolated from free-chat and recorded-audio data. */
(function (root) {
  'use strict';

  const DATA = root.JapanStoryData;
  const KEY = 'pocket-story-same-blank-ch1-v2';
  const fresh = () => ({
    version: 2,
    episode: DATA.id,
    started: false,
    introRead: false,
    read: [],
    seen: [],
    saved: [],
    igSaved: [],
    forumReply: '',
    outsiderReply: '',
    judgment: '',
    rumorSeen: [],
    officialUnlocked: false,
    officialSeen: false,
    chapterComplete: false
  });

  function normalize(value) {
    const next = fresh();
    if (!value || value.version !== 2 || value.episode !== DATA.id) return next;
    for (const key of ['started', 'introRead', 'officialUnlocked', 'officialSeen', 'chapterComplete']) next[key] = value[key] === true;
    for (const key of ['read', 'seen', 'saved', 'igSaved']) {
      next[key] = Array.isArray(value[key]) ? [...new Set(value[key].filter((item) => typeof item === 'string'))] : [];
    }
    next.forumReply = ['uneasy', 'counter', 'wait'].includes(value.forumReply) ? value.forumReply : '';
    next.outsiderReply = ['facts', 'feeling', 'lost'].includes(value.outsiderReply) ? value.outsiderReply : '';
    next.judgment = ['changed', 'tired', 'unknown'].includes(value.judgment) ? value.judgment : '';
    next.rumorSeen = Array.isArray(value.rumorSeen) ? [...new Set(value.rumorSeen.filter((id) => ['first', 'second', 'third'].includes(id)))] : [];
    return next;
  }

  let state;
  try { state = normalize(JSON.parse(root.localStorage.getItem(KEY))); } catch { state = fresh(); }
  let context = null;
  let route = 'ktstory';
  let postId = 'coldwar';
  let airportPhotoId = 'airport-seulgi-0914';
  let filter = '追星';
  let query = '';
  let sortMode = '热门';
  let youtubeChannel = 'feed';
  let youtubeVideo = '';
  let kktThread = 'wendy';
  let kktTab = 'chats';
  let memoFolder = 'folders', memoId = '', memoQuery = '';
  let personalMemos = [];
  try { const data=JSON.parse(root.localStorage.getItem('pocket-story-personal-memos-v1')); if(Array.isArray(data))personalMemos=data.filter(item=>item&&typeof item.id==='string'&&typeof item.body==='string'); } catch {}

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const notice = '';

  function save() {
    try {
      root.localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch {
      context?.toast('剧情存档保存失败，请检查浏览器空间。');
      return false;
    }
  }

  function ready(value = state) {
    return value.introRead === true &&
      value.read.includes('coldwar') &&
      value.read.includes('airport-gap') &&
      value.read.includes('stage-counter') &&
      value.seen.includes('airport-seulgi-0914') &&
      value.igSaved.includes('sg-260916');
  }

  function badge() {
    if (!state.introRead) return '1';
    if (state.read.includes('coldwar') && !state.read.includes('stage-counter')) return '1';
    if (ready() && !state.officialUnlocked) return '1';
    if (state.officialUnlocked && !state.read.includes('photo-reactions')) return '1';
    return '';
  }

  function storyTime() {
    if (state.chapterComplete) return '21:22';
    if (state.read.includes('photo-reactions')) return '21:22';
    if (state.officialSeen) return '21:18';
    if (state.officialUnlocked) return '21:15';
    if (ready()) return '21:14';
    if (state.read.includes('stage-counter') || state.read.includes('airport-gap')) return '21:10';
    if (state.read.includes('coldwar')) return '21:02';
    return '20:52';
  }

  function boot(ctx) { context = ctx; }
  function go(next) { route = next; render(); }
  function wrap(html, extra = '') { return `<section class="nf-app ${['feed', 'post'].includes(route) ? 'nf-pann' : ''} ${extra}">${html}</section>`; }
  function head(title, back = 'feed', right = '') {
    return `<header class="nf-head"><button data-route="${back}" aria-label="返回">‹</button><strong>${esc(title)}</strong>${right || '<button data-nav="phonehome" aria-label="返回手机">⌂</button>'}</header>`;
  }

  function open(next, ctx) {
    if (ctx) boot(ctx);
    if (next === 'forum') {
      route = 'feed';
      filter = '追星';
      query = '';
      state.started = true;
      state.introRead = true;
      save();
    } else {
      route = next;
    }
    render();
  }

  function render() {
    if (!context) return;
    const views = {
      opening, feed, post: thread, airportphoto: airportPhoto, official: officialPost,
      chapterend: chapterEnd, notebook: enrichedNotebook, ktstory, storychat: enrichedManagerChat, instagram,
      youtube, weverse, callhistory, kktmore, memoarchive: notebook, couplechat: enrichedCoupleChat, groupchat: enrichedGroupChat, sidechat
    };
    context.screen.innerHTML = (views[route] || feed)();
    if(route==='ktstory'){
      const app=context.screen.querySelector('.nf-kkt-app');
      if(app){
        const icons={friends:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',chats:'<path d="M21 11a9 8 0 1 0-14 7l-1 4 5-3c6 1 10-3 10-8Z"/>',calls:'<path d="m6 3 4 5-2 3c2 3 3 4 6 5l3-2 4 4c-2 6-7 3-11 0S1 7 6 3Z"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'};
        const labels={friends:'친구',chats:'채팅',calls:'통화',more:'더보기'};
        app.querySelector('.nf-kkt-head strong').textContent=labels[kktTab];
        if(kktTab==='friends')app.classList.add('kkt-friends-tab');
        app.insertAdjacentHTML('beforeend',`<nav class="kkt-native-tabs" aria-label="KakaoTalk导航">${['friends','chats','calls','more'].map(tab=>`<button data-kkt-tab="${tab}" class="${kktTab===tab?'selected':''}" aria-label="${labels[tab]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[tab]}</svg><small>${labels[tab]}</small></button>`).join('')}</nav>`);
      }
    }
    if(['couplechat','storychat','groupchat','sidechat'].includes(route)){
      const chat=context.screen.querySelector('.nf-story-chat');
      const titles={couplechat:'组长老师',storychat:'Manager',groupchat:'💖🧡💙💚💜',sidechat:''};
      const title=chat?.querySelector('.nf-head strong');
      if(chat&&title){
        chat.classList.add('kkt-conversation');
        const name=title.textContent.trim()||titles[route];
        title.innerHTML=`<span class="kkt-chat-avatar" aria-hidden="true">${route==='groupchat'?'💖':name==='Manager'?'M':name==='组长老师'?'I':name.charAt(0)}</span><span class="kkt-chat-name">${name}</span>`;
        chat.querySelectorAll('.nf-chat-message').forEach((message,index,list)=>{
          const meta=message.querySelector('small');
          if(!meta)return;
          const raw=meta.textContent.trim(), split=raw.lastIndexOf(' · ');
          const sender=split>=0?raw.slice(0,split):'',time=split>=0?raw.slice(split+3):raw;
          meta.textContent=time;
          meta.classList.add('kkt-message-time');
          if(message.classList.contains('them')&&(route==='groupchat'||(index===0||!list[index-1].classList.contains('them')))){
            const label=document.createElement('span');label.className='kkt-message-sender';label.textContent=sender;
            message.prepend(label);
          }
          if(index&&list[index-1].classList.contains(message.classList.contains('me')?'me':'them'))message.classList.add('kkt-consecutive');
        });
      }
      const tools=context.screen.querySelector('.nf-story-chat-tools');
      if(tools)tools.innerHTML=`<button data-nav="photos" aria-label="打开照片">＋</button><span class="kkt-composer-placeholder">메시지 입력</span><button data-route="ktstory" aria-label="返回聊天列表"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m14 5-7 7 7 7"/></svg></button>`;
    }
    const statusTime = root.document?.querySelector('#status-time');
    if (statusTime) statusTime.textContent = new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});
    bind();
    const scroll = context.screen.querySelector('.nf-scroll');
    if (scroll) scroll.scrollTop = 0;
  }

  function opening() {
    return wrap(`<div class="nf-opening"><div class="nf-open-logo">POCKET STORY<span>the same blank</span></div><div class="nf-night-card"><span>FUKUOKA · 2026.09.19</span><div class="nf-moon"></div><i class="nf-window"></i></div><h1>大家都在看，<br>却没有人看见全部。</h1><p>你捡到一部处于遗失模式的手机。<br>屏幕上留着一条 Pann 热帖通知。</p><button class="nf-primary" data-route="feed">查看 Pann 热帖 <span>↗</span></button><button class="nf-text-button" data-nav="phonehome">回到手机桌面</button>${notice}<p class="nf-autosave">进度自动保存在当前浏览器</p></div>`);
  }

  function ktstory() {
    return wrap(`<header class='nf-head nf-kkt-head'><button data-nav='phonehome' aria-label='返回手机'>‹</button><strong>KakaoTalk</strong><button data-route='notebook' aria-label='打开备忘录'>▤</button></header><div class='nf-scroll nf-kkt-list'><button class='nf-kkt-row' data-route='storychat'><span class='nf-kkt-avatar'>M</span><span><strong>Manager</strong><p>明天集合提前十五分钟。</p></span><time>20:50</time>${badge() ? '<i>1</i>' : ''}</button><button class='nf-kkt-row' data-route='couplechat'><span class='nf-kkt-avatar pair'>I</span><span><strong>组长老师</strong><p>门别锁。</p></span><time>21:27</time></button><button class='nf-kkt-row' data-route='groupchat'><span class='nf-kkt-avatar'>💖</span><span><strong>💖🧡💙💚💜</strong><p>Yeri：合照发群里！</p></span><time>21:17</time></button><button class='nf-kkt-row' data-kkt-thread='wendy'><span class='nf-kkt-avatar'>W</span><span><strong>Wendy</strong><p>到酒店以后跟我说一声</p></span><time>18:09</time></button><button class='nf-kkt-row' data-kkt-thread='japan'><span class='nf-kkt-avatar'>JP</span><span><strong>日本运营</strong><p>首场照片会在确认后上传。</p></span><time>20:46</time></button><button class='nf-kkt-row' data-kkt-thread='styling'><span class='nf-kkt-avatar'>S</span><span><strong>造型室</strong><p>明天先试第二套耳饰。</p></span><time>17:38</time></button><button class='nf-kkt-row' data-kkt-thread='joy'><span class='nf-kkt-avatar'>J</span><span><strong>Joy</strong><p>不是说好要拍给我看吗ㅋㅋ</p></span><time>9月18日</time></button></div>`, 'nf-kkt-app');
  }

  function storychat() {
    state.introRead = true;
    state.started = true;
    save();
    return wrap(`${head('Manager', 'ktstory', '<button data-route="ktstory" aria-label="聊天列表">☰</button>')}<div class='nf-scroll nf-chat-scroll'><div class='nf-chat-date'>9月13日 · 出发前</div><div class='nf-chat-message them'><small>Manager · 18:32</small><p>明天个人行程，你先按原计划飞日本。</p></div><div class='nf-chat-message them'><small>Manager · 18:33</small><p>珠泫那边的航班还没定，确认以后我再告诉你。</p></div><div class='nf-chat-message me'><small>你 · 18:36</small><p>好。</p></div><div class='nf-chat-date'>9月14日 · 涩琪抵达日本</div><div class='nf-chat-message them'><small>Manager · 15:08</small><p>车在出口等。到酒店以后先休息，晚一点再确认明天的拍摄。</p></div><div class='nf-chat-message me'><small>你 · 15:09</small><p>知道了。</p></div><div class='nf-chat-date'>9月16日</div><div class='nf-chat-message them'><small>Manager · 17:42</small><p>珠泫已经落地了，稍后直接回酒店。</p></div><div class='nf-chat-message them'><small>Manager · 17:42</small><p>明天彩排时间不变。</p></div><div class='nf-chat-message me'><small>你 · 17:44</small><p>她今天过来的吗？</p></div><div class='nf-chat-message them'><small>Manager · 17:44</small><p>嗯，刚到。</p></div><div class='nf-chat-message me'><small>你 · 17:45</small><p>好，我知道了。</p></div><div class='nf-chat-date'>9月19日 · 福冈首场结束后</div><div class='nf-chat-message them'><small>Manager · 20:48</small><p>首场结束辛苦了。车在 B1，十五分钟后出发。</p></div><div class='nf-chat-message them'><small>Manager · 20:49</small><p>网上有一篇帖子在讨论你们为什么没有一起飞，也有人在问珠泫是什么时候到日本的。</p></div><div class='nf-chat-message them'><small>Manager · 20:49</small><p>先不要回应，也不要用个人账号解释。官方照片等日本运营发。</p><button class='nf-inline' data-open-post='coldwar'>查看正在升温的讨论 →</button></div><div class='nf-chat-message them'><small>Manager · 20:50</small><p>明天集合提前十五分钟。今晚先休息。</p></div></div><div class='nf-story-chat-tools'><button data-route='ktstory'>消息列表</button><button data-route='notebook'>备忘录</button></div>`, 'nf-story-chat');
  }

  function couplechat() {
    return wrap(`${head('组长老师', 'ktstory')}<div class='nf-scroll nf-chat-scroll nf-couple-chat'>
<div class='nf-chat-date'>8月1日 · Fan-Con第一天</div>
<div class='nf-chat-message them'><small>组长老师 · 22:30</small><p>今天演出结束了，辛苦了</p></div>
<div class='nf-chat-message me'><small>你 · 22:33</small><p>欧尼也辛苦了</p></div>
<div class='nf-chat-message them'><small>组长老师 · 22:34</small><p>你今天跳得很好</p></div>
<div class='nf-chat-message me'><small>你 · 22:35</small><p>真的吗</p></div>
<div class='nf-chat-message them'><small>组长老师 · 22:36</small><p>真的。早点回去休息</p></div>
<div class='nf-chat-message me'><small>你 · 22:37</small><p>好</p></div>

<div class='nf-chat-date'>8月3日</div>
<div class='nf-chat-message them'><small>组长老师 · 20:15</small><p>吃饭了吗</p></div>
<div class='nf-chat-message me'><small>你 · 20:18</small><p>吃了</p></div>
<div class='nf-chat-message them'><small>组长老师 · 20:19</small><p>吃的什么</p></div>
<div class='nf-chat-message me'><small>你 · 20:20</small><p>自己随便做了点</p></div>
<div class='nf-chat-message them'><small>组长老师 · 20:21</small><p>哦。明天还要彩排吗</p></div>
<div class='nf-chat-message me'><small>你 · 20:22</small><p>嗯</p></div>
<div class='nf-chat-message them'><small>组长老师 · 20:23</small><p>那你早点睡</p></div>
<div class='nf-chat-message me'><small>你 · 20:24</small><p>好</p></div>

<div class='nf-chat-date'>8月10日</div>
<div class='nf-chat-message them'><small>组长老师 · 23:40</small><p>到家了吗</p></div>
<div class='nf-chat-message me'><small>你 · 23:43</small><p>刚到</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:44</small><p>冰箱第二层有我上周回大邱带回来的大枣，记得煮着喝</p></div>
<div class='nf-chat-message me'><small>你 · 23:45</small><p>你什么时候放的？</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:46</small><p>下午过去的时候。今天彩排是不是又站太久了</p></div>
<div class='nf-chat-message me'><small>你 · 23:47</small><p>还好</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:48</small><p>还好？我看你下台的时候腿都在抖</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:49</small><p>喝完拍给我看，我检查一下你有没有认真吃</p></div>
<div class='nf-chat-message me'><small>你 · 23:50</small><p>……知道了</p></div>
<div class='nf-chat-message me'><small>你 · 23:51</small><p>欧尼你也早点休息，最近行程太满了</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:52</small><p>我没事</p></div>
<div class='nf-chat-message me'><small>你 · 23:53</small><p>你辛苦了</p></div>

<div class='nf-chat-date'>8月15日 · 欧尼录节目之前</div>
<div class='nf-chat-message them'><small>组长老师 · 14:30</small><p>明天要去录那个节目了</p></div>
<div class='nf-chat-message me'><small>你 · 14:32</small><p>哪个？</p></div>
<div class='nf-chat-message them'><small>组长老师 · 14:33</small><p>虽然没准备什么菜</p></div>
<div class='nf-chat-message me'><small>你 · 14:34</small><p>啊~~~泳知小姐那个吗</p></div>
<div class='nf-chat-message them'><small>组长老师 · 14:35</small><p>嗯</p></div>
<div class='nf-chat-message me'><small>你 · 14:36</small><p>欧尼紧张吗</p></div>
<div class='nf-chat-message them'><small>组长老师 · 14:37</small><p>有点</p></div>
<div class='nf-chat-message me'><small>你 · 14:38</small><p>没事的！那边出来喝醉的人也很多，没关系的！</p></div>
<div class='nf-chat-message me'><small>你 · 14:39</small><p>泳知小姐会做得很好的~~~</p></div>
<div class='nf-chat-message them'><small>组长老师 · 14:40</small><p>你怎么比我还紧张</p></div>
<div class='nf-chat-message me'><small>你 · 14:41</small><p>我就是担心嘛ㅋㅋ</p></div>
<div class='nf-chat-message them'><small>组长老师 · 14:42</small><p>知道了。明天录完告诉你</p></div>
<div class='nf-chat-message me'><small>你 · 14:43</small><p>好！加油欧尼！</p></div>

<div class='nf-chat-date'>8月20日</div>
<div class='nf-chat-message them'><small>组长老师 · 22:15</small><p>最近是不是又没睡好？我看你今天状态不太对</p></div>
<div class='nf-chat-message me'><small>你 · 22:18</small><p>还好吧，最近一直在做皮肤管理</p></div>
<div class='nf-chat-message them'><small>组长老师 · 22:19</small><p>哦。你是不是又偷偷哭了</p></div>
<div class='nf-chat-message me'><small>你 · 22:21</small><p>没有</p></div>
<div class='nf-chat-message them'><small>组长老师 · 22:22</small><p>涩琪</p></div>
<div class='nf-chat-message me'><small>你 · 22:23</small><p>我先睡了，明天还要去做身材管理</p></div>
<div class='nf-chat-message them'><small>组长老师 · 22:24</small><p>……好</p></div>

<div class='nf-chat-date'>8月29日 · 欧尼回大邱开球</div>
<div class='nf-chat-message them'><small>组长老师 · 18:30</small><p>今天回大邱开球结束了</p></div>
<div class='nf-chat-message me'><small>你 · 18:32</small><p>辛苦了，今天真好看</p></div>
<div class='nf-chat-message them'><small>组长老师 · 18:33</small><p>就那样吧。我妈说让我多带点大枣给你</p></div>
<div class='nf-chat-message me'><small>你 · 18:34</small><p>……替我谢谢阿姨</p></div>
<div class='nf-chat-message them'><small>组长老师 · 18:35</small><p>你吃饭了吗</p></div>
<div class='nf-chat-message me'><small>你 · 18:36</small><p>吃了</p></div>
<div class='nf-chat-message them'><small>组长老师 · 18:37</small><p>吃的什么</p></div>
<div class='nf-chat-message me'><small>你 · 18:38</small><p>便利店</p></div>
<div class='nf-chat-message them'><small>组长老师 · 18:39</small><p>……</p></div>
<div class='nf-chat-message them'><small>组长老师 · 18:39</small><p>你以前不是说便利店的饭团不好吃吗</p></div>
<div class='nf-chat-message me'><small>你 · 18:40</small><p>今天饿了</p></div>
<div class='nf-chat-message them'><small>组长老师 · 18:41</small><p>哦</p></div>
<div class='nf-chat-message them'><small>组长老师 · 18:41</small><p>那你早点睡吧</p></div>

<div class='nf-chat-date'>9月7日 · Dior活动当天</div>
<div class='nf-chat-message them'><small>组长老师 · 22:30</small><p>活动结束了</p></div>
<div class='nf-chat-message me'><small>你 · 22:32</small><p>辛苦了，今天真漂亮</p></div>
<div class='nf-chat-message them'><small>组长老师 · 22:33</small><p>嗯，刚上车</p></div>
<div class='nf-chat-message me'><small>你 · 22:35</small><p>我把日本空下来的时间整理好了</p></div>
<div class='nf-chat-message me'><small>你 · 22:35</small><p>福冈有个展，结束早的话可以一起去。还可以拍一段两个人挑唱片的</p></div>
<div class='nf-chat-message them'><small>组长老师 · 22:39</small><p>到时候看吧</p></div>
<div class='nf-chat-message me'><small>你 · 22:41</small><p>你不想拍也没关系，我可以改成一个人的</p></div>
<div class='nf-chat-message them'><small>组长老师 · 22:44</small><p>不是不想。我现在有点累，晚一点再看</p></div>
<div class='nf-chat-message me'><small>你 · 22:47</small><p>好，我发给你</p></div>
<div class='nf-chat-message them'><small>组长老师 · 22:51</small><p>嗯</p></div>

<div class='nf-chat-date'>9月10日 · 矛盾爆发</div>
<div class='nf-chat-message them'><small>组长老师 · 23:06</small><p>你这两天是不是在躲我？</p></div>
<div class='nf-chat-message me'><small>你 · 23:11</small><p>没有啊，最近一直在做皮肤管理和身材管理</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:12</small><p>那你怎么回消息这么慢？</p></div>
<div class='nf-chat-message me'><small>你 · 23:13</small><p>最近太忙了，昨天还去看了个电影</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:13</small><p>哦</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:14</small><p>那你早点休息</p></div>
<div class='nf-chat-message me'><small>你 · 23:15</small><p>……</p></div>
<div class='nf-chat-message me'><small>你 · 23:16</small><p>欧尼，你不问问我为什么忙吗</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:16</small><p>啊？你为什么忙？</p></div>
<div class='nf-chat-message me'><small>你 · 23:17</small><p>……没什么</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:17</small><p>涩琪，你最近有点奇怪</p></div>
<div class='nf-chat-message me'><small>你 · 23:18</small><p>我哪里奇怪了</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:18</small><p>你以前不会这样</p></div>
<div class='nf-chat-message me'><small>你 · 23:19</small><p>我哪样了</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:20</small><p>就是……你好像在躲什么</p></div>
<div class='nf-chat-message me'><small>你 · 23:21</small><p>我没有</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:21</small><p>好，你说没有就没有</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:22</small><p>那你早点睡吧</p></div>
<div class='nf-chat-message me'><small>你 · 23:23</small><p>……</p></div>
<div class='nf-chat-message me'><small>你 · 23:24</small><p>欧尼你已经撑了够久了</p></div>
<div class='nf-chat-message them'><small>组长老师 · 23:24</small><p>嗯？什么？</p></div>
<div class='nf-chat-message me'><small>你 · 23:25</small><p>没什么。晚安</p></div>

<div class='nf-chat-date'>9月12日 · 冷战第二天</div>
<div class='nf-chat-message them'><small>组长老师 · 08:12</small><p>早餐吃了吗？</p></div>
<div class='nf-chat-message me'><small>你 · 08:16</small><p>嗯</p></div>
<div class='nf-chat-message them'><small>组长老师 · 08:16</small><p>吃了什么？</p></div>
<div class='nf-chat-message me'><small>你 · 08:20</small><p>等一下吃</p></div>
<div class='nf-chat-message them'><small>组长老师 · 08:21</small><p>别空腹吃药</p></div>
<div class='nf-chat-message me'><small>你 · 08:24</small><p>知道了</p></div>

<div class='nf-chat-date'>9月14日 · 你先出发</div>
<div class='nf-chat-message them'><small>组长老师 · 09:03</small><p>你已经出发了吗？</p></div>
<div class='nf-chat-message me'><small>你 · 09:08</small><p>嗯</p></div>
<div class='nf-chat-message them'><small>组长老师 · 09:09</small><p>怎么没告诉我？</p></div>
<div class='nf-chat-message me'><small>你 · 09:14</small><p>Manager知道</p></div>
<div class='nf-chat-message them'><small>组长老师 · 09:15</small><p>我问的不是工作安排</p></div>
<div class='nf-chat-message me'><small>你 · 09:21</small><p>到了再说吧</p></div>
<div class='nf-chat-message them'><small>组长老师 · 09:22</small><p>落地以后把外套穿上。那边下雨</p></div>
<div class='nf-chat-message me'><small>你 · 09:24</small><p>好</p></div>

<div class='nf-chat-date'>9月19日 · 福冈首场结束后</div>
<div class='nf-chat-message me'><small>你 · 21:20</small><p>你到了为什么没告诉我？</p></div>
<div class='nf-chat-message them'><small>组长老师 · 21:21</small><p>Manager不是告诉你了吗？</p></div>
<div class='nf-chat-message me'><small>你 · 21:21</small><p>说了。</p></div>
<div class='nf-chat-message them'><small>组长老师 · 21:22</small><p>那你知道了。</p></div>
<div class='nf-chat-message me'><small>你 · 21:22</small><p>我想听你告诉我。</p></div>
<div class='nf-chat-message them'><small>组长老师 · 21:23</small><p>你走的时候也没有告诉我。</p></div>
<div class='nf-chat-message me'><small>你 · 21:23</small><p>……</p></div>
<div class='nf-chat-message them'><small>组长老师 · 21:24</small><p>今天台上你一直在躲我。</p></div>
<div class='nf-chat-message me'><small>你 · 21:24</small><p>没有。</p></div>
<div class='nf-chat-message them'><small>组长老师 · 21:25</small><p>那你看着我说。</p></div>
<div class='nf-chat-message me'><small>你 · 21:26</small><p>你已经回房间了吗？</p></div>
<div class='nf-chat-message them'><small>组长老师 · 21:26</small><p>嗯。</p></div>
<div class='nf-chat-message me'><small>你 · 21:27</small><p>门别锁。</p></div>
</div><div class='nf-story-chat-tools'><button data-route='ktstory'>消息列表</button><button data-route='feed'>论坛</button></div>`, 'nf-story-chat');
  }

  function groupchat() {
    return wrap(`${head('Red Velvet', 'ktstory')}<div class='nf-scroll nf-chat-scroll'><div class='nf-chat-date'>9月14日</div><div class='nf-chat-message them'><small>Wendy · 10:28</small><p>涩琪先出发了吗？</p></div><div class='nf-chat-message me'><small>你 · 10:31</small><p>嗯，有个人拍摄。</p></div><div class='nf-chat-message them'><small>Yeri · 10:32</small><p>到日本帮我看便利店新品！！</p></div><div class='nf-chat-message them'><small>Joy · 10:34</small><p>她先落地再说ㅋㅋ</p></div><div class='nf-chat-date'>9月19日 · 福冈首场结束后</div><div class='nf-chat-message them'><small>Wendy · 21:12</small><p>首场顺利结束了吗？</p></div><div class='nf-chat-message them'><small>Joy · 21:13</small><p>我刚看到日本账号发预告了ㅠㅠ</p></div><div class='nf-chat-message them'><small>Yeri · 21:13</small><p>结束以后记得吃饭！！</p></div><div class='nf-chat-message them'><small>组长老师 · 21:14</small><p>刚结束，大家辛苦了。</p></div><div class='nf-chat-message me'><small>你 · 21:14</small><p>结束了ㅎㅎ</p></div><div class='nf-chat-message them'><small>Wendy · 21:15</small><p>你们两个回复怎么像工作报告</p></div><div class='nf-chat-message them'><small>Joy · 21:15</small><p>让她们先喘口气吧ㅋㅋ</p></div><div class='nf-chat-message them'><small>Yeri · 21:16</small><p>合照发群里！</p></div><div class='nf-chat-message them'><small>组长老师 · 21:16</small><p>等官方发。</p></div><div class='nf-chat-message me'><small>你 · 21:17</small><p>嗯。</p></div></div><div class='nf-story-chat-tools'><button data-route='ktstory'>消息列表</button></div>`, 'nf-story-chat');
  }

  function enrichedManagerChat() {
    const later = `<div class='nf-chat-date'>9月14日 · 涩琪抵达日本</div><div class='nf-chat-message them'><small>Manager · 15:08</small><p>车在出口等。到酒店以后先休息，晚一点再确认明天的拍摄。</p></div><div class='nf-chat-message me'><small>你 · 15:09</small><p>知道了。</p></div><div class='nf-chat-date'>9月16日</div><div class='nf-chat-message them'><small>Manager · 17:42</small><p>珠泫已经落地了，稍后直接回酒店。</p></div><div class='nf-chat-message them'><small>Manager · 17:42</small><p>明天彩排时间不变。</p></div><div class='nf-chat-message me'><small>你 · 17:44</small><p>她今天过来的吗？</p></div><div class='nf-chat-message them'><small>Manager · 17:44</small><p>嗯，刚到。</p></div><div class='nf-chat-message me'><small>你 · 17:45</small><p>好，我知道了。</p></div><div class='nf-chat-date'>9月19日 · 福冈首场结束后</div><div class='nf-chat-message them'><small>Manager · 20:48</small><p>首场结束辛苦了。车在 B1，十五分钟后出发。</p></div><div class='nf-chat-message them'><small>Manager · 20:49</small><p>网上有一篇帖子在讨论你们为什么没有一起飞，也有人在问珠泫是什么时候到日本的。</p></div><div class='nf-chat-message them'><small>Manager · 20:49</small><p>先不要回应，也不要用个人账号解释。官方照片等日本运营发。</p><button class='nf-inline' data-open-post='coldwar'>查看正在升温的讨论 →</button></div><div class='nf-chat-message them'><small>Manager · 20:50</small><p>明天集合提前十五分钟。今晚先休息。</p></div>`;
    return wrap(`${head('Manager', 'ktstory', '<button data-route="ktstory" aria-label="聊天列表">☰</button>')}<div class='nf-scroll nf-chat-scroll'>${root.PreludeData?.chatHtml('manager') || ''}${later}</div><div class='nf-story-chat-tools'><button data-route='ktstory'>消息列表</button><button data-route='notebook'>备忘录</button></div>`, 'nf-story-chat');
  }

  function enrichedCoupleChat() {
    const later = `<div class='nf-chat-date'>9月14日 · 你先出发</div><div class='nf-chat-message them'><small>组长老师 · 09:03</small><p>你已经出发了吗？</p></div><div class='nf-chat-message me'><small>你 · 09:08</small><p>嗯</p></div><div class='nf-chat-message them'><small>组长老师 · 09:09</small><p>怎么没告诉我？</p></div><div class='nf-chat-message me'><small>你 · 09:14</small><p>Manager知道</p></div><div class='nf-chat-message them'><small>组长老师 · 09:15</small><p>我问的不是工作安排</p></div><div class='nf-chat-message me'><small>你 · 09:21</small><p>到了再说吧</p></div><div class='nf-chat-message them'><small>组长老师 · 09:22</small><p>落地以后把外套穿上。那边下雨</p></div><div class='nf-chat-message me'><small>你 · 09:24</small><p>好</p></div><div class='nf-chat-date'>9月19日 · 福冈首场结束后</div><div class='nf-chat-message me'><small>你 · 21:20</small><p>你到了为什么没告诉我？</p></div><div class='nf-chat-message them'><small>组长老师 · 21:21</small><p>Manager不是告诉你了吗？</p></div><div class='nf-chat-message me'><small>你 · 21:21</small><p>说了。</p></div><div class='nf-chat-message them'><small>组长老师 · 21:22</small><p>那你知道了。</p></div><div class='nf-chat-message me'><small>你 · 21:22</small><p>我想听你告诉我。</p></div><div class='nf-chat-message them'><small>组长老师 · 21:23</small><p>你走的时候也没有告诉我。</p></div><div class='nf-chat-message me'><small>你 · 21:23</small><p>……</p></div><div class='nf-chat-message them'><small>组长老师 · 21:24</small><p>今天台上你一直在躲我。</p></div><div class='nf-chat-message me'><small>你 · 21:24</small><p>没有。</p></div><div class='nf-chat-message them'><small>组长老师 · 21:25</small><p>那你看着我说。</p></div><div class='nf-chat-message me'><small>你 · 21:26</small><p>你已经回房间了吗？</p></div><div class='nf-chat-message them'><small>组长老师 · 21:26</small><p>嗯。</p></div><div class='nf-chat-message me'><small>你 · 21:27</small><p>门别锁。</p></div>`;
    return wrap(`${head('组长老师', 'ktstory', '<button data-route="callhistory" aria-label="通话记录">☎</button>')}<div class='nf-scroll nf-chat-scroll nf-couple-chat'>${root.PreludeData?.chatHtml('couple') || ''}${later}</div><div class='nf-story-chat-tools'><button data-route='ktstory'>消息列表</button><button data-route='feed'>论坛</button></div>`, 'nf-story-chat');
  }

  function callhistory() {
    const calls=(root.PreludeData?.calls||[]).filter(item=>item[1]==='组长老师');
    return wrap(`${head('通话记录', 'couplechat')}<div class="nf-scroll">${calls.map(([date,name,type,time,kind,detail])=>`<button class="nf-kkt-row" data-call-record="${esc(date)}|${esc(time)}"><span class="nf-kkt-avatar">${type==='视频通话'?'▣':'☎'}</span><span><strong>${type==='视频通话'?'FaceTalk':'VoiceTalk'} · ${esc(type)}</strong><p>${esc(detail)}</p></span><time>${esc(date)}<br>${esc(time)}</time></button>`).join('')}</div>`);
  }

  function kktmore() {
    return wrap(`${head('더보기', 'ktstory')}<div class="nf-scroll"><button class="nf-kkt-row" data-route="notebook"><span class="nf-kkt-avatar">▤</span><span><strong>메모 · 备忘录</strong><p>查看工作与日常记录</p></span><b>›</b></button><button class="nf-kkt-row" data-nav="phone"><span class="nf-kkt-avatar">☎</span><span><strong>통화 기록 · 通话记录</strong></span><b>›</b></button><button class="nf-kkt-row" data-nav="settings"><span class="nf-kkt-avatar">⚙</span><span><strong>설정 · 设置</strong></span><b>›</b></button></div>`, 'nf-kkt-app');
  }

  function enrichedGroupChat() {
    const later = `<div class='nf-chat-date'>9月14日</div><div class='nf-chat-message them'><small>Wendy · 10:28</small><p>涩琪先出发了吗？</p></div><div class='nf-chat-message me'><small>你 · 10:31</small><p>嗯，有个人拍摄。</p></div><div class='nf-chat-message them'><small>Yeri · 10:32</small><p>到日本帮我看便利店新品！！</p></div><div class='nf-chat-message them'><small>Joy · 10:34</small><p>她先落地再说ㅋㅋ</p></div><div class='nf-chat-date'>9月19日 · 福冈首场结束后</div><div class='nf-chat-message them'><small>Wendy · 21:12</small><p>首场顺利结束了吗？</p></div><div class='nf-chat-message them'><small>Joy · 21:13</small><p>我刚看到日本账号发预告了ㅠㅠ</p></div><div class='nf-chat-message them'><small>Yeri · 21:13</small><p>结束以后记得吃饭！！</p></div><div class='nf-chat-message them'><small>珠泫 · 21:14</small><p>刚结束，大家辛苦了。</p></div><div class='nf-chat-message me'><small>你 · 21:14</small><p>结束了ㅎㅎ</p></div><div class='nf-chat-message them'><small>Wendy · 21:15</small><p>你们两个回复怎么像工作报告</p></div><div class='nf-chat-message them'><small>Joy · 21:15</small><p>让她们先喘口气吧ㅋㅋ</p></div><div class='nf-chat-message them'><small>Yeri · 21:16</small><p>合照发群里！</p></div><div class='nf-chat-message them'><small>珠泫 · 21:16</small><p>等官方发。</p></div><div class='nf-chat-message me'><small>你 · 21:17</small><p>嗯。</p></div>`;
    return wrap(`${head('💖🧡💙💚💜', 'ktstory')}<div class='nf-scroll nf-chat-scroll'>${root.PreludeData?.chatHtml('group') || ''}${later}</div><div class='nf-story-chat-tools'><button data-route='ktstory'>消息列表</button></div>`, 'nf-story-chat');
  }

  function enrichedNotebook() {
    const memoDates=['2026-08-21T20:48:00','2026-08-05T15:00:00','2026-08-07T18:20:00','2026-08-22T18:26:00','2026-08-26T17:52:00','2026-08-24T19:42:00','2026-08-24T19:52:00','2026-09-02T19:18:00','2026-09-13T15:30:00','2026-08-20T09:40:00','2026-08-27T18:14:00','2026-08-13T14:00:00','2026-09-13T15:18:00','2026-09-10T23:46:00','2026-09-12T22:07:00'];
    const originals=(root.PreludeData?.memos||[]).map(([title,body],index)=>({id:'original-'+index,title,body,at:memoDates[index],folder:/日本|日语|行李|唱片/.test(title)?'日本':/练习|声乐|录制/.test(title)?'工作':'日常'}));
    const all=[...originals,...personalMemos.map(item=>({...item,folder:'我的记录',editable:true}))];
    const folders=['所有备忘录','工作','日常','日本','我的记录'];
    const note=all.find(item=>item.id===memoId);
    const title=note?'备忘录':memoFolder==='folders'?'文件夹':memoFolder;
    const back=note?'list':'folders';
    const header=`<header class="apple-memo-head"><button ${memoFolder==='folders'&&!note?'data-nav="phonehome"':`data-memo-back="${back}"`}>‹ ${memoFolder==='folders'&&!note?'主屏幕':note?memoFolder:'文件夹'}</button>${note?.editable?'<button data-memo-save>完成</button>':'<span>메모</span>'}</header>`;
    let body='';
    if(note){body=`<div class="apple-memo-date">${note.editable?'本机笔记 · 仅当前浏览器':'手机原有记录'}</div>${note.editable?`<input class="apple-memo-title-input" id="memo-title" maxlength="60" aria-label="标题" value="${esc(note.title)}"><textarea id="memo-body" aria-label="备忘录正文" maxlength="6000">${esc(note.body)}</textarea>`:`<h1>${esc(note.title)}</h1><div class="apple-memo-body">${esc(note.body)}</div>`}`;}
    else if(memoFolder==='folders'){body=`<h1>${title}</h1><h3>我的 iPhone</h3><div class="apple-memo-card">${folders.map(folder=>`<button data-memo-folder="${folder}"><i>▱</i><strong>${folder}</strong><small>${folder==='所有备忘录'?all.length:all.filter(item=>item.folder===folder).length}</small><b>›</b></button>`).join('')}</div><h3>Pocket Story</h3><div class="apple-memo-card"><button data-route="memoarchive"><i>▤</i><strong>探索记录与剧情存档</strong><b>›</b></button></div>`;}
    else {const filtered=all.filter(item=>(memoFolder==='所有备忘录'||item.folder===memoFolder)&&(!memoQuery||(item.title+' '+item.body).toLowerCase().includes(memoQuery.toLowerCase())));body=`<h1>${esc(title)}</h1><form id="memo-search"><input aria-label="搜索备忘录" placeholder="搜索" value="${esc(memoQuery)}"><button>搜索</button></form><div class="apple-memo-card">${filtered.map(item=>`<button class="apple-memo-row" data-memo-id="${esc(item.id)}"><strong>${esc(item.title)}</strong><small>${esc(item.body.split('\n')[0])}</small><span>${esc(item.folder)}</span></button>`).join('')||'<p class="apple-memo-empty">没有备忘录</p>'}</div>`;}
    if(note)body=body.replace(note.editable?'本机笔记 · 仅当前浏览器':'手机原有记录',note.at?new Date(note.at).toLocaleString('zh-CN',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}):'');
    const compose='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 5H5v15h15v-9M13 11l7-7 2 2-7 7-4 1z"/></svg>';
    return wrap(`${header}<div class="nf-scroll apple-memo-scroll">${body}</div><footer class="apple-memo-footer"><button data-memo-back="folders" aria-label="返回文件夹"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7V5h7l2 2h9v13H3z"/></svg></button><span>${note?'':all.length+' 条备忘录'}</span><button data-memo-new aria-label="新建备忘录">${compose}</button></footer>`, 'apple-memos');
  }

  function sidechat() {
    const chats = {
      wendy: { name: 'Wendy', body: `<div class='nf-chat-date'>9月14日</div><div class='nf-chat-message them'><small>Wendy · 18:06</small><p>安全到了吗？</p></div><div class='nf-chat-message me'><small>你 · 18:07</small><p>到了，在去酒店。</p></div><div class='nf-chat-message them'><small>Wendy · 18:08</small><p>吃饭了吗？</p></div><div class='nf-chat-message me'><small>你 · 18:08</small><p>飞机上吃了一点。</p></div><div class='nf-chat-message them'><small>Wendy · 18:09</small><p>这不算。到酒店以后跟我说一声。</p></div><div class='nf-chat-date'>9月19日</div><div class='nf-chat-message them'><small>Wendy · 16:40</small><p>彩排还好吗？</p></div><div class='nf-chat-message me'><small>你 · 16:47</small><p>嗯，没问题。</p></div><div class='nf-chat-message them'><small>Wendy · 16:48</small><p>我不是只问舞台。</p></div><div class='nf-chat-message me'><small>你 · 16:55</small><p>结束再说。</p></div>` },
      japan: { name: '日本运营', body: `<div class='nf-chat-date'>9月18日</div><div class='nf-chat-message them'><small>日本运营 · 12:10</small><p>福冈场后台拍摄安排已发送，请确认。</p></div><div class='nf-chat-message me'><small>你 · 12:14</small><p>确认了，谢谢。</p></div><div class='nf-chat-date'>9月19日</div><div class='nf-chat-message them'><small>日本运营 · 20:45</small><p>首场照片会在两位确认后上传。</p></div><div class='nf-chat-message them'><small>日本运营 · 20:46</small><p>如果有不使用的照片请直接标记。</p></div><div class='nf-chat-message me'><small>你 · 20:47</small><p>好。</p></div>` },
      styling: { name: '造型室', body: `<div class='nf-chat-date'>9月18日</div><div class='nf-chat-message them'><small>造型室 · 17:32</small><p>明天耳饰准备了两套，彩排后再决定。</p></div><div class='nf-chat-message me'><small>你 · 17:34</small><p>第二套轻一点吗？</p></div><div class='nf-chat-message them'><small>造型室 · 17:35</small><p>轻一点，也不会勾到衣服。</p></div><div class='nf-chat-message me'><small>你 · 17:36</small><p>那先试第二套。</p></div><div class='nf-chat-message them'><small>造型室 · 17:38</small><p>好，明天带到现场。</p></div>` },
      joy: { name: 'Joy', body: `<div class='nf-chat-date'>9月18日</div><div class='nf-chat-message them'><small>Joy · 22:01</small><p>便利店新品呢？</p></div><div class='nf-chat-message me'><small>你 · 22:05</small><p>没来得及去。</p></div><div class='nf-chat-message them'><small>Joy · 22:05</small><p>不是说好要拍给我看吗ㅋㅋ</p></div><div class='nf-chat-message me'><small>你 · 22:08</small><p>后面还有时间。</p></div><div class='nf-chat-message them'><small>Joy · 22:09</small><p>行程很长，别第一周就把自己累坏了。</p></div>` }
    };
    const chat = chats[kktThread] || chats.wendy;
    return wrap(`${head(chat.name, 'ktstory')}<div class='nf-scroll nf-chat-scroll'>${chat.body}</div><div class='nf-story-chat-tools'><button data-route='ktstory'>消息列表</button></div>`, 'nf-story-chat');
  }

  function isAvailable(post) {
    const datedBeforeToday = /^\d{2}\.\d{2}/.test(post.time) && !post.time.startsWith('09.19');
    return (!post.unlockAfterOfficial || state.officialUnlocked) && (datedBeforeToday || post.time.slice(-5) <= storyTime());
  }

  function visiblePosts() {
    return DATA.posts.filter((post) => {
      if (post.category !== filter) return false;
      if (!isAvailable(post)) return false;
      const haystack = [post.title, post.author, post.body, ...post.comments.map((comment) => `${comment.user} ${comment.text}`)].join(' ').toLowerCase();
      return !query || haystack.includes(query.toLowerCase());
    }).sort((a, b) => sortMode === '最新' ? b.time.localeCompare(a.time) : 0);
  }

  function visibleComments(post) {
    const postDate = post.time.slice(0, 5);
    return postDate < '09.19'
      ? post.comments
      : post.comments.filter((comment) => comment.time <= storyTime());
  }

  function postCard(post, index) {
    const rank = index + 1;
    return `<button class="nf-post-card" data-post="${post.id}"><span class="nf-pann-rank ${rank <= 3 ? 'top' : ''}">${String(rank).padStart(2, '0')}</span><span class="nf-pann-row"><span class="nf-row-title"><i class="nf-feed-tag">${esc(post.tag)}</i><strong>${esc(post.title)}</strong><em>(${visibleComments(post).length})</em>${state.read.includes(post.id) ? '' : '<i class="nf-new-mark">N</i>'}</span><span class="nf-row-info"><span>${esc(post.author)}</span><span>${esc(post.time)}</span><span>浏览 ${esc(post.views)}</span></span></span></button>`;
  }

  function feed() {
    const officialBanner = state.officialUnlocked ? `<button class="nf-official-banner" data-route="official"><span>21:15 · RV JP</span><strong>福冈首场官方照片已发布</strong><b>查看 →</b></button>` : '';
    const timeline = filter === '追星' && !query ? `<section class="nf-forum-brief"><small>公开记录 · 09.14—09.19</small><div><button data-open-post="airport-gap"><time>14</time><strong>单人机场图</strong><span>目的地未写</span></button><button data-open-post="ins-context"><time>16</time><strong>个人 INS</strong><span>专辑与练习</span></button><button data-open-post="stage-counter"><time>19</time><strong>福冈首场</strong><span>现场说法不同</span></button></div></section>` : '';
    return wrap(`<header class="nf-pann-brand"><button class="nf-pann-menu" data-route="notebook" aria-label="打开备忘录">☰</button><div><strong>pann<span>판</span></strong><small>匿名讨论区</small></div><button class="nf-pann-search-icon" data-focus-search aria-label="搜索帖子">⌕</button><button class="nf-pann-mobile" data-nav="phonehome" aria-label="返回手机">⌂</button></header><nav class="nf-pann-topnav"><button data-filter="追星" class="${filter === '追星' ? 'active' : ''}">팬톡 <small>追星讨论</small></button><button data-filter="恋爱解答" class="${filter === '恋爱解答' ? 'active' : ''}">연애 <small>恋爱解答</small></button></nav>${notice}<div class="nf-search"><span>⌕</span><form id="nf-search-form"><input id="nf-search" value="${esc(query)}" placeholder="搜索帖子或关键词" aria-label="搜索论坛"><button>搜索</button></form></div><div class="nf-pann-channel"><span>${filter === '追星' ? '팬톡 <b>福冈首场</b>' : '연애 <b>恋爱解答</b>'}</span><button data-route="notebook">备忘录 ›</button></div><div class="nf-scroll">${officialBanner}<section class="nf-pann-today"><div><h1>${filter === '追星' ? '今日热帖' : '恋爱解答'} <small>${filter === '追星' ? '오늘의 톡' : '연애 고민'}</small></h1><span>09.19 · ${storyTime()}</span></div><p>${filter === '追星' ? '正在讨论 <strong># 福冈首场的气氛</strong>' : '匿名求助 <strong># 回避与疲惫</strong>'}</p></section>${timeline}<div class="nf-pann-sort"><span>${filter} · ${visiblePosts().length} 篇</span><div><button data-sort="热门" class="${sortMode === '热门' ? 'selected' : ''}">热门</button><i>│</i><button data-sort="最新" class="${sortMode === '最新' ? 'selected' : ''}">最新</button></div></div><div class="nf-feed" id="nf-feed">${visiblePosts().map(postCard).join('') || '<div class="nf-empty">没有找到帖子。</div>'}</div><div class="nf-pann-footer"><strong>pann<span>판</span></strong><p>the same blank · Chapter 01</p><small>虚构同人作品</small></div></div><nav class="nf-bottom"><button class="selected" data-route="feed">톡<span>论坛</span></button><button data-route="notebook">▤<span>备忘录</span></button><button data-route="ktstory">◌<span>KKT${badge() ? ' · 1' : ''}</span></button><button data-nav="phonehome">▦<span>桌面</span></button></nav>`);
  }

  function forumHeader() {
    return `<header class="nf-head nf-pann-head"><button data-route="feed" aria-label="返回论坛">‹</button><strong><b>pann</b> <span>판</span> <small>톡톡</small></strong><button data-nav="phonehome" aria-label="返回手机">⌂</button></header>`;
  }

  function commentMarkup(comment, post, index) {
    const link = comment.link === 'instagram' ? `<button class="nf-inline" data-open-ig="sg-260916">${esc(comment.label)} ↗</button>` : '';
    return `<article class="nf-comment"><div class="nf-comment-meta"><strong>${esc(comment.user)}${post.author !== '匿名' && comment.user === post.author ? '<i>楼主</i>' : ''}</strong><span>${index + 1}楼 · ${esc(comment.time)}</span></div><p>${esc(comment.text)}</p>${link}<div class="nf-pann-comment-foot"><span>回复</span><button aria-label="赞同此楼">△ ${Math.max(3, 34 - index * 3)}</button></div></article>`;
  }

  function forumReplyMarkup() {
    const choices = {
      uneasy: ['我也觉得有点不一样，但说不清是哪儿。', 'ㅇㅇ', '就是这种说不清才烦。我都怕自己把担心传给别人了。', '后排望远镜', '我理解你们担心。只求别把安可那段直接从记忆里删掉。'],
      counter: ['安可明明有靠近，标题是不是说太满了？', 'ㅇㅇ', '我正文写了不是零互动啊。你们都只看标题吗……', '路过的行李箱', '我就是被标题吓进来的，看完正文才知道你们其实在说两件事。'],
      wait: ['我先等官方图，再回来看看。', '同框收藏夹', '我也等。只是照片出来以后，可能还是解释不了现场的感觉。', '透明雨伞', '先等吧。我还在车站，手机已经快没电了。']
    };
    if (!state.forumReply) return `<section class="nf-forum-participate"><small>匿名访客 · 你会回哪一句？</small><button data-forum-reply="uneasy">我也觉得有点不一样，但说不清是哪儿</button><button data-forum-reply="counter">安可明明有靠近，标题是不是说太满了？</button><button data-forum-reply="wait">我先等官方图，再回来看看</button></section>`;
    const [mine, user1, reply1, user2, reply2] = choices[state.forumReply];
    return `<section class="nf-forum-participate replied"><small>你加入了讨论 · 刚刚</small><p><b>匿名访客</b>　${mine}</p><p><b>${user1}</b>　${reply1}</p><p><b>${user2}</b>　${reply2}</p><button data-forum-reply="reset">换一种说法 ↻</button></section>`;
  }

  function outsiderReplyMarkup() {
    const choices = {
      facts: ['能确认的只有两个人今晚同台。机场图没写另一位的行程。', '噢，那张图不是“她没来”的证据。我刚差点被标题带跑，谢谢你把话说清楚。'],
      feeling: ['我们也知道没有证据。只是以前看她们很自然，今天心里突然空了一下。', '我懂了。外人想要一条证据，你们其实是在说自己为什么难过。刚才我问得太像审问了。'],
      lost: ['我也是被热榜拉进来的，看到现在脑子里有三个版本。', '笑死，终于有人跟我同桌补课。先记一条：现场不能拍，每个人看到的范围不一样。']
    };
    if (!state.outsiderReply) return `<section class="nf-forum-participate"><small>路人还在楼里 · 要怎么回答她？</small><button data-outsider-reply="facts">只告诉她今晚能确认的事</button><button data-outsider-reply="feeling">说说粉丝为什么会难过</button><button data-outsider-reply="lost">承认自己也快看晕了</button></section>`;
    const [mine, reply] = choices[state.outsiderReply];
    return `<section class="nf-forum-participate replied"><small>你们又聊了两句 · 刚刚</small><p><b>匿名访客</b>　${mine}</p><p><b>隔壁版误入</b>　${reply}</p><button data-outsider-reply="reset">换一种说法 ↻</button></section>`;
  }

  function rumorChainMarkup() {
    const fragments = [
      ['first', '20:07 · 最早的提问', '“我没刷到另一位的机场图。她已经过去了吗？”', '提问的人并不知道她在哪里。'],
      ['second', '20:19 · 被截掉开头的转述', '“另一位的机场图没有，应该还没飞？”', '猜测被写成了看似有方向的回答。'],
      ['third', '20:31 · 热榜里的说法', '“她还没去日本，所以两个人分开走。”', '一句没根据的推测又长出一个原因。']
    ];
    const complete = state.rumorSeen.length === 3;
    return `<section class="nf-rumor-chain"><small>论坛旧楼归档</small><h2>一句话，传成了三句话</h2><p>逐条打开原句，看看哪一步开始多出了确定的结论。</p>${fragments.map(([id, label, quote, note]) => `<button data-rumor-fragment="${id}" class="${state.rumorSeen.includes(id) ? 'opened' : ''}"><span>${label}</span><strong>${state.rumorSeen.includes(id) ? quote : '点开查看当时写了什么 ↗'}</strong>${state.rumorSeen.includes(id) ? `<em>${note}</em>` : ''}</button>`).join('')}${complete ? '<div class="nf-rumor-reveal"><b>你找到了最初那句话。</b><p>“没刷到”经过两次转述，变成“她还没去”，又被接上“所以两人分开走”。今晚的同台推翻了传言的一部分，但并没有解释舞台上的紧张。</p><button data-route="notebook">查看已保存的记录 →</button></div>' : `<p class="nf-rumor-count">已对照 ${state.rumorSeen.length}/3 条</p>`}</section>`;
  }

  function progressCard() {
    const tasks = [
      ['核对机场图能说明什么', state.read.includes('airport-gap')],
      ['听另一位观众怎么描述舞台', state.read.includes('stage-counter')],
      ['保存9月14日机场图', state.seen.includes('airport-seulgi-0914')],
      ['收藏9月16日公开 INS', state.igSaved.includes('sg-260916')]
    ];
    if (state.officialUnlocked) return `<button class="nf-progress-ready" data-route="official"><span>21:15 · 官方更新</span><strong>RV JP 发布了福冈首场照片</strong><b>查看照片 →</b></button>`;
    if (ready()) return `<div class="nf-progress-card ready"><small>21:14 · 讨论还在更新</small><h3>刚才谁都没有现场照片</h3><p>你已经看过相反的现场描述，也保存了两条公开记录。现在有人说 RV JP 更新了。</p><button class="nf-primary" data-refresh-official>刷新热帖，查看官方更新</button></div>`;
    return `<div class="nf-progress-card"><small>把讨论放在同一条时间线上</small><h3>这些说法能对得上吗？</h3><p class="nf-progress-intro">先听不同座位的观众，再回头看机场图和 INS。那句“她没去日本”又是从哪里来的？</p>${tasks.map(([label, done]) => `<p class="${done ? 'done' : ''}"><span>${done ? '✓' : '○'}</span>${label}</p>`).join('')}<div class="nf-progress-actions">${!state.read.includes('airport-gap') ? '<button data-open-post="airport-gap">核对机场说法</button>' : ''}${!state.read.includes('stage-counter') ? '<button data-open-post="stage-counter">另一种现场记忆</button>' : ''}${state.rumorSeen.length !== 3 ? '<button data-open-post="flight-rumor">追那句机场传言</button>' : ''}${!state.seen.includes('airport-seulgi-0914') ? '<button data-airport-photo="airport-seulgi-0914">查看机场原图</button>' : ''}${!state.igSaved.includes('sg-260916') ? '<button data-open-ig="sg-260916">打开16日 INS</button>' : ''}</div></div>`;
  }

  function thread() {
    const post = DATA.posts.find((item) => item.id === postId) || DATA.posts[0];
    const isMain = post.id === 'coldwar';
    const related = (post.related || []).map((id) => DATA.posts.find((item) => item.id === id)).filter((item) => item && isAvailable(item));
    const relatedMarkup = related.length ? `<section class="nf-related-threads"><small>这栋楼的人也在看</small>${related.map((item) => `<button data-open-post="${item.id}"><span>${esc(item.tag)} · ${esc(item.time)}</span><strong>${esc(item.title)}</strong><b>›</b></button>`).join('')}</section>` : '';
    const officialReturn = post.id === 'photo-reactions' ? '<button class="nf-pann-return" data-route="official">回到 RV JP 官方照片 →</button>' : '';
    const comments = visibleComments(post);
    const playerReplies = (isMain && state.forumReply ? 3 : 0) + (post.id === 'outsider-view' && state.outsiderReply ? 2 : 0);
    const postImage = post.image ? `<figure class="nf-thread-image"><img src="${esc(post.image)}" alt="${esc(post.title)}的帖子配图" loading="lazy"><figcaption>帖子配图 · 公开内容整理</figcaption></figure>` : '';
    return wrap(`${forumHeader()}${notice}<div class="nf-scroll"><div class="nf-pann-breadcrumb"><button data-route="feed">pann</button><span>›</span><span>${esc(post.category)}</span></div><article class="nf-thread"><div class="nf-pann-thread-label">${post.tag === '热议' ? '<span>오늘의 톡</span> 今日热帖' : `${esc(post.tag)} · ${esc(post.category)}`}</div><h1>${esc(post.title)}</h1><div class="nf-pann-byline"><span>${esc(post.author)} (匿名)</span><span>${esc(post.time)}</span></div><div class="nf-pann-thread-stats">浏览 ${esc(post.views)}<span>回复 ${comments.length + playerReplies}</span></div><div class="nf-prose">${esc(post.body)}</div>${postImage}${post.airportPhotos ? airportGallery() : ''}<div class="nf-pann-post-actions"><button class="nf-bookmark ${state.saved.includes(post.id) ? 'on' : ''}" data-save-post="${post.id}"><span>${state.saved.includes(post.id) ? '★' : '☆'}</span><strong>${state.saved.includes(post.id) ? '已收藏' : '收藏帖子'}</strong></button></div></article>${post.id === 'flight-rumor' ? rumorChainMarkup() : ''}<div class="nf-comments-head"><strong>全部回复 <em>${comments.length + playerReplies}</em></strong></div>${comments.map((comment, index) => commentMarkup(comment, post, index)).join('')}${isMain ? forumReplyMarkup() + progressCard() : ''}${post.id === 'outsider-view' ? outsiderReplyMarkup() : ''}${relatedMarkup}${officialReturn}<button class="nf-pann-return" data-route="feed">목록 · 返回列表</button></div><button class="nf-thread-bottom" data-route="notebook">▤ 打开备忘录</button>`);
  }

  function airportGallery() {
    return `<section class="nf-airport-gallery"><header><strong>公开机场图</strong><span>2026.09.14</span></header><div class="nf-airport-grid">${DATA.airportPhotos.map((photo) => `<figure><button data-airport-photo="${photo.id}"><img src="${photo.src}" alt="${esc(photo.alt)}" width="1066" height="1600" loading="lazy"><span>查看并保存 ↗</span></button><figcaption>${esc(photo.caption)}<small>© ${esc(photo.credit)}</small></figcaption></figure>`).join('')}</div><p>转载文字没有写目的地。</p></section>`;
  }

  function airportPhoto() {
    const photo = DATA.airportPhotos.find((item) => item.id === airportPhotoId) || DATA.airportPhotos[0];
    const saved = state.seen.includes(photo.id);
    return wrap(`${head('公开机场图', 'post')}<div class="nf-scroll nf-airport-detail"><img src="${photo.src}" alt="${esc(photo.alt)}" width="1066" height="1600"><div><small>${photo.date} · 公开资料</small><h1>${esc(photo.caption)}</h1><p>${esc(photo.note)}</p><p class="nf-source-credit">© ${esc(photo.credit)}</p><a href="${photo.source}" target="_blank" rel="noopener noreferrer">查看来源 ↗</a><button class="nf-primary" data-save-airport="${photo.id}">${saved ? '✓ 已保存到剧情相册' : '保存到剧情相册'}</button><button class="nf-text-button" data-route="post">返回热帖</button></div></div>`);
  }

  function instagram() { return root.InstagramArchive.html(state); }

  function officialPost() {
    if (!state.officialUnlocked) return thread();
    if (!state.officialSeen) { state.officialSeen = true; save(); }
    const post = DATA.officialPost;
    const aftermath = !state.read.includes('photo-reactions') ? `<div class="nf-after-photo"><small>21:18 · 论坛还在刷新</small><p>同一张合照，有人松了口气，也有人觉得问题还在。</p><button data-open-post="photo-reactions">回论坛看照片发出后的讨论 →</button></div>` : `<div class="nf-after-photo settled"><small>21:22 · 你看过了两边的说法</small><p>照片能确认两人同台与合照，不能解释台下的沉默。</p></div>`;
    return wrap(`${head('RV JP 官方更新', 'feed')}<div class="nf-scroll nf-official-post"><div class="nf-official-account"><span>RV</span><div><strong>@${esc(post.account)}</strong><small>官方日本账号</small></div><time>21:15</time></div><p class="nf-official-copy">${esc(post.text)}</p><div class="nf-official-grid">${DATA.officialPhotos.map((photo, index) => `<figure class="${index === 0 ? 'hero' : ''}"><img src="${photo.src}" alt="${esc(photo.alt)}" loading="lazy"><figcaption>${esc(photo.caption)}</figcaption></figure>`).join('')}</div><a class="nf-source-link" href="${post.source}" target="_blank" rel="noopener noreferrer">查看官方原帖 ↗</a><aside><strong>能确认的事</strong><p>福冈首场结束，两个人共同出现在官方照片里。</p><strong>仍然不能确认的事</strong><p>另一位具体抵达日本的时间，以及台下发生过什么。</p></aside>${aftermath}${state.read.includes('photo-reactions') || state.chapterComplete ? `<button class="nf-primary" data-complete-chapter>${state.chapterComplete ? '✓ 第一章已完成' : '保存这条记录，结束第一章'}</button>` : ''}</div>`);
  }

  function chapterEnd() {
    const quietThread = state.read.includes('older-sister') ? '<div class="nf-end-whisper"><small>21:21 · 热帖有新回复</small><p>有人问：楼主是不是删东西了？</p><p>页面往上翻，原来的几句话已经找不到了。你不知道那是楼主自己删的，还是只是论坛刷新后的错觉。</p><button data-open-post="coldwar">回去看看热帖 →</button></div>' : '';
    return wrap(`<div class="nf-opening nf-chapter-end"><div class="nf-open-logo">POCKET STORY<span>the same blank</span></div><small>CHAPTER 01 · COMPLETE</small><h1>照片看起来正常。<br>讨论却没有真正结束。</h1><p>一条传言可以追到源头，官方照片可以确认两人同台。<br>可没有哪张图能解释一个人为什么不敢先开口。</p>${quietThread}<div class="nf-end-date">2026.09.19 · 21:22</div><button class="nf-primary" data-nav="phonehome">返回手机桌面</button><button class="nf-text-button" data-route="notebook">查看第一章备忘录</button><div class="nf-next-locked"><span>CHAPTER 02</span><strong>尚未开放</strong><small>十月的日本相关 INS 将作为下一章前的过渡。</small></div>${notice}</div>`);
  }

  function notebook() {
    const rows = [
      ['09.14', '涩琪单人机场公开图', state.seen.includes('airport-seulgi-0914'), '转载未写目的地'],
      ['09.16', '涩琪发布日本专辑与练习 INS', state.igSaved.includes('sg-260916'), '没有说明同行人或位置'],
      ['09.19', '福冈首场，观众确认两人同台', state.read.includes('coldwar'), '日本场无公开饭拍'],
      ['21:15', 'RV JP 发布双人官方照片', state.officialUnlocked, '确认首场结束时两人都在场']
    ];
    const perspectives = [
      ['现场感受', state.read.includes('coldwar'), '有人觉得两人很紧张、很少对上视线；这是观众的回忆。'],
      ['相反目击', state.read.includes('stage-counter'), '另一位观众记得安可有靠近；座位不同，看到的范围不同。'],
      ['二手推断', state.read.includes('flight-rumor') || state.read.includes('airport-gap'), '“没看到另一位机场图”不能改写成“她还没到”。'],
      ['私人关系', state.read.includes('older-sister'), '匿名求助贴没有身份线索，不能据此认定当事人。']
    ];
    const myThought = {changed:'她们看起来确实变了。',tired:'可能只是都太累了。',unknown:'我现在说不准。'}[state.judgment];
    return wrap(`${head('备忘录')}<div class="nf-scroll nf-notebook"><small>THE SAME BLANK / CHAPTER 01</small><h1>只记录<br>能确认的事。</h1><p>“看见了什么”和“猜测了什么”分开保存。</p><div class="nf-timeline-notes">${rows.map(([time, title, done, note]) => `<article class="${done ? 'done' : ''}"><time>${time}</time><div><strong>${done ? '✓ ' : ''}${title}</strong><p>${note}</p></div></article>`).join('')}</div><section class="nf-memo-voices"><small>论坛说法 · 非事实证据</small>${perspectives.filter((item) => item[1]).map(([label, , detail]) => `<article><strong>${label}</strong><p>${detail}</p></article>`).join('') || '<p>读过帖子后，不同说法会整理在这里。</p>'}</section>${state.rumorSeen.length === 3 ? '<section class="nf-memo-voices"><small>找到的传言源头</small><article><strong>从提问变成断言</strong><p>最早只写“我没刷到机场图，她已经过去了吗？”；两次转述后变成“她还没去日本，所以两人分开走”。这不是航班证据。</p></article></section>' : ''}${myThought ? `<section class="nf-memo-voices"><small>我的暂时判断 · 可以改变</small><article><strong>${myThought}</strong><p>这是你的感受，不是关于她们关系的事实。</p></article></section>` : ''}${root.InstagramArchive.savedCards(state)}${state.chapterComplete ? '<div class="nf-chapter-note"><small>第一章完成</small><p>官方合照结束了“她是否在日本”的信息空白，却没有回答关系问题。</p><button data-route="chapterend">查看章节结尾 →</button></div>' : ''}<div class="nf-save-panel"><strong>第一章存档</strong><p>剧情进度保存在当前浏览器；LYSN 自由聊天数据保持独立。</p><button data-export>导出剧情存档</button><label>导入剧情存档<input type="file" id="nf-import" accept="application/json,.json" hidden></label><button data-restart-chapter>重新体验第一章</button></div></div>`);
  }

  function ytThumb(url){
    const m = url.match(/[?&]v=([\w-]+)/);
    return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : '';
  }
  function ytAvatar(name){
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=96&bold=true`;
  }
  function youtube() {
    const channels = {
      seulgi: {name:'Hi Seulgi', handle:'@hi_sseulgi', videos:[['两个最爱！幸福指数爆棚的香港 OOTD VLOG','16:33 · 2024.10.25','https://www.youtube.com/watch?v=beysuZ8t7Ho'],['最爱登场！涩琪和艾琳的乡村度假约会','17:57 · 2024.12.06','https://www.youtube.com/watch?v=2gXb5N1q9-4'],['现役女爱豆的年末工作生活','17:21 · 2025.01.24','https://www.youtube.com/watch?v=wcoEVQRGlUo'],['忙碌的生日周 VLOG','27:44 · 2025.02.28','https://www.youtube.com/watch?v=rNIm1Cf2tiA'],['日夜兼程的爱豆生活！31岁solo歌手回归期的24小时深度报道vlog','31:41 · 2025.04.04','https://www.youtube.com/watch?v=beysuZ8t7Ho'],['劳逸结合的涩琪生活🔥：服装试穿、SMTOWN LIVE演唱会','23:43 · 2025.02.27','https://www.youtube.com/watch?v=2gXb5N1q9-4']]},
      irene: {name:'IRENE', handle:'@IRENEsmtown', videos:[["Back by Popular Demand — It’s Me IRENE | MEXICO",'29:20 · 2025.09.19','https://www.youtube.com/watch?v=Q6-e-j7Nz60'],["Back by Popular Demand — It’s Me IRENE | BALANCE",'35:09 · 2025.06.23','https://www.youtube.com/watch?v=ZClPxSsQ3HU'],["IRENE’s Sweet Simple Series | London & Madrid",'21:37 · 2024.02.01','https://www.youtube.com/watch?v=CElObKdEPAk'],["IRENE’s Sweet Simple Series | Amsterdam & Barcelona",'20:46 · 2023.12.12','https://www.youtube.com/watch?v=RtGSAdY-9qQ'],["IRENE’s Sweet Simple Series | Berlin",'24:16 · 2023.09.14','https://www.youtube.com/watch?v=RtGSAdY-9qQ'],["IRENE’s Sweet Simple Series | Paris",'27:38 · 2023.08.16','https://www.youtube.com/watch?v=CElObKdEPAk']]},
      redvelvet: {name:'Red Velvet', handle:'@redvelvet', videos:[["Red Velvet《'The ReVe Festival 2022 - Birthday'》Jacket Behind",'22:23 · 2022.12.08','https://www.youtube.com/watch?v=zHhacq043to'],["[RV Days] Record (t)our Video #1",'25:00 · 2023.07.08','https://www.youtube.com/watch?v=H4Dk_ybKhn4'],["[RV Days] Record (t)our Video #2",'23:59 · 2023.07.18','https://www.youtube.com/watch?v=aVsatNKNZr0'],["[RV Days] ‘RED CIRCLE’ Behind with IRENE & SEULGI",'06:01 · 2023.11.21','https://www.youtube.com/watch?v=LtM_njC6MbI'],['一个人？两个影子｜Dance Practice & NYE','28:52 · 2024.03.06','https://www.youtube.com/watch?v=qW55hbkGC0c'],['IRENE & SEULGI — 我们来说一下艰辛的部分吧','25:02 · 2025.09.15','https://www.youtube.com/watch?v=6PubX76wsAc'],['SEULGI JOY 不要晃屁股 | SMTOWN LIVE 2025','25:52 · 2025.03.05','https://www.youtube.com/watch?v=6PubX76wsAc'],['这么快就结束了 好可惜啊 | SMTOWN LIVE','17:00 · 2025.09.05','https://www.youtube.com/watch?v=qW55hbkGC0c'],['新年多福💛 | Let’s Celebrate 2026 Behind','24:55 · 2026.01.20','https://www.youtube.com/watch?v=LtM_njC6MbI'],['IRENE&SEULGI的粉任🏠 | IRENE & SEULGI’s FANSSION','13:30 · 2026.02.09','https://www.youtube.com/watch?v=aVsatNKNZr0']]}
    };
    const nav = `<header class="yt-top"><button data-nav="phonehome" aria-label="返回手机">‹</button><strong><i>▶</i> YouTube</strong><span>⌕　◉</span></header>`;
    const bottom = `<nav class="yt-bottom"><button data-yt-channel="feed" class="${youtubeChannel==='feed'?'active':''}">⌂<small>首页</small></button><button data-yt-channel="shorts">▣<small>Shorts</small></button><button data-yt-channel="subscriptions">▤<small>订阅内容</small></button><button data-yt-channel="library">◉<small>我的</small></button></nav>`;
    if (youtubeVideo) {
      const [key,indexText]=youtubeVideo.split(':'), item=channels[key], video=item.videos[Number(indexText)]||item.videos[0];
      return wrap(`${nav}<div class="nf-scroll yt-watch"><button class="yt-back" data-yt-back>‹ 返回</button><a class="yt-player" href="${video[2]}" target="_blank" rel="noopener" style="--yt-cover:url('${ytThumb(video[2])}')" aria-label="在 YouTube 观看原视频"><span>▶</span></a><h1>${video[0]}</h1><p>${item.name} · ${video[1]}</p><div class="yt-actions"><a href="${video[2]}" target="_blank" rel="noopener">在 YouTube 观看</a><button>分享</button><button>保存</button></div><button class="yt-channel-line" data-yt-channel="${key}"><img src="${ytAvatar(item.name)}" alt=""><span><strong>${item.name}</strong><small>${item.handle}</small></span><b>已订阅</b></button></div>${bottom}`);
    }
    if (channels[youtubeChannel]) {
      const item=channels[youtubeChannel];
      return wrap(`${nav}<div class="nf-scroll yt-channel-page"><section class="yt-channel-head"><img src="${ytAvatar(item.name)}" alt="${item.name}头像"><div><h1>${item.name}</h1><p>${item.handle}</p><small>公开频道内容整理</small></div></section><div class="yt-tabs"><b>首页</b><span>视频</span><span>播放列表</span></div><h2>上传的视频</h2>${item.videos.map((video,index)=>`<button class="yt-video-row" data-yt-video="${youtubeChannel}:${index}"><span class="yt-thumb" style="--yt-cover:url('${ytThumb(video[2])}')"></span><span><strong>${video[0]}</strong><small>${item.name} · ${video[1]}</small></span><i>⋮</i></button>`).join('')}</div>${bottom}`);
    }
    const recommended=[['redvelvet',4],['seulgi',1],['irene',0],['redvelvet',2],['seulgi',3]];
    return wrap(`${nav}<div class="yt-chips"><button>全部</button><button>音乐</button><button>Vlog</button><button>最近上传</button></div><div class="nf-scroll yt-feed"><section class="yt-subscriptions"><strong>订阅内容</strong><div>${Object.entries(channels).map(([key,item])=>`<button data-yt-channel="${key}"><img src="${ytAvatar(item.name)}" alt=""><small>${item.name}</small></button>`).join('')}</div></section>${recommended.map(([key,index])=>{const item=channels[key],video=item.videos[index];return `<article class="yt-card"><button class="yt-card-thumb" data-yt-video="${key}:${index}" style="--yt-cover:url('${ytThumb(video[2])}')"><span>▶</span></button><div><button data-yt-channel="${key}"><img src="${ytAvatar(item.name)}" alt=""></button><p><strong>${video[0]}</strong><small>${item.name} · ${video[1]}</small></p><i>⋮</i></div></article>`}).join('')}</div>${bottom}`);
  }

  function weverse() {
    return wrap(`${head('Weverse', 'feed')}<div class="nf-scroll"><div class="nf-wv-title">W <span>Community</span></div><article class="nf-community"><small>FAN · 20:58</small><h3>首场辛苦了</h3><p>日本场不能拍，大家回去路上注意安全。等官方照片吧。</p></article>${notice}</div>`);
  }

  function albumCards() {
    const cards = [];
    if (state.seen.includes('airport-seulgi-0914')) cards.push(`<button class="gallery-item story-gallery" data-story-photo="airport-seulgi-0914"><img src="${DATA.airportPhotos[0].src}" alt="涩琪9月14日机场公开图"><span>09.14 · 机场图</span></button>`);
    if (state.officialUnlocked) cards.push(`<button class="gallery-item story-gallery" data-story-official><img src="${DATA.officialPhotos[0].src}" alt="福冈首场官方双人自拍"><span>09.19 · 福冈首场</span></button>`);
    if (!cards.length) return '';
    return `<div class="section-label story-album-label">CHAPTER 01 · 剧情相册</div><div class="gallery story-album-grid">${cards.join('')}</div>`;
  }

  function bindAlbum(screen) {
    screen.querySelectorAll('[data-story-photo]').forEach((button) => button.onclick = () => {
      airportPhotoId = button.dataset.storyPhoto;
      open('airportphoto', context);
    });
    screen.querySelectorAll('[data-story-official]').forEach((button) => button.onclick = () => open('official', context));
  }

  function bind() {
    const screen = context.screen;
    screen.querySelectorAll('[data-kkt-tab]').forEach(button=>button.onclick=()=>{
      const tab=button.dataset.kktTab;
      if(tab==='calls'){go('callhistory');return;}
      if(tab==='more'){go('kktmore');return;}
      kktTab=tab;go('ktstory');
    });
    const persistMemos=()=>{try{root.localStorage.setItem('pocket-story-personal-memos-v1',JSON.stringify(personalMemos));return true;}catch{context.toast('存储空间不足，笔记未保存');return false;}};
    screen.querySelectorAll('[data-memo-folder]').forEach(button=>button.onclick=()=>{memoFolder=button.dataset.memoFolder;memoId='';memoQuery='';go('notebook');});
    screen.querySelectorAll('[data-memo-id]').forEach(button=>button.onclick=()=>{memoId=button.dataset.memoId;go('notebook');});
    const saveDraft=()=>{const input=screen.querySelector('#memo-body');if(!input)return true;const item=personalMemos.find(item=>item.id===memoId);if(!item)return true;const previous={...item};item.title=screen.querySelector('#memo-title').value.trim()||'新建备忘录';item.body=input.value;if(!persistMemos()){Object.assign(item,previous);return false;}return true;};
    screen.querySelectorAll('[data-memo-back]').forEach(button=>button.onclick=()=>{if(!saveDraft())return;if(button.dataset.memoBack==='folders')memoFolder='folders';memoId='';go('notebook');});
    screen.querySelectorAll('[data-memo-save]').forEach(button=>button.onclick=()=>{if(saveDraft()){memoId='';go('notebook');context.toast('已保存');}});
    screen.querySelectorAll('[data-memo-new]').forEach(button=>button.onclick=()=>{if(!saveDraft())return;const item={id:'memo-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),title:'新建备忘录',body:''};personalMemos.unshift(item);if(!persistMemos()){personalMemos.shift();return;}memoFolder='我的记录';memoId=item.id;go('notebook');});
    const memoSearch=screen.querySelector('#memo-search');if(memoSearch)memoSearch.onsubmit=event=>{event.preventDefault();memoQuery=memoSearch.querySelector('input').value.trim();go('notebook');};
    screen.querySelectorAll('#memo-title,#memo-body').forEach(input=>input.oninput=()=>{const item=personalMemos.find(item=>item.id===memoId);if(item)item.at=new Date().toISOString();saveDraft();});
    screen.querySelectorAll('[data-call-record]').forEach(button=>button.onclick=()=>context.toast('历史通话记录 · 没有保存录音或视频'));
    if (route === 'instagram') {
      root.InstagramArchive.bind({
        screen,
        render,
        fiction: () => context.toast('第一章没有虚构 INS 动态。'),
        onSave: (id) => {
          state.igSaved = state.igSaved.includes(id) ? state.igSaved.filter((item) => item !== id) : [...state.igSaved, id];
          save();
          render();
          if (id === 'sg-260916' && state.igSaved.includes(id)) context.toast('已收藏9月16日公开 INS · 备忘录已更新');
        }
      });
    }
    screen.querySelectorAll('[data-route]').forEach((button) => button.onclick = () => go(button.dataset.route));
    screen.querySelectorAll('[data-kkt-thread]').forEach((button) => button.onclick = () => { kktThread = button.dataset.kktThread; go('sidechat'); });
    screen.querySelectorAll('[data-nav]').forEach((button) => button.onclick = () => context.navigate(button.dataset.nav));
    screen.querySelectorAll('[data-yt-channel]').forEach((button) => button.onclick = () => {
      youtubeChannel = button.dataset.ytChannel;
      youtubeVideo = '';
      render();
    });
    screen.querySelectorAll('[data-yt-video]').forEach((button) => button.onclick = () => {
      youtubeVideo = button.dataset.ytVideo;
      render();
    });
    screen.querySelectorAll('[data-yt-back]').forEach((button) => button.onclick = () => {
      youtubeVideo = '';
      render();
    });
    screen.querySelectorAll('[data-open-post]').forEach((button) => button.onclick = () => {
      postId = button.dataset.openPost;
      if (!state.read.includes(postId)) state.read.push(postId);
      save();
      go('post');
    });
    screen.querySelectorAll('[data-post]').forEach((button) => button.onclick = () => {
      postId = button.dataset.post;
      if (!state.read.includes(postId)) state.read.push(postId);
      save();
      go('post');
    });
    screen.querySelectorAll('[data-filter]').forEach((button) => button.onclick = () => { filter = button.dataset.filter; query = ''; go('feed'); });
    screen.querySelectorAll('[data-category]').forEach((button) => button.onclick = () => { filter = button.dataset.category; query = ''; go('feed'); });
    screen.querySelectorAll('[data-sort]').forEach((button) => button.onclick = () => { sortMode = button.dataset.sort; go('feed'); });
    screen.querySelectorAll('[data-airport-photo]').forEach((button) => button.onclick = () => { airportPhotoId = button.dataset.airportPhoto; go('airportphoto'); });
    screen.querySelectorAll('[data-save-airport]').forEach((button) => button.onclick = () => {
      const id = button.dataset.saveAirport;
      if (!state.seen.includes(id)) state.seen.push(id);
      save();
      context.toast('已保存到剧情相册 · 备忘录已更新');
      render();
    });
    screen.querySelectorAll('[data-open-ig]').forEach((button) => button.onclick = () => {
      root.InstagramArchive.selectPost(button.dataset.openIg);
      go('instagram');
    });
    screen.querySelectorAll('[data-save-post]').forEach((button) => button.onclick = () => {
      const id = button.dataset.savePost;
      state.saved = state.saved.includes(id) ? state.saved.filter((item) => item !== id) : [...state.saved, id];
      save();
      render();
    });
    screen.querySelectorAll('[data-forum-reply]').forEach((button) => button.onclick = () => {
      const top = screen.querySelector('.nf-scroll')?.scrollTop || 0;
      state.forumReply = button.dataset.forumReply === 'reset' ? '' : button.dataset.forumReply;
      save();
      render();
      if (screen.querySelector('.nf-scroll')) screen.querySelector('.nf-scroll').scrollTop = top;
    });
    screen.querySelectorAll('[data-outsider-reply]').forEach((button) => button.onclick = () => {
      const top = screen.querySelector('.nf-scroll')?.scrollTop || 0;
      state.outsiderReply = button.dataset.outsiderReply === 'reset' ? '' : button.dataset.outsiderReply;
      save();
      render();
      if (screen.querySelector('.nf-scroll')) screen.querySelector('.nf-scroll').scrollTop = top;
    });
    screen.querySelectorAll('[data-rumor-fragment]').forEach((button) => button.onclick = () => {
      const top = screen.querySelector('.nf-scroll')?.scrollTop || 0;
      const id = button.dataset.rumorFragment;
      if (!state.rumorSeen.includes(id)) state.rumorSeen.push(id);
      save();
      render();
      if (screen.querySelector('.nf-scroll')) screen.querySelector('.nf-scroll').scrollTop = top;
    });
    screen.querySelectorAll('[data-judgment]').forEach((button) => button.onclick = () => {
      const top = screen.querySelector('.nf-scroll')?.scrollTop || 0;
      state.judgment = button.dataset.judgment === 'reset' ? '' : button.dataset.judgment;
      save();
      render();
      if (screen.querySelector('.nf-scroll')) screen.querySelector('.nf-scroll').scrollTop = top;
    });
    screen.querySelectorAll('[data-refresh-official]').forEach((button) => button.onclick = () => {
      if (!ready()) return;
      state.officialUnlocked = true;
      save();
      context.toast('21:15 · RV JP 发布了新动态');
      go('official');
    });
    screen.querySelectorAll('[data-complete-chapter]').forEach((button) => button.onclick = () => {
      state.chapterComplete = true;
      save();
      go('chapterend');
    });
    screen.querySelectorAll('[data-restart-chapter]').forEach((button) => button.onclick = () => {
      context.confirm('重新体验第一章？', '会清空这一章的帖子阅读、照片收藏和时间线记录。LYSN 聊天、你的相册照片与便签不会改变。', () => {
        state = fresh();
        postId = 'coldwar';
        filter = '追星';
        query = '';
        sortMode = '热门';
        save();
        context.navigate('lock');
        context.toast('第一章已回到 20:52');
      });
    });
    screen.querySelectorAll('[data-focus-search]').forEach((button) => button.onclick = () => screen.querySelector('#nf-search')?.focus());
    const form = screen.querySelector('#nf-search-form');
    if (form) form.onsubmit = (event) => { event.preventDefault(); query = screen.querySelector('#nf-search').value.trim(); go('feed'); };
    screen.querySelectorAll('[data-ig-open]').forEach((button) => button.onclick = () => {
      if (root.InstagramArchive.selectPost(button.dataset.igOpen)) go('instagram');
    });
    screen.querySelectorAll('[data-export]').forEach((button) => button.onclick = () => {
      const blob = new Blob([JSON.stringify({ format: 'pocket-story-ch1', state }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'the-same-blank-chapter-01-save.json';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    const input = screen.querySelector('#nf-import');
    if (input) input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const payload = JSON.parse(await file.text());
        if (payload.format !== 'pocket-story-ch1') throw new Error();
        const next = normalize(payload.state);
        context.confirm('导入第一章存档？', '这会替换当前剧情进度，不影响 LYSN 自由聊天。', () => {
          state = next;
          save();
          render();
          context.toast('第一章存档已导入');
        });
      } catch {
        context.toast('无法读取这份第一章存档。');
      }
      input.value = '';
    };
  }

  root.JapanStory = {
    open, boot, badge, storyTime, albumCards, bindAlbum,
    started: () => state.started,
    normalize, fresh, ready,
    getState: () => JSON.parse(JSON.stringify(state)),
    visiblePostsForTest: (text = '') => { query = text; return visiblePosts(); }
  };
  if (typeof module !== 'undefined') module.exports = root.JapanStory;
})(typeof window === 'undefined' ? globalThis : window);
