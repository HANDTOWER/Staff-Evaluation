import { useState, useEffect } from 'react';

// 1. 컴포넌트 선언부 추가
export default function EmployeeDirectory({ onClose }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Search term state
  const [searchTerm, setSearchTerm] = useState('');

  // 2. useEffect 선언부 추가
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        // API 경로는 실제 백엔드 설정에 맞게 수정 필요할 수 있음
        const res = await fetch('/api/employees', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to load employees');
        
        const data = await res.json();
        setEmployees(data);
        setTotalCount(data.length); 

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // 3. 필터링된 결과를 담을 변수명(filteredEmployees) 선언 추가
  // Search filtering logic (name, ID, department)
  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const name = emp.name?.toLowerCase() || '';
    const id = (emp.id || emp.employeeId || '').toString().toLowerCase();
    const dept = emp.department?.toLowerCase() || '';

    return name.includes(term) || id.includes(term) || dept.includes(term);
  });

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">groups</span>
              Employee Directory
            </h2>
            <p className="text-xs text-slate-500 font-bold mt-1">
              Total Staff: <span className="text-blue-600">{loading ? '...' : totalCount}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search bar section */}
        <div className="px-5 py-3 bg-white border-b border-slate-100 sticky top-0 z-10">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search by name, ID, or department..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="overflow-y-auto p-4 custom-scrollbar bg-slate-50/50 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Staff Data...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm font-bold border border-red-100">
              {error}
            </div>
          ) : filteredEmployees.length === 0 ? (
            // Show when no results
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">person_search</span>
                <p className="text-sm font-bold text-slate-400">No employees found matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredEmployees.map((emp) => (
                <div key={emp.id || emp.employeeId} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:border-blue-300 hover:shadow-md transition-all group cursor-default">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shrink-0">
                    <span className="material-symbols-outlined font-variation-fill text-2xl">person</span>
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate">{emp.name}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{emp.id || emp.employeeId}</span>
                      <span className="truncate text-blue-600">{emp.department || 'N/A'}</span>
                    </div>
                    {emp.position && <p className="text-[10px] text-slate-400 truncate">{emp.position}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-white text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              Showing {filteredEmployees.length} of {totalCount} Staff
            </p>
        </div>
      </div>
    </div>
  );
}