import React, { useState, useEffect } from "react";
import "./App.css";
import { Line } from "react-chartjs-2";
import { format, addDays } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("trail_sessions");
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    distance: "",
    effort: ""
  });

  useEffect(() => {
    localStorage.setItem("trail_sessions", JSON.stringify(sessions));
  }, [sessions]);

  function addSession(e) {
    e.preventDefault();
    if (!form.distance || !form.effort) return;
    const newS = {
      id: Date.now(),
      date: form.date,
      distance: parseFloat(form.distance),
      effort: parseFloat(form.effort)
    };
    setSessions(prev => [...prev, newS].sort((a, b) => a.date.localeCompare(b.date)));
    setForm({ ...form, distance: "", effort: "" });
  }

  function clearAll() {
    setSessions([]);
    localStorage.removeItem("trail_sessions");
  }

  const labels = [];
  const dataPoints = [];

  if (sessions.length) {
    const start = sessions[0].date;
    let current = new Date(start);
    const end = new Date(sessions[sessions.length - 1].date);

    while (current <= end) {
      labels.push(format(current, "yyyy-MM-dd"));
      const dayStr = format(current, "yyyy-MM-dd");
      const daySum = sessions
        .filter(s => s.date === dayStr)
        .reduce((r, s) => r + s.effort, 0);
      dataPoints.push(daySum);
      current = addDays(current, 1);
    }
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: "Effort (points) par jour",
        data: dataPoints,
        borderColor: "#ff6b6b",
        tension: 0.2
      }
    ]
  };

  return (
    <div className="App">
      <header>
        <h1>Mon Plan Trail</h1>
        <p className="subtitle">Visualise ta progression</p>
      </header>

      <main>
        <section className="form-section">
          <form onSubmit={addSession}>
            <label>Date
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </label>

            <label>Distance (km)
              <input
                type="number"
                step="0.1"
                value={form.distance}
                onChange={e => setForm({ ...form, distance: e.target.value })}
              />
            </label>

            <label>Effort (1-10)
              <input
                type="number"
                min="1"
                max="10"
                value={form.effort}
                onChange={e => setForm({ ...form, effort: e.target.value })}
              />
            </label>

            <div className="buttons">
              <button type="submit">Ajouter séance</button>
              <button type="button" onClick={clearAll}>Tout effacer</button>
            </div>
          </form>
        </section>

        <section className="list-section">
          <h2>Mes séances</h2>
          {sessions.length === 0 ? (
            <p>Aucune séance.</p>
          ) : (
            <ul>
              {sessions.map(s => (
                <li key={s.id}>
                  <strong>{s.date}</strong> — {s.distance} km — effort {s.effort}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="chart-section">
          <h2>Graphique d'effort</h2>
          {labels.length ? (
            <Line data={chartData} />
          ) : (
            <p>Ajoute des séances pour voir le graphique.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
