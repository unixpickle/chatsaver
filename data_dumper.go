package main

import (
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
)

var DumpDirectory string

func main() {
	if len(os.Args) != 3 {
		log.Fatal("Usage: data_dumper <port> <dump directory>")
	}
	if _, err := strconv.Atoi(os.Args[1]); err != nil {
		log.Fatal("Invalid port:", err)
	}
	DumpDirectory = os.Args[2]
	http.HandleFunc("/", HandleRequest)
	http.ListenAndServe(":"+os.Args[1], nil)
}

func HandleRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	r.ParseForm()
	filename := r.URL.Query().Get("filename")
	if filename == "" {
		log.Print("Received request without filename.")
		w.Write([]byte(`<!doctype html><html>
			<body>Use a ?filename= parameter and POST data</body></html>`))
		return
	}
	fullPath := filepath.Join(DumpDirectory, filepath.Base(filename))
	file, err := os.Create(fullPath)
	if err != nil {
		log.Print("Failed to open: "+fullPath+":", err)
		return
	}
	defer file.Close()
	io.Copy(file, r.Body)
	log.Print("Wrote file: " + fullPath)
}
