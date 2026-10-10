import React, { useEffect, useState } from 'react';
import { Report } from '../types';

const ReportLog: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch('/api/reports');
                if (!response.ok) {
                    throw new Error('Failed to fetch reports');
                }
                const data = await response.json();
                setReports(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) {
        return <div>Loading reports...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="report-log">
            <h2>Report Log</h2>
            <ul>
                {reports.map((report) => (
                    <li key={report.id} className={`severity-${report.severity}`}>
                        <h3>{report.issue_detected}</h3>
                        <p>Severity: {report.severity}</p>
                        <p>Visual Evidence: {report.visual_evidence.join(', ')}</p>
                        <p>Recommended Action: {report.recommended_action}</p>
                        <p>Timestamp: {new Date(report.timestamp).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReportLog;