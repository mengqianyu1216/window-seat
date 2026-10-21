import { journeys, getJourney } from './journeys.js';
import { pickNextJourney, readSavedJourneys, toggleSavedJourney, persistSavedJourneys } from './state.js';
import { WindowScene, TrainAmbience } from './scene.js';

const $ = selector => document.querySelector(selector);
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const ids = journeys.map(journey => journey.id);
const storage = { getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) };
const scene = new WindowScene($('.carriage'), journeys[0]);
const ambience = new TrainAmbience();
const dialog = $('#paper-dialog');
const content = $('#dialog-content');
let currentId = journeys[0].id;
let saved = readSavedJourneys(storage, ids);
let panelType = null;
let dialogOpener = null;
let currentFilter = '全部车票';
let toastTimer;

function notify(message) {
  const toast = $('#toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
}

function updateSavedButtons() {
  $('#saved-count').textContent = String(saved.length);
  for (const button of document.querySelectorAll('[data-action="save"]')) {
    const isSaved = saved.includes(button.dataset.id);
    button.setAttribute('aria-pressed', String(isSaved));
    button.innerHTML = `${icon('bookmark')} ${isSaved ? '已留在口袋' : '留住这一站'}`;
  }
}

function saveJourney(id) {
  if (!ids.includes(id)) return;
  const wasSaved = saved.includes(id);
  saved = toggleSavedJourney(saved, id, ids);
  const persisted = persistSavedJourneys(storage, saved);
  updateSavedButtons();
  if (panelType === 'saved') content.innerHTML = renderSaved();
  notify(wasSaved ? '这张明信片，已经从口袋取出。' : persisted ? '收进口袋了，下次还可以回来看看。' : '已留在本次浏览的口袋里。');
}

function renderJournal() {
  $('#journal-grid').innerHTML = journeys.map(journey => `
    <button type="button" class="journal-card" data-action="story" data-id="${journey.id}" aria-label="阅读${journey.name}">
      <span class="photo-tape"></span><img src="${journey.scene}" alt="${journey.place}的手绘风景" loading="lazy" width="520" height="260">
      <div class="journal-card-info"><div class="journal-card-top"><span class="journal-card-number">JOURNEY / ${journey.number}</span><span class="mood-tag">${journey.mood}</span></div>
      <h3>${journey.name}</h3><p class="journal-card-short">${journey.short}</p><span class="journal-card-link"><span>翻开这页手记</span>${icon('up')}</span></div>
    </button>`).join('');
}

function ticketMarkup(journey, action = 'travel', showCurrent = true) {
  return `<button type="button" class="journey-ticket" data-action="${action}" data-id="${journey.id}">
    <img src="${journey.scene}" alt="" loading="lazy"><div class="journey-ticket-body"><small>旅程 ${journey.number} · ${journey.place}</small><h3>${journey.name}</h3><p>${journey.short}</p></div>
    ${showCurrent && journey.id === currentId ? '<span class="ticket-current">正在经过</span>' : ''}${icon('arrow')}</button>`;
}

function filteredTickets() {
  return journeys.filter(journey => currentFilter === '全部车票' || journey.mood === currentFilter).map(journey => ticketMarkup(journey)).join('');
}

function renderPicker() {
  currentFilter = '全部车票';
  return `<div class="dialog-padding"><p class="dialog-eyebrow">PICK A LITTLE JOURNEY</p><h2 class="dialog-heading" id="dialog-title">今天，想去哪里？</h2><p class="dialog-subtitle">挑一张车票，窗外就会换一种心情。</p>
    <div class="mood-filters" aria-label="按心情选择旅程">${['全部车票', ...journeys.map(journey => journey.mood)].map((mood, index) => `<button type="button" class="mood-filter" data-action="filter" data-mood="${mood}" aria-pressed="${index === 0}">${mood}</button>`).join('')}</div>
    <div class="journey-tickets" id="journey-tickets">${filteredTickets()}</div><p class="dialog-bottom-note">这是一辆记忆列车。三段手绘风景与旅行故事为示例，等待换成真实的旅行记忆。</p></div>`;
}

function renderStory(journey) {
  return `<div class="story-cover"><img src="${journey.scene}" alt="${journey.place}的手绘风景"><span class="story-cover-label">JOURNEY ${journey.number} · ${journey.theme}</span></div>
    <article class="story-body"><div class="story-topline"><p class="story-meta">${journey.season} · ${journey.place} · 示例手记</p><button type="button" class="story-save" data-action="save" data-id="${journey.id}" aria-pressed="${saved.includes(journey.id)}">${icon('bookmark')} ${saved.includes(journey.id) ? '已留在口袋' : '留住这一站'}</button></div>
    <h2 class="dialog-heading" id="dialog-title">${journey.title}</h2><p class="story-intro">${journey.introduction}</p>
    <div class="story-route" aria-label="旅程中的四个片段">${journey.route.map(stop => `<span>${stop}</span>`).join('')}</div>
    ${journey.paragraphs.map(paragraph => `<section class="story-paragraph"><h3>${paragraph.title}</h3><p>${paragraph.text}</p></section>`).join('')}
    <button type="button" class="photo-flip" data-action="flip" data-caption="${journey.caption}" aria-pressed="false" aria-label="翻到照片背面，看看留下的一句话"><span class="photo-flip-inner"><span class="photo-front" aria-hidden="false"><img src="${journey.scene}" alt="${journey.place}"><span>${icon('flip')} 翻到背面，看看那天的心情</span></span><span class="photo-back" aria-hidden="true"><span>${journey.caption}</span><small>—— 窗边的笔记 · 示例</small></span></span></button>
    <h3 class="experience-heading">这一站，做了些小事</h3><div class="experience-grid">${journey.experiences.map(([title, text], index) => `<div class="experience-item"><span>0${index + 1}</span><h4>${title}</h4><p>${text}</p></div>`).join('')}</div>
    <div class="story-bottom"><span class="story-stamp">${journey.stamp}</span><button type="button" class="text-button" data-action="travel" data-id="${journey.id}">去窗边看看这一站 ${icon('arrow')}</button></div></article>`;
}

function renderSaved() {
  return `<div class="dialog-padding"><p class="dialog-eyebrow">LITTLE THINGS TO KEEP</p><h2 class="dialog-heading" id="dialog-title">口袋里的沿途</h2><p class="dialog-subtitle">喜欢的风景，就多留一会儿。</p>
    ${saved.length ? `<div class="saved-list">${saved.map(id => `<div class="saved-item">${ticketMarkup(getJourney(id), 'story', false)}<button type="button" class="saved-remove" data-action="save" data-id="${id}" aria-label="从收藏移除${getJourney(id).name}">${icon('close')}</button></div>`).join('')}</div>` : `<div class="collection-empty"><div class="empty-illustration">${icon('bookmark')}</div><p>口袋还是空的。<br>读一段手记，把喜欢的那一站留下来吧。</p><button type="button" class="cream-button" data-action="journeys">去挑一张车票 ${icon('arrow')}</button></div>`}
    <p class="dialog-bottom-note">收藏保存在当前浏览器，记录的是你喜欢的旅行故事。</p></div>`;
}

function renderMap() {
  return `<div class="dialog-padding"><p class="dialog-eyebrow">A MAP OF LITTLE MEMORIES</p><h2 class="dialog-heading" id="dialog-title">顺着记忆，走一走。</h2><p class="dialog-subtitle">从山风，到海边，再去追一场落日。</p>
    <div class="map-board"><svg viewBox="0 0 700 400" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="board-grid" width="35" height="35" patternUnits="userSpaceOnUse"><path d="M35 0H0v35" fill="none" stroke="#b7bd9e" stroke-width=".5"/></pattern></defs><rect width="700" height="400" fill="url(#board-grid)"/><path d="M0 275c100-80 90 60 180-16S312 165 375 206s48 130 123 87 137-27 202 11" stroke="#a6c9c2" stroke-width="30" fill="none" opacity=".7"/><g fill="#bec9a4" opacity=".5"><path d="m30 140 65-95 60 80 55-93 75 115Z"/><path d="m475 75 47-64 38 50 38-47 62 75Z"/><ellipse cx="185" cy="320" rx="95" ry="30"/><ellipse cx="567" cy="195" rx="88" ry="39"/></g><path d="M210 156C260 65 435 115 469 248S342 351 322 296" stroke="#ae7e59" stroke-width="2.5" stroke-dasharray="7 7" fill="none"/><text x="570" y="360" font-family="Georgia,serif" font-size="12" fill="#98a280" letter-spacing="3">WANDER SLOWLY</text><path d="M644 42v36m-11-24 11-17 11 17" stroke="#879875" fill="none" stroke-width="1.5"/><text x="639" y="30" font-family="Georgia,serif" font-size="10" fill="#879875">N</text></svg>
      ${journeys.map(journey => `<button type="button" class="map-pin" style="left:${journey.mapPoint[0]}%;top:${journey.mapPoint[1]}%" data-action="travel" data-id="${journey.id}"><span></span>${journey.name}</button>`).join('')}
    </div><p class="map-caption">这是一张记忆示意图，连接三段示例旅程，不代表真实地理位置或铁路线路。</p><div class="journey-tickets" style="margin-top:24px">${journeys.map(journey => ticketMarkup(journey)).join('')}</div></div>`;
}

function renderAbout() {
  return `<div class="about-letter">${icon('leaf')}<p class="dialog-eyebrow">HELLO, FELLOW WANDERER</p><h2 class="dialog-heading" id="dialog-title">很高兴，和你坐在一起。</h2><p>这里是「靠窗的位置」，<br>一个用来留住旅行片段的小站。</p><p>把一座山、一阵海风、一场落日，<br>还有路上那些微不足道的小事，<br>慢慢收进自己的生活里。</p><p>希望你来这里的时候，<br>可以放下着急，看看风景，<br>找到一点属于自己的出发理由。</p><p class="about-sign">这个靠窗的位置，永远留给你。✧</p><p class="dialog-bottom-note">当前为可交互示例网站。风景为原创生成插画，手记为示例文字；<br>个人介绍、真实地点与旅行照片可按你的经历替换。</p><button type="button" class="text-button" data-action="journeys" style="margin-top:26px">我们去哪里看看？ ${icon('arrow')}</button></div>`;
}

function openPanel(type, id = currentId) {
  const journey = getJourney(id);
  if (type === 'story' && !journey) return;
  if (!dialog.open) dialogOpener = document.activeElement;
  panelType = type;
  content.innerHTML = type === 'journeys' ? renderPicker() : type === 'story' ? renderStory(journey) : type === 'saved' ? renderSaved() : type === 'map' ? renderMap() : renderAbout();
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('dialog-open');
  scene.setModalOpen(true);
  dialog.scrollTop = 0;
  $('#dialog-close').focus({ preventScroll: true });
}

function closePanel() { if (dialog.open) dialog.close(); }

async function travelTo(id) {
  const journey = getJourney(id);
  if (!journey) return;
  closePanel();
  try {
    const changed = await scene.changeJourney(journey);
    if (!changed) return;
    currentId = id;
    $('#current-title').textContent = journey.name;
    $('#scene-place').textContent = journey.place;
    $('#scene-caption').textContent = journey.short;
    $('#journey-index').textContent = journey.number;
    $('#journey-english').textContent = journey.english;
    $('#desk-photo-image').src = journey.scene;
    $('#desk-photo-image').alt = `${journey.place}的手绘风景`;
    notify(`下一站，${journey.name}。`);
  } catch { notify('这一站暂时没加载好，稍后再试一次吧。'); }
  window.scrollTo({ top: 0, behavior: scene.motionQuery.matches ? 'instant' : 'smooth' });
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (['journeys', 'story', 'saved', 'map', 'about'].includes(action)) openPanel(action, id || currentId);
  else if (action === 'travel') void travelTo(id);
  else if (action === 'random') void travelTo(pickNextJourney(ids, currentId));
  else if (action === 'save') saveJourney(id);
  else if (action === 'filter') {
    currentFilter = button.dataset.mood;
    for (const filter of content.querySelectorAll('[data-action="filter"]')) filter.setAttribute('aria-pressed', String(filter.dataset.mood === currentFilter));
    $('#journey-tickets').innerHTML = filteredTickets();
  } else if (action === 'flip') {
    const flipped = button.classList.toggle('is-flipped');
    button.setAttribute('aria-pressed', String(flipped));
    button.setAttribute('aria-label', flipped ? `照片背面：${button.dataset.caption} 翻回照片正面` : '翻到照片背面，看看留下的一句话');
    button.querySelector('.photo-front').setAttribute('aria-hidden', String(flipped));
    button.querySelector('.photo-back').setAttribute('aria-hidden', String(!flipped));
  }
});

$('#dialog-close').addEventListener('click', closePanel);
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closePanel();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  scene.setModalOpen(false);
  panelType = null;
  if (dialogOpener?.isConnected) dialogOpener.focus({ preventScroll: true });
});
$('#motion-toggle').addEventListener('click', () => {
  if (!scene.togglePlayback()) notify('已跟随系统设置，使用静态风景。');
});
$('#night-toggle').addEventListener('click', async () => {
  try {
    const night = await scene.toggleNight();
    if (night === null) return;
    notify(night ? '窗外的灯亮了，陪你看一会儿夜色。' : '阳光回来了，继续慢慢走吧。');
  } catch { notify('夜景暂时没加载好，稍后再试一次吧。'); }
});
$('#sound-toggle').addEventListener('click', async event => {
  const button = event.currentTarget;
  try {
    const enabled = await ambience.toggle();
    button.setAttribute('aria-pressed', String(enabled));
    button.querySelector('use').setAttribute('href', enabled ? '#i-sound' : '#i-muted');
    button.querySelector('span').textContent = enabled ? '声音：开' : '声音：关';
    button.title = '轻柔的合成列车环境音';
    if (enabled) notify('轻轻的轨道声，陪你一起看风景。');
  } catch { notify('当前浏览器暂时无法播放环境音。'); }
});
document.addEventListener('visibilitychange', () => { void ambience.syncVisibility().catch(() => {}); });

renderJournal();
updateSavedButtons();
