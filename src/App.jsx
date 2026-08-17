import FontSizeControl from "./FontSizeControl";
import React, { useState, useEffect } from 'react';
import { Pill, Clock, Plus, Trash2, Edit2, CheckCircle2, Circle, Heart, Calendar, Cat, History, X, AlertCircle, Package, PlusCircle, RefreshCw, BellRing, Sparkles, Timer } from 'lucide-react';

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

  // 升級版藥物資料結構：包含 freqType ('daily' | 'interval' | 'hours') 及 freqVal
  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem('meowmed_meds_v10');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: '血壓藥 / 慢性病藥', dosage: '1 粒', time: '08:00', stock: 30, notes: '早餐後溫水送服', freqType: 'daily', freqVal: 1 },
      { id: 2, name: '隔日維他命 C', dosage: '1 粒', time: '13:00', stock: 15, notes: '隔日補充', freqType: 'interval', freqVal: 2 },
      { id: 3, name: '退燒止痛藥 (按需)', dosage: '2 粒', time: '12:00', stock: 10, notes: '發燒時每 6 小時一次', freqType: 'hours', freqVal: 6 }
    ];
  });

  const [historyLogs, setHistoryLogs] = useState(() => {
    const saved = localStorage.getItem('meowmed_history_v10');
    if (!saved) return [];
    const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
    return JSON.parse(saved).filter(log => log.timestamp >= sixtyDaysAgo);
  });

  const [userName, setUserName] = useState(() => localStorage.getItem('meowmed_username') || '自己');
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [activeTab, setActiveTab] = useState('today');
  
  const [activeMenuMedId, setActiveMenuMedId] = useState(null);
  const [editingLogTarget, setEditingLogTarget] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', dosage: '1 粒', time: '08:00', stock: 30, notes: '', freqType: 'daily', freqVal: 1 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', dosage: '1 粒', time: '08:00', stock: 30, notes: '', freqType: 'daily', freqVal: 1 });

  // 貓貓風格彈窗狀態
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);
  const [customAlertMsg, setCustomAlertMsg] = useState(null);

  const [catMoodIndex, setCatMoodIndex] = useState(0);
  const catQuotes = [
    "喵～新增咗間隔食藥同幾個鐘食一次嘅功能，好聰明呀！🐾",
    "喵！有按時食藥同計好下次時間嘅主人最精靈！✨",
    "喵～今日飲咗足夠嘅溫水未呀？💧",
    "喵嗚～要隨時留意藥物庫存，冇藥要早啲補！📦",
    "喵～可以點擊日曆圖示加入手機定時提醒啊！📅"
  ];

  // 自動每隔 5 秒切換貓貓對白
  useEffect(() => {
    const timer = setInterval(() => {
      setCatMoodIndex((prev) => (prev + 1) % catQuotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [catQuotes.length]);

  useEffect(() => {
    localStorage.setItem('meowmed_meds_v10', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('meowmed_history_v10', JSON.stringify(historyLogs));
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

  const getTakenLogsOnDate = (medId, dateStr) => {
    return historyLogs.filter(log => log.medId === medId && log.date === dateStr);
  };

  // 智能計算下一次建議服藥時間
  const calculateNextDueTime = (med) => {
    const medLogs = historyLogs.filter(l => l.medId === med.id);
    if (medLogs.length === 0) return '尚未開始服藥，隨時可以食';

    const lastLog = medLogs[0];
    const lastTimeMs = lastLog.timestamp;

    if (med.freqType === 'hours') {
      const intervalHours = Number(med.freqVal) || 6;
      const nextMs = lastTimeMs + intervalHours * 60 * 60 * 1000;
      const nextDate = new Date(nextMs);
      const timeStr = nextDate.toTimeString().slice(0, 5);
      const dateStr = `${nextDate.getMonth() + 1}月${nextDate.getDate()}日`;
      return `${dateStr} ${timeStr} (距離上次 ${intervalHours} 小時)`;
    } else if (med.freqType === 'interval') {
      const intervalDays = Number(med.freqVal) || 2;
      const nextMs = lastTimeMs + intervalDays * 24 * 60 * 60 * 1000;
      const nextDate = new Date(nextMs);
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day} (隔 ${intervalDays} 日)`;
    } else {
      const nextMs = lastTimeMs + 24 * 60 * 60 * 1000;
      const nextDate = new Date(nextMs);
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day} ${med.time || '08:00'}`;
    }
  };

  const toggleQuickLog = (med) => {
    const logs = getTakenLogsOnDate(med.id, selectedDate);
    if (logs.length === 0) {
      const now = new Date();
      const timeStr = med.time || now.toTimeString().slice(0, 5);
      const newLog = {
        id: Date.now(),
        medId: med.id,
        medName: med.name,
        dosage: med.dosage,
        date: selectedDate,
        timeStr: timeStr,
        timestamp: Date.now()
      };
      setHistoryLogs(prev => [newLog, ...prev]);
      setMedications(prev => prev.map(m => m.id === med.id ? { ...m, stock: Math.max(0, m.stock - 1) } : m));
    } else {
      const lastLog = logs[0];
      setHistoryLogs(prev => prev.filter(l => l.id !== lastLog.id));
      setMedications(prev => prev.map(m => m.id === med.id ? { ...m, stock: m.stock + 1 } : m));
    }
  };

  const addExtraDose = (med) => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    const newLog = {
      id: Date.now(),
      medId: med.id,
      medName: med.name,
      dosage: med.dosage,
      date: selectedDate,
      timeStr: timeStr,
      timestamp: Date.now()
    };
    setHistoryLogs(prev => [newLog, ...prev]);
    setMedications(prev => prev.map(m => m.id === med.id ? { ...m, stock: Math.max(0, m.stock - 1) } : m));
    setActiveMenuMedId(null);
  };

  const deleteSpecificLog = (logId, medId) => {
    setHistoryLogs(prev => prev.filter(l => l.id !== logId));
    setMedications(prev => prev.map(m => m.id === medId ? { ...m, stock: m.stock + 1 } : m));
    setActiveMenuMedId(null);
    setEditingLogTarget(null);
  };

  const saveLogTimeChange = (logId) => {
    if (!editingLogTarget) return;
    setHistoryLogs(prev => prev.map(l => l.id === logId ? { ...l, timeStr: editingLogTarget.timeStr } : l));
    setEditingLogTarget(null);
    setActiveMenuMedId(null);
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
      rrule = `FREQ=DAILY;INTERVAL=${med.freqVal || 2}`;
    } else if (med.freqType === 'hours') {
      rrule = `FREQ=HOURLY;INTERVAL=${med.freqVal || 6}`;
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MeowMed//Cat Medication Reminder//ZH-HK',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:🐱 MeowMed 提醒：食 ${med.name}`,
      `DESCRIPTION:喵～該食藥啦！\\n藥物：${med.name}\\n劑量：${med.dosage || '1粒'}\\n模式：${med.freqType === 'hours' ? `每 ${med.freqVal} 小時一次` : med.freqType === 'interval' ? `每隔 ${med.freqVal} 日一次` : '每日定時'}\\n備註：${med.notes || '無'}`,
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
    link.setAttribute('download', `MeowMed_${med.name}_智能提醒.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setCustomAlertMsg({
      title: "成功加入日曆！",
      desc: `喵～【${med.name}】嘅智能循環提醒已經順利匯出，請在手機打開並加入日曆！📅✨`
    });
  };

  const openAddModal = () => {
    setAddForm({ name: '', dosage: '1 粒', time: '08:00', stock: 30, notes: '', freqType: 'daily', freqVal: 1 });
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
      freqVal: med.freqVal || 1
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
  const completedCount = medications.filter(m => getTakenLogsOnDate(m.id, todayDateStr).length > 0).length;

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-800 flex flex-col font-sans antialiased selection:bg-amber-200">
      
      {/* 頂部 Header */}
      <header className="bg-white/90 backdrop-blur border border-amber-100/85 shadow-xs rounded-2xl p-3.5 mb-4 flex items-center justify-between max-w-md w-full mx-auto mt-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🐱</span>
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
              title="點擊手動切換下一句"
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
              今日進度：{completedCount} / {medications.length} 款
            </span>
            <span className="text-[11px] bg-amber-800/30 px-2 py-0.5 rounded-lg border border-amber-400/20">
              {completedCount === medications.length && medications.length > 0 ? '✨ 今日全部完成！' : '加油按時服藥'}
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
            {/* 日期選擇卡片 */}
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200/70 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> 檢視/補Mark日期：
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
                  { label: '昨日 (補Mark)', days: 1 },
                  { label: '前日 (補Mark)', days: 2 }
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

            {/* 藥物列表 */}
            {medications.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/60 shadow-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="text-sm font-medium text-stone-600">暫時未有藥物紀錄</p>
                <p className="text-xs text-stone-400 mt-1">點擊右上角「新增藥物」開始使用</p>
              </div>
            ) : (
              medications.map((med) => {
                const logs = getTakenLogsOnDate(med.id, selectedDate);
                const takenCount = logs.length;
                const isLowStock = med.stock <= 5;
                const isMenuOpen = activeMenuMedId === med.id;
                const nextDue = calculateNextDueTime(med);

                let freqBadgeText = '每日定時';
                if (med.freqType === 'interval') freqBadgeText = `隔 ${med.freqVal} 日一次`;
                if (med.freqType === 'hours') freqBadgeText = `每 ${med.freqVal} 小時一次`;

                return (
                  <div 
                    key={med.id}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-200 space-y-3 relative ${
                      takenCount > 0 ? 'border-emerald-200 bg-emerald-50/20' : 'border-stone-200/80 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 pr-2">
                        {/* 極速打卡按鈕 */}
                        <button 
                          onClick={() => toggleQuickLog(med)}
                          className="mt-0.5 transition active:scale-90 relative cursor-pointer"
                          title="點擊極速打卡／取消"
                        >
                          {takenCount > 0 ? (
                            <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-emerald-100" />
                          ) : (
                            <Circle className="w-7 h-7 text-stone-300 hover:text-stone-400" />
                          )}
                        </button>

                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm text-stone-800">
                              {med.name}
                            </h3>
                            
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                              isLowStock ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-stone-100 text-stone-600'
                            }`}>
                              <Package className="w-3 h-3" /> 剩 {med.stock} {isLowStock && '(快完！)'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                              <Clock className="w-3 h-3 text-amber-600" /> {med.time}
                            </span>
                            <span className="text-[10px] bg-amber-100/80 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                              {freqBadgeText}
                            </span>
                            <span className="font-medium text-stone-600">{med.dosage}</span>
                          </div>

                          {/* 下次建議服藥提示 */}
                          <div className="bg-stone-50/80 border border-stone-200/60 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] text-stone-600">
                            <Timer className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span><strong>下次建議：</strong>{nextDue}</span>
                          </div>

                          <div className="pt-0.5">
                            {takenCount > 0 ? (
                              <button
                                onClick={() => setActiveMenuMedId(isMenuOpen ? null : med.id)}
                                className="text-[11px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-300 transition flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <span>✨ 已服 {takenCount} 次 • {logs[0].timeStr}</span>
                                <span className="text-[9px] opacity-75">▼ 管理</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-stone-400 font-medium italic">
                                尚未服藥（點擊左側圓圈即時打卡）
                              </span>
                            )}
                          </div>

                          {med.notes && (
                            <p className="text-xs text-stone-400 italic pt-0.5">{med.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button 
                          onClick={() => openEditModal(med)}
                          className="text-stone-400 hover:text-amber-600 p-1.5 transition rounded-xl hover:bg-amber-50 cursor-pointer"
                          title="編輯藥物設定"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmTarget(med)}
                          className="text-stone-300 hover:text-rose-500 p-1.5 transition rounded-xl hover:bg-rose-50 cursor-pointer"
                          title="刪除藥物"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 微型選單面板 */}
                    {isMenuOpen && (
                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 mt-3 space-y-3 animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                          <span className="text-xs font-bold text-stone-700">📋 管理 【{med.name}】 服藥紀錄</span>
                          <button onClick={() => setActiveMenuMedId(null)} className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          {logs.map((log, idx) => (
                            <div key={log.id} className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-stone-600">第 {logs.length - idx} 次</span>

                              {editingLogTarget?.logId === log.id ? (
                                <div className="flex items-center gap-1">
                                  <input 
                                    type="time" 
                                    value={editingLogTarget.timeStr}
                                    onChange={(e) => setEditingLogTarget({ ...editingLogTarget, timeStr: e.target.value })}
                                    className="border border-amber-400 rounded-lg px-2 py-0.5 text-xs font-bold text-center w-24 bg-amber-50"
                                  />
                                  <button 
                                    onClick={() => saveLogTimeChange(log.id)}
                                    className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer"
                                  >
                                    儲存
                                  </button>
                                  <button 
                                    onClick={() => setEditingLogTarget(null)}
                                    className="bg-stone-200 text-stone-600 text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer"
                                  >
                                    取消
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md">
                                    {log.timeStr}
                                  </span>
                                  <button 
                                    onClick={() => setEditingLogTarget({ logId: log.id, timeStr: log.timeStr })}
                                    className="text-xs text-amber-600 hover:underline font-bold px-1 cursor-pointer"
                                  >
                                    ✏️ 改時間
                                  </button>
                                  <button 
                                    onClick={() => deleteSpecificLog(log.id, med.id)}
                                    className="text-xs text-rose-500 hover:underline font-bold px-1 cursor-pointer"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button 
                            onClick={() => addExtraDose(med)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5" /> ➕ 再加一粒
                          </button>
                          <button 
                            onClick={() => toggleQuickLog(med)}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                          >
                            取消最後一次
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-stone-100 flex justify-end">
                      <button
                        onClick={() => exportToIosCalendar(med)}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/60 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <BellRing className="w-3.5 h-3.5 text-amber-600" />
                        + 加至 iOS 智能日曆提醒
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
                <p className="text-[11px] text-stone-400">（系統將自動保留最近 60 日紀錄）</p>
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
                      <p className="text-xs text-stone-500">劑量：{log.dosage}</p>
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
              <h3 className="font-bold text-base text-stone-900">新增彈性藥物提醒</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">藥物 / 補充品名稱</label>
                <input
                  type="text"
                  required
                  placeholder="例如：降血壓藥 / 維他命C / 退燒藥"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">每次服用劑量</label>
                  <input
                    type="text"
                    placeholder="例如：1 粒 / 10ml"
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

              {/* 頻率設定 */}
              <div className="space-y-1.5 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/50">
                <label className="block text-xs font-bold text-amber-900 mb-1">⏱️ 服藥頻率模式</label>
                <select
                  value={addForm.freqType}
                  onChange={(e) => setAddForm({ ...addForm, freqType: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2 text-xs font-bold bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-2"
                >
                  <option value="daily">📅 每日定時服藥</option>
                  <option value="interval">🔄 隔幾日服藥一次（例如隔日、每3日）</option>
                  <option value="hours">⏰ 病發時每幾個鐘食一次（例如每6小時）</option>
                </select>

                {addForm.freqType === 'interval' && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-0.5">每隔幾日？ (例如 2 代表隔日)</label>
                    <input
                      type="number"
                      min="1"
                      value={addForm.freqVal}
                      onChange={(e) => setAddForm({ ...addForm, freqVal: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl p-2 text-xs bg-white"
                    />
                  </div>
                )}

                {addForm.freqType === 'hours' && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-0.5">每隔幾個鐘？ (例如 6 代表每6小時)</label>
                    <input
                      type="number"
                      min="1"
                      value={addForm.freqVal}
                      onChange={(e) => setAddForm({ ...addForm, freqVal: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl p-2 text-xs bg-white"
                    />
                  </div>
                )}
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
                  placeholder="例如：餐後服用 / 發燒時服"
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
              <h3 className="font-bold text-base text-stone-900">編輯藥物與頻率設定</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">藥物名稱</label>
                <input
                  type="text"
                  required
                  placeholder="例如：降血壓藥 / 維他命C"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">每次服用劑量</label>
                  <input
                    type="text"
                    placeholder="例如：1 粒 / 10ml"
                    value={editForm.dosage}
                    onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">預設服藥時間</label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl p-2 text-sm font-semibold text-stone-800 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                  />
                </div>
              </div>

              {/* 頻率設定 */}
              <div className="space-y-1.5 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/50">
                <label className="block text-xs font-bold text-amber-900 mb-1">⏱️ 服藥頻率模式</label>
                <select
                  value={editForm.freqType}
                  onChange={(e) => setEditForm({ ...editForm, freqType: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2 text-xs font-bold bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-2"
                >
                  <option value="daily">📅 每日定時服藥</option>
                  <option value="interval">🔄 隔幾日服藥一次</option>
                  <option value="hours">⏰ 病發時每幾個鐘食一次</option>
                </select>

                {editForm.freqType === 'interval' && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-0.5">每隔幾日？</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.freqVal}
                      onChange={(e) => setEditForm({ ...editForm, freqVal: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl p-2 text-xs bg-white"
                    />
                  </div>
                )}

                {editForm.freqType === 'hours' && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-0.5">每隔幾個鐘？</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.freqVal}
                      onChange={(e) => setEditForm({ ...editForm, freqVal: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl p-2 text-xs bg-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">目前剩餘數量 (庫存粒數)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="例如：30"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">備註 / 服用指示</label>
                <input
                  type="text"
                  placeholder="例如：餐後服用 / 溫水送服"
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

      {/* 貓貓風格刪除確認 Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl space-y-4 text-center border border-amber-100 animate-fadeIn">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-inner">
              🐱❓
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-stone-900">確定要刪除嗎？</h3>
              <p className="text-xs text-stone-500 px-2">
                喵～確定要將 <span className="font-bold text-amber-800">【{deleteConfirmTarget.name}】</span> 從清單入面移除？
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

      {/* 貓貓風格通用 Alert Modal */}
      {customAlertMsg && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl space-y-4 text-center border border-amber-100 animate-fadeIn">
            <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-md">
              🐾
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