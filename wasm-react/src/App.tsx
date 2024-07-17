import { useEffect, useState } from "react";
import fhirImageComposer from "./fhirImageComposer";
import "./App.css";
import JsonViewer from './components/JsonViwer';

/*
 * To decode the image from the console output
 * go to: https://base64.guru/converter/decode/image 
 */

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [fhirResource, setFhirResource] = useState(null);
  
  useEffect(() => {
    const _socket = new WebSocket("ws://localhost:8080/ws");
    setSocket(_socket);

    _socket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      setFhirResource(response);
    };

    _socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      _socket.close();
    };
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file && socket !== null) {
      const image = await readImage(file);

      const imageString = _arrayBufferToBase64(image);
      const fhirMediaResource = fhirImageComposer(imageString);
      const payload = JSON.stringify(fhirMediaResource);
      socket.send(payload);

    } else {
      throw new Error("Either no file could be read or socket has not been initialized");
    }
  };

  return (
    <div className="card">
      <h1>Image Classifier</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {fhirResource && (
        <div>
          <h2>Prediction:</h2>
          {fhirResource && <JsonViewer jsonData={fhirResource} />}
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