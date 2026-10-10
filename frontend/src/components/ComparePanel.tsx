import React, { useState } from 'react';

const ComparePanel = ({ onCompare }) => {
    const [oldImage, setOldImage] = useState(null);
    const [newImage, setNewImage] = useState(null);
    const [oldNote, setOldNote] = useState('');
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleOldImageChange = (event) => {
        setOldImage(event.target.files[0]);
    };

    const handleNewImageChange = (event) => {
        setNewImage(event.target.files[0]);
    };

    const handleCompare = async () => {
        if (!oldImage || !newImage) {
            setError('Both images are required for comparison.');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('old_image', oldImage);
        formData.append('new_image', newImage);
        formData.append('old_note', oldNote);
        formData.append('new_note', newNote);

        try {
            const response = await fetch('/api/compare', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to compare images.');
            }

            const result = await response.json();
            onCompare(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="compare-panel">
            <h2>Compare Images</h2>
            <div>
                <label>
                    Old Image:
                    <input type="file" accept="image/*" onChange={handleOldImageChange} />
                </label>
                <textarea
                    placeholder="Old Note"
                    value={oldNote}
                    onChange={(e) => setOldNote(e.target.value)}
                />
            </div>
            <div>
                <label>
                    New Image:
                    <input type="file" accept="image/*" onChange={handleNewImageChange} />
                </label>
                <textarea
                    placeholder="New Note"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                />
            </div>
            <button onClick={handleCompare} disabled={loading}>
                {loading ? 'Comparing...' : 'Compare'}
            </button>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default ComparePanel;