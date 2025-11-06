import React, { useState, useEffect } from 'react';
import { Users, FileCheck, BarChart2 } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const ActivityLogs = () => {
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(25);
	const [total, setTotal] = useState(0);
	const [staffFilter, setStaffFilter] = useState('');
	const [dateFilter, setDateFilter] = useState('');

	const fetchLogs = async (p = page) => {
		setLoading(true);
		try {
			// Default to backend on localhost:5000 when env var is not set
			const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
			const params = new URLSearchParams({ limit: String(limit), page: String(p) });
			if (staffFilter) params.set('staff', staffFilter);
			if (dateFilter) params.set('date', dateFilter);
			const resp = await fetch(`${base}/api/admin/staff-logs?${params.toString()}`);
			const payload = await resp.json();
			if (payload && payload.success) {
				setLogs(payload.data || []);
				setTotal(payload.total || 0);
			}
		} catch (err) {
			console.error('Failed to fetch logs', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { 
		document.title = "Admin Dashboard | Activity Logs";
		fetchLogs(1); }, [limit, staffFilter, dateFilter]);

	const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

	return (
		<div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
			<AdminSidebar />
			<div className="flex-1 flex flex-col overflow-hidden">
				<AdminHeader title="Activity Logs" />
				<main className="flex-1 p-4 sm:p-6 overflow-y-auto">
					<div className="max-w-7xl mx-auto">


						{/* Search + Card like AdminAssessment */}
						<div className="bg-white p-4 mb-4 rounded-xl shadow border border-gray-200">
							<div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
								<div className="flex items-center gap-3 w-full">
									<input
										type="text"
										placeholder="Filter by staff name or id"
										value={staffFilter}
										onChange={(e) => { setStaffFilter(e.target.value); setPage(1); }}
										className="w-1/2 px-4 py-2 border rounded-lg focus:ring focus:ring-yellow-300 focus:outline-none"
									/>
									<input
										type="date"
										value={dateFilter}
										onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
										className="px-4 py-2 border rounded-lg focus:ring focus:ring-yellow-300 focus:outline-none"
									/>
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<div>Rows:</div>
									<select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="border rounded px-2 py-1">
										<option value={10}>10</option>
										<option value={25}>25</option>
										<option value={50}>50</option>
									</select>
								</div>
							</div>

							<div className="bg-white rounded-xl shadow border border-gray-200">
								{/* Desktop Table */}
								<div className="hidden sm:block overflow-x-auto">
									<table className="min-w-full text-sm text-left">
										<thead className="bg-gray-100 text-gray-600 uppercase text-xs">
											<tr>
												<th className="px-6 py-3">Log ID</th>
												<th className="px-6 py-3">Staff Account</th>
												<th className="px-6 py-3">Action</th>
												<th className="px-6 py-3">Date</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200">
											{loading ? (
												<tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
											) : logs.length === 0 ? (
												<tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No logs found</td></tr>
											) : (
												logs.map((r) => (
													<tr key={r.staffLogs_ID} className="hover:bg-gray-50">
														<td className="px-6 py-4 font-medium text-gray-900">{r.staffLogs_ID}</td>
														<td className="px-6 py-4">{r.staffName || `#${r.staffAccount_ID}`}</td>
														<td className="px-6 py-4">{r.action}</td>
														<td className="px-6 py-4 text-gray-600">{r.date ? new Date(r.date).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : ''}</td>
													</tr>
												))
											)}
										</tbody>
									</table>
								</div>

								{/* Mobile Accordion */}
								<div className="sm:hidden divide-y divide-gray-200">
									{loading ? (
										<div className="p-4 text-center text-gray-500">Loading...</div>
									) : logs.length === 0 ? (
										<div className="p-4 text-center text-gray-500">No logs found</div>
									) : (
										logs.map((r) => (
											<div key={r.staffLogs_ID} className="p-4 hover:bg-gray-50">
												<div className="flex justify-between items-center mb-2">
													<div>
														<div className="font-semibold text-gray-900">Log #{r.staffLogs_ID}</div>
														<div className="text-xs text-gray-600">{r.staffName || `#${r.staffAccount_ID}`}</div>
													</div>
												</div>
												<div className="space-y-2">
													<div className="text-xs text-gray-600">{r.action}</div>
													<div className="text-xs text-gray-600">{r.date ? new Date(r.date).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : ''}</div>
												</div>
											</div>
										))
									)}
								</div>
							</div>

							{/* Pagination */}
							<div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600">
								<div className="mb-2 sm:mb-0">Showing {(total===0)?0:((page-1)*limit+1)} - {Math.min(total, page*limit)} of {total} entries</div>
								<div className="flex space-x-1">
									<button onClick={() => { if (page>1) { setPage(page-1); fetchLogs(page-1); } }} className={`px-3 py-1 border rounded ${page===1?'opacity-50 cursor-not-allowed':''}`} disabled={page===1}>&lt;</button>
									<button className="px-3 py-1 border rounded bg-yellow-200 font-bold">{page}</button>
									<button onClick={() => { if (page<totalPages) { setPage(page+1); fetchLogs(page+1); } }} className={`px-3 py-1 border rounded ${page>=totalPages?'opacity-50 cursor-not-allowed':''}`} disabled={page>=totalPages}>&gt;</button>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
};

export default ActivityLogs;

