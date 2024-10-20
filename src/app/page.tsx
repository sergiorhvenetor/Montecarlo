"use client";
import { useState } from "react";
import InputForm from './comnponents/InputForm';
import MonteCarloAnalysis from './comnponents/MonteCarloAnalysis';
import CPMDeterministic from './comnponents/CPMDeterministic';
import { Activity } from "./comnponents/types"; // Usar el tipo unificado de Activity

type AnalysisMethod = "deterministic" | "montecarlo";

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);
  const [method, setMethod] = useState<AnalysisMethod | null>(null);

  const handleFormSubmit = (activitiesData: Activity[]) => {
    // Asegurar que las propiedades opcionales tengan valores predeterminados
    const preparedActivities = activitiesData.map(activity => ({
      ...activity,
      to: activity.to || 0, // Valor por defecto si no se asigna
      tm: activity.tm || 0, // Valor por defecto si no se asigna
      tp: activity.tp || 0, // Valor por defecto si no se asigna
    }));
    setActivities(preparedActivities);
    setIsAnalysisMode(true);
  };

  const handleReset = () => {
    setActivities([]);
    setIsAnalysisMode(false);
    setMethod(null);
  };

  const handleEdit = (editedActivities: Activity[]) => {
    setActivities(editedActivities);
    setIsAnalysisMode(false);
  };


  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat p-4 sm:p-10" style={{ backgroundImage: 'url(/image/PERT-CPM-Monte-Carlo.png)' }}>
      <div className="bg-white bg-opacity-80 p-6 sm:p-8 rounded-lg shadow-lg max-w-6xl mx-auto mt-6 sm:mt-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-center text-blue-600 mb-6 sm:mb-8">
          Cronograma de proyecto
        </h1>
        
        {!method ? (
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setMethod("deterministic")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              Determinístico
            </button>
            <button
              onClick={() => setMethod("montecarlo")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              PERT-CPM con Monte Carlo
            </button>
          </div>
        ) : (
          !isAnalysisMode ? (
            <InputForm
              onSubmit={handleFormSubmit}
              savedActivities={activities}
              useMonteCarlo={method === "montecarlo"} // Pasar el método seleccionado
              onBackToMethodSelection={handleReset} // Pasamos esta función al InputForm
            />
          ) : (
            method === "montecarlo" ? (
              <MonteCarloAnalysis
                activities={activities}
                onReset={handleReset}
                onEdit={handleEdit}
              />
            ) : (
              <CPMDeterministic
                activities={activities}
                onReset={handleReset}
                onEdit={handleEdit}
              />
            )
          )
        )}
      </div>
    </div>
  );
}
