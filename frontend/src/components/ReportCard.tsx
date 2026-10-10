import React from 'react';

interface ReportCardProps {
    issueDetected: string; issueCategory: string; severity: string; evidenceStrength: string;
    evidenceReason: string; visualEvidence: string[]; recommendedAction: string;
    escalation: string; dataGaps: string[]; checklist: string[];
}

const ReportCard: React.FC<ReportCardProps> = (props) => (
    <section className={`panel report-panel severity-${props.severity}`}>
        <div className="report-heading"><div><span className="step-label">AI TRIAGE RESULT</span><h3>{props.issueDetected}</h3></div><span className="severity-badge">{props.severity}</span></div>
        <div className="report-meta"><span>{props.issueCategory.replace('_', ' ')}</span><span>Evidence: {props.evidenceStrength}</span></div>
        <p className="evidence-reason">{props.evidenceReason}</p>
        <div className="report-columns">
            <div><h4>Recommended action</h4><p>{props.recommendedAction}</p><h4>Escalation</h4><p>{props.escalation}</p></div>
            <div><h4>Visual evidence</h4><ul>{props.visualEvidence.map((item, i) => <li key={i}>{item}</li>)}</ul><h4>Field checklist</h4><ul>{props.checklist.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
        </div>
        {!!props.dataGaps.length && <div className="data-gaps"><strong>Data gaps:</strong> {props.dataGaps.join(' · ')}</div>}
        <p className="form-note">Preliminary visual triage only; requires authorized field inspection.</p>
    </section>
);

export default ReportCard;
