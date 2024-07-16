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
      const image = await readImage(file);
      console.log({image: _arrayBufferToBase64(image)});

      socket.onopen = () => {
        const reader = new FileReader();
        reader.onload = function () {
          socket.send(image);
        };
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

async function readImage(file: any): Promise<ArrayBuffer> {
  return new Promise((res: any, rej: any) => {
    console.log("Reading Image");
    const reader = new FileReader();
    reader.onload = function () {
      if (!reader.result) {
        rej("No image could be read");
      }
      res(reader.result);
    };
    reader.readAsArrayBuffer(file);
  })
}

function _arrayBufferToBase64( buffer: ArrayBufferLike ) {
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode( bytes[ i ] );
  }
  return window.btoa( binary );
}