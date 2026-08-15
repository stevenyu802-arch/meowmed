import FontSizeControl from "./FontSizeControl";
import React, { useState, useEffect } from 'react';
import { Pill, Clock, Plus, Trash2, Edit2, CheckCircle2, Circle, Heart, Calendar, Cat, History, X, AlertCircle, Package, PlusCircle, MinusCircle, Sparkles, Download, BellRing } from 'lucide-react';

export default function App() {
  // 香港時間 (HKT) 日期格式化 Helper
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

  // 1. 藥物庫存與清單
  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem('meowmed_meds');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: '血壓藥 / 慢性病藥', dosage: '1 粒', time: '08:00', stock: 30, notes: '早餐後溫水送服' },
      { id: 2, name: '綜合維他命', dosage: '1 粒', time: '13:00', stock: 15, notes: '午餐後服' },
      { id: 3, name: '胃藥 / 固腸丸', dosage: '2 粒', time: '21:00', stock: 6, notes: '睡前服' }
    ];
  });

  // 2. 歷史 Log (自動保留 60 日)
  const [historyLogs, setHistoryLogs] = useState(() => {
    const saved = localStorage.getItem('meowmed_history');
    if (!saved) return [];
    const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
    return JSON.parse(saved).filter(log => log.timestamp >= sixtyDaysAgo);
  });

  // 3. 狀態控制
  const [userName, setUserName] = useState(() => localStorage.getItem('meowmed_username') || '自己');
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [activeTab, setActiveTab] = useState('today');

  // 自訂貓貓 Modal / Alert 狀態（代替原生 alert/confirm，絕不顯示 GitHub Domain）
  const [catAlert, setCatAlert] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert', // 'alert' | 'confirm'
    onConfirm: null
  });

  const showCatAlert = (message, title = '喵喵提醒 🐾') => {
    setCatAlert({ isOpen: true, title, message, type: 'alert', onConfirm: null });
  };

  const showCatConfirm = (message, onConfirm, title = '喵喵確認 🐾') => {
    setCatAlert({ isOpen: true, title, message, type: 'confirm', onConfirm });
  };

  // Modal 狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', dosage: '1 粒', time: '08:00', stock: 30, notes: '' });

  // 追加 / 扣減服藥彈窗狀態
  const [confirmModalMed, setConfirmModalMed] = useState(null);

  // 貓貓互動對白與表情
  const [catMoodIndex, setCatMoodIndex] = useState(0);
  const catQuotes = [
    "喵～記得按時食藥，乖乖照顧好自己哦！🐾",
    "喵！有按時食藥嘅主人最精靈！✨",
    "喵～今日飲咗足夠嘅溫水未呀？💧",
    "喵嗚～要隨時留意藥物庫存，冇藥要早啲補！📦",
    "喵～可以點擊「+ iOS 日曆」加入手機定時提醒啊！📅"
  ];

  // 儲存 LocalStorage
  useEffect(() => {
    localStorage.setItem('meowmed_meds', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
    const validLogs = historyLogs.filter(log => log.timestamp >= sixtyDaysAgo);
    localStorage.setItem('meowmed_history', JSON.stringify(validLogs));
  }, [historyLogs]);

  useEffect(() => {
    localStorage.setItem('meowmed_username', userName);
  }, [userName]);

  // 防 Future 未來日子選擇（改用貓貓警告）
  const handleDateChange = (dateVal) => {
    if (dateVal > getTodayStr()) {
      showCatAlert("喵！唔可以選擇未到嘅未來日子啊～時間未到呀！🐾", "喵喵時空警告 🐾");
      setSelectedDate(getTodayStr());
    } else {
      setSelectedDate(dateVal);
    }
  };

  // 計算某藥物在某日期的服用次數
  const getTakenLogsOnDate = (medId, dateStr) => {
    return historyLogs.filter(log => log.medId === medId && log.date === dateStr);
  };

  // 打勾 / 追加 / 扣減服藥邏輯
  const handleMedCheckClick = (med) => {
    const logs = getTakenLogsOnDate(med.id, selectedDate);
    if (logs.length > 0) {
      setConfirmModalMed(med);
    } else {
      addDoseLog(med);
    }
  };

  const addDoseLog = (med) => {
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

    setHistoryLogs([newLog, ...historyLogs]);
    setMedications(medications.map(m => m.id === med.id ? { ...m, stock: Math.max(0, m.stock - 1) } : m));
    setConfirmModalMed(null);

    // Mark 完歷史日子，自動跳返去「今日」
    if (selectedDate !== getTodayStr()) {
      setSelectedDate(getTodayStr());
    }
  };

  const removeOneDoseLog = (med) => {
    const logs = getTakenLogsOnDate(med.id, selectedDate);
    if (logs.length === 0) return;

    const lastLogId = logs[0].id;
    setHistoryLogs(historyLogs.filter(log => log.id !== lastLogId));
    setMedications(medications.map(m => m.id === med.id ? { ...m, stock: m.stock + 1 } : m));
    setConfirmModalMed(null);

    if (selectedDate !== getTodayStr()) {
      setSelectedDate(getTodayStr());
    }
  };

  // 📅 匯出 iOS / 系統日曆 (.ics) 提醒
  const exportToIosCalendar = (med) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const [hours, minutes] = (med.time || '08:00').split(':');

    const dtStart = `${year}${month}${day}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MeowMed//Cat Medication Reminder//ZH-HK',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:🐱 MeowMed 提醒：食 ${med.name}`,
      `DESCRIPTION:喵～該食藥啦！\\n藥物：${med.name}\\n劑量：${med.dosage || '1粒'}\\n備註：${med.notes || '無'}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtStart}`,
      'RRULE:FREQ=DAILY',
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
    link.setAttribute('download', `MeowMed_${med.name}_每日提醒.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showCatAlert(
      `已為你生成【${med.name}】嘅日曆檔！喺 iPhone 點擊下載嘅檔案，即可直接「新增每日 ${med.time} 定時響鬧」至 iOS 月曆 📅✨`,
      '喵喵日曆匯出成功 🐾'
    );
  };

  // 開啟 / 編輯 Modal
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', dosage: '1 粒', time: '08:00', stock: 30, notes: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (med) => {
    setEditingId(med.id);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      time: med.time,
      stock: med.stock !== undefined ? med.stock : 30,
      notes: med.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    const parsedStock = parseInt(formData.stock, 10) || 0;

    if (editingId) {
      setMedications(medications.map(m => m.id === editingId ? { ...formData, stock: parsedStock, id: editingId } : m));
    } else {
      setMedications([...medications, { ...formData, stock: parsedStock, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  // 刪除藥物（改用貓貓確認框）
  const deleteMedication = (med) => {
    showCatConfirm(
      `喵～確定要刪除【${med.name}】？刪除咗就記錄唔返㗎啦🐾`,
      () => {
        setMedications(medications.filter(m => m.id !== med.id));
      },
      '喵喵刪除確認 🐾'
    );
  };

  // 統計今日進度
  const todayDateStr = getTodayStr();
  const completedCount = medications.filter(m => getTakenLogsOnDate(m.id, todayDateStr).length > 0).length;

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-800 flex flex-col font-sans antialiased selection:bg-amber-200">
      
      {/* 置頂 Sticky Header */}
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100/80 border border-amber-200/70 flex items-center justify-center text-xl shadow-xs shrink-0">
            🐱
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">MeowMed</h1>
            <p className="text-[11px] text-amber-800/80 font-medium">人類服藥管家 🐾</p>
          </div>
        </div>
        <FontSizeControl />
      </header>

      {/* 主要內容區域 */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
        
        {/* 服藥者與貓貓 Mascot 卡片 */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-5 shadow-lg shadow-amber-600/20 relative overflow-hidden space-y-4">
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
              onClick={() => setCatMoodIndex((catMoodIndex + 1) % catQuotes.length)}
              className="bg-white/15 hover:bg-white/25 p-2.5 rounded-2xl backdrop-blur-md border border-white/20 transition active:scale-90 flex items-center gap-1.5 shadow-inner"
              title="點擊同貓貓互動"
            >
              <Cat className="w-6 h-6 text-amber-100" />
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center gap-2 text-xs text-amber-50 font-medium">
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

        {/* Tab 頁籤 */}
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

        {/* TAB 1: 服藥 Checklist */}
        {activeTab === 'today' && (
          <div className="space-y-3.5">
            
            {/* 日期選擇器與 Shortcut */}
            <div className="bg-white rounded-2xl p-3 border border-stone-200/70 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> 檢視/補Mark日期：
                </span>
                <input 
                  type="date" 
                  value={selectedDate}
                  max={getTodayStr()}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="text-xs font-semibold bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                      className={`flex-1 text-[11px] py-1.5 rounded-xl border font-bold transition-all ${
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
                const logs = getTakenLogsOnDate(med.id, selectedDate);
                const takenCount = logs.length;
                const isLowStock = med.stock <= 5;

                return (
                  <div 
                    key={med.id}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-200 space-y-3 ${
                      takenCount > 0 ? 'border-emerald-200 bg-emerald-50/20' : 'border-stone-200/80 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 pr-2">
                        {/* 打勾按鈕 */}
                        <button 
                          onClick={() => handleMedCheckClick(med)}
                          className="mt-0.5 transition active:scale-90 relative"
                        >
                          {takenCount > 0 ? (
                            <div className="relative">
                              <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                              {takenCount > 1 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white">
                                  x{takenCount}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Circle className="w-6 h-6 text-stone-300 hover:text-stone-400" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-bold text-sm ${takenCount > 0 ? 'text-stone-700' : 'text-stone-800'}`}>
                              {med.name}
                            </h3>
                            
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                              isLowStock ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-stone-100 text-stone-600'
                            }`}>
                              <Package className="w-3 h-3" /> 剩 {med.stock} {isLowStock && '(快完！)'}
                            </span>

                            {takenCount > 0 && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                今日已食 {takenCount} 次
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                              <Clock className="w-3 h-3 text-amber-600" /> {med.time}
                            </span>
                            <span className="font-medium text-stone-600">{med.dosage}</span>
                          </div>

                          {med.notes && (
                            <p className="text-xs text-stone-400 italic pt-0.5">{med.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* 編輯與刪除 */}
                      <div className="flex items-center gap-0.5">
                        <button 
                          onClick={() => openEditModal(med)}
                          className="text-stone-400 hover:text-amber-600 p-1.5 transition rounded-xl hover:bg-amber-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteMedication(med)}
                          className="text-stone-300 hover:text-rose-500 p-1.5 transition rounded-xl hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* ✨ 匯入 iOS 日曆按鈕（用戶可自主選擇） */}
                    <div className="pt-2 border-t border-stone-100 flex justify-end">
                      <button
                        onClick={() => exportToIosCalendar(med)}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/60 flex items-center gap-1.5 transition active:scale-95"
                      >
                        <BellRing className="w-3.5 h-3.5 text-amber-600" />
                        + 加至 iOS 日曆每日提醒 ({med.time})
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: 歷史 Log */}
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

      {/* 🐾 全局貓貓主題 Alert / Confirm Modal（代替原生 alert，無 GitHub domain） */}
      {catAlert.isOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-amber-100 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-700">
              <div className="p-2 bg-amber-100 rounded-2xl">
                <Cat className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-base text-stone-900">{catAlert.title}</h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-medium bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100/60">
              {catAlert.message}
            </p>

            <div className="flex gap-2 justify-end pt-1">
              {catAlert.type === 'confirm' ? (
                <>
                  <button
                    onClick={() => setCatAlert({ ...catAlert, isOpen: false })}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    考慮吓先
                  </button>
                  <button
                    onClick={() => {
                      if (catAlert.onConfirm) catAlert.onConfirm();
                      setCatAlert({ ...catAlert, isOpen: false });
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition"
                  >
                    確定刪除 🐾
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setCatAlert({ ...catAlert, isOpen: false })}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition"
                >
                  我知道啦 🐾
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 彈窗：追加 / 扣減服藥紀錄 */}
      {confirmModalMed && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-stone-100">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-1.5">
                <Cat className="w-5 h-5 text-amber-600" /> 服藥紀錄管理
              </h3>
              <button onClick={() => setConfirmModalMed(null)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-stone-700 text-sm">
              <p className="font-bold text-amber-700">{confirmModalMed.name}</p>
              <p className="text-xs text-stone-500">
                你在 <span className="font-bold">{selectedDate}</span> 已經記錄過服用這款藥物 
                <span className="font-bold text-emerald-600"> ({getTakenLogsOnDate(confirmModalMed.id, selectedDate).length} 次)</span>。
              </p>
              <p className="text-xs text-stone-600 pt-1">如果需要一日食多次（例如醫生指示追加一粒），可以點擊追加：</p>
            </div>

            <div className="space-y-2 pt-2">
              <button 
                onClick={() => addDoseLog(confirmModalMed)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" /> 追加服藥一次 (今日多食 1 劑)
              </button>
              <button 
                onClick={() => removeOneDoseLog(confirmModalMed)}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-rose-200"
              >
                <MinusCircle className="w-4 h-4" /> 扣減/取消 1 次紀錄
              </button>
              <button 
                onClick={() => setConfirmModalMed(null)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-2 rounded-xl text-xs"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 彈窗：新增 / 編輯 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-100 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900">
                {editingId ? '編輯藥物資料與庫存' : '新增藥物提醒'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">藥物名稱</label>
                <input
                  type="text"
                  required
                  placeholder="例如：降血壓藥 / 維他命C"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">每次服用劑量</label>
                  <input
                    type="text"
                    placeholder="例如：1 粒 / 10ml"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">預設服藥時間</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl p-2.5 text-sm font-semibold text-stone-800 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">目前剩餘數量 (庫存粒數)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="例如：30"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">備註 / 服用指示</label>
                <input
                  type="text"
                  placeholder="例如：餐後服用 / 溫水送服"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-amber-600/20 transition"
                >
                  {editingId ? '儲存修改' : '確定新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}