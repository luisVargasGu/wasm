package main

import (
	"bytes"
	"io"
	"log"
	"net/http"
    "mime/multipart"
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
        _ , p, err := conn.ReadMessage()
        if err != nil {
            log.Println(err)
            return
        }

        // Call Python backend
		// THIS METHOD WILL FAIL
		// YOU MUST EXTRACT THE BASE64 IMAGE FROM 'p.content.data'
		// AND 
        response, err := callPythonBackend(p)
        if err != nil {
            log.Println(err)
            return
        }

        if err := conn.WriteMessage(websocket.TextMessage, response); err != nil {
            log.Println(err)
            return
        }
    }
}

func callPythonBackend(data []byte) ([]byte, error) {
	url := "http://localhost:5001/predict" // Your Python backend URL

	// Create a buffer and a multipart writer
	var buffer bytes.Buffer
	writer := multipart.NewWriter(&buffer)

	// Create a form file field and write the data to it
	part, err := writer.CreateFormFile("image", "upload.jpg")
	if err != nil {
		return nil, err
	}
	part.Write(data)
	writer.Close()

	req, err := http.NewRequest("POST", url, &buffer)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

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

