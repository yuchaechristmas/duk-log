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
const DuckIcon = ({ size = 36, className = "", color = "#facc15", hat = null }: { size?: number, className?: string, color?: string, hat?: string | null }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <Bird size={size} style={{ color: color, fill: color }} />
    <div className="absolute top-[45%] right-[-10%] w-[35%] h-[20%] bg-orange-400 rounded-full" /> {/* Beak */}
    <div className="absolute top-[30%] left-[25%] w-[10%] h-[10%] bg-black rounded-full" /> {/* Eye */}
    {hat && (
      <div className="absolute top-[-20%] left-[10%] text-center w-full" style={{ fontSize: size * 0.5 }}>
        {hat}
      </div>
    )}
  </div>
);

// --- Main App ---
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
  const [records, setRecords] = useState<DukRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'new-record' | 'archive' | 'discover' | 'report' | 'duck-garden'>('new-record');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // New States for User Features
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
    const isActiveIdol = (idol: string) => records.filter(r => r.idolName === idol).length > records.length * 0.8;
    
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

  // Personalized Recommendations based on Stats
  const personalizedRecs = React.useMemo(() => {
    if (!stats) return [];
    
    const recs = [];
    
    // Suggest search for top idol
    recs.push({
      title: `${stats.topIdol}의 모든 무대 모아보기`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(stats.topIdol)}+stage`,
      type: "최애 전용",
      color: "bg-brand-pink",
      reason: `네가 가장 좋아하는 ${stats.topIdol}의 기록이 제일 많아꽥! 더 보고 싶지 않아?`
    });

    // Suggest search based on dominant emotion
    if (stats.topEmotion) {
      recs.push({
        title: `${stats.topEmotion} 폭발! 추천 리스트`,
        url: `https://www.youtube.com/results?search_query=아이돌+역대급+${encodeURIComponent(stats.topEmotion)}`,
        type: "감정 맞춤",
        color: "bg-brand-blue",
        reason: `넌 덕질할 때 '${stats.topEmotion}' 기분을 자주 느끼나봐꽥! 비슷한 전율을 느껴봐!`
      });
    }

    return recs;
  }, [stats]);

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

    const savedFavorites = localStorage.getItem('duk-favorites');
    if (savedFavorites) setFavoriteIdols(JSON.parse(savedFavorites));

    const savedDuck = localStorage.getItem('duk-settings');
    if (savedDuck) setDuckSettings(JSON.parse(savedDuck));
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('duk-archive', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('duk-emotions', JSON.stringify(emotionsList));
  }, [emotionsList]);

  useEffect(() => {
    localStorage.setItem('duk-favorites', JSON.stringify(favoriteIdols));
  }, [favoriteIdols]);

  useEffect(() => {
    localStorage.setItem('duk-settings', JSON.stringify(duckSettings));
  }, [duckSettings]);

  const exportAsImage = async (id: string, title: string) => {
    const element = document.getElementById(`record-${id}`);
    if (!element) return;
    
    try {
      const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `duk-log-${title}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
      alert("이미지 저장에 실패했다꽥! 🥺");
    }
  };

  const toggleFavorite = (idol: string) => {
    setFavoriteIdols(prev => 
      prev.includes(idol) ? prev.filter(i => i !== idol) : [...prev, idol]
    );
  };

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
    <div className="max-w-6xl mx-auto px-6 py-8 md:cursor-none">
      <CustomCursor settings={duckSettings} />
      
      {/* Duck Customization Modal */}
      <AnimatePresence>
        {isSkinsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
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
              className="bg-white rounded-[64px] shadow-2xl relative z-10 w-full max-w-lg p-12 overflow-hidden artistic-border border-4 border-white"
            >
              <div className="flex flex-col items-center text-center gap-6">
                 <div className="w-32 h-32 bg-brand-pink/10 rounded-full flex items-center justify-center relative">
                    <DuckIcon size={80} color={duckSettings.color} hat={duckSettings.hat} />
                    <Sparkles className="absolute -top-2 -right-2 text-brand-yellow" size={32} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black italic">오리 꾸미기다꽥!</h3>
                    <p className="font-bold opacity-40">세상에 하나뿐인 나만의 오리를 만들어봐꽥!</p>
                 </div>

                 <div className="w-full space-y-6 text-left">
                    <div className="space-y-3">
                       <label className="text-sm font-black opacity-30 uppercase tracking-widest pl-2 flex items-center gap-2">
                         <Palette size={16} /> 색상 골라봐꽥!
                       </label>
                       <div className="flex flex-wrap gap-3">
                          {['#facc15', '#f87171', '#60a5fa', '#34d399', '#fb923c', '#a78bfa', '#27272a'].map(c => (
                            <button
                               key={c}
                               onClick={() => setDuckSettings({ ...duckSettings, color: c })}
                               className={`w-10 h-10 rounded-full artistic-border border-4 transition-all ${duckSettings.color === c ? 'scale-110 border-brand-pink' : 'border-white'}`}
                               style={{ backgroundColor: c }}
                            />
                          ))}
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-sm font-black opacity-30 uppercase tracking-widest pl-2 flex items-center gap-2">
                         👑 모자도 써봐꽥!
                       </label>
                       <div className="grid grid-cols-4 gap-3">
                          {[null, '🎀', '🎩', '👑', '🎓', '🧢', '🕶️', '🌸'].map(h => (
                            <button
                               key={h || 'none'}
                               onClick={() => setDuckSettings({ ...duckSettings, hat: h })}
                               className={`py-3 rounded-2xl artistic-border border-2 transition-all flex flex-col items-center justify-center text-xl bg-white ${duckSettings.hat === h ? 'border-brand-pink bg-brand-pink/5 scale-105' : 'border-brand-text/5 opacity-60'}`}
                            >
                               {h || '❌'}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={() => setIsSkinsOpen(false)}
                   className="w-full py-5 bg-brand-text text-white rounded-full font-black text-xl shadow-xl hover:bg-brand-pink transition-all"
                 >
                   완료다꽥!
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUp && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLevelUp(false)}
              className="absolute inset-0 bg-brand-pink/40 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-[64px] shadow-2xl relative z-10 w-full max-w-lg p-12 text-center border-8 border-brand-yellow space-y-8"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-brand-yellow rounded-full flex items-center justify-center shadow-lg">
                <Trophy size={48} className="text-brand-text" />
              </div>
              
              <div className="pt-8 space-y-4">
                 <h2 className="text-5xl font-black italic text-brand-pink">LEVEL UP!</h2>
                 <p className="text-2xl font-black">레벨 {duckLevel}로 올라갔어꽥!</p>
                 <div className="w-32 h-32 bg-brand-pink/5 rounded-full flex items-center justify-center mx-auto artistic-border border-4">
                    <DuckIcon size={64} color={duckSettings.color} hat={duckSettings.hat} />
                 </div>
                 <p className="font-bold opacity-60">
                    축하해! 너의 덕질이 점점 깊어지고 있구나꽥!<br/>
                    {duckLevel === 2 ? '이제 어엿한 초보 덕후 오리야!' : duckLevel === 3 ? '중급 덕후의 길로 들어섰어!' : '전설적인 덕후 오리가 되어가고 있어!'}
                 </p>
              </div>

              <button 
                onClick={() => setShowLevelUp(false)}
                className="w-full py-5 bg-brand-pink text-white rounded-full font-black text-xl shadow-xl hover:scale-105 transition-transform"
              >
                고마워꽥!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center md:items-end border-b-2 border-brand-text/10 pb-6 mb-12 gap-6">
        <div className="flex items-center gap-4 text-brand-text">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 10 }}
            onClick={() => setIsSkinsOpen(true)}
            className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center shadow-lg relative cursor-pointer"
          >
            <DuckIcon size={36} color={duckSettings.color} hat={duckSettings.hat} />
            <div className="absolute -top-1 -right-1 bg-brand-yellow text-xs px-1.5 py-0.5 rounded-full border-2 border-brand-pink font-black">EDIT</div>
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
              className={`whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 group relative pb-1 ${activeTab === 'new-record' ? 'text-brand-text' : 'hover:text-brand-text/60'}`}
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" /> 기록하기
              {activeTab === 'new-record' && (
                <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-pink rounded-full" />
              )}
            </span>
            <span 
              onClick={() => setActiveTab('archive')}
              className={`whitespace-nowrap cursor-pointer transition-all group relative pb-1 ${activeTab === 'archive' ? 'text-brand-text' : 'hover:text-brand-text/60'}`}
            >
              내 보물창고
              {activeTab === 'archive' && (
                <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-pink rounded-full" />
              )}
            </span>
            <span 
              onClick={() => setActiveTab('discover')}
              className={`whitespace-nowrap cursor-pointer transition-all group relative pb-1 ${activeTab === 'discover' ? 'text-brand-text' : 'hover:text-brand-text/60'}`}
            >
              둘러보기
              {activeTab === 'discover' && (
                <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-pink rounded-full" />
              )}
            </span>
            <span 
              onClick={() => setActiveTab('duck-garden')}
              className={`whitespace-nowrap cursor-pointer transition-all group relative pb-1 ${activeTab === 'duck-garden' ? 'text-brand-text' : 'hover:text-brand-text/60'}`}
            >
              오리 정원
              {activeTab === 'duck-garden' && (
                <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-pink rounded-full" />
              )}
            </span>
            <span 
              onClick={() => setActiveTab('report')}
              className={`whitespace-nowrap cursor-pointer transition-all group relative pb-1 ${activeTab === 'report' ? 'text-brand-text' : 'hover:text-brand-text/60'}`}
            >
              덕질보고서
              {activeTab === 'report' && (
                <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-pink rounded-full" />
              )}
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
                      <div className="flex flex-col gap-1.5 overflow-hidden">
                        <label className="text-sm font-black opacity-40 ml-2 uppercase tracking-widest leading-none">누구 봤어꽥?</label>
                        <div className="flex gap-2">
                          <select 
                            required
                            value={idolName}
                            onChange={(e) => setIdolName(e.target.value)}
                            className="flex-1 p-5 rounded-2xl bg-brand-blue border-none text-brand-text font-bold focus:ring-4 ring-brand-pink/20 appearance-none outline-none cursor-pointer"
                          >
                            <option value="">아이돌 골라봐꽥!</option>
                            {PRESET_IDOLS.map(name => <option key={name} value={name}>{name}</option>)}
                          </select>
                          {idolName && idolName !== '직접 입력' && (
                            <button
                              type="button"
                              onClick={() => toggleFavorite(idolName)}
                              className={`w-14 h-14 rounded-2xl artistic-border flex items-center justify-center transition-all ${favoriteIdols.includes(idolName) ? 'bg-brand-pink text-white shadow-lg scale-110' : 'bg-white text-brand-text/20 hover:text-brand-pink'}`}
                            >
                              <Heart size={24} fill={favoriteIdols.includes(idolName) ? "white" : "none"} />
                            </button>
                          )}
                        </div>
                        {favoriteIdols.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
                             {favoriteIdols.map(fav => (
                               <button
                                 key={fav}
                                 type="button"
                                 onClick={() => setIdolName(fav)}
                                 className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all border-2 ${idolName === fav ? 'bg-brand-pink text-white border-brand-pink' : 'bg-white border-brand-pink/20 text-brand-pink'}`}
                               >
                                 ♥ {fav}
                               </button>
                             ))}
                          </div>
                        )}
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
                    <div id={`record-${record.id}`} className="bg-white p-8 md:p-12 rounded-[56px] shadow-sm relative overflow-hidden group border-4 border-brand-text/5">
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
                            <div className="flex items-center gap-4">
                              <button onClick={() => shareRecord(record)} className="flex items-center gap-2 text-sm font-black hover:underline group">
                                <span>🔗 친구한테 자랑할래꽥</span>
                                <span className="text-xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗️</span>
                              </button>
                              <button 
                                onClick={() => exportAsImage(record.id, record.title)}
                                className="flex items-center gap-1.5 text-sm font-black hover:underline group text-brand-pink"
                              >
                                <span>📸 짤 제작</span>
                                <Download size={14} />
                              </button>
                            </div>
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
              className="space-y-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black flex items-center gap-2 italic">
                      <ArchiveIcon size={20} className="text-brand-blue" /> 굿즈 샵 추천이다꽥!
                    </h3>
                    <p className="text-xs font-black opacity-30 uppercase tracking-[0.2em]">Duck's Shopping List</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {SHOP_LINKS.map(shop => (
                      <a 
                        key={shop.name}
                        href={shop.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group bg-white p-6 rounded-3xl border-2 border-brand-text/5 hover:border-brand-pink/30 hover:shadow-lg transition-all flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <h4 className="font-black text-lg group-hover:text-brand-pink transition-colors">{shop.name}</h4>
                          <p className="text-sm font-bold opacity-40">{shop.description}</p>
                        </div>
                        <ExternalLink size={18} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black flex items-center gap-2 italic">
                      <ExternalLink size={20} className="text-brand-green" /> 필수 사이트들이다꽥!
                    </h3>
                    <p className="text-xs font-black opacity-30 uppercase tracking-[0.2em]">Essential Duck Link</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {OFFICIAL_SITES.map(site => (
                      <a 
                        key={site.name}
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group bg-white p-6 rounded-3xl border-2 border-brand-text/5 hover:border-brand-pink/30 hover:shadow-lg transition-all flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <h4 className="font-black text-lg group-hover:text-brand-pink transition-colors">{site.name}</h4>
                          <p className="text-sm font-bold opacity-40">{site.description}</p>
                        </div>
                        <ExternalLink size={18} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              {personalizedRecs.length > 0 && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-black flex items-center gap-2 italic">
                      <Trophy size={24} className="text-brand-yellow" /> 오직 너만을 위한 분석 추천이다꽥!
                    </h3>
                    <p className="text-sm font-black opacity-40 uppercase tracking-widest">Personalized For You</p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {personalizedRecs.map((item, idx) => (
                      <motion.div
                        key={`personal-${idx}`}
                        whileHover={{ y: -5 }}
                        className={`${item.color}/10 p-10 rounded-[56px] border-4 border-white/60 artistic-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-8`}
                      >
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="bg-brand-text text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{item.type}</span>
                            <span className="text-xs font-black text-brand-pink italic">#AI_DUCK_SELECT</span>
                          </div>
                          <h4 className="text-3xl font-black leading-tight italic-heading">{item.title}</h4>
                          <p className="text-sm font-bold opacity-60 max-w-lg">"{item.reason}"</p>
                        </div>
                        <a 
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-shrink-0 py-5 px-10 bg-brand-text text-white rounded-full font-black text-lg shadow-xl hover:bg-brand-pink transition-all flex items-center gap-3"
                        >
                          보러 가자꽥! <Sparkles size={20} />
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6">
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
              </div>

              {records.length > 0 && (
                <div className="bg-brand-yellow/10 p-12 rounded-[64px] border-4 border-white/60 space-y-8">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                       <h3 className="text-2xl font-black flex items-center gap-2 italic">
                         <History size={24} className="text-brand-pink" /> 잊고 있던 소중한 추억이다꽥!
                       </h3>
                       <p className="text-sm font-black opacity-40 uppercase tracking-widest">Memory Lane</p>
                    </div>
                  </div>
                  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {records.slice().sort(() => Math.random() - 0.5).slice(0, 5).map((record) => (
                      <motion.div 
                        key={`memory-${record.id}`}
                        whileHover={{ y: -10, rotate: 2 }}
                        onClick={() => {
                          setActiveTab('archive');
                          // Simple way to scroll to it - though we don't have real filtering/ref here
                        }}
                        className="flex-shrink-0 w-64 bg-white p-6 rounded-[32px] shadow-sm border-2 border-brand-text/5 cursor-pointer"
                      >
                        <div className="aspect-square bg-brand-pink/5 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                           {getYoutubeThumb(record.contentLink) ? (
                             <img src={getYoutubeThumb(record.contentLink)!} className="w-full h-full object-cover" alt="recal" />
                           ) : (
                             <DuckIcon size={48} className="opacity-20" />
                           )}
                        </div>
                        <span className="bg-brand-blue/20 px-2 py-0.5 rounded-full text-[9px] font-black">{record.idolName}</span>
                        <h4 className="font-black mt-2 line-clamp-1">{record.title}</h4>
                        <p className="text-[10px] opacity-40 font-bold italic mt-1">{new Date(record.createdAt).toLocaleDateString()}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'duck-garden' ? (
            <motion.div 
              key="duck-garden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              {/* Level Up Hero Section */}
              <div className="bg-brand-pink/5 p-12 rounded-[64px] artistic-border border-4 border-white flex flex-col items-center text-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(250,204,21,0.2),transparent)]"></div>
                
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl relative z-10 border-8 border-brand-pink/20"
                >
                  <DuckIcon size={100} color={duckSettings.color} hat={duckSettings.hat} />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-brand-pink/30 rounded-full"
                  />
                </motion.div>

                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-center gap-3">
                    <span className="bg-brand-text text-white px-4 py-1 rounded-full font-black text-lg">LV.{duckLevel}</span>
                    <h2 className="text-4xl font-black italic">{fanType}</h2>
                  </div>
                  <p className="text-lg font-bold opacity-60">기록 {records.length}개를 남긴 멋진 덕후 오리다꽥!</p>
                </div>

                <div className="w-full max-w-md space-y-3 relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black opacity-40 uppercase tracking-widest">Next Level Progress</span>
                    <span className="text-sm font-black text-brand-pink">{Math.floor(expProgress)}%</span>
                  </div>
                  <div className="h-4 bg-white rounded-full border-2 border-brand-pink/10 overflow-hidden p-1 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${expProgress}%` }}
                      className="h-full bg-brand-pink rounded-full shadow-[0_0_10px_rgba(244,114,182,0.5)]"
                    />
                  </div>
                  <p className="text-xs font-black opacity-30">기록 {3 - (records.length % 3)}개만 더 쓰면 레벨업이다꽥!</p>
                </div>

                <button 
                  onClick={() => setIsSkinsOpen(true)}
                  className="bg-brand-text text-white px-8 py-4 rounded-full font-black text-lg shadow-xl hover:bg-brand-pink transition-all flex items-center gap-3 z-10"
                >
                  <Palette size={20} /> 오리 꾸미기 가기
                </button>
              </div>

              {/* Garden Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white p-10 rounded-[56px] border-4 border-brand-blue/10 space-y-6">
                    <h3 className="text-2xl font-black italic flex items-center gap-2">
                       <Trophy className="text-brand-yellow" /> 오리의 업적들
                    </h3>
                    <div className="space-y-4">
                       {[
                         { title: "첫 발걸음", desc: "첫 번째 기록을 남겼어!", active: records.length >= 1 },
                         { title: "성실한 기록가", desc: "기록 5개를 돌파했어!", active: records.length >= 5 },
                         { title: "데이터 마스터", desc: "링크가 포함된 기록 3개 이상!", active: records.filter(r => r.contentLink).length >= 3 },
                         { title: "팬클럽 회장", desc: "한 아이돌을 5번 이상 기록!", active: stats?.topIdolCount && stats.topIdolCount >= 5 },
                       ].map((achievement, idx) => (
                         <div key={idx} className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${achievement.active ? 'bg-brand-blue/5 border-2 border-brand-blue/20' : 'opacity-30 grayscale'}`}>
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center artistic-border">
                               {achievement.active ? '✨' : '🔒'}
                            </div>
                            <div>
                               <h4 className="font-black">{achievement.title}</h4>
                               <p className="text-xs font-bold opacity-60">{achievement.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white p-10 rounded-[56px] border-4 border-brand-pink/10 space-y-6 flex flex-col">
                    <h3 className="text-2xl font-black italic flex items-center gap-2">
                       <Smile className="text-brand-pink" /> 오늘 아침 오리의 상태
                    </h3>
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
                       <motion.div 
                         animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                         transition={{ repeat: Infinity, duration: 3 }}
                         className="text-8xl"
                       >
                         🦆
                       </motion.div>
                       <p className="text-xl font-black italic leading-tight">
                         "{records.length > 0 ? "덕질은 항상 즐겁다꽥! 오늘 보고 싶은 무대는 뭐야?" : "아직 기록이 없어서 오리가 심심해꽥!"}"
                       </p>
                    </div>
                    <div className="p-6 bg-brand-pink/5 rounded-3xl border-2 border-dashed border-brand-pink/20">
                       <span className="text-xs font-black opacity-30 uppercase tracking-widest block mb-2 font-black">Daily Mission</span>
                       <p className="font-bold text-sm">오늘의 미션: 아무 무대나 하나 기록하기!</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black flex items-center gap-2 italic">
                  <BarChart3 size={28} className="text-brand-pink" /> 네 덕질의 모든 것을 분석했다꽥!
                </h3>
                <p className="text-sm font-black opacity-40 uppercase tracking-widest">Analysis & Insights</p>
              </div>

              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Fan Type Card */}
                  <div className="bg-brand-text text-white p-12 rounded-[64px] md:col-span-2 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                       <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                          <DuckIcon size={80} color={duckSettings.color} hat={duckSettings.hat} />
                       </div>
                       <div className="space-y-4 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                            <span className="bg-brand-pink text-white px-4 py-1.5 rounded-full font-black text-sm uppercase tracking-widest">Duk-Type: {fanType}</span>
                            <span className="bg-white/10 text-white/50 px-3 py-1.5 rounded-full font-black text-sm">LEVEL {duckLevel}</span>
                          </div>
                          <h2 className="text-5xl font-black italic tracking-tighter leading-tight">
                             "너는 {fanType} 스타일의 아티스트 지킴이다꽥!"
                          </h2>
                          <p className="text-lg opacity-60 font-medium">
                             그동안 네 기록들을 보니까 {fanType === '스밍 마스터 오리' ? '음악과 무대 영상을 정말 소중하게 여기는구나!' : 
                             fanType === '감성 폭발 오리' ? '감동적이고 짜릿한 순간들을 잘 포착해내는 것 같아!' : 
                             '차근차근 소중한 추억들을 모으고 있구나! 정말 멋져!'}
                          </p>
                       </div>
                    </div>
                  </div>

                  {/* Top Idol */}
                  <div className="bg-brand-pink/10 p-10 rounded-[56px] border-4 border-white space-y-4">
                    <span className="text-sm font-black opacity-30 uppercase tracking-widest">나의 최애 아이돌이다꽥</span>
                    <h4 className="text-4xl font-black text-brand-pink italic-heading">{stats.topIdol}</h4>
                    <p className="font-bold opacity-60">총 {stats.topIdolCount}번이나 기록했어꽥! 대단하다꽥!</p>
                    <div className="pt-4 space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-sm font-black opacity-40">덕력 게이지</span>
                         <span className="text-sm font-black text-brand-pink">{Math.min(stats.totalRecords * 10, 100)}%</span>
                      </div>
                      <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-brand-pink/20">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(stats.totalRecords * 10, 100)}%` }}
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
                      <DuckIcon size={64} color={duckSettings.color} hat={duckSettings.hat} />
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
              <DuckIcon size={28} color={duckSettings.color} hat={duckSettings.hat} />
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
