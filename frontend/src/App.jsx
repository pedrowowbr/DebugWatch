import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://localhost:8000/")
      .then(res => res.json())
      .then(data => console.log(data));
  }, []);

  return <h1>Front conectado ao Back!</h1>;
}

export default App;
