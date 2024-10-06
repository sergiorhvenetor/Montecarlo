"use client";

import React, { useState } from "react";
import { Chart } from "react-google-charts";

type Activity = {
  name: string;
  precedence: string[]; 
  to: number;
  tm: number;
  tp: number;
  totalFloat: number;
};

interface GanttChartProps {
  activities: Activity[];
}

// Extender la interfaz Window para incluir updateTaskProgress
declare global {
  interface Window {
    updateTaskProgress: (taskId: string, newProgress: number) => void;
  }
}

const GanttChart: React.FC<GanttChartProps> = ({ activities }) => {
  const [activityProgress, setActivityProgress] = useState<{ [key: string]: number }>(
    activities.reduce((acc, activity) => {
      acc[activity.name] = 0; // Inicializa todos los progresos en 0
      return acc;
    }, {} as { [key: string]: number })
  );

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [progressInput, setProgressInput] = useState<number>(0);

  const handleProgressChange = (taskId: string, newProgress: number) => {
    setActivityProgress((prev) => ({
      ...prev,
      [taskId]: newProgress,
    }));
  };

  const updateProgressManual = () => {
    if (selectedTask) {
      handleProgressChange(selectedTask, progressInput);
      setSelectedTask(null); // Limpia la selección tras actualizar
    }
  };

  const calculateDates = (activities: Activity[]) => {
    const startDate = new Date();

    let activityDates = activities.map((activity) => {
      const duration = (activity.to + 4 * activity.tm + activity.tp) / 6;
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + Math.round(duration));

      const activityData = {
        id: activity.name,
        name: activity.name,
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
        progress: activityProgress[activity.name] || 0,
        dependencies: null as string | null,
        isCritical: activity.totalFloat === 0,
      };

      return activityData;
    });

    activityDates = activityDates.map((activity) => {
      const dependencies = activities
        .filter((act) => act.precedence.includes(activity.id)) 
        .map((act) => act.name)
        .join(",");

      return {
        ...activity,
        dependencies: dependencies.length > 0 ? dependencies : null,
      };
    });

    let allDatesAdjusted = false;

    while (!allDatesAdjusted) {
      allDatesAdjusted = true;

      activityDates = activityDates.map((activity) => {
        if (activity.dependencies) {
          const maxEndDate = activity.dependencies.split(",").reduce((latestDate, depName) => {
            const predecessor = activityDates.find((act) => act.id === depName);
            if (predecessor) {
              const predecessorEndDate = new Date(predecessor.end);
              if (predecessorEndDate > latestDate) {
                return predecessorEndDate;
              }
            }
            return latestDate;
          }, new Date(startDate));

          const newStartDate = new Date(maxEndDate);
          const newEndDate = new Date(newStartDate);
          const duration = (
            (activities.find((act) => act.name === activity.id)?.to ?? 0) +
            4 * (activities.find((act) => act.name === activity.id)?.tm ?? 0) +
            (activities.find((act) => act.name === activity.id)?.tp ?? 0)
          ) / 6;
          newEndDate.setDate(newStartDate.getDate() + Math.round(duration));

          if (
            newStartDate.toISOString().split("T")[0] !== activity.start ||
            newEndDate.toISOString().split("T")[0] !== activity.end
          ) {
            allDatesAdjusted = false;
          }

          return {
            ...activity,
            start: newStartDate.toISOString().split("T")[0],
            end: newEndDate.toISOString().split("T")[0],
          };
        }
        return activity;
      });
    }

    return [
      [
        { type: "string", label: "Task ID" },
        { type: "string", label: "Task Name" },
        { type: "string", label: "Resource" },
        { type: "date", label: "Start Date" },
        { type: "date", label: "End Date" },
        { type: "number", label: "Duration" },
        { type: "number", label: "Percent Complete" },
        { type: "string", label: "Dependencies" },
        { type: "string", label: "Color" }, // Color para las tareas críticas
      ],
      ...activityDates.map((activity) => [
        activity.id,
        activity.name,
        null,
        new Date(activity.start),
        new Date(activity.end),
        null,
        activity.progress,
        activity.dependencies,
        activity.isCritical ? "#f70515" : "#0000ff", // Color rojo si es crítica, azul si no lo es
      ]),
    ];
  };

  if (typeof window !== "undefined") {
    window.updateTaskProgress = (taskId: string, newProgress: number) => {
      handleProgressChange(taskId, newProgress);
    };
  }

  const data = calculateDates(activities);

  const options = {
    height: 400,
    gantt: {
      criticalPathEnabled: true,
      criticalPathStyle: {
        stroke: "#f70515", // Asegurar que las actividades críticas se muestren en rojo
        strokeWidth: 5,
      },
      labelStyle: {
        fontName: "Arial",
        fontSize: 12,
        color: "#757575",
      },
      trackHeight: 30,
    },
    criticalBarStyle: {
      // Function to determine color based on critical path
      fill: (activity: { isCritical: any; }) => (activity.isCritical ? "#f70515" : "#0000ff"),
    },
  };

  return (
    <div className="p-4">
      <Chart chartType="Gantt" width="100%" height="400px" data={data} options={options} />
      {/* Contenedor para gestionar el progreso */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-3">Gestionar Progresos</h2>
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="task" className="block text-sm font-medium text-gray-700">Selecciona una actividad:</label>
            <select 
              id="task"
              onChange={(e) => setSelectedTask(e.target.value)} 
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Selecciona</option>
              {activities.map((activity) => (
                <option key={activity.name} value={activity.name}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="progress" className="block text-sm font-medium text-gray-700">Progreso (%):</label>
            <input 
              type="number"
              id="progress"
              value={progressInput}
              min={0}
              max={100}
              onChange={(e) => setProgressInput(Number(e.target.value))}
              className="mt-1 block w-20 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button 
            onClick={updateProgressManual}
            className="mt-6 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition duration-200"
            style={{ transform: 'scale(0.85)' }}
          >
            Actualizar Progreso
          </button>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
