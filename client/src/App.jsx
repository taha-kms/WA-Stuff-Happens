import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [ping, setPing] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/ping', { withCredentials: true })
      .then(res => setPing(res.data.message))
      .catch(err => setPing('Error: ' + err.message));
  }, []);

  return (
    <div className="card">
      <h1>Stuff Happens</h1>
      <p>Backend says: <strong>{ping || 'Loading...'}</strong></p>
    </div>
  );
}

export default App;
