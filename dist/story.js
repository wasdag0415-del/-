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

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const notice = '<div class="nf-fiction">公开资料与虚构剧情分开标注 · 私人情节均为同人创作</div>';

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
      chapterend: chapterEnd, notebook, ktstory, storychat, instagram,
      youtube, weverse, couplechat, groupchat, sidechat
    };
    context.screen.innerHTML = (views[route] || feed)();
    const statusTime = root.document?.querySelector('#status-time');
    if (statusTime) statusTime.textContent = storyTime();
    bind();
    const scroll = context.screen.querySelector('.nf-scroll');
    if (scroll) scroll.scrollTop = 0;
  }

  function opening() {
    return wrap(`<div class="nf-opening"><div class="nf-open-logo">POCKET STORY<span>the same blank</span></div><div class="nf-night-card"><span>FUKUOKA · 2026.09.19</span><div class="nf-moon"></div><i class="nf-window"></i></div><h1>大家都在看，<br>却没有人看见全部。</h1><p>你捡到一部处于遗失模式的手机。<br>Manager 发来的消息，把你带进一篇正在升温的论坛讨论。</p><button class="nf-primary" data-route="storychat">查看 Manager 的新消息 <span>↗</span></button><button class="nf-text-button" data-nav="phonehome">回到手机桌面</button>${notice}<p class="nf-autosave">进度自动保存在当前浏览器</p></div>`);
  }

  function ktstory() {
    return wrap(`<header class='nf-head nf-kkt-head'><button data-nav='phonehome' aria-label='返回手机'>‹</button><strong>KakaoTalk</strong><button data-route='notebook' aria-label='打开备忘录'>▤</button></header><div class='nf-scroll nf-kkt-list'><button class='nf-kkt-row' data-route='storychat'><span class='nf-kkt-avatar'>M</span><span><strong>Manager</strong><p>明天集合提前十五分钟。</p></span><time>20:50</time>${badge() ? '<i>1</i>' : ''}</button><button class='nf-kkt-row' data-route='couplechat'><span class='nf-kkt-avatar pair'>I</span><span><strong>组长老师</strong><p>嗯。</p></span><time>21:26</time></button><button class='nf-kkt-row' data-route='groupchat'><span class='nf-kkt-avatar'>RV</span><span><strong>Red Velvet</strong><p>Yeri：合照发群里！</p></span><time>21:17</time></button><button class='nf-kkt-row' data-kkt-thread='wendy'><span class='nf-kkt-avatar'>W</span><span><strong>Wendy</strong><p>到酒店以后跟我说一声</p></span><time>18:09</time></button><button class='nf-kkt-row' data-kkt-thread='japan'><span class='nf-kkt-avatar'>JP</span><span><strong>日本运营</strong><p>首场照片会在确认后上传。</p></span><time>20:46</time></button><button class='nf-kkt-row' data-kkt-thread='styling'><span class='nf-kkt-avatar'>S</span><span><strong>造型室</strong><p>明天先试第二套耳饰。</p></span><time>17:38</time></button><button class='nf-kkt-row' data-kkt-thread='joy'><span class='nf-kkt-avatar'>J</span><span><strong>Joy</strong><p>不是说好要拍给我看吗ㅋㅋ</p></span><time>9月18日</time></button></div>`, 'nf-kkt-app');
  }

  function judgmentMarkup() {
    const choices = {
      changed: ['她们看起来确实变了。', '我懂。我也会因为少了熟悉的东西而慌。不过“变了”到底指舞台状态还是她们之间，我们还分不清。'],
      tired: ['可能只是都太累了。', '可能。可是“只是太累”也会让担心的人没地方放情绪。楼主未必是在要一个结论，她可能就是想有人听见。'],
      unknown: ['我现在说不准。', '这个答案很难发在热帖里，但我觉得最诚实。刚才我又刷到隔壁版一条求助，看得心里有点堵。']
    };
    if (!state.judgment) return `<div class="nf-chat-choices"><button data-judgment="changed">她们看起来确实变了</button><button data-judgment="tired">可能只是都太累了</button><button data-judgment="unknown">我现在说不准</button></div>`;
    const [mine, reply] = choices[state.judgment];
    return `<div class="nf-chat-message me"><small>你 · 21:14</small><p>${mine}</p></div><div class="nf-chat-message them"><small>A</small><p>${reply}</p><p>我在恋爱版刷到一个求助标题，写着“年长的姐姐”。里面那句“她看过来，我会假装在看别处”让我停了好久。发帖人是谁我不知道，你要不要自己找来读读？</p><button class="nf-inline" data-category="恋爱解答">去恋爱版找那条帖 →</button><button class="nf-inline" data-judgment="reset">换个想法再聊 ↻</button></div>`;
  }

  function storychat() {
    state.introRead = true;
    state.started = true;
    save();
    return wrap(`${head('Manager', 'ktstory', '<button data-route="ktstory" aria-label="聊天列表">☰</button>')}<div class='nf-scroll nf-chat-scroll'><div class='nf-chat-date'>9月13日 · 出发前</div><div class='nf-chat-message them'><small>Manager · 18:32</small><p>明天个人行程，你先按原计划飞日本。</p></div><div class='nf-chat-message them'><small>Manager · 18:33</small><p>珠泫那边的航班还没定，确认以后我再告诉你。</p></div><div class='nf-chat-message me'><small>你 · 18:36</small><p>好。</p></div><div class='nf-chat-date'>9月14日 · 涩琪抵达日本</div><div class='nf-chat-message them'><small>Manager · 15:08</small><p>车在出口等。到酒店以后先休息，晚一点再确认明天的拍摄。</p></div><div class='nf-chat-message me'><small>你 · 15:09</small><p>知道了。</p></div><div class='nf-chat-date'>9月16日</div><div class='nf-chat-message them'><small>Manager · 17:42</small><p>珠泫已经落地了，稍后直接回酒店。</p></div><div class='nf-chat-message them'><small>Manager · 17:42</small><p>明天彩排时间不变。</p></div><div class='nf-chat-message me'><small>你 · 17:44</small><p>她今天过来的吗？</p></div><div class='nf-chat-message them'><small>Manager · 17:44</small><p>嗯，刚到。</p></div><div class='nf-chat-message me'><small>你 · 17:45</small><p>好，我知道了。</p></div><div class='nf-chat-date'>9月19日 · 福冈首场结束后</div><div class='nf-chat-message them'><small>Manager · 20:48</small><p>首场结束辛苦了。车在 B1，十五分钟后出发。</p></div><div class='nf-chat-message them'><small>Manager · 20:49</small><p>网上有一篇帖子在讨论你们为什么没有一起飞，也有人在问珠泫是什么时候到日本的。</p></div><div class='nf-chat-message them'><small>Manager · 20:49</small><p>先不要回应，也不要用个人账号解释。官方照片等日本运营发。</p><button class='nf-inline' data-open-post='coldwar'>查看正在升温的讨论 →</button></div><div class='nf-chat-message them'><small>Manager · 20:50</small><p>明天集合提前十五分钟。今晚先休息。</p></div></div><div class='nf-story-chat-tools'><button data-route='ktstory'>消息列表</button><button data-route='notebook'>备忘录</button></div>`, 'nf-story-chat');
  }

  function couplechat() {
    return wrap(`${head('组长老师', 'ktstory')}<div class='nf-scroll nf-chat-scroll nf-couple-chat'><div class='nf-chat-date'>9月7日</div><div class='nf-chat-message them'><small>组长老师 · 23:41</small><p>到家了吗？</p></div><div class='nf-chat-message me'><small>你 · 23:43</small><p>刚到。</p></div><div class='nf-chat-message them'><small>组长老师 · 23:43</small><p>冰箱第二层有粥。别又只喝咖啡。</p></div><div class='nf-chat-message me'><small>你 · 23:44</small><p>你什么时候放的？</p></div><div class='nf-chat-message them'><small>组长老师 · 23:44</small><p>走之前。</p></div><div class='nf-chat-message me'><small>你 · 23:45</small><p>知道了。你也早点睡。</p></div><div class='nf-chat-message them'><small>组长老师 · 23:45</small><p>吃完拍给我看。</p></div><div class='nf-chat-date'>9月10日 · 日本行程确认前</div><div class='nf-chat-message them'><small>组长老师 · 21:17</small><p>你之前发的日本拍摄清单，我看完了。</p></div><div class='nf-chat-message them'><small>组长老师 · 21:18</small><p>你列了三家店，我们哪有那么多时间。</p></div><div class='nf-chat-message me'><small>你 · 21:20</small><p>那你挑两个。</p></div><div class='nf-chat-message them'><small>组长老师 · 21:20</small><p>你挑。我跟着你。</p></div><div class='nf-chat-message me'><small>你 · 21:21</small><p>说好了。</p></div><div class='nf-chat-message them'><small>组长老师 · 21:21</small><p>嗯。拍完去吃你收藏的那家。</p></div><div class='nf-chat-date'>9月12日</div><div class='nf-chat-message them'><small>组长老师 · 23:06</small><p>你这两天是不是在躲我？</p></div><div class='nf-chat-message me'><small>你 · 23:11</small><p>没有。</p></div><div class='nf-chat-message them'><small>组长老师 · 23:12</small><p>那我们说一下好吗？</p></div><div class='nf-chat-message me'><small>你 · 23:18</small><p>不是你说很累，现在不想讲吗。</p></div><div class='nf-chat-message them'><small>组长老师 · 23:19</small><p>我那天说的是现在，不是以后都不说。</p></div><div class='nf-chat-message me'><small>你 · 23:25</small><p>嗯。</p></div><div class='nf-chat-message them'><small>组长老师 · 23:26</small><p>嗯是什么意思？</p></div><div class='nf-chat-message me'><small>你 · 23:31</small><p>你先休息吧。</p></div><div class='nf-chat-date'>9月13日</div><div class='nf-chat-message them'><small>组长老师 · 08:12</small><p>早餐吃了吗？</p></div><div class='nf-chat-message me'><small>你 · 08:16</small><p>嗯。</p></div><div class='nf-chat-message them'><small>组长老师 · 08:16</small><p>吃了什么？</p></div><div class='nf-chat-message me'><small>你 · 08:20</small><p>等一下吃。</p></div><div class='nf-chat-message them'><small>组长老师 · 08:21</small><p>我就知道。别空腹吃药。</p></div><div class='nf-chat-message me'><small>你 · 08:24</small><p>知道了。</p></div><div class='nf-chat-date'>9月14日 · 出发后</div><div class='nf-chat-message them'><small>组长老师 · 09:03</small><p>你已经出发了吗？</p></div><div class='nf-chat-message me'><small>你 · 09:08</small><p>嗯。</p></div><div class='nf-chat-message them'><small>组长老师 · 09:09</small><p>怎么没告诉我？</p></div><div class='nf-chat-message me'><small>你 · 09:14</small><p>Manager知道。</p></div><div class='nf-chat-message them'><small>组长老师 · 09:15</small><p>我问的不是工作安排。</p></div><div class='nf-chat-message me'><small>你 · 09:21</small><p>到了再说吧。</p></div><div class='nf-chat-message them'><small>组长老师 · 09:22</small><p>落地以后把外套穿上。那边下雨。</p></div><div class='nf-chat-message me'><small>你 · 09:24</small><p>好。</p></div><div class='nf-chat-date'>9月19日 · 福冈首场结束后</div><div class='nf-chat-message me'><small>你 · 21:20</small><p>你到了为什么没告诉我？</p></div><div class='nf-chat-message them'><small>组长老师 · 21:21</small><p>Manager不是告诉你了吗？</p></div><div class='nf-chat-message me'><small>你 · 21:21</small><p>说了。</p></div><div class='nf-chat-message them'><small>组长老师 · 21:22</small><p>那你知道了。</p></div><div class='nf-chat-message me'><small>你 · 21:22</small><p>我想听你告诉我。</p></div><div class='nf-chat-message them'><small>组长老师 · 21:23</small><p>你走的时候也没有告诉我。</p></div><div class='nf-chat-message me'><small>你 · 21:23</small><p>……</p></div><div class='nf-chat-message them'><small>组长老师 · 21:24</small><p>今天台上你一直在躲我。</p></div><div class='nf-chat-message me'><small>你 · 21:24</small><p>没有。</p></div><div class='nf-chat-message them'><small>组长老师 · 21:25</small><p>那你看着我说。</p></div><div class='nf-chat-message me'><small>你 · 21:26</small><p>你已经回房间了吗？</p></div><div class='nf-chat-message them'><small>组长老师 · 21:26</small><p>嗯。</p></div><div class='nf-chat-message me'><small>你 · 21:27</small><p>门别锁。</p></div></div><div class='nf-story-chat-tools'><button data-route='ktstory'>消息列表</button><button data-route='feed'>论坛</button></div>`, 'nf-story-chat');
  }

  function groupchat() {
    return wrap(`${head('Red Velvet', 'ktstory')}<div class='nf-scroll nf-chat-scroll'><div class='nf-chat-date'>9月14日</div><div class='nf-chat-message them'><small>Wendy · 10:28</small><p>涩琪先出发了吗？</p></div><div class='nf-chat-message me'><small>你 · 10:31</small><p>嗯，有个人拍摄。</p></div><div class='nf-chat-message them'><small>Yeri · 10:32</small><p>到日本帮我看便利店新品！！</p></div><div class='nf-chat-message them'><small>Joy · 10:34</small><p>她先落地再说ㅋㅋ</p></div><div class='nf-chat-date'>9月19日 · 福冈首场结束后</div><div class='nf-chat-message them'><small>Wendy · 21:12</small><p>首场顺利结束了吗？</p></div><div class='nf-chat-message them'><small>Joy · 21:13</small><p>我刚看到日本账号发预告了ㅠㅠ</p></div><div class='nf-chat-message them'><small>Yeri · 21:13</small><p>结束以后记得吃饭！！</p></div><div class='nf-chat-message them'><small>组长老师 · 21:14</small><p>刚结束，大家辛苦了。</p></div><div class='nf-chat-message me'><small>你 · 21:14</small><p>结束了ㅎㅎ</p></div><div class='nf-chat-message them'><small>Wendy · 21:15</small><p>你们两个回复怎么像工作报告</p></div><div class='nf-chat-message them'><small>Joy · 21:15</small><p>让她们先喘口气吧ㅋㅋ</p></div><div class='nf-chat-message them'><small>Yeri · 21:16</small><p>合照发群里！</p></div><div class='nf-chat-message them'><small>组长老师 · 21:16</small><p>等官方发。</p></div><div class='nf-chat-message me'><small>你 · 21:17</small><p>嗯。</p></div></div><div class='nf-story-chat-tools'><button data-route='ktstory'>消息列表</button></div>`, 'nf-story-chat');
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
    return (!post.unlockAfterOfficial || state.officialUnlocked) && post.time.slice(-5) <= storyTime();
  }

  function visiblePosts() {
    return DATA.posts.filter((post) => {
      if (post.category !== filter) return false;
      if (!isAvailable(post)) return false;
      const haystack = [post.title, post.author, post.body, ...post.comments.map((comment) => `${comment.user} ${comment.text}`)].join(' ').toLowerCase();
      return !query || haystack.includes(query.toLowerCase());
    }).sort((a, b) => sortMode === '最新' ? b.time.localeCompare(a.time) : 0);
  }

  function postCard(post, index) {
    const rank = index + 1;
    return `<button class="nf-post-card" data-post="${post.id}"><span class="nf-pann-rank ${rank <= 3 ? 'top' : ''}">${String(rank).padStart(2, '0')}</span><span class="nf-pann-row"><span class="nf-row-title"><i class="nf-feed-tag">${esc(post.tag)}</i><strong>${esc(post.title)}</strong><em>(${post.comments.filter((comment) => comment.time <= storyTime()).length})</em>${state.read.includes(post.id) ? '' : '<i class="nf-new-mark">N</i>'}</span><span class="nf-row-info"><span>${esc(post.author)}</span><span>${esc(post.time)}</span><span>浏览 ${esc(post.views)}</span></span></span></button>`;
  }

  function feed() {
    const officialBanner = state.officialUnlocked ? `<button class="nf-official-banner" data-route="official"><span>21:15 · RV JP</span><strong>福冈首场官方照片已发布</strong><b>查看 →</b></button>` : '';
    const timeline = filter === '追星' && !query ? `<section class="nf-forum-brief"><small>公开记录 · 09.14—09.19</small><div><button data-open-post="airport-gap"><time>14</time><strong>单人机场图</strong><span>目的地未写</span></button><button data-open-post="ins-context"><time>16</time><strong>个人 INS</strong><span>专辑与练习</span></button><button data-open-post="stage-counter"><time>19</time><strong>福冈首场</strong><span>现场说法不同</span></button></div></section>` : '';
    return wrap(`<header class="nf-pann-brand"><button class="nf-pann-menu" data-route="notebook" aria-label="打开备忘录">☰</button><div><strong>pann<span>판</span></strong><small>匿名讨论区</small></div><button class="nf-pann-search-icon" data-focus-search aria-label="搜索帖子">⌕</button><button class="nf-pann-mobile" data-nav="phonehome" aria-label="返回手机">⌂</button></header><nav class="nf-pann-topnav"><button data-filter="追星" class="${filter === '追星' ? 'active' : ''}">팬톡 <small>追星讨论</small></button><button data-filter="恋爱解答" class="${filter === '恋爱解答' ? 'active' : ''}">연애 <small>恋爱解答</small></button></nav>${notice}<div class="nf-search"><span>⌕</span><form id="nf-search-form"><input id="nf-search" value="${esc(query)}" placeholder="搜索帖子或关键词" aria-label="搜索论坛"><button>搜索</button></form></div><div class="nf-pann-channel"><span>${filter === '追星' ? '팬톡 <b>福冈首场</b>' : '연애 <b>恋爱解答</b>'}</span><button data-route="notebook">备忘录 ›</button></div><div class="nf-scroll">${officialBanner}<section class="nf-pann-today"><div><h1>${filter === '追星' ? '今日热帖' : '恋爱解答'} <small>${filter === '追星' ? '오늘의 톡' : '연애 고민'}</small></h1><span>09.19 · ${storyTime()}</span></div><p>${filter === '追星' ? '正在讨论 <strong># 福冈首场的气氛</strong>' : '匿名求助 <strong># 回避与疲惫</strong>'}</p></section>${timeline}<div class="nf-pann-sort"><span>${filter} · ${visiblePosts().length} 篇</span><div><button data-sort="热门" class="${sortMode === '热门' ? 'selected' : ''}">热门</button><i>│</i><button data-sort="最新" class="${sortMode === '最新' ? 'selected' : ''}">最新</button></div></div><div class="nf-feed" id="nf-feed">${visiblePosts().map(postCard).join('') || '<div class="nf-empty">没有找到帖子。</div>'}</div><div class="nf-pann-footer"><strong>pann<span>판</span></strong><p>the same blank · Chapter 01</p><small>虚构同人社区 · 不连接真实平台</small></div></div><nav class="nf-bottom"><button class="selected" data-route="feed">톡<span>论坛</span></button><button data-route="notebook">▤<span>备忘录</span></button><button data-route="ktstory">◌<span>KKT${badge() ? ' · 1' : ''}</span></button><button data-nav="phonehome">▦<span>桌面</span></button></nav>`);
  }

  function forumHeader() {
    return `<header class="nf-head nf-pann-head"><button data-route="feed" aria-label="返回论坛">‹</button><strong><b>pann</b> <span>판</span> <small>톡톡</small></strong><button data-nav="phonehome" aria-label="返回手机">⌂</button></header>`;
  }

  function commentMarkup(comment, post, index) {
    const link = comment.link === 'instagram' ? `<button class="nf-inline" data-open-ig="sg-260916">${esc(comment.label)} ↗</button>` : '';
    return `<article class="nf-comment"><div class="nf-comment-meta"><strong>${esc(comment.user)}${comment.user === post.author ? '<i>楼主</i>' : ''}</strong><span>${index + 1}楼 · ${esc(comment.time)}</span></div><p>${esc(comment.text)}</p>${link}<div class="nf-pann-comment-foot"><span>回复</span><button aria-label="赞同此楼">△ ${Math.max(3, 34 - index * 3)}</button></div></article>`;
  }

  function forumReplyMarkup() {
    const choices = {
      uneasy: ['我也觉得有点不一样，但说不清是哪儿。', 'ㅇㅇ', '就是这种说不清才烦。我都怕自己把担心传给别人了。', '后排望远镜', '我理解你们担心。只求别把安可那段直接从记忆里删掉。'],
      counter: ['安可明明有靠近，标题是不是说太满了？', 'ㅇㅇ', '我正文写了不是零互动啊。你们都只看标题吗……', '路过的行李箱', '我就是被标题吓进来的，看完正文才知道你们其实在说两件事。'],
      wait: ['我先等官方图，再回来看看。', '同框收藏夹', '我也等。只是照片出来以后，可能还是解释不了现场的感觉。', '透明雨伞', '先等吧。我还在车站，手机已经快没电了。']
    };
    if (!state.forumReply) return `<section class="nf-forum-participate"><small>匿名访客 · 你会回哪一句？</small><button data-forum-reply="uneasy">我也觉得有点不一样，但说不清是哪儿</button><button data-forum-reply="counter">安可明明有靠近，标题是不是说太满了？</button><button data-forum-reply="wait">我先等官方图，再回来看看</button><p>这是本机的剧情选择，不会发布到真实论坛。</p></section>`;
    const [mine, user1, reply1, user2, reply2] = choices[state.forumReply];
    return `<section class="nf-forum-participate replied"><small>你加入了讨论 · 刚刚</small><p><b>匿名访客</b>　${mine}</p><p><b>${user1}</b>　${reply1}</p><p><b>${user2}</b>　${reply2}</p><button data-forum-reply="reset">换一种说法 ↻</button></section>`;
  }

  function outsiderReplyMarkup() {
    const choices = {
      facts: ['能确认的只有两个人今晚同台。机场图没写另一位的行程。', '噢，那张图不是“她没来”的证据。我刚差点被标题带跑，谢谢你把话说清楚。'],
      feeling: ['我们也知道没有证据。只是以前看她们很自然，今天心里突然空了一下。', '我懂了。外人想要一条证据，你们其实是在说自己为什么难过。刚才我问得太像审问了。'],
      lost: ['我也是被热榜拉进来的，看到现在脑子里有三个版本。', '笑死，终于有人跟我同桌补课。先记一条：现场不能拍，每个人看到的范围不一样。']
    };
    if (!state.outsiderReply) return `<section class="nf-forum-participate"><small>路人还在楼里 · 要怎么回答她？</small><button data-outsider-reply="facts">只告诉她今晚能确认的事</button><button data-outsider-reply="feeling">说说粉丝为什么会难过</button><button data-outsider-reply="lost">承认自己也快看晕了</button><p>本机剧情选择 · 不会发布到真实论坛。</p></section>`;
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
    return `<section class="nf-rumor-chain"><small>论坛旧楼归档 · 虚构帖子</small><h2>一句话，传成了三句话</h2><p>逐条打开原句，看看哪一步开始多出了确定的结论。</p>${fragments.map(([id, label, quote, note]) => `<button data-rumor-fragment="${id}" class="${state.rumorSeen.includes(id) ? 'opened' : ''}"><span>${label}</span><strong>${state.rumorSeen.includes(id) ? quote : '点开查看当时写了什么 ↗'}</strong>${state.rumorSeen.includes(id) ? `<em>${note}</em>` : ''}</button>`).join('')}${complete ? '<div class="nf-rumor-reveal"><b>你找到了最初那句话。</b><p>“没刷到”经过两次转述，变成“她还没去”，又被接上“所以两人分开走”。今晚的同台推翻了传言的一部分，但并没有解释舞台上的紧张。</p><button data-route="storychat">把发现告诉 A →</button></div>' : `<p class="nf-rumor-count">已对照 ${state.rumorSeen.length}/3 条</p>`}</section>`;
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
    const comments = post.comments.filter((comment) => comment.time <= storyTime());
    const playerReplies = (isMain && state.forumReply ? 3 : 0) + (post.id === 'outsider-view' && state.outsiderReply ? 2 : 0);
    return wrap(`${forumHeader()}${notice}<div class="nf-scroll"><div class="nf-pann-breadcrumb"><button data-route="feed">pann</button><span>›</span><span>${esc(post.category)}</span></div><article class="nf-thread"><div class="nf-pann-thread-label">${post.tag === '热议' ? '<span>오늘의 톡</span> 今日热帖' : `${esc(post.tag)} · ${esc(post.category)}`}</div><h1>${esc(post.title)}</h1><div class="nf-pann-byline"><span>${esc(post.author)} (匿名)</span><span>${esc(post.time)}</span></div><div class="nf-pann-thread-stats">浏览 ${esc(post.views)}<span>回复 ${comments.length + playerReplies}</span></div><div class="nf-prose">${esc(post.body)}</div>${post.airportPhotos ? airportGallery() : ''}<div class="nf-pann-post-actions"><button class="nf-bookmark ${state.saved.includes(post.id) ? 'on' : ''}" data-save-post="${post.id}"><span>${state.saved.includes(post.id) ? '★' : '☆'}</span><strong>${state.saved.includes(post.id) ? '已收藏' : '收藏帖子'}</strong></button></div></article>${post.id === 'flight-rumor' ? rumorChainMarkup() : ''}<div class="nf-comments-head"><strong>全部回复 <em>${comments.length + playerReplies}</em></strong></div>${comments.map((comment, index) => commentMarkup(comment, post, index)).join('')}${isMain ? forumReplyMarkup() + progressCard() : ''}${post.id === 'outsider-view' ? outsiderReplyMarkup() : ''}${relatedMarkup}${officialReturn}<button class="nf-pann-return" data-route="feed">목록 · 返回列表</button></div><button class="nf-thread-bottom" data-route="notebook">▤ 打开备忘录</button>`);
  }

  function airportGallery() {
    return `<section class="nf-airport-gallery"><header><strong>公开机场图</strong><span>2026.09.14</span></header><div class="nf-airport-grid">${DATA.airportPhotos.map((photo) => `<figure><button data-airport-photo="${photo.id}"><img src="${photo.src}" alt="${esc(photo.alt)}" width="1066" height="1600" loading="lazy"><span>查看并保存 ↗</span></button><figcaption>${esc(photo.caption)}<small>© ${esc(photo.credit)}</small></figcaption></figure>`).join('')}</div><p>真实公开图片仅作时间线参考；转载文字没有写目的地。</p></section>`;
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
    return wrap(`${head('备忘录')}<div class="nf-scroll nf-notebook"><small>THE SAME BLANK / CHAPTER 01</small><h1>只记录<br>能确认的事。</h1><p>“看见了什么”和“猜测了什么”分开保存。</p><div class="nf-timeline-notes">${rows.map(([time, title, done, note]) => `<article class="${done ? 'done' : ''}"><time>${time}</time><div><strong>${done ? '✓ ' : ''}${title}</strong><p>${note}</p></div></article>`).join('')}</div><section class="nf-memo-voices"><small>论坛说法 · 非事实证据</small>${perspectives.filter((item) => item[1]).map(([label, , detail]) => `<article><strong>${label}</strong><p>${detail}</p></article>`).join('') || '<p>读过帖子后，不同说法会整理在这里。</p>'}</section>${state.rumorSeen.length === 3 ? '<section class="nf-memo-voices"><small>找到的传言源头 · 虚构论坛归档</small><article><strong>从提问变成断言</strong><p>最早只写“我没刷到机场图，她已经过去了吗？”；两次转述后变成“她还没去日本，所以两人分开走”。这不是航班证据。</p></article></section>' : ''}${myThought ? `<section class="nf-memo-voices"><small>我的暂时判断 · 可以改变</small><article><strong>${myThought}</strong><p>这是你的感受，不是关于她们关系的事实。</p></article></section>` : ''}${root.InstagramArchive.savedCards(state)}${state.chapterComplete ? '<div class="nf-chapter-note"><small>第一章完成</small><p>官方合照结束了“她是否在日本”的信息空白，却没有回答关系问题。</p><button data-route="chapterend">查看章节结尾 →</button></div>' : ''}<div class="nf-save-panel"><strong>第一章存档</strong><p>剧情进度保存在当前浏览器；LYSN 自由聊天数据保持独立。</p><button data-export>导出剧情存档</button><label>导入剧情存档<input type="file" id="nf-import" accept="application/json,.json" hidden></label><button data-restart-chapter>重新体验第一章</button></div></div>`);
  }

  function youtube() {
    const channels = {
      seulgi: {name:'Hi Seulgi', handle:'@hi_sseulgi', avatar:'assets/avatars/youtube-seulgi.jpg', cover:'assets/youtube/seulgi-videos.jpg', videos:[['两个最爱！幸福指数爆棚的香港 OOTD VLOG','16:33 · 2024.10.25','https://www.youtube.com/watch?v=beysuZ8t7Ho'],['最爱登场！涩琪和艾琳的乡村度假约会','17:57 · 2024.12.06','https://www.youtube.com/watch?v=2gXb5N1q9-4'],['现役女爱豆的年末工作生活','17:21 · 2025.01.24','https://www.youtube.com/watch?v=wcoEVQRGlUo'],['忙碌的生日周 VLOG','27:44 · 2025.02.28','https://www.youtube.com/watch?v=rNIm1Cf2tiA']]},
      irene: {name:'IRENE', handle:'@IRENEsmtown', avatar:'assets/avatars/youtube-irene.jpg', cover:'assets/youtube/irene-videos.jpg', videos:[["Back by Popular Demand — It’s Me IRENE | MEXICO · LONDON · TOKYO",'29:20 · 2025.09.19','https://www.youtube.com/watch?v=Q6-e-j7Nz60'],["Back by Popular Demand — It’s Me IRENE | BALANCE",'37:44 · 2025.06.23','https://www.youtube.com/watch?v=ZClPxSsQ3HU'],["IRENE’s Sweet Simple Series | London & Madrid",'21:37 · 2024.02.01','https://www.youtube.com/watch?v=CElObKdEPAk'],["IRENE’s Sweet Simple Series | Amsterdam & Barcelona",'20:46 · 2023.12.12','https://www.youtube.com/watch?v=RtGSAdY-9qQ']]},
      redvelvet: {name:'Red Velvet', handle:'@redvelvet', avatar:'assets/avatars/youtube-redvelvet.jpg', cover:'assets/youtube/redvelvet-videos.jpg', videos:[["[RV Days] Record (t)our Video #1",'25:00 · 2023.07.08','https://www.youtube.com/watch?v=H4Dk_ybKhn4'],["[RV Days] Record (t)our Video #2",'23:59 · 2023.07.18','https://www.youtube.com/watch?v=aVsatNKNZr0'],["[RV Days] ‘RED CIRCLE’ Behind with IRENE & SEULGI",'06:01 · 2023.11.21','https://www.youtube.com/watch?v=LtM_njC6MbI'],['一个人？两个影子｜Dance Practice & NYE','28:52 · 2024.03.06','https://www.youtube.com/watch?v=qW55hbkGC0c'],['IRENE & SEULGI — BALANCE Behind','25:02 · 2025.09.15','https://www.youtube.com/watch?v=6PubX76wsAc']]}
    };
    const nav = `<header class="yt-top"><button data-nav="phonehome" aria-label="返回手机">‹</button><strong><i>▶</i> YouTube</strong><span>⌕　◉</span></header>`;
    const bottom = `<nav class="yt-bottom"><button data-yt-channel="feed" class="${youtubeChannel==='feed'?'active':''}">⌂<small>首页</small></button><button data-yt-channel="shorts">▣<small>Shorts</small></button><button data-yt-channel="subscriptions">▤<small>订阅内容</small></button><button data-yt-channel="library">◉<small>我的</small></button></nav>`;
    if (youtubeVideo) {
      const [key,indexText]=youtubeVideo.split(':'), item=channels[key], video=item.videos[Number(indexText)]||item.videos[0];
      return wrap(`${nav}<div class="nf-scroll yt-watch"><button class="yt-back" data-yt-back>‹ 返回</button><a class="yt-player" href="${video[2]}" target="_blank" rel="noopener" style="--yt-cover:url('${item.cover}')" aria-label="在 YouTube 观看原视频"><span>▶</span></a><h1>${video[0]}</h1><p>${item.name} · ${video[1]}</p><div class="yt-actions"><a href="${video[2]}" target="_blank" rel="noopener">在 YouTube 观看</a><button>分享</button><button>保存</button></div><button class="yt-channel-line" data-yt-channel="${key}"><img src="${item.avatar}" alt=""><span><strong>${item.name}</strong><small>${item.handle}</small></span><b>已订阅</b></button></div>${bottom}`);
    }
    if (channels[youtubeChannel]) {
      const item=channels[youtubeChannel];
      return wrap(`${nav}<div class="nf-scroll yt-channel-page"><section class="yt-channel-head"><img src="${item.avatar}" alt="${item.name}头像"><div><h1>${item.name}</h1><p>${item.handle}</p><small>公开频道内容整理</small></div></section><div class="yt-tabs"><b>首页</b><span>视频</span><span>播放列表</span></div><h2>上传的视频</h2>${item.videos.map((video,index)=>`<button class="yt-video-row" data-yt-video="${youtubeChannel}:${index}"><span class="yt-thumb" style="--yt-cover:url('${item.cover}');--yt-pos:${20+index*20}%"></span><span><strong>${video[0]}</strong><small>${item.name} · ${video[1]}</small></span><i>⋮</i></button>`).join('')}</div>${bottom}`);
    }
    const recommended=[['redvelvet',4],['seulgi',1],['irene',0],['redvelvet',2],['seulgi',3]];
    return wrap(`${nav}<div class="yt-chips"><button>全部</button><button>音乐</button><button>Vlog</button><button>最近上传</button></div><div class="nf-scroll yt-feed"><section class="yt-subscriptions"><strong>订阅内容</strong><div>${Object.entries(channels).map(([key,item])=>`<button data-yt-channel="${key}"><img src="${item.avatar}" alt=""><small>${item.name}</small></button>`).join('')}</div></section>${recommended.map(([key,index])=>{const item=channels[key],video=item.videos[index];return `<article class="yt-card"><button class="yt-card-thumb" data-yt-video="${key}:${index}" style="--yt-cover:url('${item.cover}');--yt-pos:${20+index*15}%"><span>▶</span></button><div><button data-yt-channel="${key}"><img src="${item.avatar}" alt=""></button><p><strong>${video[0]}</strong><small>${item.name} · ${video[1]}</small></p><i>⋮</i></div></article>`}).join('')}<div class="nf-app-note"><strong>福冈场没有可用的公开饭拍。</strong><br>第一章不使用虚构影像冒充现场资料。</div></div>${bottom}`);
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
