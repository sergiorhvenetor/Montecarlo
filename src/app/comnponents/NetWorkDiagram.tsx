import React from 'react';
import { Activity } from './types'; // Asegúrate de usar la misma interfaz

type NetworkDiagramProps = {
  activities: Activity[];
};

const NetworkDiagram: React.FC<NetworkDiagramProps> = ({ activities }) => {
  return (
    <div>
      <h2>Diagrama de Red</h2>
      <svg width="500" height="500">
        {activities.map((activity, index) => (
          <g key={activity.id}>
            <rect
              x={index * 100}
              y={50}
              width={80}
              height={40}
              fill="blue"
              stroke="black"
              strokeWidth="2"
            />
            <text x={index * 100 + 10} y={75} fill="white">
              {activity.name}
            </text>
            {activity.precedence.map((precedingId) => (
              <line
                key={`${precedingId}-${activity.id}`}
                x1={index * 100 - 50}
                y1={70}
                x2={index * 100 + 40}
                y2={70}
                stroke="black"
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default NetworkDiagram;
