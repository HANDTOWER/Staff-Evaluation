import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'

// 1. 컴포넌트 선언부 추가 (AdminDashboard)
export default function AdminDashboard() {
  const navigate = useNavigate()
  
  // Tab state
  const [activeTab, setActiveTab] = useState('employees')
  
  // Data list and loading state
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Stats state
  const [stats, setStats] = useState({
    passRate: 0,
    countToday: 0
  })

  // Search state
  const [searchType, setSearchType] = useState('name')
  const [searchTerm, setSearchTerm] = useState('')

  // Inline edit state (employees tab)
  const [editingId, setEditingId] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

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

  // 2. Fetch initial data and stats
  useEffect(() => {
    fetchData()       
    fetchStats()      
    setEditingId(null)
    setSearchTerm('') 
  }, [activeTab])

  // Format today's date
  const getTodayString = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  // 2. 함수명 선언 추가 (const fetchStats =)
  // Fetch stats API
  const fetchStats = async () => {
    const token = localStorage.getItem('authToken')
    try {
      const rateRes = await fetch('/api/evaluations/passrate', { headers: { 'Authorization': `Bearer ${token}` } })
      const rateData = rateRes.ok ? await rateRes.json() : 0

      const countRes = await fetch('/api/evaluations/countPerDay', { headers: { 'Authorization': `Bearer ${token}` } })
      const countData = countRes.ok ? await countRes.json() : 0

      setStats({
        passRate: typeof rateData === 'number' ? rateData : 0, 
        countToday: typeof countData === 'number' ? countData : 0
      })
    } catch (e) {
      console.error("Stats fetch error:", e)
    }
  }

  // 3. 함수명 선언 추가 (const fetchData =)
  // Fetch list data API
  const fetchData = async (isSearch = false) => {
    setLoading(true)
    const token = localStorage.getItem('authToken')
    
    let endpoint = ''

    if (activeTab === 'employees') {
        endpoint = '/api/employees'
    } 
    else if (activeTab === 'evaluators') {
        endpoint = '/api/evaluators'
    } 
    else { 
        if (isSearch && searchTerm.trim() !== '') {
            if (searchType === 'name') {
                endpoint = `/api/evaluations/employee/by-name/${searchTerm}`
            } else {
                endpoint = `/api/evaluations/employee/by-id/${searchTerm}`
            }
        } else {
            endpoint = '/api/evaluations'
        }
    }

    try {
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const jsonData = await res.json()
        const sorted = Array.isArray(jsonData) ? jsonData.reverse() : (Array.isArray(jsonData) ? jsonData : [jsonData])
        setData(Array.isArray(sorted) ? sorted : [])
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

  // 4. 함수명 선언 추가 (const handleSearch =)
  const handleSearch = (e) => {
    e.preventDefault()
    fetchData(true)
  }

  const handleResetSearch = () => {
    setSearchTerm('')
    fetchData(false)
  }

  // Employee edit/delete handlers
  const handleEditClick = (employee) => {
    setEditingId(employee.id)
    setEditFormData({
      name: employee.name || '',
      position: employee.position || '',
      department: employee.department || ''
    })
  }

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
  }

  const handleCancelClick = () => {
    setEditingId(null)
    setEditFormData({})
  }

  // 5. 함수명 선언 추가 (const handleSaveClick =)
  const handleSaveClick = async (id) => {
    const token = localStorage.getItem('authToken')
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editFormData)
      })
      if (res.ok) {
        alert("Updated successfully.")
        setData(prev => prev.map(item => item.id === id ? { ...item, ...editFormData } : item))
        setEditingId(null)
      } else {
        const err = await res.text()
        alert(`Update failed: ${err}`)
      }
    } catch (e) { console.error(e); alert("An error occurred.") }
  }

  // 6. 함수명 선언 추가 (const handleDelete =)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    const token = localStorage.getItem('authToken')
    let endpoint = ''
    if (activeTab === 'employees') endpoint = `/api/employees/${id}`
    else if (activeTab === 'evaluators') endpoint = `/api/evaluators/${id}`
    else endpoint = `/api/evaluations/${id}`

    try {
      const res = await fetch(endpoint, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      if (res.ok) {
        alert("Deleted.")
        setData(prev => prev.filter(item => item.id !== id))
      } else alert("Delete failed.")
    } catch (e) { console.error(e); alert("An error occurred.") }
  }

  // 7. 함수명 선언 추가 (const handleOpenDetail =)
  // Open detail modal
  const handleOpenDetail = async (id) => {
    setShowModal(true)
    setModalLoading(true)
    setModalData(null)
    
    const token = localStorage.getItem('authToken')
    try {
      const res = await fetch(`/api/evaluations/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setModalData(data)
      } else {
        alert("Failed to load detail information.")
        setShowModal(false)
      }
    } catch (e) {
      console.error(e)
      alert("An error occurred.")
      setShowModal(false)
    } finally {
      setModalLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setModalData(null)
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
        {/* Stats widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex-1 pr-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Today's Evaluations</p>
                    <div className="flex items-center justify-between w-full">
                        <span className="text-xl font-bold text-slate-500 tracking-tight">{getTodayString()}</span>
                        <p className="text-3xl font-black text-slate-900">{stats.countToday}</p>
                    </div>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                    <span className="material-symbols-outlined">today</span>
                </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pass Rate</p>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-black text-slate-900">
                            {Math.round(Number(stats.passRate))}%
                        </p>
                        <span className={`text-sm font-bold mb-1 ${stats.passRate >= 80 ? 'text-green-500' : 'text-red-500'}`}>
                            {stats.passRate >= 80 ? 'Good' : 'Needs Improvement'}
                        </span>
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${stats.passRate >= 80 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    <span className="material-symbols-outlined">donut_large</span>
                </div>
            </div>
        </div>
        {/* Tabs and search area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 mb-6 gap-4">
            <div className="flex gap-6 overflow-x-auto">
              <button onClick={() => setActiveTab('employees')} className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${activeTab === 'employees' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                <span className="material-symbols-outlined">badge</span> Employee Management
              </button>
              <button onClick={() => setActiveTab('evaluators')} className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${activeTab === 'evaluators' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                <span className="material-symbols-outlined">manage_accounts</span> Evaluator Management
              </button>
              <button onClick={() => setActiveTab('evaluations')} className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${activeTab === 'evaluations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                <span className="material-symbols-outlined">history_edu</span> Assessment Logs
              </button>
            </div>

            {activeTab === 'evaluations' && (
                <form onSubmit={handleSearch} className="flex gap-2 pb-2 md:pb-3 w-full md:w-auto">
                    <select 
                        value={searchType} 
                        onChange={(e) => setSearchType(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="name">Name</option>
                        <option value="id">ID</option>
                    </select>
                    <div className="relative flex-1 md:w-64">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">search</span>
                        <input 
                            type="text" 
                            placeholder="Search logs..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        Search
                    </button>
                    {searchTerm && (
                        <button type="button" onClick={handleResetSearch} className="px-3 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
                            Reset
                        </button>
                    )}
                </form>
            )}
        </div>
        {/* Data table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-80 gap-3">
               <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
             </div>
          ) : data.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-80 text-slate-400">
               <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">search_off</span>
               <p className="text-sm font-bold">No records found.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {activeTab === 'employees' ? (
                      <>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase w-24">ID</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase">Name</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase">Position / Dept</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase text-right w-48">Actions</th>
                      </>
                    ) : activeTab === 'evaluators' ? (
                      <>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase w-24">ID</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase">Username</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase">Role</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase text-right w-24">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase w-24">Log ID</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase w-32">Emp ID</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase">Target Staff</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase w-20">Score</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase w-64">Violations</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase">Status</th>
                        {/* Detail column */}
                        <th className="p-4 text-xs font-black text-slate-500 uppercase text-right w-24">Detail</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {activeTab === 'employees' && (
                        <>
                          {editingId === item.id ? (
                            <>
                              <td className="p-4 text-xs font-mono text-slate-400">{item.id}</td>
                              <td className="p-4">
                                <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="w-full px-3 py-1.5 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col gap-2">
                                  <input type="text" name="position" placeholder="Position" value={editFormData.position} onChange={handleEditChange} className="w-full px-2 py-1 border border-blue-300 rounded text-xs focus:outline-none" />
                                  <input type="text" name="department" placeholder="Dept" value={editFormData.department} onChange={handleEditChange} className="w-full px-2 py-1 border border-blue-300 rounded text-xs focus:outline-none" />
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleSaveClick(item.id)} className="px-3 py-1.5 rounded-lg bg-green-600 text-white font-bold text-xs hover:bg-green-700 shadow-sm">Save</button>
                                  <button onClick={handleCancelClick} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50">Cancel</button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-4 text-xs font-mono text-slate-400">{item.id}</td>
                              <td className="p-4 text-sm font-bold text-slate-800">{item.name}</td>
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-slate-700">{item.position || '-'}</span>
                                  <span className="text-[14px] text-slate-400 font-bold uppercase">{item.department || ''}</span>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditClick(item)} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs hover:bg-indigo-100 transition-colors">Update</button>
                                  <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors">Delete</button>
                                </div>
                              </td>
                            </>
                          )}
                        </>
                      )}

                      {activeTab === 'evaluators' && (
                        <>
                          <td className="p-4 text-xs font-mono text-slate-400">{item.id}</td>
                          <td className="p-4">
                             <div className="flex items-center gap-2">
                               <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
                                 <span className="material-symbols-outlined text-sm">manage_accounts</span>
                               </div>
                               <span className="text-sm font-bold text-slate-800">{item.username || 'Unknown'}</span>
                             </div>
                          </td>
                          <td className="p-4">
                             <span className="px-2.5 py-1 rounded text-xs font-black uppercase bg-orange-100 text-orange-700 border border-orange-200">
                               {item.role || 'Evaluator'}
                             </span>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors">
                              Delete
                            </button>
                          </td>
                        </>
                      )}

                      {activeTab === 'evaluations' && (
                        <>
                          <td className="p-4 text-xs font-mono text-slate-400">#{item.id}</td>
                          <td className="p-4 text-xs font-mono font-bold text-slate-600">{item.employee?.id || '-'}</td>
                          <td className="p-4">
                             <div className="flex items-center gap-2">
                               <span className="material-symbols-outlined text-slate-400 text-sm">face</span>
                               <span className="text-sm font-bold text-slate-800">
                                 {item.employee?.name || <span className="text-red-400">Unknown</span>}
                               </span>
                             </div>
                          </td>
                          <td className="p-4 text-sm font-black text-slate-800">
                            {item.score !== undefined ? Math.round(item.score) : '--'}
                          </td>
                          <td className="p-4">
                             {item.violations && item.violations.length > 0 ? (
                                <div className="flex flex-col gap-1 items-start">
                                  {item.violations.slice(0, 1).map((v, i) => ( // Show only one item in the list to save space
                                    <span key={i} className="text-xs text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-100 truncate max-w-[200px]" title={v}>
                                      {v}
                                    </span>
                                  ))}
                                  {item.violations.length > 1 && (
                                    <span className="text-[10px] text-slate-400 pl-1">+{item.violations.length - 1} more</span>
                                  )}
                                </div>
                             ) : (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded border border-green-100">None</span>
                             )}
                          </td>
                          <td className="p-4">
                             {/* 🛠️ [Updated] Pass backend value 'pass' */}
                             <StatusBadge passed={item.pass !== undefined ? item.pass : item.passed} score={item.score} />
                          </td>
                          {/* More button */}
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleOpenDetail(item.id)}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors border border-blue-100"
                            >
                              More
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
      {/* Detail modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">assignment</span>
                Assessment Detail
              </h3>
              <button onClick={handleCloseModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            {/* Modal body */}
            <div className="p-6">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-400">Fetching Details...</p>
                </div>
              ) : modalData ? (
                <div className="space-y-6">
                  {/* Employee info */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold">
                      {modalData.employee?.name?.[0] || '?'}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{modalData.employee?.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span className="font-mono bg-slate-100 px-1.5 rounded text-xs">{modalData.employee?.id}</span>
                        <span>•</span>
                        <span>{modalData.employee?.department} / {modalData.employee?.position}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Evaluated At: {modalData.evaluatedAt ? new Date(modalData.evaluatedAt).toLocaleString() : '-'}
                      </p>
                    </div>
                  </div>
                  {/* Score and result */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Score</p>
                      <p className="text-2xl font-black text-slate-900">{modalData.score}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center flex flex-col items-center justify-center">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Result</p>
                      {/* 🛠️ [Updated] Pass backend value 'pass' */}
                      <StatusBadge passed={modalData.pass !== undefined ? modalData.pass : modalData.passed} score={modalData.score} />
                    </div>
                  </div>
                  {/* Violations list */}
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500 text-lg">warning</span>
                      Violations Detected
                    </h5>
                    {modalData.violations && modalData.violations.length > 0 ? (
                      <ul className="space-y-2">
                        {modalData.violations.map((v, i) => (
                          <li key={i} className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                            <span className="material-symbols-outlined text-base mt-0.5 shrink-0">error</span>
                            {v}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-4 bg-green-50 rounded-xl border border-green-100">
                        <span className="material-symbols-outlined text-green-500 text-3xl mb-1">check_circle</span>
                        <p className="text-sm font-bold text-green-700">No Violations Found</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-10">
                  Data not available
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function StatusBadge({ passed, score }) {
  // 🛠️ [Updated] Score check logic removed -> Trust only 'passed'
  const isPass = passed === true; 
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase border ${
      isPass ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
    }`}>
      {isPass ? 'PASS' : 'FAIL'}
    </span>
  )
}