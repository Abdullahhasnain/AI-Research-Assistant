import React from 'react';
import { MedicalRecord, User } from '../types';
import { 
  Activity, 
  User as UserIcon, 
  Clock, 
  AlertCircle, 
  FileText, 
  Siren, 
  LayoutDashboard, 
  Users, 
  ClipboardCheck,
  Calendar,
  BadgeCheck
} from 'lucide-react';

interface SidebarProps {
  data: MedicalRecord;
  currentUser: User | null;
}

const SummaryCard = ({ label, value, color, icon: Icon }: any) => (
  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
    <div className={`p-2 rounded-full opacity-10 ${color.replace('text-', 'bg-')}`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
  </div>
);

const RiskIndicator = ({ level }: { level: string }) => {
  const normalized = level.toLowerCase();
  if (normalized.includes('high')) return <span className="flex items-center text-red-600 font-bold"><div className="w-2 h-2 rounded-full bg-red-600 mr-2 animate-pulse"></div>High Risk</span>;
  if (normalized.includes('moderate')) return <span className="flex items-center text-orange-600 font-bold"><div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>Moderate</span>;
  return <span className="flex items-center text-green-600 font-bold"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>Low Risk</span>;
};

export const Sidebar: React.FC<SidebarProps> = ({ data, currentUser }) => {
  const isHighRisk = data.risk_category?.toLowerCase().includes('high');

  return (
    <div className="bg-slate-50 border-l border-slate-200 w-full md:w-[28rem] flex-shrink-0 h-full overflow-y-auto flex flex-col">
      
      {/* Dashboard Header */}
      <div className="bg-white p-5 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <LayoutDashboard className="w-5 h-5 mr-2 text-teal-600" />
            {currentUser ? `${currentUser.role} Dashboard` : 'Dashboard'}
          </h2>
          {currentUser && (
             <div className="flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
               <UserIcon className="w-3 h-3 mr-1" />
               <span className="font-medium">{currentUser.name}</span>
             </div>
          )}
        </div>

        {/* Mock Summary Panel */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard label="Total Patients" value="12" color="text-slate-700" icon={Users} />
          <SummaryCard label="High Risk" value="3" color="text-red-600" icon={Siren} />
          <SummaryCard label="Pending Labs" value="5" color="text-blue-600" icon={FileText} />
          <SummaryCard label="Follow-ups" value="8" color="text-teal-600" icon={Calendar} />
        </div>
      </div>

      {/* Active Patient Card */}
      <div className="p-4 flex-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">
          Active Patient Assessment
        </h3>

        <div className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden ${isHighRisk ? 'border-red-500' : 'border-transparent'}`}>
          
          {/* Patient Header */}
          <div className={`p-4 ${isHighRisk ? 'bg-red-50' : 'bg-slate-50'} border-b border-slate-100 flex justify-between items-start`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-slate-800">{data.name}</h2>
                <span className="text-xs font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                  {data.patient_id || "ID-###"}
                </span>
              </div>
              <div className="text-sm text-slate-500 flex gap-3">
                <span>{data.age} yrs</span>
                <span>•</span>
                <span>{data.gender}</span>
              </div>
            </div>
            {isHighRisk && <Siren className="w-6 h-6 text-red-600 animate-bounce" />}
          </div>

          {/* Risk & Action */}
          <div className="p-4 grid grid-cols-2 gap-4 border-b border-slate-100">
            <div>
              <label className="text-[10px] uppercase text-slate-400 font-bold">Risk Category</label>
              <div className="mt-1"><RiskIndicator level={data.risk_category || "Unknown"} /></div>
            </div>
            <div>
              <label className="text-[10px] uppercase text-slate-400 font-bold">Action</label>
              <div className={`mt-1 font-bold ${isHighRisk ? 'text-red-700' : 'text-teal-700'}`}>
                {data.suggested_action}
              </div>
            </div>
          </div>

          {/* Clinical Details */}
          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-center text-slate-400 mb-1">
                <Activity className="w-3 h-3 mr-1.5" />
                <label className="text-xs font-bold uppercase">Chief Complaint</label>
              </div>
              <p className="text-sm text-slate-800 font-medium">{data.chief_complaint}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-slate-400 mb-1">
                  <Clock className="w-3 h-3 mr-1.5" />
                  <label className="text-xs font-bold uppercase">Duration</label>
                </div>
                <p className="text-sm text-slate-800">{data.duration}</p>
              </div>
              <div>
                <div className="flex items-center text-slate-400 mb-1">
                  <AlertCircle className="w-3 h-3 mr-1.5" />
                  <label className="text-xs font-bold uppercase">Pain (1-10)</label>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${Number(data.pain_severity_1to10) > 7 ? 'bg-red-500' : 'bg-teal-500'}`} 
                      style={{ width: `${(Number(data.pain_severity_1to10) || 0) * 10}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-bold text-slate-700">{data.pain_severity_1to10}/10</span>
                </div>
              </div>
            </div>

            {data.pre_existing_conditions?.length > 0 && (
              <div>
                <div className="flex items-center text-slate-400 mb-2">
                  <ClipboardCheck className="w-3 h-3 mr-1.5" />
                  <label className="text-xs font-bold uppercase">History</label>
                </div>
                <div className="flex flex-wrap gap-1">
                  {data.pre_existing_conditions.map((c, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Status */}
            <div className={`rounded-lg p-3 flex items-center justify-between ${data.reports_attached ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50 border border-slate-100'}`}>
              <div className="flex items-center">
                <FileText className={`w-4 h-4 mr-2 ${data.reports_attached ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold ${data.reports_attached ? 'text-indigo-700' : 'text-slate-500'}`}>
                  {data.reports_attached ? 'Reports Attached' : 'No Reports'}
                </span>
              </div>
              {data.reports_attached && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">REVIEW</span>}
            </div>
            
            {/* Access Control Visual */}
            {currentUser && (
               <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-center text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <BadgeCheck className="w-3 h-3 mr-1" />
                  Authorized: {currentUser.role} Access
               </div>
            )}
          </div>
          
          {/* Footer Time */}
          <div className="bg-slate-50 p-2 text-center border-t border-slate-100">
            <span className="text-[10px] text-slate-400">
              Updated: {data.timestamp}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
