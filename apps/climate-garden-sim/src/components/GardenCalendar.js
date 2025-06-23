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
    <section className="calendar-section">
      <h2>Garden Calendar</h2>
      <div className="calendar-grid">
        {gardenCalendar.map((month, index) => (
          <div key={index} className="calendar-month">
            <h3>{month.month}</h3>
            <div className="month-activities">
              {month.activities.map((activity, i) => (
                <div key={i} className={`activity activity-${activity.type}`}>
                  <strong>{activity.crop}</strong>: {activity.action}
                </div>
              ))}
              {month.activities.length === 0 && (
                <div className="activity activity-rest">
                  <em>Planning and preparation month</em>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GardenCalendar;