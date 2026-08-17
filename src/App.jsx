import React, { useState, useEffect } from 'react';
import { 
  Pill, Clock, Plus, Trash2, Edit2, CheckCircle2, Circle, 
  Heart, Calendar, Cat, History, X, AlertCircle, Package, 
  PlusCircle, RefreshCw, BellRing, Sparkles, Timer, Moon, 
  Lock, PawPrint, Type, Minus, Search, ChevronRight
} from 'lucide-react';

// ==========================================
// 1. 內嵌字體大小控制元件 (FontSizeControl)
// ==========================================
function FontSizeControl() {
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('meowmed_fontsize') || 'md');

  useEffect(() => {
    localStorage.setItem('meowmed_fontsize', fontSize);
    const root = document.documentElement;
    if (fontSize === 'sm') {
      root.style.fontSize = '14px';
    } else if (fontSize === 'lg') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [fontSize]);

  return (
    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/60">
      <Type className="w-3.5 h-3.5 text-stone-500 ml-1" />
      <button
        type="button"
        onClick={() => setFontSize('sm')}
        className={`px-2 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
          fontSize === 'sm' ? 'bg-amber-500 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
        }`}
      >
        小
      </button>
      <button
        type="button"
        onClick={() => setFontSize('md')}
        className={`px-2 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
          fontSize === 'md' ? 'bg-amber-500 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
        }`}
      >
        中
      </button>
      <button
        type="button"
        onClick={() => setFontSize('lg')}
        className={`px-2 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
          fontSize === 'lg' ? 'bg-amber-500 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
        }`}
      >
        大
      </button>
    </div>
  );
}

// ==========================================
// 2. 加減計數器元件 (StepperInput)
// ==========================================
function StepperInput({ value, onChange, min = 1, max = 999, unit = '' }) {
  const numValue = parseInt(value, 10) || min;

  const handleDecrement = () => {
    if (numValue > min) onChange(numValue - 1);
  };

  const handleIncrement = () => {
    if (numValue < max) onChange(numValue + 1);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDecrement}
        className="w-11 h-11 rounded-2xl bg-stone-100 border border-stone-200/80 text-stone-700 font-black text-lg flex items-center justify-center active:scale-90 transition cursor-pointer shrink-0 shadow-xs hover:bg-stone-200"
      >
        <Minus className="w-5 h-5 text-stone-600" />
      </button>

      <div className="flex-1 relative">
        <input
          type="number"
          min={min}
          max={max}
          value={numValue}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || min)}
          className="w-full border border-stone-200 rounded-2xl py-2.5 text-center text-base font-extrabold bg-stone-50/70 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 pointer-events-none">
            {unit}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 font-black text-lg flex items-center justify-center active:scale-90 transition cursor-pointer shrink-0 shadow-xs hover:bg-amber-200"
      >
        <Plus className="w-5 h-5 text-amber-700" />
      </button>
    </div>
  );
}

// ==========================================
// 3. 主應用程式元件 (App)
// ==========================================
export default function App() {
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDateStr = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 藥物資料 State
  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem('meowmed_meds_v12');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: '慢性病藥', dosage: '2 粒', time: '08:00', stock: 30, notes: '餐後溫水送服', freqType: 'daily', dailyDoses: 2, intervalDays: 1, weekDays: [1,2,3,4,5,6,0], hoursVal: 6 },
      { id: 2, name: '維他命 C', dosage: '1 粒', time: '13:00', stock: 15, notes: '隔日補充', freqType: 'interval', dailyDoses: 1, intervalDays: 2, weekDays: [1,2,3,4,5,6,0], hoursVal: 6 },
      { id: 3, name: '退燒止痛藥', dosage: '1 粒', time: '12:00', stock: 10, notes: '有需要時服用', freqType: 'hours', dailyDoses: 1, intervalDays: 1, weekDays: [1,2,3,4,5,6,0], hoursVal: 6 }
    ];
  });

  // 打卡歷史 Log State
  const [historyLogs, setHistoryLogs] = useState(() => {
    const saved = localStorage.getItem('meowmed_history_v12');
    if (!saved) return [];
    const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
    return JSON.parse(saved).filter(log => log.timestamp >= sixtyDaysAgo);
  });

  const [userName, setUserName] = useState(() => localStorage.getItem('meowmed_username') || '自己');
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [activeTab, setActiveTab] = useState('today');

  // 歷史搜尋日期 Filter
  const [historySearchDate, setHistorySearchDate] = useState('');

  const [editingTimeLog, setEditingTimeLog] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', dosage: '1 粒', time: '08:00', stock: 30, notes: '', freqType: 'daily', dailyDoses: 1, intervalDays: 2, weekDays: [1,3,5], hoursVal: 6 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', dosage: '1 粒', time: '08:00', stock: 30, notes: '', freqType: 'daily', dailyDoses: 1, intervalDays: 2, weekDays: [1,3,5], hoursVal: 6 });

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);
  const [customAlertMsg, setCustomAlertMsg] = useState(null);

  const [catMoodIndex, setCatMoodIndex] = useState(0);
  const catQuotes = [
    "喵～今日記得按時食藥，身體健康最重要！🐾",
    "喵！有按時食藥同記低時間嘅主人最精靈！✨",
    "喵～今日飲咗足夠嘅溫水未呀？💧",
    "喵嗚～要隨時留意藥物庫存，冇藥要早啲補！📦",
    "喵～半夜聽朝起床打卡，系統會自動幫你計算下一次時間喔！🌙"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCatMoodIndex((prev) => (prev + 1) % catQuotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [catQuotes.length]);

  useEffect(() => {
    localStorage.setItem('meowmed_meds_v12', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('meowmed_history_v12', JSON.stringify(historyLogs));
  }, [historyLogs]);

  useEffect(() => {
    localStorage.setItem('meowmed_username', userName);
  }, [userName]);

  const handleDateChange = (dateVal) => {
    if (dateVal > getTodayStr()) {
      setSelectedDate(getTodayStr());
    } else {
      setSelectedDate(dateVal);
    }
  };

  const getLogsOnDate = (medId, dateStr) => {
    return historyLogs.filter(log => log.medId === medId && log.date === dateStr);
  };

  const isMedicationActiveOnDate = (med, dateStr) => {
    const targetDate = new Date(dateStr);
    const dayOfWeek = targetDate.getDay();

    if (med.freqType === 'weekday') {
      return med.weekDays ? med.weekDays.includes(dayOfWeek) : true;
    }

    if (med.freqType === 'interval') {
      const allMedLogs = historyLogs
        .filter(l => l.medId === med.id)
        .sort((a, b) => b.timestamp - a.timestamp);

      if (allMedLogs.length === 0) return true;

      const lastLog = allMedLogs[0];
      const lastDate = new Date(lastLog.date);
      const diffTime = Math.abs(targetDate - lastDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (lastLog.date === dateStr) return true;
      const interval = Number(med.intervalDays) || 2;
      return diffDays % interval === 0;
    }

    return true;
  };

  const calculateNextDueTimeInfo = (med) => {
    const medLogs = historyLogs
      .filter(l => l.medId === med.id)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (medLogs.length === 0) return { text: '尚未開始服藥，隨時可以打卡', isNight: false };

    const lastLog = medLogs[0];
    const lastTimeMs = lastLog.timestamp;

    if (med.freqType === 'hours') {
      const intervalHours = Number(med.hoursVal) || 6;
      const nextMs = lastTimeMs + intervalHours * 60 * 60 * 1000;
      const nextDate = new Date(nextMs);
      const nextHour = nextDate.getHours();
      const timeStr = nextDate.toTimeString().slice(0, 5);
      const dateStr = `${nextDate.getMonth() + 1}月${nextDate.getDate()}日`;
      
      const isNight = nextHour >= 22 || nextHour < 7;
      let text = `${dateStr} ${timeStr} (距離上次 ${intervalHours} 小時)`;
      if (isNight) {
        text += ' 🌙 [睡眠時間：今晚安心休息，聽朝起床打卡會自動重新計算]';
      }
      return { text, isNight };
    } else if (med.freqType === 'interval') {
      const intervalDays = Number(med.intervalDays) || 2;
      const nextMs = lastTimeMs + intervalDays * 24 * 60 * 60 * 1000;
      const nextDate = new Date(nextMs);
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      return { text: `${year}-${month}-${day} (每隔 ${intervalDays} 日)`, isNight: false };
    } else {
      const nextMs = lastTimeMs + 24 * 60 * 60 * 1000;
      const nextDate = new Date(nextMs);
      const timeStr = med.time || '08:00';
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      return { text: `${year}-${month}-${day} ${timeStr}`, isNight: false };
    }
  };

  const handleToggleDose = (med, doseIndex) => {
    const logs = getLogsOnDate(med.id, selectedDate);
    const existingLog = logs.find(l => l.doseIndex === doseIndex);

    if (existingLog) {
      setHistoryLogs(prev => prev.filter(l => l.id !== existingLog.id));
      setMedications(prev => prev.map(m => m.id === med.id ? { ...m, stock: m.stock + 1 } : m));
    } else {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5);
      const newLog = {
        id: Date.now() + Math.random(),
        medId: med.id,
        medName: med.name,
        dosage: med.dosage,
        date: selectedDate,
        timeStr: timeStr,
        timestamp: Date.now(),
        doseIndex: doseIndex,
        isExtra: false
      };
      setHistoryLogs(prev => [newLog, ...prev]);
      setMedications(prev => prev.map(m => m.id === med.id ? { ...m, stock: Math.max(0, m.stock - 1) } : m));
    }
  };

  // 新增補充藥物
  const addExtraDose = (med) => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    const newLog = {
      id: Date.now() + Math.random(),
      medId: med.id,
      medName: med.name,
      dosage: med.dosage,
      date: selectedDate,
      timeStr: timeStr,
      timestamp: Date.now(),
      doseIndex: 99,
      isExtra: true
    };
    setHistoryLogs(prev => [newLog, ...prev]);
    setMedications(prev => prev.map(m => m.id === med.id ? { ...m, stock: Math.max(0, m.stock - 1) } : m));
  };

  // 隨時取消/刪除補充藥物
  const removeExtraDose = (logId, medId) => {
    setHistoryLogs(prev => prev.filter(l => l.id !== logId));
    setMedications(prev => prev.map(m => m.id === medId ? { ...m, stock: m.stock + 1 } : m));
  };

  const handleSaveLogTime = (logId, newTimeStr) => {
    setHistoryLogs(prev => prev.map(l => l.id === logId ? { ...l, timeStr: newTimeStr } : l));
    setEditingTimeLog(null);
  };

  const exportToIosCalendar = (med) => {
    if (med.freqType === 'hours') return;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const [hours, minutes] = (med.time || '08:00').split(':');
    const dtStart = `${year}${month}${day}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;
  
    const intervalNum = Number(med.intervalDays) || 2;

    let rrule = 'FREQ=DAILY';
    if (med.freqType === 'interval') {
      rrule = `FREQ=DAILY;INTERVAL=${intervalNum}`;
    } else if (med.freqType === 'weekday' && med.weekDays?.length) {
      const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const byDay = med.weekDays.map(d => dayMap[d]).join(',');
      rrule = `FREQ=WEEKLY;BYDAY=${byDay}`;
    }
  
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MeowMed//Cat Medication Reminder//ZH-HK',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:🐱 MeowMed 提醒：食 ${med.name}`,
      `DESCRIPTION:喵～該食藥啦！\\n藥物：${med.name}\\n每次份量：${med.dosage || '1粒'}\\n備註：${med.notes || '無'}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtStart}`,
      `RRULE:${rrule}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:🐱 MeowMed 提醒：食 ${med.name}`,
      'TRIGGER:-PT0M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const fileUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `${med.name}_提醒.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  
    setCustomAlertMsg({
      title: "已生成日曆檔案！",
      desc: `喵～【${med.name}】嘅日曆檔已下載！請喺 Safari 彈窗點擊「下載」，然後喺「檔案 (Files)」App 點擊該 .ics 檔，即可一鍵加入 iOS 日曆！📅✨`
    });
  };

  const openAddModal = () => {
    setAddForm({ name: '', dosage: '1 粒', time: '08:00', stock: 30, notes: '', freqType: 'daily', dailyDoses: 1, intervalDays: 2, weekDays: [1,3,5], hoursVal: 6 });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.name) return;
    const parsedStock = parseInt(addForm.stock, 10) || 0;
    const newMedItem = { ...addForm, stock: parsedStock, id: Date.now() };
    setMedications(prev => [...prev, newMedItem]);
    setIsAddModalOpen(false);
  };

  const openEditModal = (med) => {
    setEditingMedId(med.id);
    setEditForm({
      name: med.name,
      dosage: med.dosage,
      time: med.time,
      stock: med.stock !== undefined ? med.stock : 30,
      notes: med.notes || '',
      freqType: med.freqType || 'daily',
      dailyDoses: med.dailyDoses || 1,
      intervalDays: med.intervalDays || 2,
      weekDays: med.weekDays || [1,3,5],
      hoursVal: med.hoursVal || 6
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm.name) return;
    const parsedStock = parseInt(editForm.stock, 10) || 0;
    setMedications(prev => prev.map(m => m.id === editingMedId ? { ...editForm, stock: parsedStock, id: editingMedId } : m));
    setIsEditModalOpen(false);
  };

  const confirmDeleteMedication = () => {
    if (!deleteConfirmTarget) return;
    setMedications(prev => prev.filter(m => m.id !== deleteConfirmTarget.id));
    setDeleteConfirmTarget(null);
  };

  const todayDateStr = getTodayStr();
  const activeMedsToday = medications.filter(m => isMedicationActiveOnDate(m, todayDateStr));
  const completedCount = activeMedsToday.filter(m => getLogsOnDate(m.id, todayDateStr).length >= (m.dailyDoses || 1)).length;
  const progressPercent = activeMedsToday.length > 0 ? Math.round((completedCount / activeMedsToday.length) * 100) : 0;

  const toggleWeekDay = (form, setForm, dayNum) => {
    const current = form.weekDays || [];
    const updated = current.includes(dayNum)
      ? current.filter(d => d !== dayNum)
      : [...current, dayNum];
    setForm({ ...form, weekDays: updated });
  };

  // 歷史 Log 按日期分組與過濾
  const filteredHistoryLogs = historyLogs.filter(log => {
    if (!historySearchDate) return true;
    return log.date === historySearchDate;
  });

  const groupedHistoryLogs = filteredHistoryLogs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {});

  const sortedHistoryDates = Object.keys(groupedHistoryLogs).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-800 flex flex-col font-sans antialiased selection:bg-amber-200">
      
      {/* 頂部 Header */}
      <header className="bg-white/90 backdrop-blur border border-amber-100/85 shadow-xs rounded-2xl p-3.5 mb-3 flex items-center justify-between max-w-md w-full mx-auto mt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 font-bold shadow-inner">
            <PawPrint className="w-5 h-5 fill-amber-500 text-amber-600 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black text-stone-900 leading-none">MeowMed</h1>
            <p className="text-xs text-amber-800 font-medium mt-1">智能服藥管家 🐾</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FontSizeControl />
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-1 space-y-4 pb-12">
        
        {/* 貓貓進度卡片 (方案A：奶白燕麥木系) */}
        <div className="bg-[#F4E6D0] text-stone-800 rounded-3xl p-5 shadow-md shadow-stone-200/50 relative overflow-hidden space-y-3.5 border border-[#E8D5B7]">
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <span className="text-stone-500 text-[10px] font-bold tracking-wider uppercase">主子 / 服藥者</span>
              <div>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-transparent text-xl font-black focus:outline-none border-b border-stone-400/40 pb-0.5 w-32 tracking-tight text-stone-800"
                />
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setCatMoodIndex((prev) => (prev + 1) % catQuotes.length)}
              className="bg-white/60 hover:bg-white/80 p-2.5 rounded-2xl backdrop-blur-md border border-white/50 transition active:scale-90 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Cat className="w-6 h-6 text-amber-700" />
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            </button>
          </div>

          {/* 貓貓助手對話框 */}
          <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-white/60 text-xs text-stone-700 font-medium transition-all duration-300 flex items-start gap-2 shadow-sm">
            <span className="text-base">💬</span>
            <span className="leading-relaxed">{catQuotes[catMoodIndex]}</span>
          </div>

          {/* 進度條與貓爪 */}
          <div className="space-y-1.5 pt-1 border-t border-stone-300/50">
            <div className="flex justify-between items-center text-xs font-bold text-stone-600">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                今日進度：{completedCount} / {activeMedsToday.length} 款
              </span>
              <span className="bg-white/80 text-stone-700 text-[11px] px-2 py-0.5 rounded-full border border-stone-200 shadow-xs">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full h-3 bg-stone-200/80 rounded-full overflow-hidden p-0.5 border border-stone-300/50">
              <div 
                className="h-full bg-gradient-to-r from-amber-300 to-amber-400 rounded-full transition-all duration-500 relative shadow-inner"
                style={{ width: `${progressPercent}%` }}
              >
                {progressPercent > 0 && (
                  <PawPrint className="w-2.5 h-2.5 text-amber-800 fill-amber-800 absolute right-1 top-1/2 -translate-y-1/2 opacity-70" />
                )}
              </div>
            </div>
          </div>
        </div>

          {/* 貓貓助手對話框 */}
          <div className="relative bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-xs text-amber-50 font-medium transition-all duration-300 flex items-start gap-2">
            <span className="text-base">💬</span>
            <span className="leading-relaxed">{catQuotes[catMoodIndex]}</span>
          </div>

          {/* 進度條與貓爪 */}
          <div className="space-y-1.5 pt-1 border-t border-amber-700/50">
            <div className="flex justify-between items-center text-xs font-bold text-amber-100">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                今日進度：{completedCount} / {activeMedsToday.length} 款
              </span>
              <span className="bg-amber-700/60 text-amber-200 text-[11px] px-2 py-0.5 rounded-full border border-amber-500/30">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full transition-all duration-500 relative"
                style={{ width: `${progressPercent}%` }}
              >
                {progressPercent > 0 && (
                  <PawPrint className="w-2.5 h-2.5 text-amber-900 fill-amber-900 absolute right-1 top-1/2 -translate-y-1/2 opacity-70" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 標題與新增按鈕 */}
        <div className="flex items-center justify-between mt-2 mb-1 px-1">
          <span className="text-xs font-bold text-[#5C3A21] tracking-wider">藥物清單管理</span>
          <button
            type="button"
            onClick={openAddModal}
            className="bg-[#5C3A21] hover:bg-[#4A2E1A] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-md shadow-amber-950/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>新增藥物</span>
          </button>
        </div>

        {/* Tabs 切換 */}
        <div className="flex bg-stone-200/70 p-1 rounded-2xl text-xs font-bold text-stone-600">
          <button 
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'today' ? 'bg-white text-stone-900 shadow-sm font-extrabold' : 'hover:text-stone-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-600" /> 服藥 Checklist
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'history' ? 'bg-white text-stone-900 shadow-sm font-extrabold' : 'hover:text-stone-900'
            }`}
          >
            <History className="w-4 h-4 text-amber-600" /> 歷史 Log ({historyLogs.length})
          </button>
        </div>

        {activeTab === 'today' && (
          <div className="space-y-3.5">
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200/70 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> 檢視 / 補打卡日期：
                </span>
                
                {selectedDate !== getTodayStr() && (
                  <button 
                    type="button"
                    onClick={() => setSelectedDate(getTodayStr())}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> 回到今日
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={selectedDate}
                  max={getTodayStr()}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="text-xs font-bold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 flex-1"
                />
              </div>

              <div className="flex gap-1.5">
                {[
                  { label: '今日', days: 0 },
                  { label: '昨日 (補打卡)', days: 1 },
                  { label: '前日 (補打卡)', days: 2 }
                ].map((tab) => {
                  const targetDate = getDateStr(tab.days);
                  const isActive = selectedDate === targetDate;
                  return (
                    <button
                      key={tab.days}
                      type="button"
                      onClick={() => handleDateChange(targetDate)}
                      className={`flex-1 text-[11px] py-2 rounded-xl border font-bold transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-[#5C3A21] text-white border-[#5C3A21] shadow-xs' 
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 藥物清單 */}
            {medications.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/60 shadow-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="text-sm font-medium text-stone-600">暫時未有藥物紀錄</p>
                <p className="text-xs text-stone-400 mt-1">點擊右上角「新增藥物」開始使用</p>
              </div>
            ) : (
              medications.map((med) => {
                const isActiveToday = isMedicationActiveOnDate(med, selectedDate);
                const logs = getLogsOnDate(med.id, selectedDate);
                const regularLogs = logs.filter(l => !l.isExtra && l.doseIndex !== 99);
                const extraLogs = logs.filter(l => l.isExtra || l.doseIndex === 99);
                const totalDosesNeeded = med.freqType === 'daily' ? (med.dailyDoses || 1) : 1;
                const isCompleted = regularLogs.length >= totalDosesNeeded;
                const isLowStock = med.stock <= 5;
                const nextDueInfo = calculateNextDueTimeInfo(med);

                let freqBadgeText = '每日定時';
                if (med.freqType === 'interval') freqBadgeText = `每隔 ${med.intervalDays || 2} 日`;
                if (med.freqType === 'weekday') freqBadgeText = '指定星期幾';
                if (med.freqType === 'hours') freqBadgeText = `每隔 ${med.hoursVal || 6} 小時`;

                return (
                  <div 
                    key={med.id}
                    className={`bg-white rounded-3xl p-4 border transition-all duration-200 space-y-3 relative ${
                      !isActiveToday 
                        ? 'opacity-60 bg-stone-50/80 border-stone-200' 
                        : isCompleted 
                          ? 'border-emerald-200 bg-emerald-50/10 shadow-xs' 
                          : 'border-stone-200/80 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1 pr-2">
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-base text-stone-800">{med.name}</h3>
                          
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                            isLowStock ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-stone-100 text-stone-600'
                          }`}>
                            <Package className="w-3 h-3" /> 剩 {med.stock} {isLowStock && '(快完！)'}
                          </span>

                          <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-md">
                            {freqBadgeText}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-stone-600 flex-wrap">
                          <span className="flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> {med.time}
                          </span>
                          <span className="font-extrabold text-stone-700">每次 {med.dosage}</span>
                          {med.freqType === 'daily' && (
                            <span className="text-stone-400 font-bold">｜ 每日 {med.dailyDoses || 1} 次</span>
                          )}
                        </div>

                        {isActiveToday && (
                          <div className={`border rounded-xl px-2.5 py-1.5 flex items-start gap-1.5 text-[11px] ${
                            nextDueInfo.isNight ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-stone-50 border-stone-200/70 text-stone-600'
                          }`}>
                            {nextDueInfo.isNight ? <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" /> : <Timer className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />}
                            <span><strong>下一次：</strong>{nextDueInfo.text}</span>
                          </div>
                        )}

                        {med.notes && (
                          <p className="text-xs text-stone-400 italic font-medium">{med.notes}</p>
                        )}

                        {!isActiveToday ? (
                          <div className="bg-stone-100 border border-stone-200 rounded-2xl p-2.5 flex items-center gap-2 text-xs text-stone-500 font-bold">
                            <Lock className="w-4 h-4 text-stone-400" />
                            <span>今日為休息日 🐾 無需服藥</span>
                          </div>
                        ) : (
                          <div className="pt-1 space-y-2">
                            {/* 常規打卡按鈕 */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {Array.from({ length: totalDosesNeeded }).map((_, idx) => {
                                const log = regularLogs.find(l => l.doseIndex === idx);
                                const isChecked = !!log;
                                return (
                                  <div key={idx} className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-2 min-h-[44px]">
                                    <button 
                                      type="button"
                                      onClick={() => handleToggleDose(med, idx)}
                                      className="transition active:scale-90 cursor-pointer text-emerald-500"
                                      title="點擊打卡"
                                    >
                                      {isChecked ? (
                                        <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-emerald-100" />
                                      ) : (
                                        <Circle className="w-7 h-7 text-stone-300 hover:text-stone-400" />
                                      )}
                                    </button>

                                    <div className="text-xs">
                                      <span className="font-extrabold text-stone-700 block text-xs">
                                        {totalDosesNeeded > 1 ? `第 ${idx + 1} 次` : '服藥打卡'}
                                      </span>
                                      
                                      {isChecked ? (
                                        editingTimeLog === log.id ? (
                                          <input 
                                            type="time" 
                                            defaultValue={log.timeStr}
                                            onBlur={(e) => handleSaveLogTime(log.id, e.target.value)}
                                            className="text-[10px] border border-amber-400 rounded px-1 font-bold bg-amber-50 w-16"
                                            autoFocus
                                          />
                                        ) : (
                                          <button 
                                            type="button"
                                            onClick={() => setEditingTimeLog(log.id)}
                                            className="text-[10px] text-emerald-700 font-bold hover:underline block"
                                            title="點擊修訂時間"
                                          >
                                            {log.timeStr} ✏️
                                          </button>
                                        )
                                      ) : (
                                        <span className="text-[10px] text-stone-400 font-bold">未打卡</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* 補充藥物按鈕 */}
                              <button
                                type="button"
                                onClick={() => addExtraDose(med)}
                                className="bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 text-xs font-bold px-3 py-2 rounded-2xl border border-amber-200 flex items-center gap-1.5 transition cursor-pointer min-h-[44px]"
                                title="有需要時加食一粒"
                              >
                                <PlusCircle className="w-4 h-4 text-amber-600" />
                                <span>補充一粒</span>
                              </button>
                            </div>

                            {/* 補充藥物紀錄列表（可隨時點擊刪除按鈕取消） */}
                            {extraLogs.length > 0 && (
                              <div className="pt-2 border-t border-dashed border-stone-200 space-y-1.5">
                                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">已補充紀錄（點擊「刪除」即可隨時取消／扣庫存自動加返）：</span>
                                <div className="flex gap-2 flex-wrap">
                                  {extraLogs.map((extraLog) => (
                                    <div key={extraLog.id} className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200 rounded-xl px-2.5 py-1">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                                      <span className="text-xs font-bold text-amber-900">補充 1 粒 ({extraLog.timeStr})</span>
                                      
                                      {/* 將「✖ 刪除」變成可點擊的 Button */}
                                      <button
                                        type="button"
                                        onClick={() => removeExtraDose(extraLog.id, med.id)}
                                        className="text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-1.5 py-0.5 rounded font-bold ml-1 transition active:scale-90 cursor-pointer"
                                        title="點擊刪除這一次補充"
                                      >
                                        ✖ 刪除
                                      </button>

                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        )}

                      </div>

                      {/* 編輯 / 刪除按鈕 */}
                      <div className="flex items-center gap-0.5">
                        <button 
                          type="button"
                          onClick={() => openEditModal(med)}
                          className="text-stone-400 hover:text-amber-600 p-2 transition rounded-xl hover:bg-amber-50 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setDeleteConfirmTarget(med)}
                          className="text-stone-300 hover:text-rose-500 p-2 transition rounded-xl hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {med.freqType !== 'hours' && (
                      <div className="pt-2 border-t border-stone-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => exportToIosCalendar(med)}
                          className="text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/60 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <BellRing className="w-3.5 h-3.5 text-amber-600" />
                          + 加至 iOS 日曆提醒
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 歷史紀錄 Tab (大翻新：按日期分組 + 按日期搜尋) */}
        {activeTab === 'history' && (
          <div className="space-y-3.5">
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200/70 shadow-sm space-y-2">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-600" /> 按日期搜尋歷史紀錄：
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={historySearchDate}
                  onChange={(e) => setHistorySearchDate(e.target.value)}
                  className="text-xs font-bold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 flex-1"
                />
                {historySearchDate && (
                  <button 
                    type="button"
                    onClick={() => setHistorySearchDate('')}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    清除搜尋
                  </button>
                )}
              </div>
            </div>

            {sortedHistoryDates.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-stone-400 border border-stone-200/60 shadow-sm">
                <History className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="text-sm font-medium text-stone-600">未找到相符嘅歷史 Log</p>
              </div>
            ) : (
              sortedHistoryDates.map((dateStr) => {
                const dayLogs = groupedHistoryLogs[dateStr];
                return (
                  <div key={dateStr} className="space-y-2">
                    {/* 日期大標題 */}
                    <div className="sticky top-0 z-10 bg-[#F7F5F0]/90 backdrop-blur py-1">
                      <span className="text-xs font-extrabold text-[#5C3A21] bg-amber-100/90 border border-amber-200/80 px-3 py-1 rounded-xl inline-flex items-center gap-1.5 shadow-xs">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        {dateStr} ({dayLogs.length} 次紀錄)
                      </span>
                    </div>

                    {/* 當日 Log 列表 */}
                    <div className="space-y-2">
                      {dayLogs.map((log) => (
                        <div key={log.id} className="bg-white rounded-2xl p-3.5 border border-stone-200/70 shadow-sm flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-stone-800">{log.medName}</h4>
                              {log.isExtra && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.2 rounded-md">
                                  額外補充
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 font-medium">每次份量：{log.dosage}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-block">
                              {log.timeStr} 服用
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* ========================================== */}
      {/* 4. 手機 Bottom-Sheet 底部彈窗 - 新增藥物 */}
      {/* ========================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 transition-opacity">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-100 max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            
            {/* 手機拉條指示器 */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto -mt-2 mb-2 sm:hidden" />

            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-1.5">
                <PawPrint className="w-5 h-5 text-amber-600 fill-amber-200" />
                新增藥物設定
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)} 
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">藥物 / 補充品名稱</label>
                <input
                  type="text"
                  required
                  placeholder="例如：降血壓藥 / 維他命C"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-2xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">每次服用份量</label>
                  <input
                    type="text"
                    placeholder="例如：1 粒 / 2 錠"
                    value={addForm.dosage}
                    onChange={(e) => setAddForm({ ...addForm, dosage: e.target.value })}
                    className="w-full border border-stone-200 rounded-2xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">預設服藥時間</label>
                  <input
                    type="time"
                    value={addForm.time}
                    onChange={(e) => setAddForm({ ...addForm, time: e.target.value })}
                    className="w-full border border-stone-200 rounded-2xl p-2.5 text-sm font-bold text-stone-800 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                  />
                </div>
              </div>

              <div className="space-y-2 bg-amber-50/60 p-4 rounded-3xl border border-amber-200/60">
                <label className="block text-xs font-bold text-amber-900">⏱️ 請選擇服藥頻率</label>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'daily', title: '每日定時', desc: '設定每日食幾多次' },
                    { id: 'interval', title: '每隔 X 日', desc: '例如隔日/隔3日' },
                    { id: 'weekday', title: '逢星期幾', desc: '例如逢二、四、六' },
                    { id: 'hours', title: '按需要(每X小時)', desc: '每次打卡自動倒數' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setAddForm({ ...addForm, freqType: mode.id })}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        addForm.freqType === mode.id 
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-bold' 
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <p className="font-bold text-xs">{mode.title}</p>
                      <p className={`text-[10px] mt-0.5 ${addForm.freqType === mode.id ? 'text-amber-100' : 'text-stone-400'}`}>
                        {mode.desc}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  {/* 1-Tap 服用次數按鈕 (1-5次) */}
                  {addForm.freqType === 'daily' && (
                    <div className="bg-white p-3 rounded-2xl border border-amber-200/60 space-y-2">
                      <span className="text-xs font-bold text-stone-700 block">每日食幾多次？ (1-Tap 快選)</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setAddForm({ ...addForm, dailyDoses: count })}
                            className={`flex-1 py-2.5 rounded-xl font-black text-xs transition border cursor-pointer active:scale-95 ${
                              addForm.dailyDoses === count 
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs' 
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {count}次
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 每隔 X 日 - Stepper 計數器 */}
                  {addForm.freqType === 'interval' && (
                    <div className="bg-white p-3 rounded-2xl border border-amber-200/60 space-y-2">
                      <span className="text-xs font-bold text-stone-700 block">每隔幾多日食一次？ (2 代表隔日)</span>
                      <StepperInput 
                        value={addForm.intervalDays} 
                        onChange={(val) => setAddForm({ ...addForm, intervalDays: val })}
                        min={1}
                        unit="日"
                      />
                    </div>
                  )}

                  {addForm.freqType === 'weekday' && (
                    <div className="bg-white p-3 rounded-2xl border border-amber-200/60 space-y-1.5">
                      <span className="text-xs font-bold text-stone-700 block">請勾選需要食藥嘅星期：</span>
                      <div className="flex gap-1 justify-between">
                        {[
                          { num: 1, label: '一' },
                          { num: 2, label: '二' },
                          { num: 3, label: '三' },
                          { num: 4, label: '四' },
                          { num: 5, label: '五' },
                          { num: 6, label: '六' },
                          { num: 0, label: '日' }
                        ].map((d) => {
                          const isSelected = (addForm.weekDays || []).includes(d.num);
                          return (
                            <button
                              key={d.num}
                              type="button"
                              onClick={() => toggleWeekDay(addForm, setAddForm, d.num)}
                              className={`w-9 h-9 rounded-xl text-xs font-extrabold transition cursor-pointer active:scale-90 ${
                                isSelected ? 'bg-amber-600 text-white shadow-xs' : 'bg-stone-100 text-stone-500'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 每隔 X 小時 - Stepper 計數器 */}
                  {addForm.freqType === 'hours' && (
                    <div className="bg-white p-3 rounded-2xl border border-amber-200/60 space-y-2">
                      <span className="text-xs font-bold text-stone-700 block">每隔幾個鐘食一次？</span>
                      <StepperInput 
                        value={addForm.hoursVal} 
                        onChange={(val) => setAddForm({ ...addForm, hoursVal: val })}
                        min={1}
                        unit="小時"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 目前剩餘庫存 - Stepper 計數器 */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-600 mb-1">目前剩餘數量 (庫存粒數)</label>
                <StepperInput 
                  value={addForm.stock} 
                  onChange={(val) => setAddForm({ ...addForm, stock: val })}
                  min={0}
                  unit="粒"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">備註 / 服用指示</label>
                <input
                  type="text"
                  placeholder="例如：餐後溫水送服"
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  className="w-full border border-stone-200 rounded-2xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer active:scale-95"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3.5 rounded-2xl text-xs shadow-md shadow-amber-600/20 transition cursor-pointer active:scale-95"
                >
                  確定新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 5. 手機 Bottom-Sheet 底部彈窗 - 編輯藥物 */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 transition-opacity">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-100 max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto -mt-2 mb-2 sm:hidden" />

            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-1.5">
                <PawPrint className="w-5 h-5 text-amber-600 fill-amber-200" />
                編輯藥物設定
              </h3>
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)} 
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">藥物名稱</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-2xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">每次服用份量</label>
                  <input
                    type="text"
                    value={editForm.dosage}
                    onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })}
                    className="w-full border border-stone-200 rounded-2xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">預設時間</label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="w-full border border-stone-200 rounded-2xl p-2.5 text-sm font-bold text-stone-800 bg-stone-50/50 focus:outline-none text-center"
                  />
                </div>
              </div>

              <div className="space-y-2 bg-amber-50/60 p-4 rounded-3xl border border-amber-200/60">
                <label className="block text-xs font-bold text-amber-900">⏱️ 請選擇服藥頻率</label>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'daily', title: '每日定時', desc: '設定每日食幾多次' },
                    { id: 'interval', title: '每隔 X 日', desc: '例如隔日/隔3日' },
                    { id: 'weekday', title: '逢星期幾', desc: '例如逢二、四、六' },
                    { id: 'hours', title: '按需要(每X小時)', desc: '每次打卡自動倒數' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, freqType: mode.id })}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        editForm.freqType === mode.id 
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-bold' 
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <p className="font-bold text-xs">{mode.title}</p>
                      <p className={`text-[10px] mt-0.5 ${editForm.freqType === mode.id ? 'text-amber-100' : 'text-stone-400'}`}>
                        {mode.desc}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  {/* 1-Tap 服用次數按鈕 (1-5次) */}
                  {editForm.freqType === 'daily' && (
                    <div className="bg-white p-3 rounded-2xl border border-amber-200/60 space-y-2">
                      <span className="text-xs font-bold text-stone-700 block">每日食幾多次？ (1-Tap 快選)</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, dailyDoses: count })}
                            className={`flex-1 py-2.5 rounded-xl font-black text-xs transition border cursor-pointer active:scale-95 ${
                              editForm.dailyDoses === count 
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs' 
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {count}次
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 每隔 X 日 - Stepper 計數器 */}
                  {editForm.freqType === 'interval' && (
                    <div className="bg-white p-3 rounded-2xl border border-amber-200/60 space-y-2">
                      <span className="text-xs font-bold text-stone-700 block">每隔幾多日食一次？</span>
                      <StepperInput 
                        value={editForm.intervalDays} 
                        onChange={(val) => setEditForm({ ...editForm, intervalDays: val })}
                        min={1}
                        unit="日"
                      />
                    </div>
                  )}

                  {editForm.freqType === 'weekday' && (
                    <div className="bg-white p-3 rounded-2xl border border-amber-200/60 space-y-1.5">
                      <span className="text-xs font-bold text-stone-700 block">請勾選需要食藥嘅星期：</span>
                      <div className="flex gap-1 justify-between">
                        {[
                          { num: 1, label: '一' },
                          { num: 2, label: '二' },
                          { num: 3, label: '三' },
                          { num: 4, label: '四' },
                          { num: 5, label: '五' },
                          { num: 6, label: '六' },
                          { num: 0, label: '日' }
                        ].map((d) => {
                          const isSelected = (editForm.weekDays || []).includes(d.num);
                          return (
                            <button
                              key={d.num}
                              type="button"
                              onClick={() => toggleWeekDay(editForm, setEditForm, d.num)}
                              className={`w-9 h-9 rounded-xl text-xs font-extrabold transition cursor-pointer active:scale-90 ${
                                isSelected ? 'bg-amber-600 text-white shadow-xs' : 'bg-stone-100 text-stone-500'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 每隔 X 小時 - Stepper 計數器 */}
                  {editForm.freqType === 'hours' && (
                    <div className="bg-white p-3 rounded-2xl border border-amber-200/60 space-y-2">
                      <span className="text-xs font-bold text-stone-700 block">每隔幾個鐘食一次？</span>
                      <StepperInput 
                        value={editForm.hoursVal} 
                        onChange={(val) => setEditForm({ ...editForm, hoursVal: val })}
                        min={1}
                        unit="小時"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 剩餘庫存粒數 - Stepper 計數器 */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-600 mb-1">剩餘庫存粒數</label>
                <StepperInput 
                  value={editForm.stock} 
                  onChange={(val) => setEditForm({ ...editForm, stock: val })}
                  min={0}
                  unit="粒"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">備註 / 服用指示</label>
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full border border-stone-200 rounded-2xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer active:scale-95"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3.5 rounded-2xl text-xs shadow-md shadow-amber-600/20 transition cursor-pointer active:scale-95"
                >
                  儲存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 6. 手機 Bottom-Sheet 底部彈窗 - 刪除確認 */}
      {/* ========================================== */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 transition-opacity">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-3xl max-w-xs w-full p-6 shadow-2xl space-y-4 text-center border border-rose-100 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto -mt-2 mb-2 sm:hidden" />

            <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-3xl mx-auto flex items-center justify-center shadow-inner relative">
              <PawPrint className="w-8 h-8 text-rose-500 fill-rose-200" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-stone-900">確定要刪除嗎？</h3>
              <p className="text-xs text-stone-500 px-2 leading-relaxed font-medium">
                喵～確定要將 <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">【{deleteConfirmTarget.name}】</span> 從清單移除？
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-3 rounded-2xl text-xs transition cursor-pointer active:scale-95"
              >
                保留
              </button>
              <button
                type="button"
                onClick={confirmDeleteMedication}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 rounded-2xl text-xs shadow-md shadow-rose-600/20 transition cursor-pointer active:scale-95"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {customAlertMsg && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl space-y-4 text-center border border-amber-100">
            <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
              <PawPrint className="w-8 h-8 text-amber-600 fill-amber-300" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-stone-900">{customAlertMsg.title}</h3>
              <p className="text-xs text-stone-500 px-1 leading-relaxed font-medium">
                {customAlertMsg.desc}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCustomAlertMsg(null)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3 rounded-2xl text-xs shadow-md shadow-amber-600/20 transition cursor-pointer active:scale-95"
              >
                知道啦！✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}