import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/')
      .then((res) => res.json())
      .then((data) => setMessage(JSON.stringify(data)))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>MindScope Frontend</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
