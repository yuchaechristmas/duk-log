/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bird, 
  Trash2, 
  Share2, 
  ExternalLink, 
  Sparkles, 
  Video,
  MessageCircle,
  Archive as ArchiveIcon,
  Loader2,
  Smile,
  Search,
  Plus,
  BarChart3
} from 'lucide-react';

// --- Types ---
interface DukRecord {
  id: string;
  idolName: string;
  title: string;
  contentLink: string;
  commentary: string;
  selectedEmotions: string[];
  createdAt: number;
}

interface DukStats {
  topIdol: string;
  topIdolCount: number;
  emotionStats: { label: string; count: number; emoji: string }[];
  totalRecords: number;
  quackMessage: string;
}

// --- Constants ---
const DEFAULT_EMOTIONS = [
  { label: '설렘', emoji: '💖' },
  { label: '전율', emoji: '⚡' },
  { label: '감동', emoji: '🥺' },
  { label: '과몰입', emoji: '😵‍💫' },
  { label: '뿌듯', emoji: '✨' },
  { label: '귀여움', emoji: '🌱' },
];

const DISCOVER_ITEMS = [
  { title: "엔하이픈 (ENHYPEN) - Bite Me", url: "https://www.youtube.com/watch?v=wXFLzOT_6_M", type: "무대", color: "bg-brand-blue" },
  { title: "뉴진스 (NewJeans) - OMG", url: "https://www.youtube.com/watch?v=sVTy_w_N8D0", type: "직캠", color: "bg-brand-pink" },
  { title: "에스파 (aespa) - Drama", url: "https://www.youtube.com/watch?v=D8VEhcPeSlc", type: "M/V", color: "bg-brand-green" },
  { title: "세븐틴 (SEVENTEEN) - 손오공", url: "https://www.youtube.com/watch?v=9S_wH780DUM", type: "Performance", color: "bg-brand-yellow" },
  { title: "르세라핌 (LE SSERAFIM) - UNFORGIVEN", url: "https://www.youtube.com/watch?v=rXyAtqCHmAc", type: "무대", color: "bg-brand-blue" },
  { title: "아이브 (IVE) - I AM", url: "https://www.youtube.com/watch?v=6ZUIwj3FgUY", type: "M/V", color: "bg-brand-pink" },
  { title: "스트레이 키즈 (Stray Kids) - 특 (S-Class)", url: "https://www.youtube.com/watch?v=JsOOis4bBFg", type: "직캠", color: "bg-brand-green" },
  { title: "방탄소년단 (BTS) - Dynamite", url: "https://www.youtube.com/watch?v=gdZLi9oWNZg", type: "무대", color: "bg-brand-yellow" },
  { title: "블랙핑크 (BLACKPINK) - Pink Venom", url: "https://www.youtube.com/watch?v=gQlMMD8auMs", type: "M/V", color: "bg-brand-blue" },
  { title: "트와이스 (TWICE) - Set Me Free", url: "https://www.youtube.com/watch?v=w4c-7_8S7Lw", type: "Performance", color: "bg-brand-pink" },
];

const PRESET_IDOLS = [
  "뉴진스", "아이브", "르세라핌", "에스파", "엔하이픈", "세븐틴", "스트레이 키즈", "방탄소년단", "직접 입력"
];

// --- Duck Icon Component ---
const DuckIcon = ({ size = 36, className = "" }: { size?: number, className?: string }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <Bird size={size} className="text-yellow-400 fill-yellow-400" />
    <div className="absolute top-[45%] right-[-10%] w-[35%] h-[20%] bg-orange-400 rounded-full" /> {/* Beak */}
    <div className="absolute top-[30%] left-[25%] w-[10%] h-[10%] bg-black rounded-full" /> {/* Eye */}
  </div>
);

// --- Main App ---
export default function App() {
  const [records, setRecords] = useState<DukRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'new-record' | 'archive' | 'discover' | 'report'>('new-record');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // Emotion Management State
  const [emotionsList, setEmotionsList] = useState(DEFAULT_EMOTIONS);
  const [newEmotionLabel, setNewEmotionLabel] = useState('');
  const [newEmotionEmoji, setNewEmotionEmoji] = useState('✨');
  const [showAddEmotion, setShowAddEmotion] = useState(false);

  // Helper to extract YouTube ID
  const getYoutubeThumb = (url: string) => {
    if (!url) return null;
    try {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      const id = match ? match[1] : null;
      return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
    } catch {
      return null;
    }
  };

  const stats = React.useMemo(() => {
    if (records.length === 0) return null;

    const idolCounts: { [key: string]: number } = {};
    const emotionCounts: { [key: string]: number } = {};

    records.forEach(r => {
      idolCounts[r.idolName] = (idolCounts[r.idolName] || 0) + 1;
      r.selectedEmotions.forEach(emo => {
        emotionCounts[emo] = (emotionCounts[emo] || 0) + 1;
      });
    });

    const topIdolEntry = Object.entries(idolCounts).sort((a, b) => b[1] - a[1])[0];
    const sortedEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({
        label,
        count,
        emoji: emotionsList.find(e => e.label === label)?.emoji || '✨'
      }));

    return {
      topIdol: topIdolEntry[0],
      topIdolCount: topIdolEntry[1],
      emotionStats: sortedEmotions,
      totalRecords: records.length,
      quackMessage: records.length >= 10 ? "너 완전 대단한 팬이다꽥! 레전드다꽥!" : 
                    records.length >= 5 ? "기록이 꽤 쌓였다꽥! 꾸준하다꽥!" : 
                    "기록이 차곡차곡 쌓이고 있다꽥!"
    };
  }, [records, emotionsList]);

  // Form State
  const [idolName, setIdolName] = useState('');
  const [title, setTitle] = useState('');
  const [customIdol, setCustomIdol] = useState('');
  const [contentLink, setContentLink] = useState('');
  const [commentary, setCommentary] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    const savedRecords = localStorage.getItem('duk-archive');
    if (savedRecords) setRecords(JSON.parse(savedRecords));
    
    const savedEmotions = localStorage.getItem('duk-emotions');
    if (savedEmotions) setEmotionsList(JSON.parse(savedEmotions));
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('duk-archive', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('duk-emotions', JSON.stringify(emotionsList));
  }, [emotionsList]);

  const toggleEmotion = (label: string) => {
    setSelectedEmotions(prev => 
      prev.includes(label) 
        ? prev.filter(e => e !== label) 
        : [...prev, label]
    );
  };

  const addCustomEmotion = () => {
    if (!newEmotionLabel.trim()) return;
    if (emotionsList.some(e => e.label === newEmotionLabel)) {
      alert("이미 있는 감정이다꽥!");
      return;
    }
    setEmotionsList([...emotionsList, { label: newEmotionLabel, emoji: newEmotionEmoji }]);
    setNewEmotionLabel('');
    setShowAddEmotion(false);
  };

  const deleteEmotion = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`'${label}' 감정을 삭제할래꽥?`)) {
      setEmotionsList(emotionsList.filter(emo => emo.label !== label));
      setSelectedEmotions(selectedEmotions.filter(emo => emo !== label));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmotions.length === 0) {
      alert("지금 기분이 어떤지 알려줘꽥! 💖");
      return;
    }
    setLoading(true);

    const finalIdol = idolName === '직접 입력' ? customIdol : idolName;
    const newRecord: DukRecord = {
      id: Date.now().toString(),
      idolName: finalIdol,
      title: title || `${finalIdol} 덕질 기록이다꽥!`,
      contentLink,
      commentary,
      selectedEmotions,
      createdAt: Date.now(),
    };

    setTimeout(() => {
      setRecords([newRecord, ...records]);
      resetForm();
      setLoading(false);
    }, 500);
  };

  const resetForm = () => {
    setIdolName('');
    setTitle('');
    setCustomIdol('');
    setContentLink('');
    setCommentary('');
    setSelectedEmotions([]);
  };

  const deleteRecord = (id: string) => {
    if (confirm("이 소중한 기록을 정말 지울 거야꽥? 🥺")) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const shareRecord = (record: DukRecord) => {
    const text = `[덕로그] ${record.idolName} 덕질했어꽥!✨\n\n"${record.title}"\n\n#DukLog #아이돌 #덕질 #꽥`;
    if (navigator.share) {
      navigator.share({ title: '덕로그 공유다꽥', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      alert("링크 복사 완료다꽥! 친구들한테 보여줘꽥 💖");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center md:items-end border-b-2 border-brand-text/10 pb-6 mb-12 gap-6">
        <div className="flex items-center gap-4 text-brand-text">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center shadow-lg relative"
          >
            <DuckIcon size={36} />
            <div className="absolute -top-1 -right-1 bg-brand-yellow text-xs px-1.5 py-0.5 rounded-full border-2 border-brand-pink font-black">QUACK</div>
          </motion.div>
          <div>
            <h1 className="text-5xl italic-heading tracking-tighter">덕로그</h1>
            <p className="text-sm font-black opacity-40 flex items-center gap-2 uppercase tracking-widest mt-1">
               우리 오빠/언니 기록장이다꽥 <Smile size={14} className="text-brand-pink" />
            </p>
          </div>
        </div>
        
        <nav className="flex gap-8 text-sm font-black text-brand-text/40 overflow-x-auto w-full md:w-auto pb-4 md:pb-0 scrollbar-hide">
          <div className="flex items-center gap-6">
            <span 
              onClick={() => setActiveTab('new-record')}
              className={`whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${activeTab === 'new-record' ? 'text-brand-text border-b-4 border-brand-pink' : 'hover:text-brand-text/60'}`}
            >
              <Plus size={16} /> 기록하기
            </span>
            <span 
              onClick={() => setActiveTab('archive')}
              className={`whitespace-nowrap cursor-pointer transition-all ${activeTab === 'archive' ? 'text-brand-text border-b-4 border-brand-pink' : 'hover:text-brand-text/60'}`}
            >
              내 보물창고
            </span>
            <span 
              onClick={() => setActiveTab('discover')}
              className={`whitespace-nowrap cursor-pointer transition-all ${activeTab === 'discover' ? 'text-brand-text border-b-4 border-brand-pink' : 'hover:text-brand-text/60'}`}
            >
              둘러보기
            </span>
            <span 
              onClick={() => setActiveTab('report')}
              className={`whitespace-nowrap cursor-pointer transition-all ${activeTab === 'report' ? 'text-brand-text border-b-4 border-brand-pink' : 'hover:text-brand-text/60'}`}
            >
              덕질 보고서
            </span>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'new-record' ? (
            <motion.section 
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="bg-white/60 p-8 md:p-12 rounded-[48px] artistic-border card-shadow backdrop-blur-sm border-2 border-brand-text/5">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-2.5 h-2.5 bg-brand-pink rounded-full shadow-[0_0_10px_#f8ccdf]"></div>
                  <h2 className="text-2xl font-black text-brand-text italic">오늘 덕질한 거 적어줘꽥!</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {/* Idol Selector */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-black opacity-40 ml-2 uppercase tracking-widest leading-none">누구 봤어꽥?</label>
                        <select 
                          required
                          value={idolName}
                          onChange={(e) => setIdolName(e.target.value)}
                          className="w-full p-5 rounded-2xl bg-brand-blue border-none text-brand-text font-bold focus:ring-4 ring-brand-pink/20 appearance-none outline-none cursor-pointer"
                        >
                          <option value="">아이돌 골라봐꽥!</option>
                          {PRESET_IDOLS.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                        {idolName === '직접 입력' && (
                          <motion.input
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            type="text"
                            placeholder="이름이 뭐야꽥?"
                            value={customIdol}
                            onChange={(e) => setCustomIdol(e.target.value)}
                            className="w-full p-5 mt-2 rounded-2xl bg-white border-none shadow-inner font-bold focus:ring-4 ring-brand-pink/20 outline-none"
                          />
                        )}
                      </div>

                      {/* Title Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-black opacity-40 ml-2 uppercase tracking-widest leading-none">제목이 뭐야꽥?</label>
                        <input
                          type="text"
                          placeholder="오늘 기록의 제목을 지어줘꽥!"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full p-5 rounded-2xl bg-white border-none shadow-inner font-bold focus:ring-4 ring-brand-pink/20 outline-none"
                        />
                      </div>

                      {/* Link */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-black opacity-40 ml-2 uppercase tracking-widest">링크 있으면 줘꽥!</label>
                        <input
                          type="url"
                          placeholder="YouTube 링크 같은 거!"
                          value={contentLink}
                          onChange={(e) => setContentLink(e.target.value)}
                          className="w-full p-5 rounded-2xl bg-white border-none shadow-inner font-bold focus:ring-4 ring-brand-pink/20 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Commentary */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-black opacity-40 ml-2 uppercase tracking-widest">어땠어꽥? (솔직하게!)</label>
                        <textarea
                          required
                          rows={6}
                          placeholder="막 이랬다꽥 저랬다꽥 적어줘!"
                          value={commentary}
                          onChange={(e) => setCommentary(e.target.value)}
                          className="w-full p-5 rounded-2xl bg-white border-none shadow-inner font-bold resize-none focus:ring-4 ring-brand-pink/20 outline-none h-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emotion Selection */}
                  <div className="flex flex-col gap-4 pt-2">
                    <div className="flex items-center justify-between ml-2">
                       <label className="text-sm font-black opacity-40 uppercase tracking-widest font-black">지금 기분 다 골라봐꽥! (복수 선택)</label>
                       <button 
                         type="button"
                         onClick={() => setShowAddEmotion(!showAddEmotion)}
                         className="text-xs font-black text-brand-pink flex items-center gap-1 bg-brand-pink/5 px-3 py-1 rounded-full border border-brand-pink/20"
                       >
                         {showAddEmotion ? '닫기' : '나만의 기분 추가꽥! +'}
                       </button>
                    </div>

                    <AnimatePresence>
                      {showAddEmotion && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-white/50 p-6 rounded-3xl border-2 border-brand-pink/20 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                               <label className="text-sm font-black opacity-30 ml-1">이모지 선택</label>
                               <div className="flex gap-2">
                                 {['✨', '🫶', '🔥', '🍰', '🎸', '🤡', '🌟'].map(e => (
                                   <button 
                                     key={e} 
                                     type="button" 
                                     onClick={() => setNewEmotionEmoji(e)}
                                     className={`w-10 h-10 rounded-xl artistic-border text-xl flex items-center justify-center transition-all ${newEmotionEmoji === e ? 'bg-brand-pink ring-2 ring-white scale-110' : 'bg-white'}`}
                                   >
                                     {e}
                                   </button>
                                 ))}
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-sm font-black opacity-30 ml-1">기분 이름 (예: 덕통사고)</label>
                               <div className="flex gap-2">
                                 <input 
                                   type="text"
                                   placeholder="기분을 적어줘꽥!"
                                   value={newEmotionLabel}
                                   onChange={(e) => setNewEmotionLabel(e.target.value)}
                                   className="flex-1 p-3 rounded-xl bg-white border-none shadow-inner text-sm font-bold outline-none"
                                 />
                                 <button 
                                   type="button"
                                   onClick={addCustomEmotion}
                                   className="bg-brand-text text-white px-4 rounded-xl text-sm font-black shadow-lg"
                                 >
                                   추가
                                 </button>
                               </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {emotionsList.map((emo) => (
                        <button
                          key={emo.label}
                          type="button"
                          onClick={() => toggleEmotion(emo.label)}
                          className={`py-4 rounded-2xl font-black text-sm transition-all flex flex-col items-center gap-2 artistic-border relative group/emo ${
                            selectedEmotions.includes(emo.label) 
                              ? 'bg-brand-pink text-white ring-2 ring-white shadow-md' 
                              : 'bg-white text-brand-text/40 hover:text-brand-text hover:bg-brand-pink/5'
                          }`}
                        >
                          <span 
                            onClick={(e) => deleteEmotion(emo.label, e)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-brand-text text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover/emo:opacity-100 transition-opacity shadow-lg z-20"
                            title="삭제꽥!"
                          >
                            ×
                          </span>
                          <span className="text-2xl">{emo.emoji}</span>
                          {emo.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={loading}
                    className="w-full py-6 bg-brand-text text-white rounded-[2rem] font-black text-xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                    {loading ? '기록 저장 중이다꽥...' : '방금 느낀 이 감정 기록하기꽥! ✨'}
                  </motion.button>
                </form>
              </div>

              <div className="bg-white/40 p-8 rounded-[40px] artistic-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-4 border-brand-yellow bg-brand-pink"></div>
                    <div className="w-10 h-10 rounded-full border-4 border-brand-yellow bg-brand-blue"></div>
                    <div className="w-10 h-10 rounded-full border-4 border-brand-yellow bg-brand-green"></div>
                  </div>
                  <span className="text-sm font-black opacity-50 italic">지금까지 총 {records.length}개의 조각을 모았어꽥</span>
                </div>
                <button 
                  onClick={() => setActiveTab('archive')}
                  className="text-sm font-black flex items-center gap-2 border-b-2 border-brand-text/20 pb-1"
                >
                  보물창고 보러가기꽥 ↗️
                </button>
              </div>
            </motion.section>
          ) : activeTab === 'archive' ? (
            <motion.section 
              key="archive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4 px-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black flex items-center gap-2 tracking-tighter">
                    <Search size={16} className="text-brand-pink" /> 최근 내 보물들이다꽥
                  </h3>
                  <span className="bg-white/50 px-3 py-1 rounded-full text-sm font-black uppercase border border-brand-text/5 tracking-widest">
                    Total: {records.length}
                  </span>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {['전체', ...Array.from(new Set(records.map(r => r.idolName)))].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-black transition-all border-2 ${
                        selectedCategory === cat 
                          ? 'bg-brand-pink text-white border-brand-pink shadow-md' 
                          : 'bg-white/40 text-brand-text/40 border-transparent hover:border-brand-pink/20'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {records.length === 0 && !loading && (
                <div className="bg-white/20 rounded-[48px] p-24 artistic-border flex flex-col items-center justify-center text-center backdrop-blur-sm">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <ArchiveIcon size={32} className="text-brand-pink/40" />
                  </div>
                  <p className="font-black opacity-20 text-lg tracking-tight">아직 텅 비어있어꽥!<br />빨리 하나 적어봐꽥!</p>
                </div>
              )}

              <div className="space-y-12">
                {records
                  .filter(r => selectedCategory === '전체' || r.idolName === selectedCategory)
                  .map((record) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Record Card */}
                    <div className="bg-white p-8 md:p-12 rounded-[56px] shadow-sm relative overflow-hidden group border-4 border-brand-text/5">
                      <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-pink/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                      
                      <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-brand-blue/50 px-3 py-0.5 rounded-full text-sm font-black uppercase tracking-[0.2em]">{record.idolName}</span>
                              <span className="text-sm font-bold opacity-30 italic">{new Date(record.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-3xl font-black italic-heading tracking-tight underline decoration-brand-pink/30 underline-offset-8">
                              {record.title}
                            </h3>
                          </div>
                          <div className="flex gap-1 p-4 bg-brand-yellow/30 rounded-[2rem] border-2 border-brand-yellow/50">
                            {(() => {
                              const thumb = getYoutubeThumb(record.contentLink);
                              return thumb ? (
                                <img 
                                  src={thumb} 
                                  alt="thumbnail" 
                                  className="w-20 h-12 object-cover rounded-lg"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                record.selectedEmotions.slice(0, 2).map(emo => (
                                  <span key={emo} className="text-3xl drop-shadow-xl">
                                    {emotionsList.find(e => e.label === emo)?.emoji || '✨'}
                                  </span>
                                ))
                              );
                            })()}
                          </div>
                        </div>

                        <div className="bg-brand-yellow/10 p-8 rounded-[40px] artistic-border backdrop-blur-sm relative border-2 border-brand-yellow/20">
                           <MessageCircle size={32} className="absolute -top-4 -left-4 text-brand-pink opacity-20" />
                           <p className="text-lg leading-relaxed font-black opacity-90 italic">
                             "{record.commentary}"
                           </p>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                          {record.selectedEmotions.map(emo => (
                            <span key={emo} className="px-5 py-2.5 bg-white rounded-2xl text-[11px] font-black artistic-border shadow-sm flex items-center gap-2">
                              <span>{emotionsList.find(e => e.label === emo)?.emoji || '✨'}</span>
                              <span>{emo}</span>
                            </span>
                          ))}
                        </div>

                        <div className="pt-8 flex justify-between items-center border-t border-brand-text/5">
                            <button onClick={() => shareRecord(record)} className="flex items-center gap-2 text-sm font-black hover:underline group">
                              <span>🔗 친구한테 자랑할래꽥</span>
                              <span className="text-xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗️</span>
                            </button>
                            <div className="flex gap-3">
                                <a 
                                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(record.idolName)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center hover:bg-brand-pink hover:text-white transition-all shadow-sm"
                                  title={`${record.idolName} 검색하기꽥!`}
                                >
                                  <Search size={20} />
                                </a>
                                {record.contentLink && (
                                  <a 
                                    href={record.contentLink} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center text-white transition-all shadow-sm"
                                  >
                                    <Video size={20} />
                                  </a>
                                )}
                                <button 
                                  onClick={() => deleteRecord(record.id)} 
                                  className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                >
                                  <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ) : activeTab === 'discover' ? (
            <motion.div 
              key="discover"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black flex items-center gap-2 italic">
                  <Sparkles size={24} className="text-brand-yellow" /> 오리가 추천하는 핫한 무대다꽥!
                </h3>
                <p className="text-sm font-black opacity-40 uppercase tracking-widest">Quack's Choice: Legend Stages</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {DISCOVER_ITEMS.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${item.color}/10 p-10 rounded-[56px] artistic-border shadow-md flex flex-col justify-between group border-4 border-white/40 h-full relative overflow-hidden`}
                  >
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/40 transition-colors"></div>
                    <div className="flex-1 space-y-2">
                      <span className="text-xs font-black opacity-30 uppercase tracking-[0.2em]">{item.type} 추천이다꽥</span>
                      <h4 className="text-2xl font-black leading-tight group-hover:text-brand-pink transition-colors">{item.title}</h4>
                    </div>
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-flex items-center justify-center gap-2 py-4 px-8 bg-brand-text text-white rounded-[2rem] font-black text-sm shadow-xl hover:bg-brand-pink transition-all w-fit"
                    >
                      지금 바로 보러가기! <ExternalLink size={14} />
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black flex items-center gap-2 italic">
                  <BarChart3 size={28} className="text-brand-pink" /> 꼼꼼하게 기록한 네 덕질 보고서다꽥!
                </h3>
                <p className="text-sm font-black opacity-40 uppercase tracking-widest">My Duck Report</p>
              </div>

              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Top Idol */}
                    <div className="bg-brand-pink/10 p-10 rounded-[56px] border-4 border-white space-y-4">
                      <span className="text-sm font-black opacity-30 uppercase tracking-widest">나의 최애 아이돌이다꽥</span>
                      <h4 className="text-4xl font-black text-brand-pink italic-heading">{stats.topIdol}</h4>
                      <p className="font-bold opacity-60">총 {stats.topIdolCount}번이나 기록했어꽥! 대단하다꽥!</p>
                      
                      {/* Duck Power Gauge */}
                      <div className="pt-4 space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-sm font-black opacity-40">덕력 게이지</span>
                           <span className="text-sm font-black text-brand-pink">{Math.min(stats.totalRecords * 10, 100)}%</span>
                        </div>
                        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-brand-pink/20">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(stats.totalRecords * 10, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-brand-pink"
                          />
                        </div>
                      </div>
                    </div>

                  {/* Emotion Trends */}
                  <div className="bg-brand-blue/10 p-10 rounded-[56px] border-4 border-white space-y-6">
                    <span className="text-sm font-black opacity-30 uppercase tracking-widest">자주 느끼는 감정들이다꽥</span>
                    <div className="space-y-3">
                      {stats.emotionStats.slice(0, 3).map((emo) => (
                        <div key={emo.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{emo.emoji}</span>
                            <span className="font-black text-lg">{emo.label}</span>
                          </div>
                          <span className="bg-white/50 px-3 py-1 rounded-full text-sm font-black">{emo.count}회</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Duck Style Summary */}
                  <div className="bg-brand-green/10 col-span-1 md:col-span-2 p-10 rounded-[56px] border-4 border-white flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <DuckIcon size={64} />
                    </div>
                    <div className="space-y-3">
                      <span className="text-sm font-black opacity-30 uppercase tracking-widest">오리의 한마디다꽥</span>
                      <h4 className="text-2xl font-black italic">"{stats.quackMessage}"</h4>
                      <p className="text-sm font-bold opacity-50">지금까지 총 {stats.totalRecords}개의 소중한 기록을 남겼어꽥!</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/20 rounded-[48px] p-24 artistic-border flex flex-col items-center justify-center text-center">
                  <p className="font-black opacity-20 text-lg">기록이 더 쌓여야 보고서를 보여줄 수 있어꽥!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-48 text-center pb-24 border-t border-brand-text/5 pt-12">
        <motion.div 
          whileHover={{ y: -5 }}
          className="inline-flex items-center gap-4 group"
        >
           <div className="w-14 h-14 bg-white rounded-full artistic-border flex items-center justify-center shadow-lg group-hover:bg-brand-pink transition-colors">
              <DuckIcon size={28} />
           </div>
            <div className="text-left">
              <p className="text-sm font-black text-brand-text/60 uppercase tracking-[0.3em] leading-none mb-1">Duk-Log Duck Archive</p>
              <div className="text-sm font-black italic flex items-center gap-2">너의 덕질을 응원한다꽥! <DuckIcon size={16} /> 2026.</div>
            </div>
        </motion.div>
      </footer>
    </div>
  );
}
