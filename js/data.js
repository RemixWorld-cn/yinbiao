/**
 * 48个国际音标完整数据集
 * 单元音12 + 双元音8 = 20元音，辅音28，合计48
 * word 字段用于浏览器语音合成（Web Speech API）朗读示例单词
 */

// ========== 元音 20 ==========
// 单元音 12 + 双元音 8
const VOWEL_DATA = [
  // --- 单元音 12 ---
  { phon: 'iː',  mn: '火车鸣笛 呜呜呜', word: 'see' },
  { phon: 'ɪ',   mn: '喊句口号 耶耶耶', word: 'sit' },
  { phon: 'e',   mn: '一指微笑 哎哎哎', word: 'bed' },
  { phon: 'æ',   mn: '三指咧嘴',       word: 'cat' },
  { phon: 'ɑː',  mn: '大叫一声 啊啊啊', word: 'car' },
  { phon: 'ɒ',   mn: '半边圆圈 哦哦哦', word: 'hot' },
  { phon: 'ɔː',  mn: '恍然大悟 哦哦哦', word: 'law' },
  { phon: 'ʊ',   mn: '污水坑 呜呜呜',   word: 'book' },
  { phon: 'uː',  mn: '织件毛衣 衣衣衣', word: 'food' },
  { phon: 'ʌ',   mn: '三天没吃 饿饿饿', word: 'cup' },
  { phon: 'ɜː',  mn: '尖角扎人 啊',     word: 'bird' },
  { phon: 'ə',   mn: '小额倒胃',       word: 'about' },
  // --- 双元音 8 ---
  { phon: 'eɪ',  mn: '应答一声 A',     word: 'day' },
  { phon: 'aɪ',  mn: '爱的呼唤 I',     word: 'my' },
  { phon: 'ɔɪ',  mn: '熬夜男孩 O',     word: 'boy' },
  { phon: 'aʊ',  mn: '老虎咆哮 O',     word: 'how' },
  { phon: 'əʊ',  mn: '疯狂呕吐 O',     word: 'go' },
  { phon: 'ɪə',  mn: '一只小鹅',       word: 'here' },
  { phon: 'eə',  mn: '挨饿小鹅 E',     word: 'air' },
  { phon: 'ʊə',  mn: '五只小鹅 U',     word: 'tour' }
];

// ========== 辅音 28 ==========
const CONSONANT_DATA = [
  { phon: 'p',   mn: '婆婆泼水 泼泼泼',         word: 'pen' },
  { phon: 'b',   mn: '手剥香蕉 剥剥剥',         word: 'bag' },
  { phon: 't',   mn: '两指弹起 TTT',           word: 'ten' },
  { phon: 'd',   mn: '小马跑步 TTT',           word: 'dog' },
  { phon: 'k',   mn: '轻轻咳嗽 KKK',           word: 'key' },
  { phon: 'ɡ',   mn: '农夫割草 GGG',           word: 'go' },
  { phon: 'f',   mn: '轻抚摸',                 word: 'fan' },
  { phon: 'v',   mn: '轻咬下唇',               word: 'van' },
  { phon: 's',   mn: '春蚕吐丝',               word: 'sun' },
  { phon: 'z',   mn: '电钻打洞',               word: 'zoo' },
  { phon: 'θ',   mn: '轻咬舌尖',               word: 'think' },
  { phon: 'ð',   mn: '舌尖发麻',               word: 'this' },
  { phon: 'ʃ',   mn: '一位老师',               word: 'she' },
  { phon: 'ʒ',   mn: '日头高照',               word: 'vision' },
  { phon: 'h',   mn: '大口喝水',               word: 'hat' },
  { phon: 'tʃ',  mn: '吃饭 ch ch ch',         word: 'chair' },
  { phon: 'dʒ',  mn: '蜘蛛织网 zh zh zh',      word: 'judge' },
  { phon: 'tr',  mn: '轻轻戳洞 ch ch ch',      word: 'tree' },
  { phon: 'dr',  mn: '小鸟捉虫 zhuo zhuo zhuo', word: 'dream' },
  { phon: 'ts',  mn: '呲牙咧嘴 z z z',         word: 'cats' },
  { phon: 'dz',  mn: '工人伐木 z h h',         word: 'beds' },
  { phon: 'm',   mn: '嘴巴紧闭 嗯嗯嗯',         word: 'man' },
  { phon: 'n',   mn: '嘴巴微张 嗯嗯嗯',         word: 'no' },
  { phon: 'ŋ',   mn: '舌头拱起 嗯嗯嗯',         word: 'sing' },
  { phon: 'l',   mn: '气从旁流 了了了',         word: 'love' },
  { phon: 'r',   mn: '卷起舌尖 r r r',         word: 'red' },
  { phon: 'j',   mn: '一位爷爷 y y y',         word: 'yes' },
  { phon: 'w',   mn: '学生是我 w w w',         word: 'we' }
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
