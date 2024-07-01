package main

import (
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
        var message string
        err := conn.ReadJSON(&message)
        if err != nil {
            log.Println("Read error:", err)
            break
        }
        log.Println("Received:", message)

        // Send raw data to the frontend for WASM processing
        err = conn.WriteJSON(message)
        if err != nil {
            log.Println("Write error:", err)
            break
        }
    }
}

func main() {
    http.HandleFunc("/ws", wsHandler)
    log.Fatal(http.ListenAndServe(":8080", nil))
}

