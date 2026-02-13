import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'

// ✅ 컴포넌트 이름: EvaManagement
export default function EvaManagement() {
  const navigate = useNavigate()
  
  // Tab state: 'evaluations' (default) or 'evaluators'
  const [activeTab, setActiveTab] = useState('evaluations')
  
  // Data state
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  
  // 1. Admin permission check
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role !== 'ADMIN') {
        alert("Access Denied: Admins Only")
        navigate('/') 
      }
    } else {
      navigate('/login')
    }
  }, [navigate])

  // 2. Fetch data when tab changes
  useEffect(() => {
    fetchData()
  }, [activeTab])

  // ✅ 함수 선언 추가 (const fetchData =)
  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem('authToken')
    
    // Switch API endpoint by tab
    const endpoint = activeTab === 'evaluations' ? '/api/evaluations' : '/api/evaluators'

    try {
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const jsonData = await res.json()
        // Sort latest first (assumes numeric ID)
        const sorted = Array.isArray(jsonData) ? jsonData.reverse() : []
        setData(sorted)
      } else {
        console.error("Failed to fetch data")
        setData([])
      }
    } catch (e) {
      console.error(e)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ 함수 선언 추가 (const handleDelete =)
  // 3. Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;

    const token = localStorage.getItem('authToken')
    
    // Switch delete API endpoint by tab
    const endpoint = activeTab === 'evaluations' 
      ? `/api/evaluations/${id}` 
      : `/api/evaluators/${id}`

    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        alert("Deleted successfully.")
        // Remove from UI immediately
        setData(prev => prev.filter(item => (item.id || item.employeeId) !== id))
        // Resync data
        fetchData()
      } else {
        alert("Failed to delete.")
      }
    } catch (e) {
      console.error(e)
      alert("Error occurred.")
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen font-[--font-display]">
      <AppHeader 
        title="Admin Dashboard" 
        subtitle="System Management Center" 
        icon="admin_panel_settings"
        showBack 
        rightSlot={
          <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase">
            Admin Mode
          </div>
        }
      />

      <main className="max-w-7xl mx-auto p-6">
        
        {/* Tab navigation (switch views here) */}
        <div className="flex gap-6 border-b border-slate-200 mb-6">
          <button 
            onClick={() => setActiveTab('evaluations')}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all border-b-2 
              ${activeTab === 'evaluations' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
              }`}
          >
            <span className="material-symbols-outlined text-[20px]">history_edu</span>
            Assessment Logs
          </button>
          
          <button 
            onClick={() => setActiveTab('evaluators')}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all border-b-2 
              ${activeTab === 'evaluators' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
              }`}
          >
            <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
            Evaluator Accounts
          </button>
        </div>

        {/* Content area */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-80 gap-3">
               <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Data...</p>
             </div>
          ) : data.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-80 text-slate-400">
               <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">inbox</span>
               <p className="text-sm font-bold">No records found.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {/* Switch header by tab */}
                    {activeTab === 'evaluations' ? (
                      <>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase w-20">ID</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase">Target Staff</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase">Score</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase">Status</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase">Date</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase text-right">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase w-20">ID</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase">Username</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase">Role</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase text-right">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Assessment logs rows */}
                      {activeTab === 'evaluations' && (
                        <>
                          <td className="p-4 text-xs font-mono text-slate-400">#{item.id}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <span className="material-symbols-outlined text-sm">person</span>
                              </div>
                              <div>
                                {/* Target staff ID or name */}
                                <p className="text-sm font-bold text-slate-800">{item.employeeId || 'Unknown'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm font-black text-slate-800">
                            {item.score !== undefined ? Math.round(item.score) : '--'}
                          </td>
                          <td className="p-4">
                             <StatusBadge passed={item.passed} score={item.score} />
                          </td>
                          <td className="p-4 text-xs font-bold text-slate-500">
                            {item.evaluatedAt ? new Date(item.evaluatedAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              title="Delete Record"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </td>
                        </>
                      )}

                      {/* Evaluator accounts rows */}
                      {activeTab === 'evaluators' && (
                        <>
                          <td className="p-4 text-xs font-mono text-slate-400">#{item.id}</td>
                          <td className="p-4">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                  <span className="material-symbols-outlined text-sm">badge</span>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{item.username || item.name}</p>
                                  <p className="text-[10px] text-slate-400 uppercase">{item.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase
                              ${item.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}
                            `}>
                              {item.role || 'Evaluator'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              title="Remove Evaluator"
                            >
                              <span className="material-symbols-outlined text-[20px]">person_remove</span>
                            </button>
                          </td>
                        </>
                      )}
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Simple status badge component (PASS for 80+)
function StatusBadge({ passed, score }) {
  const isPass = (score >= 80) || passed === true;
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${
      isPass 
        ? 'bg-green-50 text-green-600 border-green-100' 
        : 'bg-red-50 text-red-600 border-red-100'
    }`}>
      {isPass ? 'PASS' : 'FAIL'}
    </span>
  )
}