import React, { useState } from 'react';

const DemoModeToggle = ({ onToggle }) => {
    const [isDemoMode, setIsDemoMode] = useState(false);

    const handleToggle = () => {
        setIsDemoMode(!isDemoMode);
        onToggle(!isDemoMode);
    };

    return (
        <div className="demo-toggle">
            <label>
                <input
                    type="checkbox"
                    checked={isDemoMode}
                    onChange={handleToggle}
                    className="form-checkbox"
                />
                <span>Demo mode</span>
            </label>
        </div>
    );
};

export default DemoModeToggle;