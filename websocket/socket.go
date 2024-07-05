package main

import (
	"bytes"
	"io"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println("Upgrade error:", err)
        return
    }
    defer conn.Close()

    for {
        messageType, p, err := conn.ReadMessage()
        if err != nil {
            log.Println(err)
            return
        }

        // Call Python backend
        response, err := callPythonBackend(p)
        if err != nil {
            log.Println(err)
            return
        }

        if err := conn.WriteMessage(messageType, response); err != nil {
            log.Println(err)
            return
        }
    }
}

func callPythonBackend(data []byte) ([]byte, error) {
    url := "http://localhost:5001/your-endpoint" // Your Python backend URL
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(data))
    if err != nil {
        return nil, err
    }

    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    return body, nil
}

func main() {
    http.HandleFunc("/ws", wsHandler)
    log.Fatal(http.ListenAndServe(":8080", nil))
}

