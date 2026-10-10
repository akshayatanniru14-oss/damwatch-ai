import React, { useState } from 'react';
import { analyzeDam } from '../api';
import { AnalyzeResponse } from '../types';
import ReportCard from './ReportCard';

const assets = [
    'Bhakra Dam', 'Sardar Sarovar Dam', 'Tehri Dam', 'Narmada Dam',
    'Idukki Dam', 'Koynanagar Dam', 'Krishna Raja Sagara Dam', 'Mettur Dam',
];

const IntakeForm: React.FC = () => {
    const [images, setImages] = useState<File[]>([]);
    const [note, setNote] = useState('');
    const [asset, setAsset] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: '', lon: '' });
    const [waterLevel, setWaterLevel] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!images.length || !asset) {
            setError('Add at least one inspection image and select an asset.');
            return;
        }
        setLoading(true);
        setError('');
        setAnalysis(null);
        const formData = new FormData();
        images.forEach((image) => formData.append('images', image));
        formData.append('note', note);
        formData.append('asset', asset);
        if (coordinates.lat && coordinates.lon) {
            formData.append('coordinates', JSON.stringify({
                lat: Number(coordinates.lat), lon: Number(coordinates.lon),
            }));
        }
        if (waterLevel) formData.append('water_level', waterLevel);
        try {
            setAnalysis(await analyzeDam(formData));
        } catch (err: any) {
            const detail = err?.response?.data?.detail;
            setError(detail || 'Unable to generate a report. Check that the backend and API key are ready.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrap">
            <section className="hero">
                <div>
                    <div className="eyebrow">FIELD OPERATIONS / NEW INSPECTION</div>
                    <h2>See risk before it becomes failure.</h2>
                    <p>Upload field imagery and let Gemma turn visual signals into an actionable inspection brief.</p>
                </div>
                <div className="hero-stat"><strong>01</strong><span>Intake</span></div>
                <div className="hero-stat"><strong>02</strong><span>AI triage</span></div>
                <div className="hero-stat"><strong>03</strong><span>Action plan</span></div>
            </section>

            <div className="workspace-grid">
                <form onSubmit={handleSubmit} className="panel intake-panel">
                    <div className="panel-heading">
                        <div><span className="step-label">STEP 01</span><h3>Inspection details</h3></div>
                        <span className="required-label">* Required</span>
                    </div>
                    <label className="field-label">Inspection imagery <span>*</span></label>
                    <label className="upload-zone">
                        <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files || []).slice(0, 3))} />
                        <span className="upload-icon">↑</span>
                        <strong>{images.length ? `${images.length} image${images.length > 1 ? 's' : ''} selected` : 'Drop images here or browse'}</strong>
                        <small>PNG, JPG or WEBP · up to 3 images</small>
                    </label>
                    <label className="field-label" htmlFor="asset">Asset <span>*</span></label>
                    <select id="asset" value={asset} onChange={(e) => setAsset(e.target.value)}>
                        <option value="">Choose an asset</option>
                        {assets.map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <label className="field-label" htmlFor="note">Inspector notes</label>
                    <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you notice in the field?" rows={4} />
                    <div className="field-row">
                        <div><label className="field-label" htmlFor="water">Water level</label><input id="water" value={waterLevel} onChange={(e) => setWaterLevel(e.target.value)} placeholder="e.g. 142.3 m" /></div>
                        <div><label className="field-label">Coordinates</label><div className="coordinate-row"><input value={coordinates.lat} onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })} placeholder="Lat" /><input value={coordinates.lon} onChange={(e) => setCoordinates({ ...coordinates, lon: e.target.value })} placeholder="Long" /></div></div>
                    </div>
                    {error && <div className="alert">{error}</div>}
                    <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Analyzing imagery...' : 'Generate inspection brief  →'}</button>
                    <p className="form-note">AI-assisted preliminary triage. Always verify findings with an authorized field inspection.</p>
                </form>

                <aside className="panel guidance-panel">
                    <span className="step-label">HOW IT WORKS</span>
                    <h3>From image to insight.</h3>
                    <div className="guidance-item"><b>01</b><div><strong>Capture</strong><p>Take clear photos showing the full context and close-up detail.</p></div></div>
                    <div className="guidance-item"><b>02</b><div><strong>Analyze</strong><p>Gemma checks for cracks, seepage, erosion and blockages.</p></div></div>
                    <div className="guidance-item"><b>03</b><div><strong>Respond</strong><p>Use the severity and checklist to plan the next field action.</p></div></div>
                    <div className="safety-note"><span>✦</span><p><strong>Safety first</strong><br />DamWatch supports decisions; it never replaces an engineer.</p></div>
                </aside>
            </div>
            {analysis && <ReportCard issueDetected={analysis.issue_detected} issueCategory={analysis.issue_category} severity={analysis.severity} evidenceStrength={analysis.evidence_strength} evidenceReason={analysis.evidence_reason} visualEvidence={analysis.visual_evidence} recommendedAction={analysis.recommended_action} escalation={analysis.escalation} dataGaps={analysis.data_gaps} checklist={analysis.checklist} />}
        </div>
    );
};

export default IntakeForm;
