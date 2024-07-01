import { useEffect, useState } from "react";
import "./App.css";
import reactLogo from "./assets/react.svg";
import { loadWasm } from "./goWasm";
import viteLogo from "/vite.svg";

function App() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const initWasm = async () => {
      await loadWasm();

      const socket = new WebSocket("ws://localhost:8080/ws");
      setSocket(socket);

      socket.onopen = () => {
        console.log("WebSocket connection established");
      };

      socket.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        const important = await (window as any).processData(message);
        if (important) {
          setNotifications((prev) => [...prev, "Important data detected!"]);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };

      socket.onerror = (error) => {
        console.log("WebSocket error:", error);
      };

      return () => {
        socket.close();
      };
    };

    initWasm();
  }, []);

  const sendMessage = (msg: string) => {
    if (socket) {
      socket.send(JSON.stringify(msg));
    }
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <h1>Notifications</h1>
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>{notification}</li>
          ))}
        </ul>
        <button onClick={() => sendMessage("important")}>
          Send Important Message
        </button>
        <button onClick={() => sendMessage("unimportant")}>
          Send Unimportant Message
        </button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
