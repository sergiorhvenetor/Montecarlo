'use client'

import { useState } from 'react';

type Activity = {
  name: string;
  precedence: string[];
  to: number;
  tm: number;
  tp: number;
  [key: string]: string | string[] | number; // Agregamos la firma de índice
};

export default function InputForm({ onSubmit }: { onSubmit: (activities: Activity[]) => void }) {
  const [activities, setActivities] = useState<Activity[]>([
    { name: '', precedence: [], to: 0, tm: 0, tp: 0 },
  ]);

  // Aquí cambiamos el tipo de `field` a `keyof Activity` para que sea una clave válida de Activity
  const handleChange = (index: number, field: keyof Activity, value: string | number) => {
    const updatedActivities = [...activities];
    if (field === 'precedence') {
      updatedActivities[index][field] = (value as string).split(',').map((item) => item.trim());
    } else {
      updatedActivities[index][field] = value;
    }
    setActivities(updatedActivities);
  };

  const addActivity = () => {
    setActivities([...activities, { name: '', precedence: [], to: 0, tm: 0, tp: 0 }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(activities);
  };

  return (
    <form onSubmit={handleSubmit}>
      {activities.map((activity, index) => (
        <div key={index} className="activity-form">
          <input
            type="text"
            placeholder="Nombre de la actividad"
            value={activity.name}
            onChange={(e) => handleChange(index, 'name', e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Precedencia (ej. A,B,C)"
            value={activity.precedence.join(',')}
            onChange={(e) => handleChange(index, 'precedence', e.target.value)}
          />
          <input
            type="number"
            placeholder="To"
            value={activity.to}
            onChange={(e) => handleChange(index, 'to', parseFloat(e.target.value))}
            required
          />
          <input
            type="number"
            placeholder="Tm"
            value={activity.tm}
            onChange={(e) => handleChange(index, 'tm', parseFloat(e.target.value))}
            required
          />
          <input
            type="number"
            placeholder="Tp"
            value={activity.tp}
            onChange={(e) => handleChange(index, 'tp', parseFloat(e.target.value))}
            required
          />
        </div>
      ))}
      <button type="button" onClick={addActivity}>Agregar Actividad</button>
      <button type="submit">Realizar Análisis</button>
    </form>
  );
}
