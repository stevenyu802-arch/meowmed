import React, { useState, useEffect } from 'react';
import { 
  Pill, Clock, Plus, Trash2, Edit2, CheckCircle2, Circle, 
  Heart, Calendar, Cat, History, X, AlertCircle, Package, 
  PlusCircle, RefreshCw, BellRing, Sparkles, Timer, Moon, 
  Lock, PawPrint, Type 
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
        onClick={() => setFontSize('sm')}
        className={`px-2 py-0.5 text-xs font-bold rounded-lg transition cursor-pointer ${
          fontSize === 'sm' ? 'bg-amber-500 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
        }`}
      >
        小
      </button>
      <button
        onClick={() => setFontSize('md')}
        className={`px-2 py-0.5 text-xs font-bold rounded-lg transition cursor-pointer ${
          fontSize === 'md' ? 'bg-amber-500 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
        }`}
      >
        中
      </button>
      <button
        onClick={() => setFontSize('lg')}
        className={`px-2 py-0.5 text-xs font-bold rounded-lg transition cursor-pointer ${
          fontSize === 'lg' ? 'bg-amber-500 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
        }`}
      >
        大
      </button>
    </div>
  );
}

// ==========================================
// 2. 主應用程式元件 (App)
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
    const existingLog = logs[doseIndex];

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
        doseIndex: doseIndex
      };
      setHistoryLogs(prev => [newLog, ...prev]);
      setMedications(prev => prev.map(m => m.id === med.id ? { ...m, stock: Math.max(0, m.stock - 1) } : m));
    }
  };

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
      doseIndex: 99
    };
    setHistoryLogs(prev => [newLog, ...prev]);
    setMedications(prev => prev.map(m => m.id === med.id ? { ...m, stock: Math.max(0, m.stock - 1) } : m));
  };

  const handleSaveLogTime = (logId, newTimeStr) => {
    setHistoryLogs(prev => prev.map(l => l.id === logId ? { ...l, timeStr: newTimeStr } : l));
    setEditingTimeLog(null);
  };

  const exportToIosCalendar = (med) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const [hours, minutes] = (med.time || '08:00').split(':');
    const dtStart = `${year}${month}${day}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;

    let rrule = 'FREQ=DAILY';
    if (med.freqType === 'interval') {
      rrule = `FREQ=DAILY;INTERVAL=${med.intervalDays || 2}`;
    } else if (med.freqType === 'hours') {
      rrule = `FREQ=HOURLY;INTERVAL=${med.hoursVal || 6}`;
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
      rrule,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:🐱 MeowMed 提醒：食 ${med.name}`,
      'TRIGGER:-PT0M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MeowMed_${med.name}_提醒.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setCustomAlertMsg({
      title: "成功加入日曆！",
      desc: `喵～【${med.name}】嘅智能提醒已經匯出，請在手機打開並加入日曆！📅✨`
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

  const toggleWeekDay = (form, setForm, dayNum) => {
    const current = form.weekDays || [];
    const updated = current.includes(dayNum)
      ? current.filter(d => d !== dayNum)
      : [...current, dayNum];
    setForm({ ...form, weekDays: updated });
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-800 flex flex-col font-sans antialiased selection:bg-amber-200">
      
      {/* 頂部 Header */}
      <header className="bg-white/90 backdrop-blur border border-amber-100/85 shadow-xs rounded-2xl p-3.5 mb-4 flex items-center justify-between max-w-md w-full mx-auto mt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 font-bold shadow-inner">
            <PawPrint className="w-5 h-5 fill-amber-500 text-amber-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">MeowMed</h1>
            <p className="text-xs text-amber-800 font-medium mt-1">智能服藥管家 🐾</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FontSizeControl />
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-2 space-y-4">
        
        {/* 貓貓狀態卡片 */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-5 shadow-lg shadow-amber-600/25 relative overflow-hidden space-y-4">
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <span className="text-amber-200/90 text-[10px] font-bold tracking-wider uppercase">服藥者名字</span>
              <div>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-transparent text-xl font-black focus:outline-none border-b border-amber-300/40 pb-0.5 w-32 tracking-tight text-white"
                />
              </div>
            </div>

            <button 
              onClick={() => setCatMoodIndex((prev) => (prev + 1) % catQuotes.length)}
              className="bg-white/15 hover:bg-white/25 p-2.5 rounded-2xl backdrop-blur-md border border-white/20 transition active:scale-90 flex items-center gap-1.5 shadow-inner cursor-pointer"
            >
              <Cat className="w-6 h-6 text-amber-100" />
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center gap-2 text-xs text-amber-50 font-medium transition-all duration-300">
            <span>{catQuotes[catMoodIndex]}</span>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-amber-100 font-semibold border-t border-amber-400/30">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              今日進度：{completedCount} / {activeMedsToday.length} 款
            </span>
            <span className="text-[11px] bg-amber-800/30 px-2 py-0.5 rounded-lg border border-amber-400/20">
              {completedCount === activeMedsToday.length && activeMedsToday.length > 0 ? '✨ 今日任務完成！' : '按時服藥最精靈'}
            </span>
          </div>
        </div>

        {/* 標題與新增按鈕 */}
        <div className="flex items-center justify-between mt-4 mb-2 px-1">
          <span className="text-xs font-bold text-amber-900/70 tracking-wider">藥物清單管理</span>
          <button
            type="button"
            onClick={openAddModal}
            className="bg-[#5C3A21] hover:bg-[#4A2E1A] active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span>新增藥物</span>
          </button>
        </div>

        {/* Tabs 切換 */}
        <div className="flex bg-stone-200/60 p-1 rounded-2xl text-xs font-bold text-stone-600">
          <button 
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'today' ? 'bg-white text-stone-900 shadow-sm' : 'hover:text-stone-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-600" /> 服藥 Checklist
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history' ? 'bg-white text-stone-900 shadow-sm' : 'hover:text-stone-900'
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
                  className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 flex-1"
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
                      onClick={() => handleDateChange(targetDate)}
                      className={`flex-1 text-[11px] py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
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
                const totalDosesNeeded = med.freqType === 'daily' ? (med.dailyDoses || 1) : 1;
                const isCompleted = logs.length >= totalDosesNeeded;
                const isLowStock = med.stock <= 5;
                const nextDueInfo = calculateNextDueTimeInfo(med);

                let freqBadgeText = '每日定時';
                if (med.freqType === 'interval') freqBadgeText = `每隔 ${med.intervalDays || 2} 日`;
                if (med.freqType === 'weekday') freqBadgeText = '指定星期幾';
                if (med.freqType === 'hours') freqBadgeText = `每隔 ${med.hoursVal || 6} 小時`;

                return (
                  <div 
                    key={med.id}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-200 space-y-3 relative ${
                      !isActiveToday 
                        ? 'opacity-60 bg-stone-50/80 border-stone-200' 
                        : isCompleted 
                          ? 'border-emerald-200 bg-emerald-50/10' 
                          : 'border-stone-200/80 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1 pr-2">
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-stone-800">{med.name}</h3>
                          
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                            isLowStock ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-stone-100 text-stone-600'
                          }`}>
                            <Package className="w-3 h-3" /> 剩 {med.stock} {isLowStock && '(快完！)'}
                          </span>

                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                            {freqBadgeText}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-stone-600">
                          <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                            <Clock className="w-3 h-3 text-amber-600" /> {med.time}
                          </span>
                          <span className="font-bold text-stone-700">每次 {med.dosage}</span>
                          {med.freqType === 'daily' && (
                            <span className="text-stone-400 font-medium">｜ 每日 {med.dailyDoses || 1} 次</span>
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
                          <p className="text-xs text-stone-400 italic">{med.notes}</p>
                        )}

                        {!isActiveToday ? (
                          <div className="bg-stone-100 border border-stone-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-stone-500 font-bold">
                            <Lock className="w-4 h-4 text-stone-400" />
                            <span>今日為休息日 🐾 無需服藥</span>
                          </div>
                        ) : (
                          <div className="pt-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {Array.from({ length: totalDosesNeeded }).map((_, idx) => {
                                const log = logs[idx];
                                const isChecked = !!log;
                                return (
                                  <div key={idx} className="flex items-center gap-1.5 bg-stone-50 border border-stone-200/80 rounded-xl px-2.5 py-1.5">
                                    <button 
                                      onClick={() => handleToggleDose(med, idx)}
                                      className="transition active:scale-90 cursor-pointer"
                                      title="點擊打卡"
                                    >
                                      {isChecked ? (
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                                      ) : (
                                        <Circle className="w-6 h-6 text-stone-300 hover:text-stone-400" />
                                      )}
                                    </button>

                                    <div className="text-xs">
                                      <span className="font-bold text-stone-700 block text-[11px]">
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
                                            onClick={() => setEditingTimeLog(log.id)}
                                            className="text-[10px] text-emerald-700 font-bold hover:underline block"
                                            title="點擊修訂時間"
                                          >
                                            {log.timeStr} ✏️
                                          </button>
                                        )
                                      ) : (
                                        <span className="text-[10px] text-stone-400">未打卡</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              <button
                                onClick={() => addExtraDose(med)}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-2 rounded-xl border border-amber-200/60 flex items-center gap-1 transition cursor-pointer"
                                title="有需要時加食一粒"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>補充一粒</span>
                              </button>
                            </div>
                          </div>
                        )}

                      </div>

                      <div className="flex items-center gap-0.5">
                        <button 
                          onClick={() => openEditModal(med)}
                          className="text-stone-400 hover:text-amber-600 p-1.5 transition rounded-xl hover:bg-amber-50 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmTarget(med)}
                          className="text-stone-300 hover:text-rose-500 p-1.5 transition rounded-xl hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex justify-end">
                      <button
                        onClick={() => exportToIosCalendar(med)}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/60 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <BellRing className="w-3.5 h-3.5 text-amber-600" />
                        + 加至 iOS 日曆提醒
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <div>
                <h2 className="font-bold text-stone-800 text-sm">歷來服藥紀錄</h2>
                <p className="text-[11px] text-stone-400">（系統自動保留最近 60 日紀錄）</p>
              </div>
            </div>

            {historyLogs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-stone-400 border border-stone-200/60 shadow-sm">
                <History className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="text-sm font-medium text-stone-600">暫時未有歷史 Log</p>
              </div>
            ) : (
              <div className="space-y-2">
                {historyLogs.map((log) => (
                  <div key={log.id} className="bg-white rounded-2xl p-3.5 border border-stone-200/70 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-stone-800">{log.medName}</h4>
                      <p className="text-xs text-stone-500">每次份量：{log.dosage}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg inline-block">
                        {log.date}
                      </span>
                      <p className="text-[10px] text-stone-400 pt-0.5">{log.timeStr} 服用</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 新增藥物 Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900">新增藥物設定</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">藥物 / 補充品名稱</label>
                <input
                  type="text"
                  required
                  placeholder="例如：降血壓藥 / 維他命C"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">每次服用份量</label>
                  <input
                    type="text"
                    placeholder="例如：1 粒 / 2 錠"
                    value={addForm.dosage}
                    onChange={(e) => setAddForm({ ...addForm, dosage: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">預設服藥時間</label>
                  <input
                    type="time"
                    value={addForm.time}
                    onChange={(e) => setAddForm({ ...addForm, time: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl p-2 text-sm font-semibold text-stone-800 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                  />
                </div>
              </div>

              <div className="space-y-2 bg-amber-50/40 p-3.5 rounded-2xl border border-amber-200/50">
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
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        addForm.freqType === mode.id 
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
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
                  {addForm.freqType === 'daily' && (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200/60">
                      <span className="text-xs font-bold text-stone-700">每日食幾多次？</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={addForm.dailyDoses}
                        onChange={(e) => setAddForm({ ...addForm, dailyDoses: parseInt(e.target.value, 10) || 1 })}
                        className="w-16 border border-stone-200 rounded-lg p-1 text-center text-xs font-bold"
                      />
                    </div>
                  )}

                  {addForm.freqType === 'interval' && (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200/60">
                      <span className="text-xs font-bold text-stone-700">每隔幾多日食一次？ (2 代表隔日)</span>
                      <input
                        type="number"
                        min="1"
                        value={addForm.intervalDays}
                        onChange={(e) => setAddForm({ ...addForm, intervalDays: parseInt(e.target.value, 10) || 2 })}
                        className="w-16 border border-stone-200 rounded-lg p-1 text-center text-xs font-bold"
                      />
                    </div>
                  )}

                  {addForm.freqType === 'weekday' && (
                    <div className="bg-white p-2.5 rounded-xl border border-amber-200/60 space-y-1.5">
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
                              className={`w-8 h-8 rounded-full text-xs font-bold transition ${
                                isSelected ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-500'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {addForm.freqType === 'hours' && (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200/60">
                      <span className="text-xs font-bold text-stone-700">每隔幾個鐘食一次？</span>
                      <input
                        type="number"
                        min="1"
                        value={addForm.hoursVal}
                        onChange={(e) => setAddForm({ ...addForm, hoursVal: parseInt(e.target.value, 10) || 6 })}
                        className="w-16 border border-stone-200 rounded-lg p-1 text-center text-xs font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">目前剩餘數量 (庫存粒數)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="例如：30"
                  value={addForm.stock}
                  onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">備註 / 服用指示</label>
                <input
                  type="text"
                  placeholder="例如：餐後溫水送服"
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-amber-600/20 transition cursor-pointer"
                >
                  確定新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 編輯藥物 Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900">編輯藥物設定</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">藥物名稱</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">每次服用份量</label>
                  <input
                    type="text"
                    value={editForm.dosage}
                    onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">預設時間</label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl p-2 text-sm font-semibold text-stone-800 bg-stone-50/50 focus:outline-none text-center"
                  />
                </div>
              </div>

              <div className="space-y-2 bg-amber-50/40 p-3.5 rounded-2xl border border-amber-200/50">
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
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        editForm.freqType === mode.id 
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
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
                  {editForm.freqType === 'daily' && (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200/60">
                      <span className="text-xs font-bold text-stone-700">每日食幾多次？</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editForm.dailyDoses}
                        onChange={(e) => setEditForm({ ...editForm, dailyDoses: parseInt(e.target.value, 10) || 1 })}
                        className="w-16 border border-stone-200 rounded-lg p-1 text-center text-xs font-bold"
                      />
                    </div>
                  )}

                  {editForm.freqType === 'interval' && (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200/60">
                      <span className="text-xs font-bold text-stone-700">每隔幾多日食一次？</span>
                      <input
                        type="number"
                        min="1"
                        value={editForm.intervalDays}
                        onChange={(e) => setEditForm({ ...editForm, intervalDays: parseInt(e.target.value, 10) || 2 })}
                        className="w-16 border border-stone-200 rounded-lg p-1 text-center text-xs font-bold"
                      />
                    </div>
                  )}

                  {editForm.freqType === 'weekday' && (
                    <div className="bg-white p-2.5 rounded-xl border border-amber-200/60 space-y-1.5">
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
                              className={`w-8 h-8 rounded-full text-xs font-bold transition ${
                                isSelected ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-500'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {editForm.freqType === 'hours' && (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200/60">
                      <span className="text-xs font-bold text-stone-700">每隔幾個鐘食一次？</span>
                      <input
                        type="number"
                        min="1"
                        value={editForm.hoursVal}
                        onChange={(e) => setEditForm({ ...editForm, hoursVal: parseInt(e.target.value, 10) || 6 })}
                        className="w-16 border border-stone-200 rounded-lg p-1 text-center text-xs font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">剩餘庫存粒數</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">備註 / 服用指示</label>
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-amber-600/20 transition cursor-pointer"
                >
                  儲存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 刪除確認 Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl space-y-4 text-center border border-rose-100">
            <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-3xl mx-auto flex items-center justify-center shadow-inner relative">
              <PawPrint className="w-8 h-8 text-rose-500 fill-rose-200" />
              <span className="absolute -top-1 -right-1 text-xs">❓</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-stone-900">確定要刪除嗎？</h3>
              <p className="text-xs text-stone-500 px-2 leading-relaxed">
                喵～確定要將 <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">【{deleteConfirmTarget.name}】</span> 從清單移除？
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                保留
              </button>
              <button
                type="button"
                onClick={confirmDeleteMedication}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {customAlertMsg && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl space-y-4 text-center border border-amber-100">
            <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
              <PawPrint className="w-8 h-8 text-amber-600 fill-amber-300" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-stone-900">{customAlertMsg.title}</h3>
              <p className="text-xs text-stone-500 px-1 leading-relaxed">
                {customAlertMsg.desc}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCustomAlertMsg(null)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-amber-600/20 transition cursor-pointer"
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