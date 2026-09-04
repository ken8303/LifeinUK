import type { Settings } from './types'

export type Lang = Settings['lang']

/**
 * Interface strings are bilingual. When Traditional Chinese is selected,
 * questions, answers, explanations and the live exam controls are shown in
 * Chinese with English retained underneath where useful.
 */
const UI = {
  /* sidebar */
  overview: ['Overview', '總覽'],
  overviewNote: ['Progress at a glance', '進度一覽'],
  practice: ['Practice tests', '練習測驗'],
  practiceNote: ['17 tests · marked on submit', '17 套測驗 · 提交後批改'],
  adaptive: ['Adaptive mock', '適應性模擬'],
  adaptiveNote: ['Weighted to your errors', '按錯題加重出現機率'],
  official: ['Official simulation', '正式模擬考試'],
  officialNote: ['24 questions · 45 minutes', '24 題 · 45 分鐘'],
  weak: ['Weak spots', '弱項題庫'],
  weakNote: ['Saved and repeatedly missed', '收藏及經常答錯的題目'],
  stats: ['Statistics', '統計'],
  statsNote: ['Heatmap and per-question detail', '熱圖及每題詳情'],
  masteredLabel: ['Mastered', '已掌握'],
  storedLocally: [
    'Progress is saved on this computer only.',
    '進度只儲存在這部電腦。',
  ],
  recordRemarkTitle: ['About your record', '關於你的紀錄'],
  recordRemark: [
    'Your progress is saved on this computer, in this browser, for this link. Keep all three the same and everything is still here next time. Change any one of them — a different browser, another computer or phone, a private window, or a different link — and you start from zero. Clearing your browsing data also erases it. There is no account and nothing is uploaded.',
    '你的進度只儲存在這部電腦、這個瀏覽器、這條連結。三者保持不變，下次回來紀錄仍在。只要其中一項改變 — 換瀏覽器、換電腦或手機、使用無痕視窗，或換另一條連結 — 都會由零開始。清除瀏覽資料同樣會刪除紀錄。本程式沒有帳戶，亦不會上傳任何資料。',
  ],
  desktopOnly: [
    'Desktop and laptop only — the real test is sat at a terminal, so this needs a screen at least 1024px wide.',
    '只支援桌面電腦及手提電腦 — 正式考試在電腦終端機上進行，所以本程式需要闊度至少 1024 像素的螢幕。',
  ],
  runInProgress: ['Run in progress', '進行中'],

  /* dashboard */
  dashEyebrow: ['Life in the UK', '英國生活考試'],
  dashTitle: ['Your progress through the question bank', '你的題庫進度'],
  resume: ['Resume', '繼續'],
  startAdaptive: ['Start an adaptive mock', '開始適應性模擬'],
  sitTimed: ['Sit the timed test', '進行計時測驗'],
  masterRate: ['Master rate', '掌握率'],
  ofQuestionsMastered: ['of {total} questions mastered', '／{total} 題已掌握'],
  neverAttempted: ['{n} never attempted', '{n} 題未做過'],
  stillShaky: ['{n} still shaky', '{n} 題未穩'],
  masteredDef: [
    'Mastered = answered twice or more, with your last two attempts both right.',
    '「已掌握」＝做過兩次或以上，而且最近兩次都答對。',
  ],
  aimFor80: [' Aim for 80% before booking the real test.', '　建議達到 80% 才報考正式測驗。'],
  readyBadge: ['Two clean passes in a row — you look ready', '連續兩次合格 — 你準備好了'],
  overallAccuracy: ['Overall accuracy', '整體正確率'],
  answersRecorded: ['{n} answers recorded', '已記錄 {n} 個作答'],
  lastOfficial: ['Last official mock', '最近一次正式模擬'],
  passMark: ['Pass mark {a}/{b}', '合格分數 {a}/{b}'],
  weakSpotsTile: ['Weak spots', '弱項題目'],
  savedOrMissed: ['Saved or repeatedly missed', '收藏或經常答錯'],
  questionsSeen: ['Questions seen', '已看過的題目'],
  ofTheBank: ['{p} of the bank', '佔題庫 {p}'],
  startHere: ['Start here', '由此開始'],
  threeWays: ['Three ways to work through the bank', '三種練習方式'],
  learnIt: ['Learn it', '學習'],
  drillIt: ['Drill it', '操練'],
  rehearseIt: ['Rehearse it', '模擬'],
  practiceBody: [
    'Work the 17 tests in order. Choose an answer, submit it, and you are marked straight away.',
    '按順序做 17 套測驗。選好答案後提交，即時批改。',
  ],
  adaptiveBody: [
    'Twenty-four questions weighted towards whatever you keep getting wrong.',
    '24 條題目，你越常答錯的越容易出現。',
  ],
  officialBody: [
    'The real conditions: 45 minutes, no feedback, flag for review, and 18 out of 24 to pass.',
    '真實考試條件：45 分鐘、不即時對答案、可標記題目，24 題中答對 18 題合格。',
  ],
  open: ['Open', '開啟'],
  handbookChapters: ['Handbook chapters', '手冊章節'],
  whereGaps: ['Where the gaps are', '弱項分佈'],
  fullStats: ['Full statistics', '完整統計'],
  mockResults: ['Mock results', '模擬成績'],
  scoreTrend: ['Score trend', '分數走勢'],
  answerFewFirst: [
    'Answer a few questions to see which chapters need work.',
    '做幾條題目後，這裡會顯示哪些章節需要加強。',
  ],
  needTwoMocks: [
    'Finish two mock tests and your score trend appears here.',
    '完成兩次模擬測驗後，這裡會顯示分數走勢。',
  ],

  /* practice list */
  practiceTitle: ['The seventeen practice tests', '十七套練習測驗'],
  practiceIntro: [
    '17 tests of 24 questions. Choose an answer, submit it, and you are marked straight away. Nothing is timed.',
    '17 套測驗，每套 24 題。選好答案後提交，即時批改，不設時限。',
  ],
  chooseTest: ['Choose a test', '選擇測驗'],
  testsAndQuestions: ['{t} tests · {q} questions', '{t} 套測驗 · {q} 條題目'],
  testN: ['Test {n}', '測驗 {n}'],
  notStarted: ['not started', '未開始'],
  pctCorrect: ['{p} correct', '正確率 {p}'],
  attempted: ['{a}/{b} attempted', '已做 {a}/{b}'],
  masteredCount: ['{n} mastered', '{n} 題已掌握'],
  continueWhereLeft: ['Continue where there is work left', '繼續未完成的部分'],

  /* adaptive */
  adaptiveTitle: ['Practice weighted to your mistakes', '按錯題加權的練習'],
  adaptiveIntro: [
    '24 questions from all 408. The ones you get wrong come back more often.',
    '從全部 408 題中抽出 24 題，答錯的題目會較常再出現。',
  ],
  startRun: ['Start a {n}-question run', '開始 {n} 題練習'],
  stillShakyTile: ['Still shaky', '未穩'],

  /* official setup */
  officialTitle: ['Sit it under test conditions', '在考試條件下應試'],
  officialIntro: [
    '24 questions, 45 minutes, no feedback until you submit the paper.',
    '24 題、45 分鐘，交卷前不會顯示對錯。',
  ],
  beforeBegin: ['Before you begin', '開始之前'],
  rulesTitle: ['The rules of the real thing', '正式考試規則'],
  rule24: ['24 questions', '24 條題目'],
  rule24Note: ['Drawn from the full 408-question bank.', '從 408 題的題庫中抽取。'],
  rule45: ['45 minutes', '45 分鐘'],
  rule45Note: [
    'The clock keeps running if you refresh or close the tab.',
    '重新整理或關閉分頁，時間仍會繼續走。',
  ],
  rule18: ['18 to pass', '答對 18 題合格'],
  rule18Note: ['That is 75%. Anything below is a fail.', '即 75%，低於此分數為不合格。'],
  ruleNoFb: ['No feedback', '不即時批改'],
  ruleNoFbNote: [
    'Answers stay locked until you submit the whole paper.',
    '交卷前不會顯示答案是否正確。',
  ],
  ruleFlag: ['Flag for review', '標記待覆核'],
  ruleFlagNote: [
    'Mark anything you want to revisit, then work the flag list.',
    '可標記想再看的題目，稍後逐一處理。',
  ],
  questionSelection: ['Question selection', '出題方式'],
  selAdaptive: ['Weighted to your weak spots', '按弱項加權'],
  selAdaptiveNote: ['Favours what you get wrong.', '較常抽出你答錯的題目。'],
  selRandom: ['Straight random draw', '純隨機抽題'],
  selRandomNote: ['Closest to a real sitting.', '最接近真實考試。'],
  beginTest: ['Begin the 45-minute test', '開始 45 分鐘測驗'],
  yourRecord: ['Your record', '你的紀錄'],
  recentOfficial: ['Recent official attempts', '最近的正式模擬紀錄'],
  noOfficialYet: [
    'No official attempts yet. Your results will be listed here.',
    '尚未進行正式模擬，成績會顯示在這裡。',
  ],

  /* weak spots */
  weakTitle: ['The questions worth another look', '值得再看的題目'],
  weakIntro: [
    'Questions you star, plus anything under 60% correct or wrong on your last attempt.',
    '你收藏的題目，加上正確率低於 60% 或上次答錯的題目。',
  ],
  savedByYou: ['Saved by you', '你的收藏'],
  starredWhilePractising: ['Starred while practising', '練習時收藏'],
  flaggedByTracker: ['Flagged by the tracker', '系統判定弱項'],
  lowAccOrMiss: ['Low accuracy or a recent miss', '正確率低或最近答錯'],
  deckSize: ['Deck size', '題組數量'],
  questionsToDrill: ['Questions available to drill', '可供操練的題目'],
  drillWholeDeck: ['Drill the whole deck', '操練整個題組'],
  onlySaved: ['Only my saved questions', '只練收藏題目'],
  onlyMissed: ['Only the ones I keep missing', '只練經常答錯的'],
  nothingHereYet: ['Nothing here yet', '暫時沒有題目'],
  nothingHereBody: [
    'Star a question while practising, or answer a few and anything you keep getting wrong will collect here automatically.',
    '練習時收藏題目，或做多幾題，經常答錯的會自動收集在此。',
  ],
  goToPractice: ['Go to practice', '前往練習'],
  whatsInDeck: ['What is in the deck', '題組內容'],
  nQuestions: ['{n} questions', '{n} 條題目'],
  savedPill: ['Saved', '已收藏'],
  strugglingPill: ['Struggling', '弱項'],
  unseen: ['unseen', '未做過'],

  /* statistics */
  statsEyebrow: ['Statistics', '統計'],
  statsTitle: ['Where you stand across all {n} questions', '全部 {n} 題的整體表現'],
  stillStruggling: ['Still struggling', '仍然答錯'],
  wrongRecently: ['Wrong recently or under 60%', '最近答錯或正確率低於 60%'],
  neverAttemptedTile: ['Never attempted', '從未作答'],
  seenAtLeastOnce: ['{n} questions seen at least once', '已看過 {n} 題'],
  byErrorRate: ['Every question, by error rate', '每題錯誤率'],
  failureHeatmap: ['Failure heatmap', '錯題熱圖'],
  gridNote: ['17 tests × 24 questions', '17 套 × 24 題'],
  accuracyBySubject: ['Accuracy by subject', '各章節正確率'],
  sourceTests: ['Source tests', '來源測驗'],
  accuracyByTest: ['Accuracy by practice test', '各測驗正確率'],
  perQuestionDetail: ['Per-question detail', '每題詳情'],
  questionPerformance: ['Question performance', '題目表現'],
  weakest: ['Weakest', '最弱'],
  mostAnswered: ['Most answered', '做得最多'],
  mostRecent: ['Most recent', '最近'],
  colQuestion: ['Question', '題目'],
  colAsked: ['Asked', '作答次數'],
  colWrong: ['Wrong', '答錯'],
  colAccuracy: ['Accuracy', '正確率'],
  colLastSeen: ['Last seen', '最後一次'],
  colStatus: ['Status', '狀態'],
  nothingAnsweredYet: [
    'Nothing answered yet — the table fills in as you practise.',
    '尚未作答 — 練習後這裡會逐步填滿。',
  ],
  storedOnDevice: ['Stored on this device', '儲存在此裝置'],
  yourData: ['Your data', '你的資料'],
  dataBody: [
    'Statistics, saved questions and any test in progress are kept in this browser only. Nothing is sent anywhere. Clearing resets every count back to zero.',
    '統計、收藏題目及未完成的測驗只儲存在這個瀏覽器，不會傳送到任何地方。清除後所有紀錄歸零。',
  ],
  resetProgress: ['Reset all progress', '清除所有進度'],
  confirmErase: ['Erase all progress? This cannot be undone.', '確定清除所有進度？此操作無法復原。'],
  yesErase: ['Yes, erase everything', '確定全部清除'],
  cancel: ['Cancel', '取消'],
  savedLabel: ['Save', '收藏'],
  masteredPill: ['Mastered', '已掌握'],
  emptyNoteTopics: [
    'Answer a few questions and the breakdown appears here.',
    '做幾條題目後，這裡會顯示分項成績。',
  ],
  seenWord: ['seen', '已看'],
  fewerErrors: ['Fewer errors', '較少答錯'],
  moreErrors: ['More errors', '較多答錯'],
  questionOf: ['Question {n} of {total}', '第 {n} 題／共 {total} 題'],
  chooseAnswers: ['Choose {n} answers', '請選擇 {n} 個答案'],
  save: ['Save', '收藏'],
  saved: ['Saved', '已收藏'],
  flag: ['Flag', '標記'],
  flagged: ['Flagged', '已標記'],
  correct: ['Correct', '正確'],
  yourAnswer: ['Your answer', '你的答案'],
  correctAnswer: ['Correct answer', '正確答案'],
  notQuite: ['Not quite', '不完全正確'],
  previous: ['Previous', '上一題'],
  submitAnswer: ['Submit answer', '提交答案'],
  next: ['Next', '下一題'],
  finishReview: ['Finish and review', '完成並查看結果'],
  backToTests: ['Back to tests', '返回測驗'],
  leaveRun: ['Leave run', '離開練習'],
  weakBack: ['Back to Weak Spots', '返回弱項題庫'],
  correctCount: ['{a}/{b} correct', '{a}/{b} 正確'],
  finishWithQuestionsLeft: ['Finish with questions left?', '仍有題目未作答，確定完成？'],
  questionsStillUnanswered: ['{n} of {total} questions are still unanswered. They will be marked as not attempted and will not count towards your statistics.', '仍有 {n}／{total} 題未作答。這些題目會標記為未作答，不會計入你的統計。'],
  keepGoing: ['Keep going', '繼續作答'],
  finishNow: ['Finish now', '現在完成'],
  submitTest: ['Submit test', '提交測驗'],
  reviewAll: ['Review all', '查看全部'],
  reviewAnswers: ['Review answers', '查看答案'],
  simulatedSitting: ['Simulated sitting', '模擬考試'],
  underFiveMinutes: ['Under five minutes remaining. The paper submits itself when the clock reaches zero.', '剩餘不足五分鐘。時間到零時，試卷會自動提交。'],
  answered: ['answered', '已作答'],
  leftBlank: ['left blank', '未作答'],
  flaggedForReview: ['flagged', '已標記'],
  questionSummary: ['Question summary', '題目摘要'],
  backToPaper: ['Back to the paper', '返回試卷'],
  submitYourTest: ['Submit your test?', '確定提交測驗？'],
  keepWorking: ['Keep working', '繼續作答'],
  submitAndMark: ['Submit and mark', '提交並批改'],
  allAnswered: ['All 24 questions are answered.', '24 題全部已作答。'],
  notAttempted: ['Not attempted', '未作答'],
  savedToWeak: ['Saved to Weak Spots', '已收藏至弱項'],
  emptyNoteExams: ['Nothing attempted yet.', '尚未作答。'],
  emptyNoteExams2: ['Tests 10 to 17 are untouched so far.', '測驗 10 至 17 尚未開始。'],
} satisfies Record<string, readonly [string, string]>

export type UIKey = keyof typeof UI

export function makeT(lang: Lang) {
  return (key: UIKey, vars?: Record<string, string | number>): string => {
    const pair: readonly [string, string] = UI[key]
    let out: string = lang === 'zh' ? pair[1] : pair[0]
    if (vars) for (const [k, v] of Object.entries(vars)) out = out.replace(`{${k}}`, String(v))
    return out
  }
}

const TOPIC_ZH: Record<string, string> = {
  'Values & Principles': '價值觀與原則',
  'What is the UK?': '認識英國',
  'A Long & Illustrious History': '悠久歷史',
  'A Modern, Thriving Society': '現代社會',
  'Government, Law & Your Role': '政府、法律與你的角色',
}

export function topicLabel(lang: Lang, topic: string): string {
  return lang === 'zh' ? (TOPIC_ZH[topic] ?? topic) : topic
}

/** Class hook for the system CJK face; empty in English. */
export function zhFont(lang: Lang): string {
  return lang === 'zh' ? 'zh' : ''
}
