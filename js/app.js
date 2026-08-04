/**
 * 国际音标对对碰 — 游戏主逻辑
 * 音标发音：本地真人音频文件（audio/ 目录）
 * 口诀朗读：浏览器 Web Speech API（中文语音合成）
 */

// ====== 状态变量 ======
let currentMode = 'vowel';       // 当前模式：vowel / consonant / all
let cardList = [];               // 当前牌组
let selectItem = null;           // 当前选中的卡片 { idx, data }
let score = 0;                   // 得分
let timer = 0;                   // 计时（秒）
let timerId = null;              // 计时器ID
let isPaused = false;            // 是否暂停
let isProcessing = false;        // 动画进行中标记（防止快速连点）
let errorMap = {};               // 常错音标记录 { 'iː': 2, ... }
let matchedPairs = 0;            // 已配对数
let totalPairs = 0;              // 总配对数

// ====== DOM 引用 ======
const boardDom     = document.getElementById('board');
const scoreDom     = document.getElementById('score');
const timerDom     = document.getElementById('timer');
const progressDom  = document.getElementById('progress');
const progressFill = document.getElementById('progressFill');
const winModal     = document.getElementById('winModal');
const errorModal   = document.getElementById('errorModal');
const toastDom     = document.getElementById('toast');
const pauseBtn     = document.getElementById('pauseBtn');

// ====== 配置管理（localStorage 持久化） ======

const CONFIG_KEY = 'ipaGameConfig';
const ERROR_KEY  = 'ipaGameErrors';  // 常错音标持久化存储键

/** 加载已保存的配置 */
function loadConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

/** 保存配置（合并写入） */
function saveConfig(partial) {
  try {
    const current = loadConfig();
    Object.assign(current, partial);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(current));
  } catch (e) {}
}

/** 应用主题色到 body */
function applyTheme(theme) {
  document.body.className = '';
  document.body.classList.add('theme-' + (theme || 'pink'));
}

/** 获取常错音标记录范围：all=全部记录(持久化) / session=本次记录(不保存) */
function getErrorScope() {
  const sel = document.getElementById('errorScope');
  return sel ? sel.value : 'session';
}

/** 从 localStorage 加载持久化的常错音标 */
function loadPersistedErrors() {
  try {
    const saved = localStorage.getItem(ERROR_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

/** 将常错音标保存到 localStorage */
function savePersistedErrors() {
  try {
    localStorage.setItem(ERROR_KEY, JSON.stringify(errorMap));
  } catch (e) {}
}

/** 清除持久化的常错音标 */
function clearPersistedErrors() {
  try {
    localStorage.removeItem(ERROR_KEY);
  } catch (e) {}
}

/** 保存顶部设置栏的当前值 */
function saveTopBarSettings() {
  saveConfig({
    mode:       currentMode,
    pairCount:  document.getElementById('pairCount').value,
    pronMode:   document.getElementById('pronMode').value,
    speechRate: document.getElementById('speechRate').value,
    voiceSelect:document.getElementById('voiceSelect').value
  });
}

/** 从存储恢复顶部设置栏的值 */
function loadTopBarSettings() {
  const config = loadConfig();
  if (config.pairCount)   document.getElementById('pairCount').value   = config.pairCount;
  if (config.pronMode)    document.getElementById('pronMode').value    = config.pronMode;
  if (config.speechRate)  document.getElementById('speechRate').value  = config.speechRate;
  if (config.voiceSelect) document.getElementById('voiceSelect').value = config.voiceSelect;
  if (config.mode) {
    currentMode = config.mode;
    document.querySelectorAll('.mode-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === config.mode);
    });
  }
}

/** 根据开关状态更新音标对数下拉框选项 */
function applyExpandPairs(expanded) {
  const sel = document.getElementById('pairCount');
  const currentValue = sel.value;

  // 清空现有选项
  sel.innerHTML = '';

  // 基础选项
  const baseOptions = [
    { value: '5',  label: '5对' },
    { value: '10', label: '10对' },
    { value: '15', label: '15对' }
  ];

  // 扩展选项
  const extraOptions = [
    { value: '20', label: '20对' },
    { value: '25', label: '25对' },
    { value: '30', label: '30对' },
    { value: '35', label: '35对' },
    { value: '40', label: '40对' },
    { value: '45', label: '45对' }
  ];

  const options = expanded ? [...baseOptions, ...extraOptions] : baseOptions;
  options.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.label;
    sel.appendChild(o);
  });

  // "全部"选项始终存在
  const allOpt = document.createElement('option');
  allOpt.value = 'all';
  allOpt.textContent = '全部';
  sel.appendChild(allOpt);

  // 尝试恢复之前选中的值
  if ([...sel.options].some(o => o.value === currentValue)) {
    sel.value = currentValue;
  } else {
    sel.value = '10';
  }
}

/** 初始化设置面板 */
function initSettings() {
  const config = loadConfig();

  // 应用已保存的主题
  const theme = config.theme || 'pink';
  applyTheme(theme);
  document.querySelectorAll('.color-option').forEach(o => {
    o.classList.toggle('active', o.dataset.theme === theme);
  });

  // 恢复常错音标范围设置
  const errorScope = config.errorScope || 'session';
  const errorScopeSel = document.getElementById('errorScope');
  if (errorScopeSel) errorScopeSel.value = errorScope;

  // 如果是"全部记录"模式，从 localStorage 加载历史错题
  if (errorScope === 'all') {
    errorMap = loadPersistedErrors();
  }

  // 恢复"增加音标对数"设置
  const expandPairs = config.expandPairs === true;
  document.getElementById('expandPairs').checked = expandPairs;
  applyExpandPairs(expandPairs);

  // 设置图标 → 打开弹窗
  document.getElementById('settingsIcon').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.add('show');
  });

  // 完成按钮 → 关闭弹窗
  document.getElementById('closeSettings').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.remove('show');
  });

  // 右上角 X → 关闭弹窗
  document.getElementById('closeSettingsX').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.remove('show');
  });

  // 主题色选择
  document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      const t = option.dataset.theme;
      applyTheme(t);
      saveConfig({ theme: t });
      showToast('🎨 主题已切换为' + (t === 'pink' ? '粉色' : t === 'blue' ? '蓝色' : t === 'yellow' ? '黄色' : '绿色'), 'success');
    });
  });

  // 音频测试按钮
  document.getElementById('testAudioBtn').addEventListener('click', () => {
    playPhoneticAudio('audio/vowel-i-long.mp3');
    showToast('🔊 正在播放测试音频', 'success');
  });

  // 重置配置按钮
  document.getElementById('resetConfigBtn').addEventListener('click', () => {
    if (confirm('确定要重置所有配置吗？\n\n将清除：主题颜色、关卡模式、发音方式、语速、朗读人、常错音标记录等所有设置。\n重置后页面会自动刷新。')) {
      localStorage.removeItem(CONFIG_KEY);
      localStorage.removeItem(ERROR_KEY);
      showToast('✅ 已重置所有配置', 'success');
      setTimeout(() => location.reload(), 1200);
    }
  });

  // 点击遮罩关闭设置弹窗
  document.getElementById('settingsModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('settingsModal')) {
      document.getElementById('settingsModal').classList.remove('show');
    }
  });

  // 增加音标对数开关
  document.getElementById('expandPairs').addEventListener('change', (e) => {
    const expanded = e.target.checked;
    applyExpandPairs(expanded);
    saveConfig({ expandPairs: expanded });
    saveTopBarSettings(); // 保存当前选中的对数值
    showToast(expanded ? '🔢 已增加更多对数选项' : '🔢 已恢复默认对数选项', 'success');
  });
}

// ====== 工具函数 ======

/** 获取当前模式的数据源 */
function getCurrentData() {
  switch (currentMode) {
    case 'vowel':     return VOWEL_DATA;
    case 'consonant': return CONSONANT_DATA;
    case 'all':       return [...VOWEL_DATA, ...CONSONANT_DATA];
    default:          return VOWEL_DATA;
  }
}

/** Fisher-Yates 洗牌 */
function shuffle(arr) {
  const temp = [...arr];
  for (let i = temp.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    [temp[i], temp[r]] = [temp[r], temp[i]];
  }
  return temp;
}

/** 随机取一个柔和配色 */
function randomColor() {
  return CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
}

/** Toast 提示 */
let toastTimer = null;
function showToast(msg, type = '') {
  clearTimeout(toastTimer);
  toastDom.textContent = msg;
  toastDom.className = 'show ' + type;
  toastTimer = setTimeout(() => {
    toastDom.classList.remove('show');
  }, 1400);
}

// ====== 音频播放（本地真人音频文件） ======

/**
 * 音频缓存：预加载所有音频到内存
 * 播放时用 cloneNode() 从缓存复制，秒播且互不干扰
 * 远程 .ogg 音频加载失败时自动从缓存移除，播放时走 TTS 回退
 */
const audioCache = {};

/** 预加载所有音频文件到缓存 */
function preloadAudio() {
  [...VOWEL_DATA, ...CONSONANT_DATA].forEach(item => {
    if (item.audio && !audioCache[item.audio]) {
      const a = new Audio();
      a.src = item.audio;
      a.preload = 'auto';
      // 远程音频加载失败时从缓存移除，播放时自动走 TTS 回退
      a.addEventListener('error', () => {
        delete audioCache[item.audio];
      });
      a.load();  // 触发加载
      audioCache[item.audio] = a;
    }
  });
}

/**
 * 播放音标音频文件（从缓存克隆，秒播）
 * 音频加载失败时，用 TTS 朗读英文示例单词作为回退
 * @param {string} audioPath - 音频文件路径
 * @param {string} [fallbackWord] - 英文示例单词（音频失败时 TTS 朗读）
 */
function playPhoneticAudio(audioPath, fallbackWord) {
  if (!audioPath) {
    if (fallbackWord) speakEnglishWord(fallbackWord);
    return;
  }

  // 停止正在播放的 TTS 中文朗读
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  const cached = audioCache[audioPath];

  // 缓存不存在（远程音频预加载失败已移除）→ 直接走 TTS 回退
  if (!cached) {
    if (fallbackWord) speakEnglishWord(fallbackWord);
    return;
  }

  // 从缓存克隆 Audio 节点（已预加载，秒播）
  const audio = cached.cloneNode();

  // 应用语速设置（playbackRate: 0.5 ~ 2.0）
  const rate = parseFloat(document.getElementById('speechRate').value);
  audio.playbackRate = rate;

  // 音频播放失败时，用 TTS 朗读英文单词
  let fallbackTriggered = false;
  const doFallback = () => {
    if (fallbackTriggered) return;
    fallbackTriggered = true;
    if (fallbackWord) speakEnglishWord(fallbackWord);
  };

  audio.addEventListener('error', doFallback);
  audio.play().catch(doFallback);
}

/** 用 TTS 朗读英文单词（音频回退方案） */
function speakEnglishWord(word) {
  if (!('speechSynthesis' in window) || !word) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = 'en-US';
  utter.rate = parseFloat(document.getElementById('speechRate').value);
  // 尝试使用英文语音
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang && v.lang.startsWith('en'));
  if (enVoice) utter.voice = enVoice;
  window.speechSynthesis.speak(utter);
}

// ====== 中文语音合成（Web Speech API） ======

/**
 * 朗读中文文本（口诀卡片专用）
 * @param {string} text - 要朗读的中文文本
 */
function speakChinese(text) {
  if (!('speechSynthesis' in window)) return;
  // 取消正在进行的朗读和音频
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-CN';
  utter.rate = parseFloat(document.getElementById('speechRate').value);

  const voices = window.speechSynthesis.getVoices();
  const voiceName = document.getElementById('voiceSelect').value;

  if (voiceName) {
    const v = voices.find(v => v.name === voiceName);
    // 仅当选的语音是中文时才使用
    if (v && v.lang && v.lang.startsWith('zh')) {
      utter.voice = v;
    }
  } else {
    // 自动选择中文语音
    const zhVoice = voices.find(v => v.lang && v.lang.startsWith('zh'));
    if (zhVoice) utter.voice = zhVoice;
  }

  window.speechSynthesis.speak(utter);
}

/**
 * 配对成功时：先播放音标音频，再朗读口诀+后缀
 * 音频不可用时直接朗读口诀
 * @param {string} audioPath - 音标音频文件路径
 * @param {string} mnText    - 口诀文本（含后缀）
 */
function playPairAudio(audioPath, mnText) {
  // 停止当前所有播放
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  if (!audioPath) {
    speakChinese(mnText);
    return;
  }

  const cached = audioCache[audioPath];

  // 缓存不存在（远程音频预加载失败）→ 直接朗读口诀
  if (!cached) {
    speakChinese(mnText);
    return;
  }

  // 从缓存克隆 Audio 节点（已预加载，秒播）
  const audio = cached.cloneNode();
  const rate = parseFloat(document.getElementById('speechRate').value);
  audio.playbackRate = rate;

  // 音频播放结束后，朗读口诀+后缀
  audio.addEventListener('ended', () => {
    speakChinese(mnText);
  });

  // 播放失败时直接朗读中文
  audio.addEventListener('error', () => {
    speakChinese(mnText);
  });

  audio.play().catch(() => {
    speakChinese(mnText);
  });
}

/** 加载可用语音列表（中文语音） */
function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const select = document.getElementById('voiceSelect');
  select.innerHTML = '<option value="">默认中文语音</option>';

  // 中文语音（用于口诀朗读）
  const zhVoices = voices.filter(v => v.lang && v.lang.startsWith('zh'));
  zhVoices.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    select.appendChild(opt);
  });

  // 如果没有中文语音，提示用户
  if (zhVoices.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '（系统无中文语音）';
    opt.disabled = true;
    select.appendChild(opt);
  }
}

// 语音列表可能异步加载
if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

// ====== 游戏核心 ======

/** 加载关卡 */
function loadLevel() {
  stopTimer();
  isProcessing = false;
  selectItem = null;
  cardList = [];
  matchedPairs = 0;

  let sourceData = getCurrentData();

  // 根据对数设置截取
  const pairCountVal = document.getElementById('pairCount').value;
  if (pairCountVal !== 'all') {
    const n = parseInt(pairCountVal);
    if (sourceData.length > n) {
      sourceData = shuffle(sourceData).slice(0, n);
    }
  }

  totalPairs = sourceData.length;

  // 生成卡片：每个音标生成两张（音标卡 + 口诀卡）
  sourceData.forEach(item => {
    cardList.push({
      type: 'phon',
      key: item.phon,
      text: item.phon,
      audio: item.audio,   // 音频文件路径（本地或远程 wikimedia）
      word: item.word,     // 英文示例单词（音频加载失败时 TTS 朗读）
      mn: item.mn,         // 对应的中文口诀
      hidden: false
    });
    cardList.push({
      type: 'mn',
      key: item.phon,
      text: item.mn,                    // 卡片只显示口诀
      audio: item.audio,
      word: item.word,
      mn: item.mn,                      // 纯中文口诀
      tts: item.mn + ' ' + item.suffix, // TTS 朗读：口诀 + 三连后缀
      hidden: false
    });
  });

  cardList = shuffle(cardList);

  // 重置状态
  score = 0;
  timer = 0;
  scoreDom.textContent = score;
  timerDom.textContent = timer;
  updateProgress();

  startTimer();
  renderBoard();
}

/** 更新进度显示 */
function updateProgress() {
  progressDom.textContent = `${matchedPairs} / ${totalPairs}`;
  const pct = totalPairs > 0 ? (matchedPairs / totalPairs * 100) : 0;
  progressFill.style.width = pct + '%';
}

/** 渲染棋盘 */
function renderBoard() {
  boardDom.innerHTML = '';
  cardList.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'card ' + item.type + '-card';
    div.style.background = randomColor();

    if (item.hidden)   div.classList.add('hidden');
    if (selectItem && selectItem.idx === idx) div.classList.add('selected');

    div.textContent = item.text;
    div.dataset.idx = idx;
    div.addEventListener('click', () => handleCardClick(idx));
    boardDom.appendChild(div);
  });
}

/** 点击卡片处理 */
function handleCardClick(idx) {
  if (isProcessing) return;
  const cur = cardList[idx];
  if (cur.hidden) return;

  // 没有选中卡片 → 选中当前卡片
  if (selectItem === null) {
    selectItem = { idx, data: cur };
    // 点击发音模式
    if (getPronMode() === 'click') {
      if (cur.type === 'mn') {
        // 口诀卡片 → 朗读口诀+后缀
        speakChinese(cur.tts || cur.text);
      } else {
        // 音标卡片 → 播放音频，失败时 TTS 朗读英文单词
        playPhoneticAudio(cur.audio, cur.word);
      }
    }
    renderBoard();
    return;
  }

  // 点击同一张卡片 → 取消选中
  if (selectItem.idx === idx) {
    selectItem = null;
    renderBoard();
    return;
  }

  // 已选中一张，再点另一张 → 判断匹配
  const prev = selectItem.data;
  isProcessing = true;

  if (prev.key === cur.key && prev.type !== cur.type) {
    // ===== 配对成功 =====
    const prevIdx = selectItem.idx;
    const curIdx = idx;

    // 添加消除动画
    const cards = boardDom.querySelectorAll('.card');
    cards[prevIdx].classList.add('matched');
    cards[curIdx].classList.add('matched');
    cards[prevIdx].classList.remove('selected');

    // 配对发音模式：先播音标音频，再读口诀+后缀
    if (getPronMode() === 'match') {
      playPairAudio(cur.audio, cur.tts || cur.mn);
    }

    showToast('✅ 配对成功！', 'success');

    // 动画结束后隐藏卡片
    setTimeout(() => {
      cardList[prevIdx].hidden = true;
      cardList[curIdx].hidden = true;
      matchedPairs++;
      score += 10;
      scoreDom.textContent = score;
      selectItem = null;
      isProcessing = false;
      updateProgress();
      renderBoard();
      checkWin();
    }, 550);

  } else {
    // ===== 配对失败 =====
    const prevIdx = selectItem.idx;
    const curIdx = idx;

    // 红色抖动动画
    const cards = boardDom.querySelectorAll('.card');
    cards[prevIdx].classList.add('error');
    cards[curIdx].classList.add('error');

    showToast('❌ 配对失败！', 'error');

    // 记录常错音标
    errorMap[prev.key] = (errorMap[prev.key] || 0) + 1;
    errorMap[cur.key] = (errorMap[cur.key] || 0) + 1;
    // 如果是"全部记录"模式，同步保存到浏览器
    if (getErrorScope() === 'all') {
      savePersistedErrors();
    }

    // 动画结束后恢复
    setTimeout(() => {
      cards[prevIdx]?.classList.remove('error');
      cards[curIdx]?.classList.remove('error');
      selectItem = null;
      isProcessing = false;
      renderBoard();
    }, 600);
  }
}

/** 获取发音模式 */
function getPronMode() {
  return document.getElementById('pronMode').value;
}

/** 检查是否通关 */
function checkWin() {
  if (matchedPairs >= totalPairs && totalPairs > 0) {
    stopTimer();
    document.getElementById('winTime').textContent = timer;
    document.getElementById('winScore').textContent = score;

    const errorCount = Object.keys(errorMap).length;
    const hintDom = document.getElementById('winErrorHint');
    if (errorCount > 0) {
      hintDom.textContent = `本局有 ${errorCount} 个常错音标，继续加油！`;
    } else {
      hintDom.textContent = '🎉 全部一次配对成功，太棒了！';
    }

    setTimeout(() => {
      winModal.classList.add('show');
    }, 400);
  }
}

// ====== 计时器 ======

function startTimer() {
  stopTimer();
  timerId = setInterval(() => {
    if (!isPaused) {
      timer++;
      timerDom.textContent = timer;
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    pauseBtn.textContent = '继续计时';
    pauseBtn.classList.add('paused');
  } else {
    pauseBtn.textContent = '暂停计时';
    pauseBtn.classList.remove('paused');
  }
}

// ====== 常错音标弹窗 ======

function showErrorModal() {
  const listDom = document.getElementById('errorList');
  const entries = Object.entries(errorMap).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    listDom.innerHTML = '<div class="empty">还没有出错记录，棒棒哒！</div>';
  } else {
    listDom.innerHTML = entries.map(([k, v]) =>
      `<div class="err-item">
        <span class="phon">${k}</span>
        <span class="count">出错 ${v} 次</span>
      </div>`
    ).join('');
  }

  errorModal.classList.add('show');
}

/** 生成常错音标图片报告并下载为 PNG */
function downloadErrorReport() {
  const entries = Object.entries(errorMap).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    showToast('暂无错题数据，无法生成报告', 'error');
    return;
  }

  const totalErrors = entries.reduce((sum, [, v]) => sum + v, 0);
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  // 画布参数
  const colWidths = [80, 200, 100];
  const tableX = 30;
  const tableW = colWidths.reduce((a, b) => a + b, 0);
  const rowH = 40;
  const headerH = 44;
  const titleH = 70;
  const footerH = 50;
  const canvasW = tableX * 2 + tableW;
  const canvasH = titleH + headerH + entries.length * rowH + footerH;

  const canvas = document.createElement('canvas');
  const scale = 2; // 高清绘制
  canvas.width = canvasW * scale;
  canvas.height = canvasH * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // 背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // 标题
  ctx.fillStyle = '#333';
  ctx.font = 'bold 22px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📋 常错音标报告', canvasW / 2, 36);

  // 日期信息
  ctx.fillStyle = '#999';
  ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText(`生成时间：${dateStr} ${timeStr}  |  共 ${entries.length} 个音标  |  累计出错 ${totalErrors} 次`, canvasW / 2, 58);

  // 表头背景
  ctx.fillStyle = '#d64878';
  ctx.fillRect(tableX, titleH, tableW, headerH);

  // 表头文字
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const headers = ['序号', '音标', '出错次数'];
  let cx = tableX;
  headers.forEach((h, i) => {
    ctx.fillText(h, cx + colWidths[i] / 2, titleH + headerH / 2);
    cx += colWidths[i];
  });

  // 表格内容
  entries.forEach(([phon, count], idx) => {
    const y = titleH + headerH + idx * rowH;

    // 斑马纹背景
    ctx.fillStyle = idx % 2 === 0 ? '#fff5f8' : '#ffffff';
    ctx.fillRect(tableX, y, tableW, rowH);

    // 行文字
    ctx.fillStyle = '#555';
    ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(String(idx + 1), tableX + colWidths[0] / 2, y + rowH / 2);

    ctx.fillStyle = '#d64878';
    ctx.font = 'bold 20px "Segoe UI","Charis SIL",serif';
    ctx.fillText(phon, tableX + colWidths[0] + colWidths[1] / 2, y + rowH / 2);

    ctx.fillStyle = '#e03131';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(count + ' 次', tableX + colWidths[0] + colWidths[1] + colWidths[2] / 2, y + rowH / 2);

    // 行边框
    ctx.strokeStyle = '#ffe0ec';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tableX, y + rowH);
    ctx.lineTo(tableX + tableW, y + rowH);
    ctx.stroke();
  });

  // 外边框
  ctx.strokeStyle = '#d64878';
  ctx.lineWidth = 2;
  ctx.strokeRect(tableX, titleH, tableW, headerH + entries.length * rowH);

  // 底部提示
  ctx.fillStyle = '#bbb';
  ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('🎈 国际音标对对碰 — 常错音标统计报告', canvasW / 2, canvasH - 20);

  const dataURL = canvas.toDataURL('image/png');
  const fileName = `常错音标报告_${dateStr}_${timeStr.replace(':','')}.png`;

  // 检测是否为移动设备
  const isMobile = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent);

  if (isMobile) {
    // 移动端：弹出图片预览，提示长按保存到相册
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = `<img src="${dataURL}" alt="常错音标报告" />`;

    // 存储数据供"下载图片"按钮使用
    window._lastReportDataURL = dataURL;
    window._lastReportFileName = fileName;

    document.getElementById('imagePreviewModal').classList.add('show');
    showToast('📷 长按图片可保存到相册', 'success');
  } else {
    // 桌面端：直接下载
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataURL;
    link.click();
    showToast('📷 报告已保存到下载文件夹', 'success');
  }
}

// ====== 事件绑定 ======

// 模式切换
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    // "全部记录"模式不清空错题，"本次记录"模式清空
    if (getErrorScope() !== 'all') {
      errorMap = {};
    }
    saveTopBarSettings();
    loadLevel();
  });
});

// 设置变更时重新加载
document.getElementById('pairCount').addEventListener('change', () => {
  saveTopBarSettings();
  loadLevel();
});
document.getElementById('pronMode').addEventListener('change', () => {
  saveTopBarSettings();
  if (getPronMode() === 'match') {
    showToast('🔊 配对成功后自动发音', 'success');
  } else if (getPronMode() === 'click') {
    showToast('🔊 点击卡片即发音', 'success');
  } else {
    showToast('🔇 已关闭发音', '');
  }
});

// 语速变更时保存
document.getElementById('speechRate').addEventListener('change', () => {
  saveTopBarSettings();
});

// 朗读人变更时保存
document.getElementById('voiceSelect').addEventListener('change', () => {
  saveTopBarSettings();
});

// 常错音标范围切换
document.getElementById('errorScope').addEventListener('change', () => {
  const scope = getErrorScope();
  saveConfig({ errorScope: scope });
  if (scope === 'all') {
    // 切到"全部记录"：加载历史错题并合并到当前
    const persisted = loadPersistedErrors();
    Object.entries(persisted).forEach(([k, v]) => {
      errorMap[k] = (errorMap[k] || 0) + v;
    });
    savePersistedErrors();
    showToast('📋 已切换为全部记录，历史错题已加载', 'success');
  } else {
    // 切到"本次记录"：清除持久化数据，仅保留本次
    clearPersistedErrors();
    showToast('📋 已切换为本次记录，不再保存错题', 'success');
  }
});

// 暂停/继续
pauseBtn.addEventListener('click', togglePause);

// 重新开始
document.getElementById('resetBtn').addEventListener('click', () => loadLevel());

// 常错音标
document.getElementById('showErrorBtn').addEventListener('click', showErrorModal);

// 生成图片报告并下载
document.getElementById('downloadErrorReport').addEventListener('click', downloadErrorReport);

// 关闭弹窗
document.getElementById('closeWin').addEventListener('click', () => {
  winModal.classList.remove('show');
  loadLevel();
});
document.getElementById('closeError').addEventListener('click', () => {
  errorModal.classList.remove('show');
});

// 清空错题
document.getElementById('clearErrors').addEventListener('click', () => {
  errorMap = {};
  clearPersistedErrors();  // 同时清除浏览器中的持久化错题
  document.getElementById('errorList').innerHTML =
    '<div class="empty">已清空，继续加油！</div>';
  showToast('已清空错题记录', 'success');
});

// 点击遮罩关闭弹窗
[
  winModal,
  errorModal,
  document.getElementById('settingsModal'),
  document.getElementById('imagePreviewModal')
].forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });
});

// 图片预览弹窗 — 关闭按钮
document.getElementById('closeImagePreview').addEventListener('click', () => {
  document.getElementById('imagePreviewModal').classList.remove('show');
});
document.getElementById('closeImagePreviewBtn').addEventListener('click', () => {
  document.getElementById('imagePreviewModal').classList.remove('show');
});

// 图片预览弹窗 — 下载图片按钮（备用方案）
document.getElementById('downloadImageBtn').addEventListener('click', () => {
  if (window._lastReportDataURL) {
    const link = document.createElement('a');
    link.download = window._lastReportFileName || '常错音标报告.png';
    link.href = window._lastReportDataURL;
    link.click();
    showToast('📷 图片已下载，请在下载文件夹中查看', 'success');
  }
});

// ====== 启动 ======
initSettings();       // 初始化设置面板（应用主题色等）
loadTopBarSettings(); // 恢复顶部设置栏的值
preloadAudio();       // 预加载音频文件
loadLevel();
