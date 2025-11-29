import React, { useState } from 'react';
import { generateDailyPlan } from '../services/geminiService';
import { PlannerResult } from '../types';
import { IconCalendarClock, IconWand, IconLoader } from './Icons';

export const DailyPlanner: React.FC = () => {
  const [notes, setNotes] = useState('');
  const [plan, setPlan] = useState<PlannerResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!notes.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await generateDailyPlan(notes);
      setPlan(result);
    } catch (error) {
      alert("Plan oluşturulamadı. Lütfen tekrar dene.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
          <IconCalendarClock className="text-primary-600 w-5 h-5" />
          Akıllı Günlük Planlayıcı
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Yapman gerekenleri, toplantılarını ve hedeflerini dağınık bir şekilde yaz. Yapay zeka senin için günü planlasın.
        </p>
        
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Örnek: Sabah 9'da kalkacağım. Markete gitmem lazım. Akşam 5'te spor yapacağım. 2 saat ders çalışmalıyım..."
          className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm mb-4"
        />
        
        <button
          onClick={handleGenerate}
          disabled={isLoading || !notes.trim()}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <IconLoader className="w-5 h-5" />
              Planlanıyor...
            </>
          ) : (
            <>
              <IconWand className="w-5 h-5" />
              Planı Oluştur
            </>
          )}
        </button>
      </div>

      {plan && (
        <div className="flex-1 overflow-y-auto space-y-4 pb-20 md:pb-0">
          {/* Tips Section */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <h3 className="text-orange-800 font-semibold text-sm mb-2 flex items-center gap-2">
              💡 Günün İpuçları
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {plan.tips.map((tip, idx) => (
                <li key={idx} className="text-xs text-orange-700">{tip}</li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700">Günlük Akış</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {plan.schedule.map((item, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex gap-4">
                  <div className="w-24 flex-shrink-0 text-sm font-bold text-primary-600">
                    {item.time}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">{item.activity}</h4>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setPlan(null)}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Yeni Plan Oluştur
          </button>
        </div>
      )}
    </div>
  );
};