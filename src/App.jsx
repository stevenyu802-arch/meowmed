import React, { useState, useEffect } from 'react';
import { Pill, Clock, Plus, Trash2, Edit2, CheckCircle2, Circle, Heart, Calendar, Cat, RotateCcw, History, Check, X, AlertCircle, Package } from 'lucide-react';

export default function App() {
  // 1. 藥物基本資料（含剩餘數量 stock）
  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem('meowmed_meds');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: '血壓藥 / 慢性病藥', dosage: '1 粒', time: '08:00', stock: 30, notes: '早餐後溫水送服' },
      { id: 2, name: '綜合維他命', dosage: '1 粒', time: '13:00', stock: 15, notes: '午餐後服' },
      { id: 3, name: '胃藥 / 固腸丸', dosage: '2 粒', time: '21:00', stock: 6, notes: '睡前服' }
    ];
  });

  // 2. 歷來紀錄 History Logs
  const [historyLogs, setHistoryLogs] = useState(() => {
    const saved = localStorage.getItem('meowmed_history');
    if (!saved) return [];
    
    // 自動清理超過 60 日（2個月）嘅舊紀錄
    const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
    const parsed = JSON.parse(saved);
    return parsed.filter(log => log.timestamp >= sixtyDaysAgo);
  });

  // 3. 服藥者名稱與日期選擇
  const [userName, setUserName] = useState(() => localStorage.getItem('meowmed_username') || '自己');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'history'

  // 4. Modal 控制（新增 / 編輯）
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', dosage: '', time: '08:00', stock: 30, notes: '' });

  // 儲存至 LocalStorage
  useEffect(() => {
    localStorage.setItem('meowmed_meds', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    // 每次更新時確保過濾掉 60 日前嘅紀錄
    const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
    const validLogs = historyLogs.filter(log => log.timestamp >= sixtyDaysAgo);
    localStorage.setItem('meowmed_history', JSON.stringify(validLogs));
  }, [historyLogs]);

  useEffect(() => {
    localStorage.setItem('meowmed_username', userName);
  }, [userName]);

  // 開啟「新增」Modal
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', dosage: '', time: '09:00', stock: 30, notes: '' });
    setIsModalOpen(true);
  };

  // 開啟「編輯」Modal
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

  // 提交表格（新增/編輯）
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const parsedStock = parseInt(formData.stock, 10) || 0;

    if (editingId) {
      setMedications(medications.map(m => m.id === editingId ? { ...formData, stock: parsedStock, id: editingId } : m));
    } else {
      const newMed = { ...formData, stock: parsedStock, id: Date.now() };
      setMedications([...medications, newMed]);
    }
    setIsModalOpen(false);
  };

  // 刪除藥物
  const deleteMedication = (id) => {
    if (window.confirm('確定要刪除這款藥物？')) {
      setMedications(medications.filter(m => m.id !== id));
    }
  };

  // 檢查選定日期某藥物是否已食
  const isTakenOnDate = (medId, dateStr) => {
    return historyLogs.some(log => log.medId === medId && log.date === dateStr);
  };

  // 切換服藥狀態（支援補 Mark 返前一兩日）
  const toggleTakenForDate = (med) => {
    const alreadyTaken = isTakenOnDate(med.id, selectedDate);

    if (alreadyTaken) {
      // 取消 Mark：移除該日紀錄 + 補回 1 個庫存
      setHistoryLogs(historyLogs.filter(log => !(log.medId === med.id && log.date === selectedDate)));
      setMedications(medications.map(m => m.id === med.id ? { ...m, stock: m.stock + 1 } : m));
    } else {
      // Mark 已食：新增 Log + 扣減 1 個庫存
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5); // HH:mm
      
      const newLog = {
        id: Date.now(),
        medId: med.id,
        medName: med.name,
        dosage: med.dosage,
        date: selectedDate, // 選定嘅日期（可補 Mark 舊日子）
        timeStr: timeStr,
        timestamp: Date.now()
      };

      setHistoryLogs([newLog, ...historyLogs]);
      setMedications(medications.map(m => m.id === med.id ? { ...m, stock: Math.max(0, m.stock - 1) } : m));
    }
  };

  // 快捷切換日期 (今天 / 昨天 / 前天)
  const setQuickDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const completedTodayCount = medications.filter(m => isTakenOnDate(m.id, selectedDate)).length;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 flex flex-col font-sans antialiased">
      
      {/* 頂部 Sticky Header（修復置頂遮擋 BUG） */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-2xl">
              <Cat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base text-stone-900 tracking-tight leading-tight">MeowMed</h1>
              <p className="text-[11px] font-medium text-stone-400">人類服藥管家 🐾</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={openAddModal}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> 新增藥物
            </button>
          </div>
        </div>
      </header>

      {/* 主要內容區塊（使用 flex-1 確保 Layout 不重疊） */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
        
        {/* 個人與進度卡片 */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-3xl p-5 shadow-lg shadow-amber-600/15 relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-amber-200/90 text-[11px] font-bold tracking-wider uppercase">服藥者名字</span>
              <div>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-transparent text-xl font-black focus:outline-none border-b border-amber-300/40 pb-0.5 w-36 tracking-tight text-white"
                />
              </div>
              <p className="text-amber-100/90 text-xs pt-1.5 flex items-center gap-1 font-medium">
                <Heart className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                所選日期已完成：{completedTodayCount} / {medications.length} 款
              </p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
              <Pill className="w-6 h-6 text-amber-100" />
            </div>
          </div>
        </div>

        {/* Tab 頁籤：今日清單 / 歷來 Log */}
        <div className="flex bg-stone-200/70 p-1 rounded-2xl text-xs font-bold text-stone-600">
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

        {/* TAB 1: 服藥 Checklist (可切換日期與補 Mark) */}
        {activeTab === 'today' && (
          <div className="space-y-3.5">
            
            {/* 日期選擇器與補 Mark 選項 */}
            <div className="bg-white rounded-2xl p-3 border border-stone-200/70 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> 檢視/補打勾日期：
                </span>
                <input 
                  type="date" 
                  value={selectedDate}
                  max={todayStr}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-semibold bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* 快捷按鈕 */}
              <div className="flex gap-1.5 pt-1">
                <button 
                  onClick={() => setQuickDate(0)}
                  className={`flex-1 text-[11px] py-1 rounded-lg border font-medium transition ${
                    selectedDate === todayStr ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold' : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}
                >
                  今日
                </button>
                <button 
                  onClick={() => setQuickDate(1)}
                  className="flex-1 text-[11px] py-1 rounded-lg border bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 font-medium transition"
                >
                  昨日 (補Mark)
                </button>
                <button 
                  onClick={() => setQuickDate(2)}
                  className="flex-1 text-[11px] py-1 rounded-lg border bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 font-medium transition"
                >
                  前日 (補Mark)
                </button>
              </div>
            </div>

            {/* 藥物清單 */}
            {medications.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/60 shadow-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="text-sm font-medium text-stone-600">暫時未有藥物紀錄</p>
                <p className="text-xs text-stone-400 mt-1">點擊右上角「新增藥物」加入第一款藥</p>
              </div>
            ) : (
              medications.map((med) => {
                const taken = isTakenOnDate(med.id, selectedDate);
                const isLowStock = med.stock <= 5;

                return (
                  <div 
                    key={med.id}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-200 flex items-center justify-between ${
                      taken ? 'border-emerald-200 bg-emerald-50/20 opacity-80' : 'border-stone-200/80 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 pr-2">
                      <button 
                        onClick={() => toggleTakenForDate(med)}
                        className="mt-0.5 transition active:scale-90"
                        title={taken ? '取消紀錄' : '標示為已食'}
                      >
                        {taken ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                        ) : (
                          <Circle className="w-6 h-6 text-stone-300 hover:text-stone-400" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-bold text-sm ${taken ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                            {med.name}
                          </h3>
                          
                          {/* 剩餘數量標籤 */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                            isLowStock ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-stone-100 text-stone-600'
                          }`}>
                            <Package className="w-3 h-3" /> 剩 {med.stock} {isLowStock && '(快完！)'}
                          </span>
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

                    {/* 編輯與刪除按鈕 */}
                    <div className="flex items-center gap-0.5">
                      <button 
                        onClick={() => openEditModal(med)}
                        className="text-stone-400 hover:text-amber-600 p-2 transition rounded-xl hover:bg-amber-50"
                        title="編輯藥物與庫存"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteMedication(med.id)}
                        className="text-stone-300 hover:text-rose-500 p-2 transition rounded-xl hover:bg-rose-50"
                        title="刪除藥物"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: 歷來紀錄 Log (保留最近 60 日) */}
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
                <p className="text-xs text-stone-400 mt-1">每次打勾服藥後，紀錄會自動存於此處</p>
              </div>
            ) : (
              <div className="space-y-2">
                {historyLogs.map((log) => (
                  <div key={log.id} className="bg-white rounded-2xl p-3.5 border border-stone-200/70 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100/70 text-emerald-600 rounded-xl">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-800">{log.medName}</h4>
                        <p className="text-xs text-stone-500">劑量：{log.dosage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg inline-block">
                        {log.date}
                      </span>
                      <p className="text-[10px] text-stone-400 pt-0.5">{log.timeStr} 記錄</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 新增 / 編輯 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-100 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex justify-between items-center">
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
                  className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">每次服用劑量</label>
                  <input
                    type="text"
                    placeholder="例如：1 粒 / 10ml"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">預設服藥時間</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">目前剩餘數量 (庫存)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="例如：30"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">備註 / 服用指示</label>
                <input
                  type="text"
                  placeholder="例如：餐後服用 / 需配大量溫水"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-3 rounded-xl text-sm transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-amber-600/20 transition"
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