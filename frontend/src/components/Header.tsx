import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <header className="topbar">
            <div className="brand">
                <div className="brand-mark">DW</div>
                <div>
                    <h1>DamWatch <span>AI</span></h1>
                    <p>Infrastructure intelligence</p>
                </div>
            </div>
            <div className="topbar-meta">
                <nav className="topnav">
                    <Link to="/">New inspection</Link>
                    <Link to="/compare">Compare timeline</Link>
                </nav>
                <span className="status-dot" /> System ready
                <span className="model-pill">Gemma 4</span>
            </div>
        </header>
    );
};

export default Header;