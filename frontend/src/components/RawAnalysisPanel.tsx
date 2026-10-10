import React from 'react';

interface RawAnalysisPanelProps {
    rawAnalysis: string | null;
}

const RawAnalysisPanel: React.FC<RawAnalysisPanelProps> = ({ rawAnalysis }) => {
    return (
        <div className="p-4 border rounded shadow-md bg-white">
            <h2 className="text-lg font-semibold mb-2">Raw AI Analysis</h2>
            {rawAnalysis ? (
                <pre className="whitespace-pre-wrap">{rawAnalysis}</pre>
            ) : (
                <p>No analysis available.</p>
            )}
        </div>
    );
};

export default RawAnalysisPanel;