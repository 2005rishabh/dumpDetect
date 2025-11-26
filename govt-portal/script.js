const API_URL = 'https://dumpdetect.onrender.com/api/reports';

function getSeverityBadge(severity) {
    let color;
    switch (severity) {
        case 'High': color = 'var(--danger-color)'; break;
        case 'Medium': color = 'var(--warning-color)'; break;
        case 'Low': color = 'var(--success-color)'; break;
        default: color = '#666';
    }
    return `<span style="background-color: ${color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">${severity}</span>`;
}

function getStatusBadge(status) {
    let bg, color;
    switch (status) {
        case 'Pending': bg = '#ffeeba'; color = '#856404'; break;
        case 'Under Review': bg = '#b8daff'; color = '#004085'; break;
        case 'Resolved': bg = '#c3e6cb'; color = '#155724'; break;
        case 'False Alarm': bg = '#f8d7da'; color = '#721c24'; break;
        default: bg = '#eee'; color = '#333';
    }
    return `<span style="background-color: ${bg}; color: ${color}; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">${status}</span>`;
}

// Fetch all reports
async function fetchReports() {
    try {
        const response = await fetch(API_URL);
        const reports = await response.json();
        return reports;
    } catch (error) {
        console.error('Error fetching reports:', error);
        return [];
    }
}

// Fetch single report
async function fetchReport(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Report not found');
        return await response.json();
    } catch (error) {
        console.error('Error fetching report:', error);
        return null;
    }
}

// Update Status
async function updateStatus(id, newStatus) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            alert('Status updated successfully!');
            location.reload();
        } else {
            alert('Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status');
    }
}

// Render Dashboard Stats
async function renderDashboard() {
    const reports = await fetchReports();

    const total = reports.length;
    const today = reports.filter(r => new Date(r.date).toDateString() === new Date().toDateString()).length;
    const hotspots = reports.filter(r => r.severity === 'High').length;
    const pending = reports.filter(r => r.status === 'Pending').length;

    const statsContainer = document.querySelector('.dashboard-grid');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <h3>Total Reports Received</h3>
                <div class="value">${total}</div>
            </div>
            <div class="stat-card">
                <h3>Reports Today</h3>
                <div class="value">${today}</div>
            </div>
            <div class="stat-card">
                <h3>Major Hotspots</h3>
                <div class="value" style="color: var(--danger-color);">${hotspots}</div>
            </div>
            <div class="stat-card">
                <h3>Pending Verifications</h3>
                <div class="value" style="color: var(--warning-color);">${pending}</div>
            </div>
        `;
    }
}

// Render Reports Table
async function renderTable() {
    const tableBody = document.getElementById('reports-table-body');
    if (!tableBody) return;

    const reports = await fetchReports();

    if (reports.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No reports found</td></tr>';
        return;
    }

    tableBody.innerHTML = reports.map(report => `
        <tr>
            <td><a href="report-details.html?id=${report._id}" style="color: var(--primary-color); font-weight: 600;">${report._id.substring(0, 8)}...</a></td>
            <td><img src="${report.imagePath || 'assets/images/pollution_1.png'}" alt="Thumbnail" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td>${report.location}</td>
            <td>${report.description.substring(0, 50)}...</td>
            <td>${new Date(report.date).toLocaleString()}</td>
            <td>${getSeverityBadge(report.severity)}</td>
            <td>${getStatusBadge(report.status)}</td>
            <td><a href="report-details.html?id=${report._id}" class="btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">View</a></td>
        </tr>
    `).join('');
}

// Render Details Page
async function renderDetails() {
    const detailsContainer = document.getElementById('report-details-container');
    if (!detailsContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');

    if (!reportId) {
        detailsContainer.innerHTML = '<p>No Report ID provided</p>';
        return;
    }

    const report = await fetchReport(reportId);

    if (!report) {
        detailsContainer.innerHTML = '<p>Report not found</p>';
        return;
    }

    detailsContainer.innerHTML = `
        <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 300px;">
                <img src="${report.imagePath || 'assets/images/pollution_1.png'}" alt="Evidence" style="width: 100%; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            </div>
            <div style="flex: 1; min-width: 300px;">
                <h2 style="margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Report Details: ${report._id}</h2>
                
                <div style="margin-bottom: 1.5rem;">
                    <p><strong>Location:</strong> ${report.location}</p>
                    <p><strong>Coordinates:</strong> ${report.coordinates || 'N/A'}</p>
                    <p><strong>Date & Time:</strong> ${new Date(report.date).toLocaleString()}</p>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <p><strong>Description:</strong></p>
                    <p style="background: #f9f9f9; padding: 1rem; border-radius: 4px; border-left: 3px solid var(--primary-color);">${report.description}</p>
                </div>

                <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
                    <div>
                        <strong>Severity:</strong><br>
                        ${getSeverityBadge(report.severity)}
                    </div>
                    <div>
                        <strong>Current Status:</strong><br>
                        ${getStatusBadge(report.status)}
                    </div>
                </div>

                <div style="background: #e3f2fd; padding: 1.5rem; border-radius: 8px;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">Official Action</h3>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Update Status:</label>
                        <select id="status-select" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
                            <option value="Pending" ${report.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Under Review" ${report.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                            <option value="Resolved" ${report.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="False Alarm" ${report.status === 'False Alarm' ? 'selected' : ''}>False Alarm</option>
                        </select>
                    </div>
                    <button class="btn" onclick="updateStatus('${report._id}', document.getElementById('status-select').value)">Update Status</button>
                </div>
            </div>
        </div>
    `;
}

// Initialize based on page
if (document.querySelector('.dashboard-grid')) {
    renderDashboard();
} else if (document.getElementById('reports-table-body')) {
    renderTable();
} else if (document.getElementById('report-details-container')) {
    renderDetails();
}

