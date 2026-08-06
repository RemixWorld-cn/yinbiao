/**
 * 48个国际音标完整数据集
 * 单元音12 + 双元音8 = 20元音，辅音28，合计48
 *
 * audio      字段为音频文件路径
 *   - 辅音：使用 jynbug/wikimedia-phoneme-audio 仓库（Wikimedia Commons 标准发音）
 *   - 元音：使用本地 audio/ 目录音频文件
 * mn         字段为中文口诀（Web Speech API 朗读此字段）
 * suffix     字段为三连拼音/字母后缀（仅显示，不参与TTS朗读）
 * videoPhon  字段为视频自动字幕识别错误的音标（仅11条有此字段，显示在音标卡片上）
 *
 * 配对标准严格按照文档：音标(phon) ↔ 中文口诀(mn)
 */

// Wikimedia 语音仓库基础 URL
const WIKI_AUDIO_BASE = 'https://raw.githubusercontent.com/jynbug/wikimedia-phoneme-audio/main/audio/';

// ========== 元音 20 ==========
// 单元音 12 + 双元音 8
// 仓库无元音音频，使用本地音频文件
const VOWEL_DATA = [
  // --- 单元音 12 ---
  { phon: 'iː',  mn: '织件毛衣',   suffix: '衣衣衣',         word: 'see',    audio: 'audio/vowel-i-long.mp3' },
  { phon: 'ɪ',   mn: '喊句口号',   suffix: '耶耶耶',         word: 'sit',    audio: 'audio/vowel-i-short.mp3', videoPhon: 'eɪ' },
  { phon: 'e',   mn: '一指微笑',   suffix: '哎哎哎',         word: 'bed',    audio: 'audio/vowel-e-short.mp3' },
  { phon: 'æ',   mn: '三指咧嘴',   suffix: '啊啊啊',         word: 'cat',    audio: 'audio/vowel-ae-short.mp3' },
  { phon: 'ɑː',  mn: '大叫一声',   suffix: '啊啊啊',         word: 'car',    audio: 'audio/vowel-a-long.mp3' },
  { phon: 'ɒ',   mn: '半边圆圈',   suffix: '哦哦哦',         word: 'hot',    audio: 'audio/vowel-o-short.mp3', videoPhon: 'ɜː' },
  { phon: 'ɔː',  mn: '恍然大悟',   suffix: '哦哦哦',         word: 'law',    audio: 'audio/vowel-aw-long.mp3' },
  { phon: 'ʊ',   mn: '污污水坑',   suffix: '呜呜呜',         word: 'book',   audio: 'audio/vowel-u-short.mp3', videoPhon: 'aʊ' },
  { phon: 'uː',  mn: '火车鸣笛',   suffix: '呜呜呜',         word: 'food',   audio: 'audio/vowel-u-long.mp3' },
  { phon: 'ʌ',   mn: '尖角扎人',   suffix: '啊啊啊',         word: 'cup',    audio: 'audio/vowel-uh-short.mp3' },
  { phon: 'ɜː',  mn: '三天没吃',   suffix: '饿饿饿',         word: 'bird',   audio: 'audio/vowel-er-long.mp3', videoPhon: 'æ' },
  { phon: 'ə',   mn: '小鹅倒立',   suffix: '鹅鹅鹅',         word: 'about',  audio: 'audio/vowel-schwa-short.mp3', videoPhon: 'əː' },
  // --- 双元音 8 ---
  { phon: 'eɪ',  mn: '应答一声',   suffix: 'A A A',          word: 'day',    audio: 'audio/diphthong-ei.mp3', videoPhon: 'e' },
  { phon: 'aɪ',  mn: '爱的呼唤',   suffix: 'I I I',          word: 'my',     audio: 'audio/diphthong-ai.mp3', videoPhon: 'ɑː' },
  { phon: 'ɔɪ',  mn: '熬夜男孩',   suffix: 'O O O',          word: 'boy',    audio: 'audio/diphthong-oi.mp3' },
  { phon: 'aʊ',  mn: '老虎咆哮',   suffix: 'O O O',          word: 'how',    audio: 'audio/diphthong-au.mp3' },
  { phon: 'əʊ',  mn: '疯狂呕吐',   suffix: 'O O O',          word: 'go',     audio: 'audio/diphthong-ou.mp3', videoPhon: 'ʊ' },
  { phon: 'ɪə',  mn: '一只小鹅',   suffix: '鹅鹅鹅',         word: 'here',   audio: 'audio/diphthong-ear.mp3', videoPhon: 'ɜː' },
  { phon: 'eə',  mn: '挨饿小鹅',   suffix: 'E E E',          word: 'air',    audio: 'audio/diphthong-air.mp3', videoPhon: 'ɪ' },
  { phon: 'ʊə',  mn: '五只小鹅',   suffix: 'U U U',          word: 'tour',   audio: 'audio/diphthong-ure.mp3', videoPhon: 'ʊ' }
];

// ========== 辅音 28 ==========
// 24个使用 jynbug/wikimedia-phoneme-audio 仓库的 Wikimedia Commons 标准发音
// 4个（ts/dz/tr/dr）仓库缺失或格式不可用，使用本地音频文件
const CONSONANT_DATA = [
  { phon: 'p',   mn: '婆婆泼水',   suffix: '泼泼泼',         word: 'pen',    audio: WIKI_AUDIO_BASE + 'Voiceless_bilabial_plosive.ogg' },
  { phon: 'b',   mn: '手剥香蕉',   suffix: '剥剥剥',         word: 'bag',    audio: WIKI_AUDIO_BASE + 'Voiced_bilabial_plosive.ogg' },
  { phon: 't',   mn: '两指弹起',   suffix: 'T T T',          word: 'ten',    audio: WIKI_AUDIO_BASE + 'Voiceless_alveolar_plosive.ogg' },
  { phon: 'd',   mn: '小马跑步',   suffix: 'D D D',          word: 'dog',    audio: WIKI_AUDIO_BASE + 'Voiced_alveolar_plosive.ogg' },
  { phon: 'k',   mn: '轻轻咳嗽',   suffix: 'K K K',          word: 'key',    audio: WIKI_AUDIO_BASE + 'Voiceless_velar_plosive.ogg' },
  { phon: 'ɡ',   mn: '农夫割草',   suffix: 'G G G',          word: 'go',     audio: WIKI_AUDIO_BASE + 'Voiced_velar_plosive_02.ogg' },
  { phon: 'f',   mn: '轻轻抚摸',   suffix: 'f f f',          word: 'fan',    audio: WIKI_AUDIO_BASE + 'Voiceless_labio-dental_fricative.ogg' },
  { phon: 'v',   mn: '轻咬下唇',   suffix: 'v v v',          word: 'van',    audio: WIKI_AUDIO_BASE + 'Voiced_labio-dental_fricative.ogg' },
  { phon: 's',   mn: '春蚕吐丝',   suffix: 's s s',          word: 'sun',    audio: WIKI_AUDIO_BASE + 'Voiceless_alveolar_sibilant.ogg' },
  { phon: 'z',   mn: '电钻打洞',   suffix: 'z z z',          word: 'zoo',    audio: WIKI_AUDIO_BASE + 'Voiced_alveolar_sibilant.ogg' },
  { phon: 'θ',   mn: '轻咬舌尖',   suffix: 'th th th',       word: 'think',  audio: WIKI_AUDIO_BASE + 'Voiceless_dental_fricative.ogg' },
  { phon: 'ð',   mn: '舌尖发麻',   suffix: 'th th th',       word: 'this',   audio: WIKI_AUDIO_BASE + 'Voiced_dental_fricative.ogg' },
  { phon: 'ʃ',   mn: '一位老师',   suffix: 'sh sh sh',       word: 'she',    audio: WIKI_AUDIO_BASE + 'Voiceless_palato-alveolar_sibilant.ogg' },
  { phon: 'ʒ',   mn: '日头高照',   suffix: 'zh zh zh',       word: 'vision', audio: WIKI_AUDIO_BASE + 'Voiced_palato-alveolar_sibilant.ogg' },
  { phon: 'h',   mn: '大口喝水',   suffix: 'h h h',          word: 'hat',    audio: WIKI_AUDIO_BASE + 'Voiceless_glottal_fricative.ogg' },
  { phon: 'tʃ',  mn: '大口吃饭',   suffix: 'ch ch ch',       word: 'chair',  audio: WIKI_AUDIO_BASE + 'Voiceless_palato-alveolar_affricate.ogg' },
  { phon: 'dʒ',  mn: '蜘蛛织网',   suffix: 'zh zh zh',       word: 'judge',  audio: WIKI_AUDIO_BASE + 'Voiced_palato-alveolar_affricate.ogg' },
  // 以下4个（tr/dr/ts/dz）仓库缺失或.ogx格式浏览器不可播放，使用本地音频
  { phon: 'tr',  mn: '轻轻戳动',   suffix: 'ch ch ch',       word: 'tree',   audio: 'audio/consonant-tr.mp3' },
  { phon: 'dr',  mn: '小鸟捉虫',   suffix: 'zhuo zhuo zhuo', word: 'dream',  audio: 'audio/consonant-dr.mp3' },
  { phon: 'ts',  mn: '龇牙咧嘴',   suffix: 'z z z',          word: 'cats',   audio: 'audio/consonant-ts.mp3' },
  { phon: 'dz',  mn: '工人伐木',   suffix: 'z z z',          word: 'beds',   audio: 'audio/consonant-dz.mp3' },
  { phon: 'm',   mn: '嘴巴紧闭',   suffix: '嗯嗯嗯',         word: 'man',    audio: WIKI_AUDIO_BASE + 'Bilabial_nasal.ogg' },
  { phon: 'n',   mn: '嘴巴微张',   suffix: '嗯嗯嗯',         word: 'no',     audio: WIKI_AUDIO_BASE + 'Alveolar_nasal.ogg' },
  { phon: 'ŋ',   mn: '舌头拱起',   suffix: '嗯嗯嗯',         word: 'sing',   audio: WIKI_AUDIO_BASE + 'Velar_nasal.ogg' },
  { phon: 'l',   mn: '气从旁流',   suffix: '了了了',         word: 'love',   audio: WIKI_AUDIO_BASE + 'Alveolar_lateral_approximant.ogg' },
  { phon: 'r',   mn: '卷起舌尖',   suffix: 'r r r',          word: 'red',    audio: WIKI_AUDIO_BASE + 'Alveolar_approximant.ogg' },
  { phon: 'j',   mn: '一位爷爷',   suffix: 'y y y',          word: 'yes',    audio: WIKI_AUDIO_BASE + 'Palatal_approximant.ogg' },
  { phon: 'w',   mn: '学生是我',   suffix: 'w w w',          word: 'we',     audio: WIKI_AUDIO_BASE + 'Voiced_labio-velar_approximant.ogg' }
];

// 卡片配色（柔和马卡龙色系）
const CARD_COLORS = [
  '#d4f5e9', // 薄荷绿
  '#ffe0d6', // 蜜桃橙
  '#e8d5f5', // 薰衣草紫
  '#d6eaff', // 天空蓝
  '#ffd6e0', // 珊瑚粉
  '#fff5d6', // 奶油黄
  '#dcf0e8', // 浅翠绿
  '#fde0e6', // 樱花粉
  '#e0e8fd', // 浅蓝紫
  '#f5e0d6'  // 杏色
];
