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
  // 取得今日 YYYY-MM-DD 格式字串
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 藥物資料清單 State
  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem('meowmed_meds_v14');
    return saved ? JSON.parse(saved) : [
      { 
        id: 1, 
        name: '慢性病藥', 
        dosage: '2 粒', 
        time: '08:00', 
        stock: 30, 
        notes: '餐後溫水送服', 
        freqType: 'daily', 
        dailyDoses: 2, 
        intervalDays: 1, 
        weekDays: [1,2,3,4,5,6,0], 
        hoursVal: 6 
      },
      { 
        id: 2, 
        name: '維他命 C', 
        dosage: '1 粒', 
        time: '13:00', 
        stock: 15, 
        notes: '隔日補充', 
        freqType: 'interval', 
        dailyDoses: 1, 
        intervalDays: 2, 
        weekDays: [1,2,3,4,5,6,0], 
        hoursVal: 6 
      },
      { 
        id: 3, 
        name: '退燒止痛藥', 
        dosage: '1 粒', 
        time: '12:00', 
        stock: 10, 
        notes: '有需要時服用', 
        freqType: 'hours', 
        dailyDoses: 1, 
        intervalDays: 1, 
        weekDays: [1,2,3,4,5,6,0], 
        hoursVal: 6 
      }
    ];
  });

  // 服藥歷史紀錄 State (自動清理超過 60 天前的紀錄)
  const [historyLogs, setHistoryLogs] = useState(() => {
    const saved = localStorage.getItem('meowmed_history_v14');
    if (!saved) return [];
    const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
    return JSON.parse(saved).filter(log => log.timestamp >= sixtyDaysAgo);
  });

  // 介面互動控制 State
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [activeTab, setActiveTab] = useState('today');
  const [customAlertMsg, setCustomAlertMsg] = useState(null);

  // 新增 Modal 控制 State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ 
    name: '', 
    dosage: '1 粒', 
    time: '08:00', 
    stock: 30, 
    notes: '', 
    freqType: 'daily', 
    dailyDoses: 1, 
    intervalDays: 2, 
    weekDays: [1,3,5], 
    hoursVal: 6 
  });

  // 編輯 Modal 控制 State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    dosage: '1 粒', 
    time: '08:00', 
    stock: 30, 
    notes: '', 
    freqType: 'daily', 
    dailyDoses: 1, 
    intervalDays: 2, 
    weekDays: [1,3,5], 
    hoursVal: 6 
  });

  // 貓咪語錄庫
  const catQuotes = [
    "喵～今日記得按時食藥，身體健康最重要！🐾",
    "喵！有按時食藥同記低時間嘅主人最精靈！✨",
    "喵～隔日食藥記得睇清日曆提示喔！📅",
    "喵嗚～按小時食藥記得聽朝起床再打卡，半夜要好好休息！🌙"
  ];
  const [catMoodIndex] = useState(0);

  // 持久化儲存至 LocalStorage
  useEffect(() => {
    localStorage.setItem('meowmed_meds_v14', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('meowmed_history_v14', JSON.stringify(historyLogs));
  }, [historyLogs]);

  // 查詢特定藥物在指定日期的打卡紀錄
  const getLogsOnDate = (medId, dateStr) => {
    return historyLogs.filter(log => log.medId === medId && log.date === dateStr);
  };

  // 計算下一次服藥時間與夜間防打擾狀態
  const calculateNextDueTimeInfo = (med) => {
    const medLogs = historyLogs
      .filter(l => l.medId === med.id)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (medLogs.length === 0) {
      return { text: '尚未開始服藥，隨時可以打卡', isNight: false };
    }

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

  // 匯出至 iOS / Apple 日曆 (.ics)
  const exportToIosCalendar = (med) => {
    if (med.freqType === 'hours') {
      setCustomAlertMsg({
        title: "不支援加入日曆",
        desc: "喵～「按小時服藥」需要根據你每次實際打卡時間動態倒數。為防止日曆喺凌晨鬧響打擾睡眠，請直接使用 App 內的動態提醒！🐾"
      });
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const [hours, minutes] = (med.time || '08:00').split(':');
    const dtStart = `${year}${month}${day}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;

    let rrule = 'FREQ=DAILY';
    if (med.freqType === 'interval') {
      rrule = `FREQ=DAILY;INTERVAL=${med.intervalDays || 2}`;
    } else if (med.freqType === 'weekday' && med.weekDays?.length > 0) {
      const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const byDays = med.weekDays.map(d => dayMap[d]).join(',');
      rrule = `FREQ=WEEKLY;BYDAY=${byDays}`;
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
      desc: `喵～【${med.name}】嘅 ${med.freqType === 'interval' ? `每隔 ${med.intervalDays} 日` : '定時'} 提醒已經匯出，日曆唔會每日盲目鬧響啦！📅✨`
    });
  };

  // 打卡 / 取消打卡處理
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
        doseIndex: doseIndex
      };
      setHistoryLogs(prev => [newLog, ...prev]);
      setMedications(prev => prev.map(m => m.id === med.id ? { ...m, stock: Math.max(0, m.stock - 1) } : m));
    }
  };

  // 新增藥物處理
  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!addForm.name) return;
    const newMed = {
      id: Date.now(),
      ...addForm
    };
    setMedications(prev => [...prev, newMed]);
    setIsAddModalOpen(false);
    setAddForm({ 
      name: '', 
      dosage: '1 粒', 
      time: '08:00', 
      stock: 30, 
      notes: '', 
      freqType: 'daily', 
      dailyDoses: 1, 
      intervalDays: 2, 
      weekDays: [1,3,5], 
      hoursVal: 6 
    });
  };

  // 開啟編輯 Modal
  const handleOpenEdit = (med) => {
    setEditingMedId(med.id);
    setEditForm({ ...med });
    setIsEditModalOpen(true);
  };

  // 儲存編輯結果
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setMedications(prev => prev.map(m => m.id === editingMedId ? { ...editForm, id: editingMedId } : m));
    setIsEditModalOpen(false);
  };

  // 刪除藥物
  const handleDeleteMed = (id) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-800 flex flex-col font-sans antialiased">
      {/* 頂部 Header */}
      <header className="bg-white/90 backdrop-blur border border-amber-100/85 shadow-xs rounded-2xl p-3.5 mb-3 flex items-center justify-between max-w-md w-full mx-auto mt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 font-bold shadow-inner">
            <PawPrint className="w-5 h-5 fill-amber-500 text-amber-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">MeowMed</h1>
            <p className="text-xs text-amber-800 font-medium mt-1">智能服藥管家 🐾</p>
          </div>
        </div>
        <FontSizeControl />
      </header>

      {/* 主內容容器 */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-1 space-y-4 pb-20">
        {/* 貓咪提示語錄卡片 */}
        <div className="bg-amber-500 text-white p-3 rounded-2xl shadow-sm flex items-center gap-3">
          <Cat className="w-7 h-7 text-amber-100 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{catQuotes[catMoodIndex]}</p>
        </div>

        {/* Tab 頁籤切換 */}
        <div className="flex bg-stone-200/70 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'today' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            當日打卡
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'manage' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            藥物管理
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'history' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            歷史紀錄
          </button>
        </div>

        {/* TAB 1: 當日打卡介面 */}
        {activeTab === 'today' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-xs font-bold text-stone-700">選擇日期：</span>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="text-xs font-bold border border-stone-200 p-1.5 rounded-xl bg-stone-50 outline-none"
              />
            </div>

            {medications.map(med => {
              const logs = getLogsOnDate(med.id, selectedDate);
              const totalDoses = med.freqType === 'hours' ? 1 : (Number(med.dailyDoses) || 1);
              const nextDueInfo = calculateNextDueTimeInfo(med);

              return (
                <div key={med.id} className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">{med.name}</h3>
                      <p className="text-[11px] text-stone-500 mt-0.5">每次份量：{med.dosage} | 剩餘：{med.stock}</p>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                      {med.freqType === 'hours' ? `每 ${med.hoursVal} 小時` : med.freqType === 'interval' ? `隔 ${med.intervalDays} 日` : '定時'}
                    </span>
                  </div>

                  {/* 打卡按鈕區域 */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Array.from({ length: totalDoses }).map((_, idx) => {
                      const isTaken = logs.some(l => l.doseIndex === idx);
                      const log = logs.find(l => l.doseIndex === idx);

                      return (
                        <button
                          key={idx}
                          onClick={() => handleToggleDose(med, idx)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                            isTaken
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-amber-400'
                          }`}
                        >
                          {isTaken ? <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" /> : <Circle className="w-4 h-4 text-stone-400" />}
                          <span>{isTaken ? `第 ${idx + 1} 劑 (${log?.timeStr || ''})` : `打卡第 ${idx + 1} 劑`}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 下一次服藥時間指示器 */}
                  <div className={`border rounded-xl px-2.5 py-1.5 flex items-start gap-1.5 text-[11px] ${
                    nextDueInfo.isNight ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-stone-50 border-stone-200/70 text-stone-600'
                  }`}>
                    {nextDueInfo.isNight ? <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" /> : <Timer className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />}
                    <span><strong>下一次服藥：</strong>{nextDueInfo.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: 藥物管理介面 */}
        {activeTab === 'manage' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">我的藥物清單</h2>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> 新增藥物
              </button>
            </div>

            {medications.map((med) => {
              const isHoursMode = med.freqType === 'hours';

              return (
                <div key={med.id} className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-stone-800">{med.name}</h3>
                      <button onClick={() => handleOpenEdit(med)} className="text-stone-400 hover:text-amber-600 cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteMed(med.id)} className="text-stone-400 hover:text-rose-600 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                      {isHoursMode ? `每 ${med.hoursVal} 小時` : med.freqType === 'interval' ? `隔 ${med.intervalDays} 日` : '定時'}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 flex justify-between">
                    <span>每次份量：{med.dosage}</span>
                    <span>剩餘庫存：{med.stock}</span>
                  </div>

                  {med.notes && (
                    <p className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-lg">
                      💡 {med.notes}
                    </p>
                  )}

                  <div className="pt-2 border-t border-stone-100 flex justify-end">
                    {isHoursMode ? (
                      <span className="text-[10px] text-amber-800/80 bg-amber-50 px-2.5 py-1 rounded-xl font-medium border border-amber-200/50">
                        🐾 依實際打卡動態倒數 (不加入日曆)
                      </span>
                    ) : (
                      <button
                        onClick={() => exportToIosCalendar(med)}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/60 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <BellRing className="w-3.5 h-3.5 text-amber-600" />
                        + 加至 iOS 日曆提醒
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: 歷史紀錄介面 */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">服藥打卡歷史 (近 60 天)</h2>
            {historyLogs.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center text-stone-400 text-xs border border-stone-200/80">
                尚未有任何服藥打卡紀錄 🐾
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-3 border border-stone-200/80 divide-y divide-stone-100">
                {historyLogs.slice(0, 30).map(log => (
                  <div key={log.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-stone-800">{log.medName} <span className="text-stone-400 font-normal">({log.dosage})</span></p>
                      <p className="text-[10px] text-stone-500">{log.date} at {log.timeStr}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                      已服藥
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 新增藥物 Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-amber-100">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <h3 className="font-bold text-sm text-stone-900">新增藥物</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddMedication} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700">藥物名稱</label>
                <input 
                  type="text" 
                  required 
                  value={addForm.name} 
                  onChange={e => setAddForm({...addForm, name: e.target.value})} 
                  className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  placeholder="例：感冒藥" 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700">每次份量</label>
                  <input 
                    type="text" 
                    value={addForm.dosage} 
                    onChange={e => setAddForm({...addForm, dosage: e.target.value})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700">頻率類型</label>
                  <select 
                    value={addForm.freqType} 
                    onChange={e => setAddForm({...addForm, freqType: e.target.value})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none bg-white"
                  >
                    <option value="daily">每日定時</option>
                    <option value="interval">隔日 / 每隔 X 日</option>
                    <option value="hours">每隔 X 小時 (動態倒數)</option>
                  </select>
                </div>
              </div>

              {addForm.freqType === 'daily' && (
                <div>
                  <label className="font-bold text-stone-700">每日次數</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="6" 
                    value={addForm.dailyDoses} 
                    onChange={e => setAddForm({...addForm, dailyDoses: e.target.value})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  />
                </div>
              )}

              {addForm.freqType === 'interval' && (
                <div>
                  <label className="font-bold text-stone-700">相隔天數 (例：2 代表隔日)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={addForm.intervalDays} 
                    onChange={e => setAddForm({...addForm, intervalDays: e.target.value})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  />
                </div>
              )}

              {addForm.freqType === 'hours' && (
                <div>
                  <label className="font-bold text-stone-700">相隔小時 (例：6 小時)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={addForm.hoursVal} 
                    onChange={e => setAddForm({...addForm, hoursVal: e.target.value})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700">預設時間</label>
                  <input 
                    type="time" 
                    value={addForm.time} 
                    onChange={e => setAddForm({...addForm, time: e.target.value})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700">初始庫存</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={addForm.stock} 
                    onChange={e => setAddForm({...addForm, stock: Number(e.target.value)})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700">備註</label>
                <input 
                  type="text" 
                  value={addForm.notes} 
                  onChange={e => setAddForm({...addForm, notes: e.target.value})} 
                  className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  placeholder="例：飯後服" 
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="w-1/2 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold cursor-pointer">取消</button>
                <button type="submit" className="w-1/2 py-2 bg-amber-500 text-white rounded-xl font-bold shadow-md shadow-amber-500/20 cursor-pointer">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 編輯藥物 Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-amber-100">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
              <h3 className="font-bold text-sm text-stone-900">編輯藥物</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-stone-400 hover:text-stone-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700">藥物名稱</label>
                <input 
                  type="text" 
                  required 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700">每次份量</label>
                  <input 
                    type="text" 
                    value={editForm.dosage} 
                    onChange={e => setEditForm({...editForm, dosage: e.target.value})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700">頻率類型</label>
                  <select 
                    value={editForm.freqType} 
                    onChange={e => setEditForm({...editForm, freqType: e.target.value})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none bg-white"
                  >
                    <option value="daily">每日定時</option>
                    <option value="interval">隔日 / 每隔 X 日</option>
                    <option value="hours">每隔 X 小時 (動態倒數)</option>
                  </select>
                </div>
              </div>

              {editForm.freqType === 'daily' && (
                <div>
                  <label className="font-bold text-stone-700">每日次數</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="6" 
                    value={editForm.dailyDoses} 
                    onChange={e => setEditForm({...editForm, dailyDoses: e.target.value})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  />
                </div>
              )}

              {editForm.freqType === 'interval' && (
                <div>
                  <label className="font-bold text-stone-700">相隔天數 (例：2 代表隔日)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={editForm.intervalDays} 
                    onChange={e => setEditForm({...editForm, intervalDays: e.target.value})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  />
                </div>
              )}

              {editForm.freqType === 'hours' && (
                <div>
                  <label className="font-bold text-stone-700">相隔小時 (例：6 小時)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={editForm.hoursVal} 
                    onChange={e => setEditForm({...editForm, hoursVal: e.target.value})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700">預設時間</label>
                  <input 
                    type="time" 
                    value={editForm.time} 
                    onChange={e => setEditForm({...editForm, time: e.target.value})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700">當前庫存</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={editForm.stock} 
                    onChange={e => setEditForm({...editForm, stock: Number(e.target.value)})} 
                    className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700">備註</label>
                <input 
                  type="text" 
                  value={editForm.notes} 
                  onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                  className="w-full mt-1 p-2 border border-stone-200 rounded-xl outline-none" 
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-1/2 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold cursor-pointer">取消</button>
                <button type="submit" className="w-1/2 py-2 bg-amber-500 text-white rounded-xl font-bold shadow-md shadow-amber-500/20 cursor-pointer">更新</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 提示對話框 Modal */}
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