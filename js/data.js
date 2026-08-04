/**
 * 48个国际音标完整数据集
 * 单元音12 + 双元音8 = 20元音，辅音28，合计48
 * audio   字段为本地音频文件路径（真人发音）
 * mn      字段为中文口诀（Web Speech API 朗读此字段）
 * suffix  字段为三连拼音/字母后缀（仅显示，不参与TTS朗读）
 */

// ========== 元音 20 ==========
// 单元音 12 + 双元音 8
const VOWEL_DATA = [
  // --- 单元音 12 ---
  { phon: 'iː',  mn: '火车鸣笛',   suffix: '呜呜呜',         word: 'see',    audio: 'audio/vowel-i-long.mp3' },
  { phon: 'ɪ',   mn: '喊句口号',   suffix: '耶耶耶',         word: 'sit',    audio: 'audio/vowel-i-short.mp3' },
  { phon: 'e',   mn: '一指微笑',   suffix: '哎哎哎',         word: 'bed',    audio: 'audio/vowel-e-short.mp3' },
  { phon: 'æ',   mn: '三指咧嘴',   suffix: '啊啊啊',         word: 'cat',    audio: 'audio/vowel-ae-short.mp3' },
  { phon: 'ɑː',  mn: '大叫一声',   suffix: '啊啊啊',         word: 'car',    audio: 'audio/vowel-a-long.mp3' },
  { phon: 'ɒ',   mn: '半边圆圈',   suffix: '哦哦哦',         word: 'hot',    audio: 'audio/vowel-o-short.mp3' },
  { phon: 'ɔː',  mn: '恍然大悟',   suffix: '哦哦哦',         word: 'law',    audio: 'audio/vowel-aw-long.mp3' },
  { phon: 'ʊ',   mn: '污污水坑',   suffix: '呜呜呜',         word: 'book',   audio: 'audio/vowel-u-short.mp3' },
  { phon: 'uː',  mn: '织件毛衣',   suffix: '衣衣衣',         word: 'food',   audio: 'audio/vowel-u-long.mp3' },
  { phon: 'ʌ',   mn: '三天没吃',   suffix: '饿饿饿',         word: 'cup',    audio: 'audio/vowel-uh-short.mp3' },
  { phon: 'ɜː',  mn: '尖角扎人',   suffix: '啊啊啊',         word: 'bird',   audio: 'audio/vowel-er-long.mp3' },
  { phon: 'ə',   mn: '小鹅倒立胃', suffix: '鹅鹅鹅',         word: 'about', audio: 'audio/vowel-schwa-short.mp3' },
  // --- 双元音 8 ---
  { phon: 'eɪ',  mn: '应答一声',   suffix: 'A A A',          word: 'day',    audio: 'audio/diphthong-ei.mp3' },
  { phon: 'aɪ',  mn: '爱的呼唤',   suffix: 'I I I',          word: 'my',     audio: 'audio/diphthong-ai.mp3' },
  { phon: 'ɔɪ',  mn: '熬夜男孩',   suffix: 'O O O',          word: 'boy',    audio: 'audio/diphthong-oi.mp3' },
  { phon: 'aʊ',  mn: '老虎咆哮',   suffix: 'O O O',          word: 'how',    audio: 'audio/diphthong-au.mp3' },
  { phon: 'əʊ',  mn: '疯狂呕吐',   suffix: 'O O O',          word: 'go',     audio: 'audio/diphthong-ou.mp3' },
  { phon: 'ɪə',  mn: '一只小鹅',   suffix: '鹅鹅鹅',         word: 'here',   audio: 'audio/diphthong-ear.mp3' },
  { phon: 'eə',  mn: '挨饿小鹅',   suffix: 'E E E',          word: 'air',    audio: 'audio/diphthong-air.mp3' },
  { phon: 'ʊə',  mn: '五只小鹅',   suffix: 'U U U',          word: 'tour',   audio: 'audio/diphthong-ure.mp3' }
];

// ========== 辅音 28 ==========
const CONSONANT_DATA = [
  { phon: 'p',   mn: '婆婆泼水',   suffix: '泼泼泼',         word: 'pen',    audio: 'audio/consonant-p.mp3' },
  { phon: 'b',   mn: '手剥香蕉',   suffix: '剥剥剥',         word: 'bag',    audio: 'audio/consonant-b.mp3' },
  { phon: 't',   mn: '两指弹起',   suffix: 'T T T',          word: 'ten',    audio: 'audio/consonant-t.mp3' },
  { phon: 'd',   mn: '小马跑步',   suffix: 'T T T',          word: 'dog',    audio: 'audio/consonant-d.mp3' },
  { phon: 'k',   mn: '轻轻咳嗽',   suffix: 'K K K',          word: 'key',    audio: 'audio/consonant-k.mp3' },
  { phon: 'ɡ',   mn: '农夫割草',   suffix: 'G G G',          word: 'go',     audio: 'audio/consonant-g.mp3' },
  { phon: 'f',   mn: '轻轻抚摸',   suffix: 'f f f',          word: 'fan',    audio: 'audio/consonant-f.mp3' },
  { phon: 'v',   mn: '轻咬下唇',   suffix: 'v v v',          word: 'van',    audio: 'audio/consonant-v.mp3' },
  { phon: 's',   mn: '春蚕吐丝',   suffix: 's s s',          word: 'sun',    audio: 'audio/consonant-s.mp3' },
  { phon: 'z',   mn: '电钻打洞',   suffix: 'z z z',          word: 'zoo',    audio: 'audio/consonant-z.mp3' },
  { phon: 'θ',   mn: '轻咬舌尖',   suffix: 'th th th',       word: 'think',  audio: 'audio/consonant-th-soft.mp3' },
  { phon: 'ð',   mn: '舌尖发麻',   suffix: 'th th th',       word: 'this',   audio: 'audio/consonant-th-voice.mp3' },
  { phon: 'ʃ',   mn: '一位老师',   suffix: 'sh sh sh',       word: 'she',    audio: 'audio/consonant-sh.mp3' },
  { phon: 'ʒ',   mn: '日头高照',   suffix: 'zh zh zh',       word: 'vision', audio: 'audio/consonant-zh.mp3' },
  { phon: 'h',   mn: '大口喝水',   suffix: 'h h h',          word: 'hat',    audio: 'audio/consonant-h.mp3' },
  { phon: 'tʃ',  mn: '大口吃饭',   suffix: 'ch ch ch',       word: 'chair',  audio: 'audio/consonant-ch.mp3' },
  { phon: 'dʒ',  mn: '蜘蛛织网',   suffix: 'zh zh zh',       word: 'judge',  audio: 'audio/consonant-j.mp3' },
  { phon: 'tr',  mn: '轻轻戳洞',   suffix: 'ch ch ch',       word: 'tree',   audio: 'audio/consonant-tr.mp3' },
  { phon: 'dr',  mn: '小鸟捉虫',   suffix: 'zhuo zhuo zhuo', word: 'dream',  audio: 'audio/consonant-dr.mp3' },
  { phon: 'ts',  mn: '呲牙咧嘴',   suffix: 'z z z',          word: 'cats',   audio: 'audio/consonant-ts.mp3' },
  { phon: 'dz',  mn: '工人伐木',   suffix: 'z z z',          word: 'beds',   audio: 'audio/consonant-dz.mp3' },
  { phon: 'm',   mn: '嘴巴紧闭',   suffix: '嗯嗯嗯',         word: 'man',    audio: 'audio/consonant-m.mp3' },
  { phon: 'n',   mn: '嘴巴微张',   suffix: '嗯嗯嗯',         word: 'no',     audio: 'audio/consonant-n.mp3' },
  { phon: 'ŋ',   mn: '舌头拱起',   suffix: '嗯嗯嗯',         word: 'sing',   audio: 'audio/consonant-ng.mp3' },
  { phon: 'l',   mn: '气从旁流',   suffix: '了了了',         word: 'love',   audio: 'audio/consonant-l.mp3' },
  { phon: 'r',   mn: '卷起舌尖',   suffix: 'r r r',          word: 'red',    audio: 'audio/consonant-r.mp3' },
  { phon: 'j',   mn: '一位爷爷',   suffix: 'y y y',          word: 'yes',    audio: 'audio/consonant-y.mp3' },
  { phon: 'w',   mn: '学生是我',   suffix: 'w w w',          word: 'we',     audio: 'audio/consonant-w.mp3' }
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
