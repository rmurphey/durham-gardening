/**
 * GardenCalendar Component
 * Displays month-by-month garden planning calendar
 */

import React from 'react';

const GardenCalendar = ({ gardenCalendar }) => {
  if (!gardenCalendar || gardenCalendar.length === 0) {
    return null;
  }

  return (
    <section className="card garden-calendar">
      <div className="card-header">
        <h2 className="card-title">Garden Calendar</h2>
        <p className="card-subtitle calendar-subtitle">Month-by-month Durham garden planning</p>
      </div>
      
      <div className="calendar-grid">
        {gardenCalendar.map((month, index) => {
          const currentMonth = new Date().getMonth() + 1;
          const isCurrentMonth = month.month === getMonthName(currentMonth);
          
          return (
            <div key={index} className={`calendar-month ${isCurrentMonth ? 'current' : ''}`}>
              <div className="month-header">
                <h5>{month.month}</h5>
                {isCurrentMonth && <span className="month-emphasis">current</span>}
              </div>
              <div className="month-activities">
                {month.activities.map((activity, i) => (
                  <div key={i} className={`activity activity-${activity.type} priority-${activity.priority || 'medium'}`}>
                    <div className="activity-header">
                      <span className="activity-crop">{activity.crop}</span>
                      {activity.priority === 'high' && (
                        <span className="activity-priority">urgent</span>
                      )}
                    </div>
                    <div className="activity-action">{activity.action}</div>
                    {activity.timing && (
                      <div className="activity-timing">{activity.timing}</div>
                    )}
                  </div>
                ))}
                {month.activities.length === 0 && (
                  <div className="activity activity-rest">
                    <em>Planning and preparation month</em>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// Helper function to get month name
function getMonthName(monthNumber) {
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
  return monthNames[monthNumber];
}

export default GardenCalendar;