import React, { useState } from 'react';
import { CompareResponse } from '../types';
import { compareDams } from '../api';

const ComparePanel: React.FC = () => {
    const [oldImage, setOldImage] = useState<File | null>(null);
    const [newImage, setNewImage] = useState<File | null>(null);
    const [oldNote, setOldNote] = useState('');
    const [newNote, setNewNote] = useState('');
    const [result, setResult] = useState<CompareResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const compare = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!oldImage || !newImage) {
            setError('Choose both the earlier and newer inspection images.');
            return;
        }
        setLoading(true);
        setError('');
        const form = new FormData();
        form.append('old_image', oldImage);
        form.append('new_image', newImage);
        form.append('old_note', oldNote);
        form.append('new_note', newNote);
        try {
            setResult(await compareDams(form));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Comparison failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrap">
            <section className="hero">
                <div><div className="eyebrow">FIELD OPERATIONS / CONDITION TIMELINE</div><h2>See what changed.</h2><p>Compare two inspections of the same location and surface whether the condition is stable, improving, or worsening.</p></div>
                <div className="hero-stat"><strong>02</strong><span>Images</span></div><div className="hero-stat"><strong>01</strong><span>Timeline</span></div>
            </section>
            <form onSubmit={compare} className="panel intake-panel">
                <div className="panel-heading"><div><span className="step-label">STEP 01</span><h3>Upload inspection pair</h3></div><span className="required-label">Earlier → newer</span></div>
                <div className="field-row">
                    <div><label className="field-label">Earlier inspection <span>*</span></label><label className="upload-zone compact"><input type="file" accept="image/*" onChange={(e) => setOldImage(e.target.files?.[0] || null)} /><span className="upload-icon">01</span><strong>{oldImage?.name || 'Choose earlier image'}</strong><small>Baseline condition</small></label><textarea value={oldNote} onChange={(e) => setOldNote(e.target.value)} placeholder="Earlier inspection note" rows={3} /></div>
                    <div><label className="field-label">Newer inspection <span>*</span></label><label className="upload-zone compact"><input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files?.[0] || null)} /><span className="upload-icon">02</span><strong>{newImage?.name || 'Choose newer image'}</strong><small>Current condition</small></label><textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Newer inspection note" rows={3} /></div>
                </div>
                {error && <div className="alert">{error}</div>}
                <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Comparing inspections...' : 'Detect condition change  →'}</button>
                <p className="form-note">Gemma compares visible evidence only. Keep camera angle and location consistent where possible.</p>
            </form>
            {result && <section className={`panel report-panel severity-${result.updated_severity}`}><div className="report-heading"><div><span className="step-label">TIMELINE RESULT</span><h3>{result.change_summary}</h3></div><span className="severity-badge">{result.change_detected ? 'Change detected' : 'Stable'}</span></div><div className="report-meta"><span>{result.updated_severity} priority</span><span>{result.changes.length} observation{result.changes.length === 1 ? '' : 's'}</span></div><div className="report-columns"><div><h4>Recommended action</h4><p>{result.recommended_action}</p></div><div><h4>What changed</h4><ul>{result.changes.map((change, index) => <li key={index}><strong>{change.direction}: </strong>{change.observation}</li>)}</ul></div></div><p className="form-note">Preliminary visual triage only; requires authorized field inspection.</p></section>}
        </div>
    );
};

export default ComparePanel;
