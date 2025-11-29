import React, { useState } from 'react';
import { AppView } from './types';
import { ChatInterface } from './components/ChatInterface';
import { TaskManager } from './components/TaskManager';
import { DailyPlanner } from './components/DailyPlanner';
import { 
  IconHome, 
  IconListTodo, 
  IconMessageSquare, 
  IconCalendarClock,
  IconMenu 
} from './components/Icons';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dashboard is just a summary view redirecting to features
  const renderContent = () => {
    switch (currentView) {
      case AppView.TASKS:
        return <TaskManager />;
      case AppView.CHAT:
        return <ChatInterface />;
      case AppView.PLANNER:
        return <DailyPlanner />;
      case AppView.DASHBOARD:
      default:
        return (
          <div className="flex flex-col h-full justify-center items-center space-y-6 text-center p-6">
            <div className="w-24 h-24 bg-primary-100 rounded-3xl flex items-center justify-center mb-2 overflow-hidden shadow-sm">
              <img 
                src="https://flagcdn.com/w160/tr.png" 
                alt="Türk Bayrağı" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Hoş Geldiniz, Ben TURAN.</h1>
            <p className="text-gray-500 max-w-md">
              Bugün üretkenliğinizi artırmak için buradayım. Görevlerinizi yönetebilir, günü planlayabilir veya aklınızdaki soruları cevaplayabilirim.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-8">
              <button 
                onClick={() => setCurrentView(AppView.TASKS)}
                className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IconListTodo className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Görevler</h3>
                <p className="text-xs text-gray-500">Yapılacakları listele ve AI ile yönet.</p>
              </button>

              <button 
                onClick={() => setCurrentView(AppView.PLANNER)}
                className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
              >
                 <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IconCalendarClock className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Planlayıcı</h3>
                <p className="text-xs text-gray-500">Karmaşık gününü saniyeler içinde planla.</p>
              </button>

              <button 
                onClick={() => setCurrentView(AppView.CHAT)}
                className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
              >
                 <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IconMessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Sohbet</h3>
                <p className="text-xs text-gray-500">Her konuda yardım iste veya sohbet et.</p>
              </button>
            </div>
          </div>
        );
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        currentView === view
          ? 'bg-primary-50 text-primary-700 font-medium'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-5 h-5 ${currentView === view ? 'text-primary-600' : 'text-gray-400'}`} />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden relative">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full p-4">
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center overflow-hidden">
             <img src="https://flagcdn.com/w40/tr.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-xl text-gray-800 tracking-tight">TURAN</span>
        </div>
        
        <nav className="space-y-1 flex-1">
          <NavItem view={AppView.DASHBOARD} icon={IconHome} label="Ana Sayfa" />
          <NavItem view={AppView.TASKS} icon={IconListTodo} label="Görevler" />
          <NavItem view={AppView.PLANNER} icon={IconCalendarClock} label="Planlayıcı" />
          <NavItem view={AppView.CHAT} icon={IconMessageSquare} label="Sohbet" />
        </nav>

        <div className="mt-auto space-y-4">
          <div className="px-4 py-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">KVKK Aydınlatma Metni</p>
            <p className="text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer transition-colors mt-1">Gizlilik Politikası</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Gemini 2.5 Flash tarafından güçlendirilmiştir.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 md:hidden border-r border-gray-200 p-4 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8 px-2 mt-2">
           <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center overflow-hidden">
               <img src="https://flagcdn.com/w40/tr.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xl text-gray-800">TURAN</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1">
            <IconMenu className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <nav className="space-y-1 flex-1">
          <NavItem view={AppView.DASHBOARD} icon={IconHome} label="Ana Sayfa" />
          <NavItem view={AppView.TASKS} icon={IconListTodo} label="Görevler" />
          <NavItem view={AppView.PLANNER} icon={IconCalendarClock} label="Planlayıcı" />
          <NavItem view={AppView.CHAT} icon={IconMessageSquare} label="Sohbet" />
        </nav>
        <div className="px-4 py-4 border-t border-gray-100 mt-auto">
            <p className="text-[10px] text-gray-400">KVKK ve Gizlilik</p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
              <IconMenu className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="font-semibold text-gray-800 capitalize">
              {currentView === AppView.DASHBOARD ? 'Ana Sayfa' : 
               currentView === AppView.TASKS ? 'Görevler' : 
               currentView === AppView.PLANNER ? 'Planlayıcı' : 'Sohbet'}
            </h1>
          </div>
          <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden">
            <img src="https://flagcdn.com/w40/tr.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-hidden p-4 md:p-8 max-w-5xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;