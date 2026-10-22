const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { parseHTML } = require('linkedom');
const { initialState } = require('../dist/app.js');

const STORY_KEY = 'pocket-story-same-blank-ch1-v2';

function harness(existingStory) {
  const { window } = parseHTML(fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8'));
  const { document } = window;
  window.HTMLElement.prototype.scrollIntoView = function () {};
  window.HTMLElement.prototype.focus = function () {};
  const old = initialState();
  old.profiles[0].name = '已保存的联系人';
  old.messages.starlight.push({ id: 'old-message', role: 'user', text: '不能丢掉的旧聊天', at: 1234567890 });
  old.messages.starlight.push({ id: 'old-voice', role: 'assistant', type: 'voice', text: '旧录音', audioId: 'keep-audio', duration: 3, at: 1234567891 });
  const entries = new Map([['pocket-star-v1', JSON.stringify(old)]]);
  if (existingStory) entries.set(STORY_KEY, JSON.stringify(existingStory));
  const localStorage = { getItem: (key) => entries.get(key) || null, setItem: (key, value) => entries.set(key, String(value)) };
  window.localStorage = localStorage;
  const timers = [];
  const sandbox = {
    window, document, localStorage, console, Blob, URL,
    crypto: require('node:crypto').webcrypto,
    setInterval: () => 0, clearInterval: () => {},
    setTimeout: (fn, delay) => { timers.push({ fn, delay }); return timers.length; },
    clearTimeout: () => {},
    PocketVoice: { stop() {}, clear: () => Promise.resolve(), remove: () => Promise.resolve() }
  };
  const context = vm.createContext(sandbox);
  document.querySelector('#modal').showModal = function () { this.open = true; };
  document.querySelector('#modal').close = function () { this.open = false; };
  for (const filename of ['story-data.js', 'instagram-data.js', 'instagram.js', 'story.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist', filename), 'utf8'), context, { filename });
  }
  sandbox.JapanStory = window.JapanStory;
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist/app.js'), 'utf8'), context, { filename: 'app.js' });
  const screen = document.querySelector('#screen');
  const act = (selector) => {
    const element = document.querySelector(selector);
    assert.ok(element, `Missing ${selector}`);
    assert.ok(!element.disabled, `Disabled ${selector}`);
    element.click();
  };
  return { document, window, screen, act, entries, timers, old, story: window.JapanStory };
}

const h = harness();
assert.match(h.screen.textContent, /9月19日 星期六/);
assert.match(h.screen.textContent, /S 的 iPhone/);
assert.match(h.screen.textContent, /遗失模式/);
assert.match(h.screen.textContent, /此 iPhone 已丢失/);
h.act('[data-view="passcode"]');
assert.match(h.screen.textContent, /请输入 6 位密码/);
for (const digit of ['0','0','0','0','0','0']) h.act(`[data-passcode-digit="${digit}"]`);
assert.match(h.screen.textContent, /密码错误，请重试/);
for (const digit of ['9','1','0','3','2','9']) h.act(`[data-passcode-digit="${digit}"]`);
assert.match(h.screen.textContent, /今日热帖/);
assert.match(h.screen.textContent, /福冈首场看完还是觉得不对/);
h.act('[data-nav="phonehome"]');
h.act('[data-view="ktstory"]');
h.act('[data-route="storychat"]');
assert.match(h.screen.textContent, /这句话是谁先说的/);
assert.match(h.screen.textContent, /咱们待会儿再往回翻/);
h.act('[data-open-post="coldwar"]');
assert.equal(h.story.storyTime(), '21:02');
assert.doesNotMatch(h.screen.textContent, /散场后大家都疲惫/);
assert.match(h.screen.textContent, /很少真正对上视线/);
assert.match(h.screen.textContent, /日本场不能拍/);
assert.ok(h.screen.querySelector('[data-forum-reply="uneasy"]'));
h.act('[data-forum-reply="uneasy"]');
assert.match(h.screen.textContent, /我都怕自己把担心传给别人了/);
assert.equal(h.story.getState().forumReply, 'uneasy');
assert.ok(h.screen.querySelector('[data-open-post="flight-rumor"]'));
h.act('[data-open-post="flight-rumor"]');
for (const id of ['first', 'second', 'third']) h.act(`[data-rumor-fragment="${id}"]`);
assert.match(h.screen.textContent, /从提问变成断言|你找到了最初那句话/);
assert.equal(h.story.getState().rumorSeen.length, 3);
h.act('[data-route="storychat"]');
assert.match(h.screen.textContent, /传言能纠正/);
h.act('[data-open-post="coldwar"]');
assert.ok(h.screen.querySelector('[data-airport-photo="airport-seulgi-0914"]'));
assert.ok(h.screen.querySelector('[data-open-ig="sg-260916"]'));

h.act('[data-airport-photo="airport-seulgi-0914"]');
assert.match(h.screen.textContent, /转载文字没有写目的地/);
assert.ok(h.screen.querySelector('a[href="https://x.com/KSGUpdates/status/2099389016236085734"]'));
h.act('[data-save-airport="airport-seulgi-0914"]');
assert.ok(h.story.getState().seen.includes('airport-seulgi-0914'));
h.act('[data-route="post"]');
h.act('[data-open-ig="sg-260916"]');
assert.match(h.screen.textContent, /hi_sseulgi/);
assert.match(h.screen.querySelector('.ia-photo-counter').textContent, /1 \/ 13/);
h.act('[data-ig-save="sg-260916"]');
assert.ok(h.story.getState().igSaved.includes('sg-260916'));
h.act('[data-ig-back]');
h.act('[data-nav="forum"]');
h.act('[data-post="coldwar"]');
assert.match(h.screen.textContent, /把讨论放在同一条时间线上/);
h.act('[data-open-post="airport-gap"]');
assert.match(h.screen.textContent, /没有图.*没有去/s);
h.act('[data-open-post="stage-counter"]');
assert.match(h.screen.textContent, /看不清每一次眼神/);
assert.equal(h.story.storyTime(), '21:14');
h.act('[data-nav="phonehome"]');
h.act('[data-view="ktstory"]');
h.act('[data-route="storychat"]');
assert.ok(h.screen.querySelector('[data-judgment="unknown"]'));
h.act('[data-judgment="unknown"]');
assert.match(h.screen.textContent, /这个答案很难发在热帖里/);
assert.ok(h.screen.querySelector('[data-category="恋爱解答"]'));
assert.equal(h.story.getState().judgment, 'unknown');
h.act('[data-open-post="coldwar"]');
assert.ok(h.screen.querySelector('[data-open-post="outsider-view"]'));
h.act('[data-open-post="outsider-view"]');
assert.match(h.screen.textContent, /热榜点进来的路人/);
assert.match(h.screen.textContent, /我不认识你们说的两个人/);
assert.ok(h.screen.querySelector('[data-outsider-reply="feeling"]'));
h.act('[data-outsider-reply="feeling"]');
assert.match(h.screen.textContent, /你们其实是在说自己为什么难过/);
h.act('[data-open-post="coldwar"]');
assert.match(h.screen.textContent, /散场后大家都疲惫/);
assert.match(h.screen.textContent, /21:14 · 讨论还在更新/);
h.act('[data-refresh-official]');
assert.equal(h.story.storyTime(), '21:18');
assert.match(h.screen.textContent, /RV JP 官方更新/);
assert.equal(h.screen.querySelectorAll('.nf-official-grid img').length, 3);
assert.match(h.screen.textContent, /能确认的事/);
assert.match(h.screen.textContent, /仍然不能确认的事/);
assert.ok(h.screen.querySelector('a[href="https://x.com/Red_VelvetJP/status/2101299057998385254"]'));
assert.equal(h.screen.querySelector('[data-complete-chapter]'), null);
h.act('[data-open-post="photo-reactions"]');
assert.equal(h.story.storyTime(), '21:22');
assert.match(h.screen.textContent, /一张图索要它给不了的答案/);
assert.doesNotMatch(h.screen.textContent, /删了什么|删东西/);
h.act('[data-route="official"]');
h.act('[data-complete-chapter]');
assert.match(h.screen.textContent, /CHAPTER 01 · COMPLETE/);
assert.match(h.screen.textContent, /CHAPTER 02/);
assert.match(h.screen.textContent, /尚未开放/);
assert.match(h.screen.textContent, /十月的日本相关 INS/);

h.act('[data-nav="phonehome"]');
h.act('[data-view="album"]');
assert.equal(h.screen.querySelectorAll('.story-gallery').length, 2);
assert.match(h.screen.textContent, /09.14 · 机场图/);
assert.match(h.screen.textContent, /09.19 · 福冈首场/);
h.act('#home');
h.act('[data-view="notebook"]');
assert.match(h.screen.textContent, /只记录/);
assert.match(h.screen.textContent, /涩琪单人机场公开图/);
assert.match(h.screen.textContent, /RV JP 发布双人官方照片/);

h.act('[data-nav="phonehome"]');
h.act('[data-view="ktstory"]');
h.act('[data-route="couplechat"]');
assert.match(h.screen.textContent, /以“你”为收件人的聊天记录/);
assert.doesNotMatch(h.screen.textContent, /我只是累|不是不想看见你/);
h.act('[data-route="storychat"]');
h.act('[data-route="ktstory"]');
h.act('[data-nav="phonehome"]');
h.act('[data-view="forum"]');
h.act('[data-filter="恋爱解答"]');
assert.ok(h.screen.querySelector('[data-post="older-sister"]'));
h.act('[data-post="older-sister"]');
assert.match(h.screen.textContent, /比自己年长的姐姐/);
assert.match(h.screen.textContent, /一个人在回避/);

const persisted = JSON.parse(h.entries.get(STORY_KEY));
assert.equal(persisted.chapterComplete, true);
assert.equal(h.entries.get('pocket-star-v1'), JSON.stringify(h.old), 'story exploration must not mutate LYSN data');

const extras = harness();
extras.act('[data-view="passcode"]');
for (const digit of ['9','1','0','3','2','9']) extras.act(`[data-passcode-digit="${digit}"]`);
extras.act('[data-nav="phonehome"]');
extras.act('[data-view="music"]');
assert.match(extras.screen.textContent, /首场以后/);
assert.ok(extras.screen.querySelector('[data-music-toggle]'));
extras.act('[data-view="phonehome"]');
extras.act('[data-view="sms"]');
assert.match(extras.screen.textContent, /包裹提醒/);
assert.match(extras.screen.textContent, /巡演事务/);
assert.match(extras.screen.textContent, /酒店前台/);
extras.act('[data-sms-thread="tour"]');
assert.match(extras.screen.textContent, /call sheet/);
assert.match(extras.screen.textContent, /服务通知 · 无法回复/);

const systemApps = harness();
systemApps.act('[data-view="passcode"]');
for (const digit of ['9','1','0','3','2','9']) systemApps.act(`[data-passcode-digit="${digit}"]`);
systemApps.act('[data-nav="phonehome"]');
assert.ok(systemApps.screen.querySelector('.ios-widget-calendar'));
assert.ok(systemApps.screen.querySelector('.ios-widget-pann'));
for (const app of ['calendar', 'phone', 'browser', 'sms', 'music']) {
  assert.ok(systemApps.screen.querySelector(`[data-view="${app}"]`), `missing iOS story app ${app}`);
}
assert.equal(systemApps.screen.querySelector('.ios-app-grid [data-view="timeline"]'), null, 'Timeline must be merged into Calendar');
systemApps.act('[data-view="calendar"]');
assert.match(systemApps.screen.textContent, /回放本章/);
assert.match(systemApps.screen.textContent, /福冈首场的现场讨论/);
assert.match(systemApps.screen.textContent, /剧情记录/);
assert.match(systemApps.screen.textContent, /时间只保存顺序/);
assert.match(systemApps.screen.textContent, /尚未发现/);
systemApps.act('[data-view="phonehome"]');
systemApps.act('[data-view="browser"]');
assert.equal(systemApps.screen.querySelector('#ios-search-input').getAttribute('placeholder'), '搜索网页或输入关键词');
assert.match(systemApps.screen.textContent, /福冈 夜间营业 餐厅/);
assert.match(systemApps.screen.textContent, /怎么和不愿意说难过的人沟通/);
systemApps.act('[data-search="福冈 夜间营业 餐厅"]');
assert.match(systemApps.screen.textContent, /22:00 后仍营业的餐厅/);
systemApps.act('[data-view="phonehome"]');
systemApps.act('[data-view="phone"]');
assert.match(systemApps.screen.textContent, /队长老师/);
assert.match(systemApps.screen.textContent, /通话内容不可恢复/);
assert.equal(systemApps.screen.querySelectorAll('.ios-call-list button').length, 6);

const resumed = harness(persisted);
assert.equal(resumed.story.getState().chapterComplete, true);
assert.equal(resumed.story.storyTime(), '21:22');
resumed.act('[data-view="passcode"]');
for (const digit of ['9','1','0','3','2','9']) resumed.act(`[data-passcode-digit="${digit}"]`);
resumed.act('[data-nav="phonehome"]');
resumed.act('[data-view="ktstory"]');
resumed.act('[data-route="storychat"]');
resumed.act('[data-route="ktstory"]');
resumed.act('[data-nav="phonehome"]');
resumed.act('[data-view="lysn"]');
assert.match(resumed.screen.textContent, /自定义角色聊天/);
assert.match(resumed.screen.textContent, /已保存的联系人/);
resumed.act('[data-contact="starlight"]');
assert.match(resumed.screen.textContent, /不能丢掉的旧聊天/);
assert.ok(resumed.screen.querySelector('[data-play="old-voice"]'));

const replay = harness(persisted);
replay.act('[data-view="passcode"]');
for (const digit of ['9','1','0','3','2','9']) replay.act(`[data-passcode-digit="${digit}"]`);
replay.act('[data-nav="phonehome"]');
replay.act('[data-view="ktstory"]');
replay.act('[data-route="storychat"]');
replay.act('[data-route="notebook"]');
replay.act('[data-restart-chapter]');
replay.act('#confirm-action');
assert.equal(replay.story.storyTime(), '20:52');
assert.equal(replay.story.getState().chapterComplete, false);
assert.match(replay.screen.textContent, /S 的 iPhone · 遗失模式/);
assert.equal(replay.entries.get('pocket-star-v1'), JSON.stringify(replay.old));

for (const asset of [
  'assets/chapter1/seulgi-airport-20260914.jpg',
  'assets/chapter1/rvjp-fukuoka-backstage-20260919.jpg',
  'assets/chapter1/rvjp-fukuoka-audience-duo-20260919.jpg',
  'assets/chapter1/rvjp-fukuoka-audience-full-20260919.jpg',
  'assets/chapter1/after-first-show.wav'
]) assert.ok(fs.statSync(path.join(__dirname, '../dist', asset)).size > 1000, `missing asset ${asset}`);

const postIds = h.window.JapanStoryData.posts.map((post) => post.id);
assert.equal(postIds.length, new Set(postIds).size);
assert.equal(h.story.ready({ introRead: true, read: ['coldwar', 'airport-gap', 'stage-counter'], seen: ['airport-seulgi-0914'], igSaved: ['sg-260916'] }), true);
assert.equal(h.story.ready({ introRead: true, read: ['coldwar', 'airport-gap'], seen: ['airport-seulgi-0914'], igSaved: ['sg-260916'] }), false);

console.log('PASS: Chapter 01 lock-screen entry, third-person investigation, public-source timeline, album/memo triggers, locked Chapter 02, persistence, and preserved LYSN data.');
