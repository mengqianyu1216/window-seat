import { getSceneAsset } from './journeys.js';

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export class WindowScene {
  constructor(root, initialJourney) {
    this.root = root;
    this.world = root.querySelector('#window-world');
    this.track = root.querySelector('#landscape-track');
    this.motionButton = root.querySelector('#motion-toggle');
    this.nightButton = root.querySelector('#night-toggle');
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.userPaused = false;
    this.modalOpen = false;
    this.transitionId = 0;
    this.isNight = false;
    this.renderedNight = false;
    this.currentJourney = initialJourney;
    this.resizeObserver = new ResizeObserver(() => {
      this.world.style.setProperty('--tile-width', `${Math.max(this.world.clientHeight * 3, this.world.clientWidth)}px`);
    });
    this.resizeObserver.observe(this.world);
    this.motionQuery.addEventListener('change', () => this.syncPlayback());
    document.addEventListener('visibilitychange', () => this.syncPlayback());
    this.syncPlayback();
  }

  syncPlayback() {
    const reduced = this.motionQuery.matches;
    const paused = this.userPaused || reduced || this.modalOpen || document.hidden;
    this.root.classList.toggle('is-paused', paused);
    this.motionButton.setAttribute('aria-pressed', String(this.userPaused || reduced));
    this.motionButton.querySelector('use').setAttribute('href', this.userPaused || reduced ? '#i-play' : '#i-pause');
    this.motionButton.querySelector('span').textContent = reduced ? '静态风景' : this.userPaused ? '继续前行' : '暂停风景';
    this.root.querySelector('#running-label').textContent = reduced || this.userPaused ? '把这一刻，多留一会儿' : '列车正慢慢前行';
  }

  togglePlayback() {
    if (this.motionQuery.matches) return false;
    this.userPaused = !this.userPaused;
    this.syncPlayback();
    return true;
  }

  setModalOpen(open) {
    this.modalOpen = open;
    this.syncPlayback();
  }

  async toggleNight() {
    this.isNight = !this.isNight;
    const update = this.changeJourney(this.currentJourney);
    const ownedTransition = this.transitionId;
    try {
      const changed = await update;
      return changed ? this.isNight : null;
    } catch (error) {
      if (ownedTransition !== this.transitionId) return null;
      this.isNight = this.renderedNight;
      throw error;
    }
  }

  syncNightControl() {
    const button = this.root.querySelector('#night-toggle');
    button.setAttribute('aria-pressed', String(this.renderedNight));
    button.setAttribute('aria-label', this.renderedNight ? '切换到日光模式' : '切换到夜行模式');
    button.querySelector('use').setAttribute('href', this.renderedNight ? '#i-sun' : '#i-moon');
    button.querySelector('span').textContent = this.renderedNight ? '日光' : '夜行';
  }

  async changeJourney(journey) {
    const transitionId = ++this.transitionId;
    const requestedNight = this.isNight;
    this.root.classList.add('is-changing');
    this.nightButton.disabled = true;
    try {
      const image = new Image();
      image.src = getSceneAsset(journey, requestedNight);
      await Promise.all([image.decode(), wait(this.motionQuery.matches ? 0 : 400)]);
      if (transitionId !== this.transitionId) return false;
      for (const panel of this.track.querySelectorAll('img')) panel.src = image.src;
      this.root.dataset.scene = journey.id;
      this.currentJourney = journey;
      this.renderedNight = requestedNight;
      this.isNight = requestedNight;
      this.root.classList.toggle('is-night', requestedNight);
      this.syncNightControl();
      await wait(this.motionQuery.matches ? 0 : 80);
      return transitionId === this.transitionId;
    } finally {
      if (transitionId === this.transitionId) {
        this.root.classList.remove('is-changing');
        this.nightButton.disabled = false;
      }
    }
  }
}

export class TrainAmbience {
  constructor() { this.enabled = false; this.context = null; }

  async toggle() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error('Audio unavailable');
      this.context = new AudioContext();
      const length = this.context.sampleRate * 3;
      const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < length; index++) channel[index] = Math.random() * 2 - 1;
      const noise = this.context.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;
      const volume = this.context.createGain();
      volume.gain.value = 0.075;
      noise.connect(filter).connect(volume).connect(this.context.destination);
      const rhythm = this.context.createOscillator();
      rhythm.frequency.value = 4.5;
      const modulation = this.context.createGain();
      modulation.gain.value = 0.024;
      rhythm.connect(modulation).connect(volume.gain);
      noise.start();
      rhythm.start();
    }
    this.enabled = !this.enabled;
    if (this.enabled && !document.hidden) await this.context.resume();
    else await this.context.suspend();
    return this.enabled;
  }

  async syncVisibility() {
    if (!this.context) return;
    if (document.hidden || !this.enabled) await this.context.suspend();
    else await this.context.resume();
  }
}
