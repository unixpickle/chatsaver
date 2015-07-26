package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
)

type OutputAction struct {
	Author        string       `json:"author"`
	Body          string       `json:"body"`
	Timestamp     int64        `json:"timestamp"`
	HasAttachment bool         `json:"has_attachment"`
	Attachments   []Attachment `json:"attachments"`
}

type Attachment struct {
	Type       string `json:"attach_type"`
	URL        string `json:"url"`
	PreviewURL string `json:"preview_url"`
	HighresURL string `json:"hires_url"`
}

func main() {
	if len(os.Args) != 3 {
		log.Fatal("Usage: image_fetcher <processed.js> <output>")
	}
	parsed, err := readProcessedData(os.Args[1])
	if err != nil {
		log.Fatal(err)
	}
	dirPath := os.Args[2]
	for _, message := range parsed {
		if !message.HasAttachment {
			continue
		}
		for i, attachment := range message.Attachments {
			if attachment.Type != "photo" {
				continue
			}
			data, err := downloadURL(attachment.HighresURL)
			if err != nil {
				log.Print("error downloading file:", err)
			}
			downloadedPath := filepath.Join(dirPath, strconv.FormatInt(message.Timestamp,10)+"_"+
				strconv.Itoa(i)+".jpg")
			if err := ioutil.WriteFile(downloadedPath, data, 0777); err != nil {
				log.Print("error writing file:", downloadedPath, ":", err)
			}
		}
	}
}

func readProcessedData(path string) ([]OutputAction, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	realData := data[29 : len(data)-1]
	var res []OutputAction
	if err := json.Unmarshal(realData, &res); err != nil {
		return nil, err
	}
	return res, nil
}

func downloadURL(url string) ([]byte, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return ioutil.ReadAll(resp.Body)
}
