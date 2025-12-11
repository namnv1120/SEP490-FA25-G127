import React from 'react';

const StatsCard = ({ title, value, change, changeType, icon, iconColor, period = 'vs last month' }) => {
    return (
        <div className="admin-stats-card">
            <div className="admin-stats-header">
                <span className="admin-stats-title">{title}</span>
                <div className={`admin-stats-icon ${iconColor}`}>
                    {icon}
                </div>
            </div>
            <div className="admin-stats-value">{value}</div>
            <div className="admin-stats-footer">
                <span className={`admin-stats-change ${changeType}`}>
                    {changeType === 'positive' ? '↑' : '↓'} {change}
                </span>
                <span className="admin-stats-period">{period}</span>
            </div>
        </div>
    );
};

export default StatsCard;
