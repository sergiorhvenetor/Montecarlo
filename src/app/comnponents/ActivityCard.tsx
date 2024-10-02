'use client';

import React from 'react';
import { CompleteActivity } from './types';  // Usamos la interfaz combinada

interface ActivityCardProps {
  activity: CompleteActivity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  return (
    <div
      className="grid grid-cols-3 grid-rows-3 gap-0 border-2 border-red-500 w-60 h-40"
      style={{ backgroundColor: activity.isCritical ? '#fdd' : '#e0f7fa' }} // Cambiar color si es crítica
    >
      {/* Fila superior */}
      <div className="border border-gray-400 flex items-center justify-center text-center">
        {activity.earliestStart.toFixed(2)}
      </div>
      <div className="border border-gray-400 flex items-center justify-center text-center">
        {activity.duration.toFixed(2)}
      </div>
      <div className="border border-gray-400 flex items-center justify-center text-center">
        {activity.earliestFinish.toFixed(2)}
      </div>

      {/* Fila media */}
      <div className="border border-gray-400 flex items-center justify-center text-center">
        {activity.id}
      </div>
      <div className="border border-gray-400 flex items-center justify-center text-center">
        {activity.name}
      </div>
      <div className="border border-gray-400 flex items-center justify-center text-center">
        {activity.totalFloat.toFixed(2)}
      </div>

      {/* Fila inferior */}
      <div className="border border-gray-400 flex items-center justify-center text-center">
        {activity.latestStart.toFixed(2)}
      </div>
      <div className="border border-gray-400 flex items-center justify-center text-center">
        {activity.totalFloat.toFixed(2)}
      </div>
      <div className="border border-gray-400 flex items-center justify-center text-center">
        {activity.latestFinish.toFixed(2)}
      </div>
    </div>
  );
};

export default ActivityCard;
