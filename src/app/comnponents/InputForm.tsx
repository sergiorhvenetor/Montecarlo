"use client";
import { useState } from "react";

type Activity = {
  name: string;
  precedence: string[];
  to: number;
  tm: number;
  tp: number;
  [key: string]: string | string[] | number;
};

export default function InputForm({
  onSubmit,
}: {
  onSubmit: (activities: Activity[]) => void;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState<Activity>({
    name: "",
    precedence: [],
    to: 0,
    tm: 0,
    tp: 0,
  });

  const handleChange = (field: keyof Activity, value: string | number) => {
    if (field === "precedence") {
      setNewActivity({
        ...newActivity,
        [field]: (value as string).split(",").map((item) => item.trim()),
      });
    } else {
      setNewActivity({
        ...newActivity,
        [field]: value,
      });
    }
  };

  const addActivity = () => {
    setActivities([...activities, newActivity]);
    setNewActivity({ name: "", precedence: [], to: 0, tm: 0, tp: 0 }); // Limpiar el formulario después de agregar
  };

  const handleEditActivity = (
    index: number,
    field: keyof Activity,
    value: string | number
  ) => {
    const updatedActivities = [...activities];
    if (field === "precedence") {
      updatedActivities[index][field] = (value as string)
        .split(",")
        .map((item) => item.trim());
    } else {
      updatedActivities[index][field] = value;
    }
    setActivities(updatedActivities);
  };

  const handleRemoveActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(activities);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-4 max-w-2xl mx-auto mt-10">
      {/* Formulario para agregar nuevas actividades */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={`activity-name`}
              className="block text-xs sm:text-sm font-medium text-gray-700"
            >
              Nombre de la actividad
            </label>
            <input
              id={`activity-name`}
              type="text"
              placeholder="Nombre de la actividad"
              value={newActivity.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div>
            <label
              htmlFor={`activity-precedence`}
              className="block text-xs sm:text-sm font-medium text-gray-700"
            >
              Precedencia
            </label>
            <input
              id={`activity-precedence`}
              type="text"
              placeholder="Precedencia (ej. A,B,C)"
              value={newActivity.precedence.join(",")}
              onChange={(e) => handleChange("precedence", e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div>
            <label
              htmlFor={`activity-to`}
              className="block text-xs sm:text-sm font-medium text-gray-700"
            >
              To
            </label>
            <input
              id={`activity-to`}
              type="number"
              placeholder="To"
              value={newActivity.to}
              onChange={(e) => handleChange("to", parseFloat(e.target.value))}
              required
              className="border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div>
            <label
              htmlFor={`activity-tm`}
              className="block text-xs sm:text-sm font-medium text-gray-700"
            >
              Tm
            </label>
            <input
              id={`activity-tm`}
              type="number"
              placeholder="Tm"
              value={newActivity.tm}
              onChange={(e) => handleChange("tm", parseFloat(e.target.value))}
              required
              className="border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div>
            <label
              htmlFor={`activity-tp`}
              className="block text-xs sm:text-sm font-medium text-gray-700"
            >
              Tp
            </label>
            <input
              id={`activity-tp`}
              type="number"
              placeholder="Tp"
              value={newActivity.tp}
              onChange={(e) => handleChange("tp", parseFloat(e.target.value))}
              required
              className="border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={addActivity}
          className="bg-green-500 text-white px-4 py-2 text-xs sm:text-sm rounded-lg hover:bg-green-600 transition-colors duration-300"
        >
          Agregar Actividad
        </button>
      </form>

      {/* Tabla Editable */}
      {activities.length > 0 && (
        <div className="mt-6">
          <h3 className="text-2xl font-bold mb-4">Lista de Actividades</h3>
          <div className="overflow-x-auto">
            <table className="table-auto w-full bg-white rounded-lg shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-600 text-white text-xs sm:text-sm">
                  <th className="px-2 py-2 sm:px-4">Actividad</th>
                  <th className="px-2 py-2 sm:px-4">Precedencia</th>
                  <th className="px-2 py-2 sm:px-4">To</th>
                  <th className="px-2 py-2 sm:px-4">Tm</th>
                  <th className="px-2 py-2 sm:px-4">Tp</th>
                  <th className="px-2 py-2 sm:px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, index) => (
                  <tr key={index} className="text-center">
                    <td className="border px-2 py-2 sm:px-4">
                      <input
                        type="text"
                        value={activity.name}
                        onChange={(e) =>
                          handleEditActivity(index, "name", e.target.value)
                        }
                        className="border border-gray-300 rounded-lg p-1 text-xs sm:text-sm w-full"
                      />
                    </td>
                    <td className="border px-2 py-2 sm:px-4">
                      <input
                        type="text"
                        value={activity.precedence.join(",")}
                        onChange={(e) =>
                          handleEditActivity(index, "precedence", e.target.value)
                        }
                        className="border border-gray-300 rounded-lg p-1 text-xs sm:text-sm w-full"
                      />
                    </td>
                    <td className="border px-2 py-2 sm:px-4">
                      <input
                        type="number"
                        value={activity.to}
                        onChange={(e) =>
                          handleEditActivity(
                            index,
                            "to",
                            parseFloat(e.target.value)
                          )
                        }
                        className="border border-gray-300 rounded-lg p-1 text-xs sm:text-sm w-full"
                      />
                    </td>
                    <td className="border px-2 py-2 sm:px-4">
                      <input
                        type="number"
                        value={activity.tm}
                        onChange={(e) =>
                          handleEditActivity(
                            index,
                            "tm",
                            parseFloat(e.target.value)
                          )
                        }
                        className="border border-gray-300 rounded-lg p-1 text-xs sm:text-sm w-full"
                      />
                    </td>
                    <td className="border px-2 py-2 sm:px-4">
                      <input
                        type="number"
                        value={activity.tp}
                        onChange={(e) =>
                          handleEditActivity(
                            index,
                            "tp",
                            parseFloat(e.target.value)
                          )
                        }
                        className="border border-gray-300 rounded-lg p-1 text-xs sm:text-sm w-full"
                      />
                    </td>
                    <td className="border px-2 py-2 sm:px-4">
                      <button
                        onClick={() => handleRemoveActivity(index)}
                        className="bg-red-500 text-white px-2 py-1 text-xs sm:text-sm rounded-lg hover:bg-red-600 transition-colors duration-300"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 text-xs sm:text-sm rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              Realizar Análisis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
