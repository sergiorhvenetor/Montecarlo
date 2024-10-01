'use client'
import { useState } from 'react';
import InputForm from './comnponents/InputForm';
import MonteCarloAnalysis from './comnponents/MonteCarloAnalysis';

type Activity = {
  name: string;
  precedence: string[]; // Precedencia es un arreglo de strings
  to: number;
  tm: number;
  tp: number;
};

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);

  const handleFormSubmit = (activitiesData: Activity[]) => {
    setActivities(activitiesData);
  };

  return (
    <div className="container">
      <h1>Análisis PERT-CPM con Monte Carlo</h1>
      {activities.length === 0 ? (
        <InputForm onSubmit={handleFormSubmit} />
      ) : (
        <MonteCarloAnalysis activities={activities} />
      )}
    </div>
  );
}
