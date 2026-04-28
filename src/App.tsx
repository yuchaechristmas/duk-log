/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
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
  BarChart3,
  MousePointer2,
  Trophy,
  History,
  Download,
  Heart,
  Palette
} from 'lucide-react';

// --- Types ---
interface DuckRecord {
  id: string;
  idolName: string;
  title: string;
  contentLink: string;
  commentary: string;
  selectedEmotions: string[];
  createdAt: number;
}

interface DuckStats {
  topIdol: string;
  topIdolCount: number;
  topEmotion: string | null;
  emotionStats: { label: string; count: number; emoji: string }[];
  totalRecords: number;
  quackMessage: string;
}

interface DuckSettings {
  color: string;
  hat: string | null;
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
  { title: "엔하이픈 (ENHYPEN) - No Doubt", url: "https://youtu.be/7nT4-kGpLBk?si=5Teh8lm02WduMQWp", type: "퍼포먼스", color: "bg-brand-blue" },
  { title: "&TEAM (앤팀) - Firework", url: "https://youtu.be/aWDQwM2b_Oc?si=IZ6V4Hblz7NyLsRI", type: "무대", color: "bg-brand-pink" },
  { title: "에스파 (aespa) - Drama", url: "https://www.youtube.com/watch?v=D8VEhcPeSlc", type: "M/V", color: "bg-brand-green" },
  { title: "아이브 (IVE) - Bang Bang", url: "https://youtu.be/ThViJ6Xh5OE?si=pId4DvQHBedZ3buo", type: "무대", color: "bg-brand-yellow" },
  { title: "최예나 (YENA) - 캐치캐치", url: "https://youtu.be/erNe2L0beR0?si=XuCKTPnX0wAb2VR9", type: "무대", color: "bg-brand-blue" },
  { title: "Hearts2Hearts (하츠투하츠) - RUDE!", url: "https://youtu.be/j3gznEhDUK8?si=cEWgYUqrU0iLtkt2", type: "M/V", color: "bg-brand-pink" },
];

const SHOP_LINKS = [
  { name: "위버스 샵 (Weverse Shop)", url: "https://weverseshop.io/", description: "공식 굿즈는 여기서꽥!" },
  { name: "SMTOWN &STORE", url: "https://www.smtownandstore.com/", description: "SM 아티스트 굿즈다꽥!" },
  { name: "JYP SHOP", url: "https://thejypshop.com/", description: "JYP 아티스트 굿즈다꽥!" },
  { name: "Ktown4u", url: "https://www.ktown4u.com/", description: "앨범 공동구매 할인이다꽥!" },
];

const OFFICIAL_SITES = [
  { name: "Melon", url: "https://www.melon.com/", description: "음원 스밍 가자꽥!" },
  { name: "M Countdown", url: "https://www.mnetplus.world/", description: "사전투표 잊지 마꽥!" },
  { name: "The Show", url: "https://programs.sbs.co.kr/plus/theshow/main", description: "화요병 퇴치 무대다꽥!" },
];

const PRESET_IDOLS = [
  "뉴진스", "아이브", "르세라핌", "에스파", "엔하이픈", "세븐틴", "스트레이 키즈", "방탄소년단", "직접 입력"
];

// --- Duck Icon Component ---
const DuckIcon = ({ size = 36, className = "", color = "#facc15", hat = null, md_size }: { size?: number, className?: string, color?: string, hat?: string | null, md_size?: number }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <Bird size={size} style={{ color: color, fill: color }} className={`${md_size ? `md:w-[${md_size}px] md:h-[${md_size}px]` : ""}`} />
    <div className="absolute top-[45%] right-[-10%] w-[35%] h-[20%] bg-orange-400 rounded-full" /> {/* Beak */}
    <div className="absolute top-[30%] left-[25%] w-[10%] h-[10%] bg-black rounded-full" /> {/* Eye */}
    {hat && (
      <div className="absolute top-[-20%] left-[10%] text-center w-full" style={{ fontSize: size * 0.5 }}>
        {hat}
      </div>
    )}
  </div>
);

// --- Custom Cursor Component ---
const CustomCursor = ({ settings }: { settings: DuckSettings }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [trail, setTrail] = useState<{ x: number, y: number, id: number }[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Add particle
      if (Math.random() > 0.8) {
        setTrail(prev => [{ x: e.clientX, y: e.clientY, id: Date.now() }, ...prev.slice(0, 10)]);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest('button, a, input, select, textarea, [role="button"]'));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTrail(prev => prev.slice(0, -1));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] hidden md:flex items-center justify-center"
        animate={{
          x: mousePos.x - 16,
          y: mousePos.y - 16,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 400, mass: 0.5 }}
      >
        <div className={`transition-all duration-300 ${isHovering ? 'rotate-12' : 'rotate-0'}`}>
          <DuckIcon size={24} color={settings.color} hat={settings.hat} />
        </div>
      </motion.div>
      <AnimatePresence>
        {trail.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.5, scale: 0.5 }}
            animate={{ opacity: 0, scale: 0, y: p.y + 10 }}
            exit={{ opacity: 0 }}
            className="fixed w-2 h-2 bg-brand-pink rounded-full pointer-events-none z-[9998]"
            style={{ left: p.x, top: p.y }}
          />
        ))}
      </AnimatePresence>
    </>
  );
};

export default function App() {
  const [records, setRecords] = useState<DuckRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'new-record' | 'archive' | 'discover' | 'report' | 'duck-garden'>('new-record');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // User Features States
  const [favoriteIdols, setFavoriteIdols] = useState<string[]>([]);
  const [duckSettings, setDuckSettings] = useState<DuckSettings>({ color: '#facc15', hat: null });
  const [isSkinsOpen, setIsSkinsOpen] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(1);

  // Level & Experience Calculation
  const duckLevel = Math.floor(records.length / 3) + 1;
  const expProgress = (records.length % 3) / 3 * 100;

  useEffect(() => {
    if (duckLevel > prevLevel) {
      setShowLevelUp(true);
      setPrevLevel(duckLevel);
    }
  }, [duckLevel, prevLevel]);

  // Fan Type Analysis
  const fanType = React.useMemo(() => {
    if (records.length === 0) return "햇병아리 팬";
    
    const hasManyLinks = records.filter(r => r.contentLink).length > records.length * 0.7;
    const hasManyEmotions = records.filter(r => r.selectedEmotions.length > 3).length > records.length * 0.5;
    
    if (hasManyLinks) return "스밍 마스터 오리";
    if (hasManyEmotions) return "감성 폭발 오리";
    if (records.length > 10 && favoriteIdols.length === 1) return "지독한 일편단심";
    if (records.length > 5) return "베테랑 덕후 오리";
    return "성장하는 아기오리";
  }, [records, favoriteIdols]);

  // Emotion Management State
  const [emotionsList, setEmotionsList] = useState(DEFAULT_EMOTIONS);
  const [newEmotionLabel, setNewEmotionLabel] = useState('');
  const [newEmotionEmoji, setNewEmotionEmoji] = useState('✨');
  const [showAddEmotion, setShowAddEmotion] = useState(false);

  // Stats Calculation
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
    const topEmotionEntry = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
    
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
      topEmotion: topEmotionEntry ? topEmotionEntry[0] : null,
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

  // Local Storage Effects
  useEffect(() => {
    const savedRecords = localStorage.getItem('duck-archive') || localStorage.getItem('duk-archive');
    if (savedRecords) setRecords(JSON.parse(savedRecords));
    const savedEmotions = localStorage.getItem('duck-emotions') || localStorage.getItem('duk-emotions');
    if (savedEmotions) setEmotionsList(JSON.parse(savedEmotions));
    const savedFavorites = localStorage.getItem('duck-favorites') || localStorage.getItem('duk-favorites');
    if (savedFavorites) setFavoriteIdols(JSON.parse(savedFavorites));
    const savedDuck = localStorage.getItem('duck-settings') || localStorage.getItem('duk-settings');
    if (savedDuck) setDuckSettings(JSON.parse(savedDuck));
  }, []);

  useEffect(() => {
    localStorage.setItem('duck-archive', JSON.stringify(records));
    localStorage.setItem('duck-emotions', JSON.stringify(emotionsList));
    localStorage.setItem('duck-favorites', JSON.stringify(favoriteIdols));
    localStorage.setItem('duck-settings', JSON.stringify(duckSettings));
  }, [records, emotionsList, favoriteIdols, duckSettings]);

  // Handlers
  const toggleFavorite = (idol: string) => {
    setFavoriteIdols(prev => 
      prev.includes(idol) ? prev.filter(i => i !== idol) : [...prev, idol]
    );
  };

  const toggleEmotion = (label: string) => {
    setSelectedEmotions(prev => 
      prev.includes(label) ? prev.filter(e => e !== label) : [...prev, label]
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
      alert("지금 기분이다꽥! 💖");
      return;
    }
    setLoading(true);
    const finalIdol = idolName === '직접 입력' ? customIdol : idolName;
    const newRecord: DuckRecord = {
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
      setActiveTab('archive');
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
    if (confirm("이 소기록을 지울 거야꽥? 🥺")) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const shareRecord = (record: DuckRecord) => {
    const text = `[덕로그] ${record.idolName} 덕질했어꽥!✨\n\n"${record.title}"\n\n#DuckLog #아이돌 #덕질 #꽥`;
    if (navigator.share) {
      navigator.share({ title: '덕로그 공유다꽥', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      alert("링크 복사 완료다꽥!");
    }
  };

  const exportAsImage = async (id: string, title: string) => {
    const element = document.getElementById(`record-${id}`);
    if (!element) return;
    try {
      const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `duck-log-${title}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("이미지 저장 실패 🥺");
    }
  };

  const getYoutubeThumb = (url: string) => {
    if (!url) return null;
    try {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      const id = match ? match[1] : null;
      return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
    } catch { return null; }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 md:py-8 md:cursor-none">
      <CustomCursor settings={duckSettings} />
      
      {/* Duck Customization Modal */}
      <AnimatePresence>
        {isSkinsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSkinsOpen(false)}
              className="absolute inset-0 bg-brand-text/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] md:rounded-[64px] shadow-2xl relative z-10 w-full max-w-lg p-6 md:p-12 overflow-hidden artistic-border border-4 border-white"
            >
              <div className="flex flex-col items-center text-center gap-4 md:gap-6">
                 <div className="w-20 h-20 md:w-32 md:h-32 bg-brand-pink/10 rounded-full flex items-center justify-center relative">
                    <DuckIcon size={48} color={duckSettings.color} hat={duckSettings.hat} md_size={64} />
                    <Sparkles className="absolute -top-1 -right-1 text-brand-yellow" size={20} />
                 </div>
                 <div>
                    <h3 className="text-xl md:text-3xl font-black italic">오리 꾸미기다꽥!</h3>
                    <p className="font-bold opacity-40 text-xs md:text-base">나만의 오리를 만들어봐꽥!</p>
                 </div>
                 <div className="w-full space-y-4 md:space-y-6 text-left">
                    <div className="space-y-2">
                       <label className="text-xs md:text-sm font-black opacity-30 uppercase tracking-widest pl-2 flex items-center gap-2">색상 선택</label>
                       <div className="flex flex-wrap gap-2 md:gap-3">
                          {['#facc15', '#f87171', '#60a5fa', '#34d399', '#fb923c', '#a78bfa', '#27272a'].map(c => (
                            <button key={c} onClick={() => setDuckSettings({ ...duckSettings, color: c })}
                               className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 md:border-4 transition-all ${duckSettings.color === c ? 'scale-110 border-brand-pink' : 'border-white'}`}
                               style={{ backgroundColor: c }} />
                          ))}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs md:text-sm font-black opacity-30 uppercase tracking-widest pl-2 flex items-center gap-2">아이템 장착</label>
                       <div className="grid grid-cols-4 gap-2">
                          {[null, '🎀', '🎩', '👑', '🎓', '🧢', '🕶️', '🌸'].map(h => (
                            <button key={h || 'none'} onClick={() => setDuckSettings({ ...duckSettings, hat: h })}
                               className={`py-2 md:py-3 rounded-xl md:rounded-2xl border-2 transition-all text-base md:text-xl bg-white ${duckSettings.hat === h ? 'border-brand-pink bg-brand-pink/5 scale-105' : 'border-brand-text/5 opacity-60'}`}>
                               {h || '❌'}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setIsSkinsOpen(false)} className="w-full py-3 bg-brand-text text-white rounded-full font-black text-sm md:text-xl shadow-xl">완료</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUp && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLevelUp(false)} className="absolute inset-0 bg-brand-pink/40 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-[40px] md:rounded-[64px] shadow-2xl relative z-10 w-full max-w-sm p-8 md:p-12 text-center border-4 border-brand-yellow space-y-6">
              <h2 className="text-3xl md:text-5xl font-black italic text-brand-pink">LEVEL UP!</h2>
              <p className="text-xl md:text-2xl font-black">레벨 {duckLevel}로 올라갔어꽥!</p>
              <div className="w-20 h-20 md:w-32 md:h-32 bg-brand-pink/5 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-inner">
                 <DuckIcon size={48} color={duckSettings.color} hat={duckSettings.hat} md_size={64} />
              </div>
              <button onClick={() => setShowLevelUp(false)} className="w-full py-3 bg-brand-pink text-white rounded-full font-black">고마워꽥!</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center md:items-end border-b-2 border-brand-text/10 pb-4 md:pb-6 mb-6 md:mb-12 gap-6">
        <div className="flex items-center gap-3 md:gap-4 text-brand-text">
          <motion.div whileHover={{ scale: 1.1 }} onClick={() => setIsSkinsOpen(true)} className="w-12 h-12 md:w-16 md:h-16 bg-brand-pink rounded-full flex items-center justify-center shadow-lg relative cursor-pointer">
            <DuckIcon size={28} color={duckSettings.color} hat={duckSettings.hat} md_size={36} />
            <div className="absolute -top-1 -right-1 bg-brand-yellow text-[8px] md:text-xs px-1 py-0.5 rounded-full border-2 border-brand-pink font-black">EDIT</div>
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-5xl italic-heading tracking-tighter">덕로그</h1>
            <p className="text-xs md:text-sm font-black opacity-40 uppercase tracking-widest mt-1">나의 Duck질 저장소</p>
          </div>
        </div>
        <nav className="flex gap-4 md:gap-8 text-xs md:text-sm font-black text-brand-text/40 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
           {[
             { id: 'new-record', label: '기록하기', icon: <Plus size={14} /> },
             { id: 'archive', label: '보물창고' },
             { id: 'discover', label: '둘러보기' },
             { id: 'duck-garden', label: '오리 정원' },
             { id: 'report', label: '덕질보고서' }
           ].map(tab => (
             <span key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 relative pb-1 ${activeTab === tab.id ? 'text-brand-text' : 'hover:text-brand-text/60'}`}>
               {tab.icon} {tab.label}
               {activeTab === tab.id && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-pink rounded-full" />}
             </span>
           ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'new-record' ? (
            <motion.section key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="bg-white/60 p-6 md:p-12 rounded-[32px] md:rounded-[48px] border-2 border-brand-text/5 backdrop-blur-sm card-shadow">
                <h2 className="text-lg md:text-2xl font-black mb-6 md:mb-8 italic">오늘 덕질한 거 적어줘꽥!</h2>
                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs md:text-sm font-black opacity-40 uppercase tracking-widest pl-2">누구 봤어꽥?</label>
                        <div className="flex gap-2">
                          <select required value={idolName} onChange={(e) => setIdolName(e.target.value)} className="flex-1 p-3 md:p-5 rounded-xl md:rounded-2xl bg-brand-blue border-none text-brand-text font-bold text-sm md:text-base outline-none">
                            <option value="">아이돌 골라봐꽥!</option>
                            {favoriteIdols.length > 0 && (
                              <optgroup label="나의 최애들 💖">
                                {favoriteIdols.map(name => <option key={`fav-${name}`} value={name}>{name}</option>)}
                              </optgroup>
                            )}
                            <optgroup label="인기 아이돌">
                              {PRESET_IDOLS.map(name => <option key={name} value={name}>{name}</option>)}
                            </optgroup>
                          </select>
                          {idolName && idolName !== '직접 입력' && (
                            <button type="button" onClick={() => toggleFavorite(idolName)} 
                              className={`w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl artistic-border flex items-center justify-center transition-all ${favoriteIdols.includes(idolName) ? 'bg-brand-pink text-white' : 'bg-white text-brand-pink'}`}>
                              <Heart size={18} fill={favoriteIdols.includes(idolName) ? "white" : "none"} />
                            </button>
                          )}
                        </div>
                        {idolName === '직접 입력' && (
                          <input type="text" placeholder="이름이 뭐야꽥?" value={customIdol} onChange={(e) => setCustomIdol(e.target.value)} className="w-full p-3 md:p-5 mt-2 rounded-xl bg-white border-none shadow-inner font-bold text-sm" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs md:text-sm font-black opacity-40 uppercase tracking-widest pl-2">제목이 뭐야꽥?</label>
                        <input type="text" placeholder="제목을 지어줘꽥!" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 md:p-5 rounded-xl md:rounded-2xl bg-white border-none shadow-inner font-bold text-sm md:text-base" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs md:text-sm font-black opacity-40 uppercase tracking-widest pl-2">유튜브 링크</label>
                        <input type="url" placeholder="유튜브 링크 등" value={contentLink} onChange={(e) => setContentLink(e.target.value)} className="w-full p-3 md:p-5 rounded-xl md:rounded-2xl bg-white border-none shadow-inner font-bold text-sm md:text-base" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs md:text-sm font-black opacity-40 uppercase tracking-widest pl-2">메모 (솔직하게!)</label>
                      <textarea required rows={6} placeholder="이랬다꽥 저랬다꽥 다 적어줘꽥" value={commentary} onChange={(e) => setCommentary(e.target.value)} className="w-full p-3 md:p-5 rounded-xl md:rounded-2xl bg-white border-none shadow-inner font-bold resize-none grow text-sm md:text-base" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs md:text-sm font-black opacity-40 uppercase tracking-widest">지금 기분이다꽥!</label>
                      <button type="button" onClick={() => setShowAddEmotion(!showAddEmotion)} className="text-xs md:text-xs font-black text-brand-pink bg-brand-pink/5 px-2 py-1 rounded-full border border-brand-pink/20">커스텀 추가 +</button>
                    </div>
                    <AnimatePresence>
                      {showAddEmotion && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white/50 rounded-2xl border-2 border-brand-pink/20 mb-4 flex flex-col gap-3">
                           <div className="flex flex-wrap gap-2">
                             {['✨', '🫶', '🔥', '🍰', '🎸', '🤡', '🌟'].map(e => (
                               <button key={e} type="button" onClick={() => setNewEmotionEmoji(e)} className={`w-8 h-8 rounded-lg border-2 ${newEmotionEmoji === e ? 'bg-brand-pink border-white' : 'bg-white'}`}>{e}</button>
                             ))}
                           </div>
                           <div className="flex gap-2">
                             <input type="text" placeholder="새 기분 이름" value={newEmotionLabel} onChange={(e) => setNewEmotionLabel(e.target.value)} className="flex-1 p-2 rounded-lg bg-white border-none text-xs font-bold" />
                             <button type="button" onClick={addCustomEmotion} className="bg-brand-text text-white px-4 rounded-lg text-xs font-black">추가</button>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {emotionsList.map((emo) => (
                        <motion.div key={emo.label} className="relative group">
                          <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={() => toggleEmotion(emo.label)}
                            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all shadow-sm ${selectedEmotions.includes(emo.label) ? 'bg-brand-pink text-white translate-y-[-2px] shadow-md' : 'bg-white text-brand-text/60 border-2 border-brand-text/5'}`}>
                            <span className="text-base md:text-xl">{emo.emoji}</span>
                            <span className="font-black text-xs md:text-sm">{emo.label}</span>
                          </motion.button>
                          {!DEFAULT_EMOTIONS.some(de => de.label === emo.label) && (
                            <button
                              type="button"
                              onClick={(e) => deleteEmotion(emo.label, e)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-4 md:py-6 bg-brand-text text-white rounded-[20px] md:rounded-[28px] font-black text-lg md:text-2xl shadow-xl hover:bg-brand-pink transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <><Bird /> 기록 저장하기다꽥!</>}
                  </button>
                </form>
              </div>
            </motion.section>
          ) : activeTab === 'archive' ? (
            <motion.section key="archive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
               <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl md:text-3xl font-black italic">나의 보물창고✨</h2>
                    <p className="text-xs md:text-sm font-bold opacity-30">{records.length}개의 기록</p>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
                    {['전체', ...Array.from(new Set(records.map(r => r.idolName)))].map(idol => (
                      <button
                        key={idol}
                        onClick={() => setSelectedCategory(idol)}
                        className={`px-4 py-2 rounded-full text-xs md:text-sm font-black whitespace-nowrap transition-all border-2 ${selectedCategory === idol ? 'bg-brand-text text-white border-brand-text' : 'bg-white text-brand-text/40 border-brand-text/5 hover:border-brand-text/20'}`}
                      >
                        {idol}
                      </button>
                    ))}
                  </div>
               </div>

               {records.length === 0 ? (
                 <div className="text-center py-20 bg-white/40 rounded-[48px] artistic-border">
                   <DuckIcon size={64} className="mx-auto mb-4 opacity-20" />
                   <p className="font-black opacity-30 text-lg">아직 보물이 없다꽥! 하나 적어봐!</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                   {records
                     .filter(r => selectedCategory === '전체' || r.idolName === selectedCategory)
                     .map(record => (
                     <motion.div key={record.id} id={`record-${record.id}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[56px] border-4 border-brand-text/5 relative overflow-hidden flex flex-col justify-between min-h-[350px]">
                        <div className="space-y-4">
                           <div className="flex justify-between items-start">
                              <div className="flex gap-2 ml-auto">
                                <button onClick={() => shareRecord(record)} className="p-2 hover:bg-brand-pink/10 rounded-full transition-colors"><Share2 size={16} /></button>
                                <button onClick={() => deleteRecord(record.id)} className="p-2 hover:bg-red-50 text-red-400 rounded-full transition-colors"><Trash2 size={16} /></button>
                              </div>
                           </div>
                           <div className="space-y-1">
                              <h3 className="text-sm md:text-xl font-black opacity-40 leading-none">{record.idolName}</h3>
                              <h2 className="text-xl md:text-3xl font-black tracking-tight leading-tight">{record.title}</h2>
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {record.selectedEmotions.map(emo => (
                                <span key={emo} className="bg-brand-pink/10 text-brand-pink px-2 md:px-3 py-1 rounded-full text-xs md:text-xs font-black">
                                  {emotionsList.find(e => e.label === emo)?.emoji} {emo}
                                </span>
                              ))}
                           </div>
                           <p className="text-sm md:text-lg font-bold opacity-70 line-clamp-4 leading-relaxed whitespace-pre-wrap">{record.commentary}</p>
                        </div>
                        <div className="mt-6 flex flex-col gap-3">
                           {record.contentLink && getYoutubeThumb(record.contentLink) && (
                             <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-inner artistic-border mb-1">
                               <img src={getYoutubeThumb(record.contentLink)!} className="w-full h-full object-cover" alt="thumbnail" />
                             </div>
                           )}
                           <div className="grid grid-cols-2 gap-2">
                             {record.contentLink && (
                               <a href={record.contentLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-brand-blue/10 hover:bg-brand-blue/20 transition-all group overflow-hidden">
                                  <div className="w-8 h-8 md:w-10 md:h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0"><Video size={16} /></div>
                                  <span className="text-xs font-black truncate flex-1">유튜브 꽥!</span>
                                  <ExternalLink size={12} className="group-hover:translate-x-1 transition-transform" />
                               </a>
                             )}
                             <a 
                               href={`https://www.youtube.com/results?search_query=${encodeURIComponent(record.idolName + ' ' + record.selectedEmotions[0])}`} 
                               target="_blank" 
                               rel="noreferrer" 
                               className="flex items-center gap-3 p-3 rounded-2xl bg-brand-pink/10 hover:bg-brand-pink/20 transition-all group overflow-hidden"
                             >
                                <div className="w-8 h-8 md:w-10 md:h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0"><Search size={16} /></div>
                                <span className="text-xs font-black truncate flex-1">유사 영상꽥!</span>
                                <ExternalLink size={12} className="group-hover:translate-x-1 transition-transform" />
                             </a>
                           </div>
                           <div className="flex justify-between items-center pt-2 border-t border-brand-text/5">
                              <span className="text-xs md:text-sm font-bold opacity-30 italic">{new Date(record.createdAt).toLocaleDateString()}</span>
                              <button onClick={() => exportAsImage(record.id, record.title)} className="text-xs md:text-xs font-black text-brand-text/40 flex items-center gap-1 hover:text-brand-pink transition-colors"><Download size={12} /> 이미지 소장하기</button>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                 </div>
               )}
            </motion.section>
          ) : activeTab === 'discover' ? (
            <motion.section key="discover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
               <div className="space-y-6">
                 <h3 className="text-xl md:text-2xl font-black italic flex items-center gap-2 px-2"><Sparkles className="text-brand-pink" /> {stats?.topIdol ? `${stats.topIdol} 팬을 위한 추천이다꽥!` : "요즘 뜨는 무대 추천이다꽥!"}</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {(stats?.topIdol 
                      ? [...DISCOVER_ITEMS].sort((a, b) => a.title.includes(stats.topIdol) ? -1 : 1)
                      : DISCOVER_ITEMS
                    ).map((item, idx) => (
                      <a key={idx} href={item.url} target="_blank" rel="noreferrer" className="group rounded-[28px] md:rounded-[40px] p-6 md:p-8 bg-brand-text text-white relative overflow-hidden transition-all hover:scale-[1.02] flex flex-col justify-between shadow-lg">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.color} text-brand-text mb-3`}>{item.type}</span>
                        <h4 className="text-base md:text-xl font-black leading-tight mb-4 group-hover:text-brand-pink transition-colors">{item.title}</h4>
                        <div className="flex justify-between items-center border-t border-white/10 pt-3">
                          <span className="text-[10px] opacity-40 font-bold">Watch on YouTube</span>
                          <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 transition-all" />
                        </div>
                      </a>
                    ))}
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xl md:text-2xl font-black italic flex items-center gap-2 px-2">🛒 굿즈 사러 가자꽥!</h3>
                    <div className="space-y-3">
                       {SHOP_LINKS.map(link => (
                         <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 md:p-6 bg-white rounded-2xl md:rounded-[32px] artistic-border hover:bg-brand-yellow/10 transition-all">
                           <div>
                             <h4 className="font-black text-sm md:text-base">{link.name}</h4>
                             <p className="text-[10px] md:text-xs font-bold opacity-40">{link.description}</p>
                           </div>
                           <ExternalLink size={16} className="opacity-20" />
                         </a>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xl md:text-2xl font-black italic flex items-center gap-2 px-2">🔗 필수 덕질 사이트다꽥!</h3>
                    <div className="space-y-3">
                       {OFFICIAL_SITES.map(site => (
                         <a key={site.name} href={site.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 md:p-6 bg-white rounded-2xl md:rounded-[32px] artistic-border hover:bg-brand-blue/10 transition-all">
                           <div>
                             <h4 className="font-black text-sm md:text-base">{site.name}</h4>
                             <p className="text-[10px] md:text-xs font-bold opacity-40">{site.description}</p>
                           </div>
                           <ExternalLink size={16} className="opacity-20" />
                         </a>
                       ))}
                    </div>
                  </div>
               </div>
            </motion.section>
          ) : activeTab === 'duck-garden' ? (
            <motion.section key="garden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
               <div className="bg-gradient-to-br from-brand-yellow/20 to-brand-pink/20 p-8 md:p-16 rounded-[48px] md:rounded-[80px] artistic-border relative overflow-hidden text-center space-y-8">
                  <div className="relative inline-block">
                    <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="relative z-10">
                      <DuckIcon size={100} color={duckSettings.color} hat={duckSettings.hat} md_size={160} />
                    </motion.div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-brand-text/10 rounded-[100%] blur-md" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl md:text-6xl font-black italic tracking-tighter">LV. {duckLevel} <span className="text-brand-pink">{fanType}</span></h2>
                    <p className="text-lg md:text-xl font-bold opacity-60">기록 {records.length}개를 작성해서 오리가 이만큼 컸어꽥!</p>
                  </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs md:text-sm font-black opacity-30 uppercase tracking-widest">Growth Progress</span>
                        <span className="text-sm md:text-base font-black text-brand-pink">{Math.round(expProgress)}%</span>
                      </div>
                      <div className="w-full h-4 md:h-6 bg-white rounded-full p-1 shadow-inner artistic-border">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${expProgress}%` }} transition={{ duration: 1 }} className="h-full bg-brand-pink rounded-full relative overflow-hidden">
                           <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
                        </motion.div>
                      </div>
                    </div>
                  <button onClick={() => setIsSkinsOpen(true)} className="bg-brand-text text-white px-8 py-4 rounded-full font-black text-lg shadow-xl hover:bg-brand-pink transition-all flex items-center gap-3 mx-auto">
                    <Palette size={20} /> 오리 꾸미기
                  </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[56px] border-4 border-brand-blue/10 space-y-6">
                    <h3 className="text-xl md:text-2xl font-black italic flex items-center gap-2"><Trophy className="text-brand-yellow" /> 오리의 업적들</h3>
                    <div className="space-y-4">
                       {[
                         { title: "첫 발걸음", desc: "첫 번째 기록을 남겼어!", active: records.length >= 1 },
                         { title: "성실한 기록가", desc: "기록 5개를 돌파했어!", active: records.length >= 5 },
                         { title: "데이터 마스터", desc: "링크가 포함된 기록 3개 이상!", active: records.filter(r => r.contentLink).length >= 3 },
                         { title: "팬클럽 회장", desc: "한 아이돌을 5번 이상 기록!", active: stats?.topIdolCount && stats.topIdolCount >= 5 },
                       ].map((achievement, idx) => (
                         <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl md:rounded-3xl transition-all ${achievement.active ? 'bg-brand-blue/5 border-2 border-brand-blue/10' : 'opacity-30 grayscale'}`}>
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center artistic-border">{achievement.active ? '✨' : '🔒'}</div>
                            <div>
                               <h4 className="font-black text-sm md:text-base">{achievement.title}</h4>
                               <p className="text-xs md:text-xs font-bold opacity-60">{achievement.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[56px] border-4 border-brand-pink/10 space-y-6 flex flex-col justify-between">
                     <h3 className="text-xl md:text-2xl font-black italic flex items-center gap-2"><Smile className="text-brand-pink" /> 오리의 기분</h3>
                     <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-6">
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="text-6xl md:text-8xl">🦆</motion.div>
                        <p className="text-lg md:text-xl font-black italic leading-tight">"{records.length > 0 ? "덕질은 항상 즐겁다꽥!" : "아직 기록이 없어꽥!"}"</p>
                     </div>
                     <div className="p-4 md:p-6 bg-brand-pink/5 rounded-2xl md:rounded-3xl border-2 border-dashed border-brand-pink/20">
                        <span className="text-xs md:text-xs font-black opacity-30 uppercase tracking-widest block mb-1">Daily Mission</span>
                        <p className="font-bold text-xs md:text-sm">오늘의 미션: 아무 무대나 하나 기록하기!</p>
                     </div>
                  </div>
               </div>
            </motion.section>
          ) : (
            <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10 md:space-y-12">
              <div className="flex flex-col gap-2 px-2 md:px-0">
                <h3 className="text-xl md:text-2xl font-black flex items-center gap-2 italic">
                  <BarChart3 className="text-brand-pink w-6 h-6 md:w-7 md:h-7" /> 덕질 분석 데이터다꽥!
                </h3>
                <p className="text-xs md:text-sm font-black opacity-40 uppercase tracking-widest">Analysis & Insights</p>
              </div>

              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  {/* Fan Type Card */}
                  <div className="bg-brand-text text-white p-6 md:p-12 rounded-[32px] md:rounded-[64px] md:col-span-2 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50"></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-center">
                       <div className="w-20 h-20 md:w-36 md:h-36 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                          <DuckIcon size={48} color={duckSettings.color} hat={duckSettings.hat} md_size={80} />
                       </div>
                       <div className="space-y-3 md:space-y-4 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 flex-wrap">
                            <span className="bg-brand-pink text-white px-3 py-1 rounded-full font-black text-xs md:text-xs uppercase tracking-widest">{fanType}</span>
                            <span className="bg-white/10 text-white/50 px-2 py-1 rounded-full font-black text-xs md:text-xs">LEVEL {duckLevel}</span>
                          </div>
                          <h2 className="text-xl md:text-4xl font-black italic tracking-tighter leading-tight">"너는 {fanType} 스타일이다꽥!"</h2>
                          <p className="text-xs md:text-lg opacity-60 font-medium">네 기록들을 보니까 정말 대단해! 앞으로도 소중한 덕질 이어가자꽥!</p>
                       </div>
                    </div>
                  </div>

                  {/* Top Idol */}
                  <div className="bg-brand-pink/10 p-6 md:p-10 rounded-[32px] md:rounded-[56px] border-4 border-white space-y-3">
                    <span className="text-xs md:text-sm font-black opacity-30 uppercase tracking-widest">나의 최애 아이돌</span>
                    <h4 className="text-2xl md:text-4xl font-black text-brand-pink italic">{stats.topIdol}</h4>
                    <p className="text-xs md:text-base font-bold opacity-60">총 {stats.topIdolCount}번의 기록</p>
                    <div className="pt-4 space-y-2">
                       <div className="flex justify-between items-end px-1">
                         <span className="text-xs md:text-xs font-black opacity-40">덕력 게이지</span>
                         <span className="text-xs md:text-xs font-black text-brand-pink">{Math.min(stats.totalRecords * 10, 100)}%</span>
                      </div>
                      <div className="w-full h-2 md:h-3 bg-white rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stats.totalRecords * 10, 100)}%` }} className="h-full bg-brand-pink" />
                      </div>
                    </div>
                  </div>

                  {/* Emotion Trends */}
                  <div className="bg-brand-blue/10 p-6 md:p-10 rounded-[32px] md:rounded-[56px] border-4 border-white space-y-4">
                    <span className="text-xs md:text-sm font-black opacity-30 uppercase tracking-widest">주요 감정 키워드</span>
                    <div className="space-y-2 md:space-y-3">
                      {stats.emotionStats.slice(0, 3).map((emo) => (
                        <div key={emo.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg md:text-2xl">{emo.emoji}</span>
                            <span className="font-black text-sm md:text-lg">{emo.label}</span>
                          </div>
                          <span className="bg-white/50 px-2 py-1 rounded-full text-xs md:text-xs font-black">{emo.count}회</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Summary */}
                  <div className="bg-brand-green/10 md:col-span-2 p-6 md:p-10 rounded-[32px] md:rounded-[56px] border-4 border-white flex flex-col md:flex-row gap-4 md:gap-8 items-center">
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <DuckIcon size={48} color={duckSettings.color} hat={duckSettings.hat} md_size={64} />
                    </div>
                    <div className="text-center md:text-left space-y-1">
                      <span className="text-xs md:text-sm font-black opacity-30 uppercase tracking-widest">오리의 한마디</span>
                      <h4 className="text-base md:text-2xl font-black italic">"{stats.quackMessage}"</h4>
                      <p className="text-xs md:text-sm font-bold opacity-50">지금까지 총 {stats.totalRecords}개의 소중한 기록을 남겼어꽥!</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/20 rounded-[32px] p-20 text-center">
                  <p className="font-black opacity-20 text-sm md:text-lg">기록이 더 쌓여야 분석이 가능하다꽥! 🥺</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-24 md:mt-48 text-center pb-24 border-t border-brand-text/5 pt-12">
        <div className="inline-flex items-center gap-4">
           <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full artistic-border flex items-center justify-center shadow-lg">
              <DuckIcon size={24} color={duckSettings.color} hat={duckSettings.hat} />
           </div>
           <div className="text-left">
              <p className="text-xs md:text-xs font-black text-brand-text/60 uppercase tracking-widest mb-1">Duck-Log Archive</p>
              <div className="text-xs md:text-sm font-black italic">너의 덕질을 응원한다꽥! ✨</div>
           </div>
        </div>
      </footer>
    </div>
  );
}
