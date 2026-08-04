/**
 * 国际音标对对碰 — 游戏主逻辑
 * 使用浏览器 Web Speech API 进行语音朗读
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

// ====== 语音合成（Web Speech API） ======

/** 检测文本是否包含中文 */
function isChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
}

/**
 * 朗读文本（自动识别中英文）
 * @param {string} text - 要朗读的文本
 * @param {string} cardType - 卡片类型 'phon' | 'mn'，用于选择语音
 */
function speak(text, cardType) {
  if (!('speechSynthesis' in window)) return;
  // 取消正在进行的朗读
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  const rate = parseFloat(document.getElementById('speechRate').value);
  utter.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const voiceName = document.getElementById('voiceSelect').value;
  const selectedVoice = voiceName ? voices.find(v => v.name === voiceName) : null;

  // 根据卡片类型和文本内容选择语言
  if (cardType === 'mn' || isChinese(text)) {
    // 口诀卡片 → 中文朗读
    utter.lang = 'zh-CN';
    // 用户选的语音是中文就用它，否则自动找中文语音
    if (selectedVoice && selectedVoice.lang && selectedVoice.lang.startsWith('zh')) {
      utter.voice = selectedVoice;
    } else {
      const zhVoice = voices.find(v => v.lang && v.lang.startsWith('zh'));
      if (zhVoice) utter.voice = zhVoice;
    }
  } else {
    // 音标卡片 → 英文朗读示例单词
    utter.lang = 'en-US';
    // 用户选的语音是英文就用它，否则自动找英文语音
    if (selectedVoice && selectedVoice.lang && selectedVoice.lang.startsWith('en')) {
      utter.voice = selectedVoice;
    } else {
      const enVoice = voices.find(v => v.lang && v.lang.startsWith('en'));
      if (enVoice) utter.voice = enVoice;
    }
  }

  window.speechSynthesis.speak(utter);
}

/** 配对成功时依次朗读英文单词 + 中文口诀 */
function speakPair(word, mnText) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const rate = parseFloat(document.getElementById('speechRate').value);
  const voices = window.speechSynthesis.getVoices();
  const voiceName = document.getElementById('voiceSelect').value;
  const selectedVoice = voiceName ? voices.find(v => v.name === voiceName) : null;

  // 先读英文单词
  const enUtter = new SpeechSynthesisUtterance(word);
  enUtter.lang = 'en-US';
  enUtter.rate = rate;
  // 用户选的语音是英文就用它，否则自动找英文语音
  if (selectedVoice && selectedVoice.lang && selectedVoice.lang.startsWith('en')) {
    enUtter.voice = selectedVoice;
  } else {
    const enVoice = voices.find(v => v.lang && v.lang.startsWith('en'));
    if (enVoice) enUtter.voice = enVoice;
  }

  // 再读中文口诀
  const zhUtter = new SpeechSynthesisUtterance(mnText);
  zhUtter.lang = 'zh-CN';
  zhUtter.rate = rate;
  // 用户选的语音是中文就用它，否则自动找中文语音
  if (selectedVoice && selectedVoice.lang && selectedVoice.lang.startsWith('zh')) {
    zhUtter.voice = selectedVoice;
  } else {
    const zhVoice = voices.find(v => v.lang && v.lang.startsWith('zh'));
    if (zhVoice) zhUtter.voice = zhVoice;
  }

  // 依次排队朗读
  window.speechSynthesis.speak(enUtter);
  window.speechSynthesis.speak(zhUtter);
}

/** 加载可用语音列表（中文 + 英文） */
function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const select = document.getElementById('voiceSelect');
  // 保留"默认发音"选项
  select.innerHTML = '<option value="">默认发音（自动中英文）</option>';

  // 中文语音
  const zhVoices = voices.filter(v => v.lang && v.lang.startsWith('zh'));
  if (zhVoices.length > 0) {
    const zhGroup = document.createElement('optgroup');
    zhGroup.label = '中文语音';
    zhVoices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})`;
      zhGroup.appendChild(opt);
    });
    select.appendChild(zhGroup);
  }

  // 英文语音
  const enVoices = voices.filter(v => v.lang && v.lang.startsWith('en'));
  if (enVoices.length > 0) {
    const enGroup = document.createElement('optgroup');
    enGroup.label = '英文语音';
    enVoices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})`;
      enGroup.appendChild(opt);
    });
    select.appendChild(enGroup);
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
      word: item.word,
      hidden: false
    });
    cardList.push({
      type: 'mn',
      key: item.phon,
      text: item.mn,
      word: item.word,
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
    // 点击发音模式：音标卡读英文单词，口诀卡读中文文字
    if (getPronMode() === 'click') {
      if (cur.type === 'mn') {
        speak(cur.text, 'mn');   // 朗读口诀中文
      } else {
        speak(cur.word, 'phon'); // 朗读英文示例单词
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

    // 配对发音模式：依次朗读英文单词 + 中文口诀
    if (getPronMode() === 'match') {
      speakPair(cur.word, cur.type === 'mn' ? cur.text : prev.text);
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

// ====== 事件绑定 ======

// 模式切换
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    errorMap = {};  // 切换模式清空错题
    loadLevel();
  });
});

// 设置变更时重新加载
document.getElementById('pairCount').addEventListener('change', () => loadLevel());
document.getElementById('pronMode').addEventListener('change', () => {
  if (getPronMode() === 'match') {
    showToast('🔊 配对成功后自动发音', 'success');
  } else if (getPronMode() === 'click') {
    showToast('🔊 点击卡片即发音', 'success');
  } else {
    showToast('🔇 已关闭发音', '');
  }
});

// 暂停/继续
pauseBtn.addEventListener('click', togglePause);

// 重新开始
document.getElementById('resetBtn').addEventListener('click', () => loadLevel());

// 常错音标
document.getElementById('showErrorBtn').addEventListener('click', showErrorModal);

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
  document.getElementById('errorList').innerHTML =
    '<div class="empty">已清空，继续加油！</div>';
  showToast('已清空错题记录', 'success');
});

// 点击遮罩关闭弹窗
[winModal, errorModal].forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });
});

// ====== 启动 ======
loadLevel();
