import React, { useState, useEffect } from 'react';
import { Pill, Clock, Plus, Trash2, CheckCircle2, Circle, Heart, Calendar, Cat, AlertCircle } from 'lucide-react';

export default function App() {
  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem('meowmed_meds');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Eye Drops', dosage: '1 drop', time: '08:00', given: false, notes: 'Left eye only' },
      { id: 2, name: 'Probiotics', dosage: '1 capsule', time: '19:00', given: false, notes: 'Mix with dinner' }
    ];
  });

  const [petName, setPetName] = useState(() => localStorage.getItem('meowmed_pet') || 'Mochi');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', time: '09:00', notes: '' });

  useEffect(() => {
    localStorage.setItem('meowmed_meds', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('meowmed_pet', petName);
  }, [petName]);

  const toggleDose = (id) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, given: !med.given } : med
    ));
  };

  const addMedication = (e) => {
    e.preventDefault();
    if (!newMed.name) return;
    setMedications([...medications, { ...newMed, id: Date.now(), given: false }]);
    setNewMed({ name: '', dosage: '', time: '09:00', notes: '' });
    setShowAddModal(false);
  };

  const deleteMed = (id) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const resetDaily = () => {
    setMedications(medications.map(m => ({ ...m, given: false })));
  };

  const completedCount = medications.filter(m => m.given).length;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 pb-12 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
              <Cat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-tight">MeowMed</h1>
              <p className="text-xs text-stone-500">Pet Medication & Care Tracker</p>
            </div>
          </div>
          <button 
            onClick={resetDaily}
            className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 px-3 py-1.5 rounded-lg font-medium transition"
          >
            Reset Doses
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Pet Profile Card */}
        <div className="bg-amber-600 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <span className="text-amber-200 text-xs font-semibold tracking-wider uppercase">Patient</span>
              <div className="flex items-center gap-2 mt-0.5">
                <input 
                  type="text" 
                  value={petName} 
                  onChange={(e) => setPetName(e.target.value)}
                  className="bg-transparent text-2xl font-bold focus:outline-none border-b border-amber-400/50 w-36"
                />
              </div>
              <p className="text-amber-100 text-sm mt-2 flex items-center gap-1.5">
                <Heart className="w-4 h-4 fill-amber-400 text-amber-400" />
                {completedCount} of {medications.length} doses given today
              </p>
            </div>
            <div className="bg-amber-500/50 p-3 rounded-full border border-amber-400/30">
              <Pill className="w-8 h-8 text-amber-100" />
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-stone-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-500" /> Today's Schedule
            </h2>
            <span className="text-xs font-semibold text-stone-400">{medications.length} total</span>
          </div>

          {medications.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-stone-400 border border-stone-200">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No medications scheduled.</p>
              <p className="text-xs mt-1">Tap below to add your first reminder.</p>
            </div>
          ) : (
            medications.map((med) => (
              <div 
                key={med.id}
                className={`bg-white rounded-xl p-4 border transition-all duration-200 flex items-center justify-between ${
                  med.given ? 'border-emerald-200 bg-emerald-50/30 opacity-75' : 'border-stone-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 pr-2">
                  <button 
                    onClick={() => toggleDose(med.id)}
                    className="mt-0.5 text-stone-400 hover:text-emerald-600 transition"
                  >
                    {med.given ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6 text-stone-300" />
                    )}
                  </button>
                  <div>
                    <h3 className={`font-semibold ${med.given ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                      {med.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                      <span className="flex items-center gap-1 font-medium bg-stone-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-stone-400" /> {med.time}
                      </span>
                      <span>{med.dosage}</span>
                    </div>
                    {med.notes && (
                      <p className="text-xs text-stone-400 mt-1.5 italic">{med.notes}</p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => deleteMed(med.id)}
                  className="text-stone-300 hover:text-rose-500 p-1 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-stone-800 hover:bg-stone-900 text-white font-medium py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-5 h-5" /> Add Medication
        </button>
      </main>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-stone-800">Add New Medication</h3>
            <form onSubmit={addMedication} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ear Drops"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 tablet"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">Time</label>
                  <input
                    type="time"
                    value={newMed.time}
                    onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                    className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Instructions / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Give after food"
                  value={newMed.notes}
                  onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium py-2.5 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-lg text-sm"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}