'use client';
import { useState } from 'react';
import InputForm from './comnponents/InputForm';
import MonteCarloAnalysis from './comnponents/MonteCarloAnalysis';

type Activity = {
  name: string;
  precedence: string[];
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
    <div className="min-h-screen bg-cover bg-center bg-no-repeat p-4 sm:p-10" style={{ backgroundImage: 'url(/your-background-image.jpg)' }}>
      <div className="bg-white bg-opacity-80 p-6 sm:p-8 rounded-lg shadow-lg max-w-6xl mx-auto mt-6 sm:mt-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-center text-blue-600 mb-6 sm:mb-8">
          Análisis PERT-CPM con Monte Carlo
        </h1>
        {activities.length === 0 ? (
          <InputForm onSubmit={handleFormSubmit} />
        ) : (
          <MonteCarloAnalysis activities={activities} />
        )}
      </div>
    </div>
  );
}
