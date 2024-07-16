import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      const socket = new WebSocket("ws://localhost:8080/ws");

      socket.onopen = () => {
        const reader = new FileReader();
        reader.onload = function () {
          if (reader.result) {
            socket.send(reader.result);
          }
        };
        reader.readAsArrayBuffer(file);
      };

      socket.onmessage = (event) => {
        const response = JSON.parse(event.data);
        setPrediction(response.prediction);
        socket.close();
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        socket.close();
      };
    }
  };

  return (
    <div className="card">
      <h1>Image Classifier</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {prediction && (
        <div>
          <h2>Prediction:</h2>
          <p>{prediction}</p>
        </div>
      )}
    </div>
  );
}

export default App;
