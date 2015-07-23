package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type Action struct {
	MessageID         string       `json:"message_id"`
	Author            string       `json:"author"`
	Timestamp         int64        `json:"timestamp"`
	TimestampDatetime string       `json:"timestamp_datetime"`
	Body              string       `json:"body"`
	HTMLBody          string       `json:"html_body"`
	HasAttachment     bool         `json:"has_attachment"`
	Attachments       []Attachment `json:"attachments"`
}

type Attachment struct {
	Type       string `json:"attach_type"`
	URL        string `json:"url"`
	PreviewURL string `json:"preview_url"`
}

type Payload struct {
	Actions []Action `json:"actions"`
}

type ThreadInfoPage struct {
	Payload Payload `json:"payload"`
}

type ActionList []Action

func (a ActionList) Len() int {
	return len(a)
}

func (a ActionList) Less(i, j int) bool {
	return a[i].Timestamp < a[j].Timestamp
}

func (a ActionList) Swap(i, j int) {
	a[j], a[i] = a[i], a[j]
}

func main() {
	if len(os.Args) != 2 {
		log.Fatal("Usage: data_processor <directory path>")
	}
	dir, err := os.Open(os.Args[1])
	if err != nil {
		log.Fatal("Failed to open directory:", err)
	}
	defer dir.Close()
	names, err := dir.Readdirnames(-1)
	if err != nil {
		log.Fatal("Cannot read directory:", err)
	}
	allActions := make([]Action, 0)
	for _, name := range names {
		p := filepath.Join(os.Args[1], name)
		contents, err := ioutil.ReadFile(p)
		if err != nil {
			log.Print("Failed to read: "+p+":", err)
			continue
		}
		actions, err := parseActions(contents)
		if err != nil {
			log.Print("Failed to parse: "+p+":", err)
			continue
		}
		allActions = append(allActions, actions...)
	}
	sort.Sort(ActionList(allActions))
	fmt.Println("got", len(allActions), "actions")
	allActions = removeDuplicates(allActions)
	fmt.Println("got", len(allActions), "unique actions")
}

func parseActions(data []byte) ([]Action, error) {
	index := strings.Index(string(data), "{")
	if index < 0 {
		return nil, errors.New("no { in data")
	}
	jsonData := data[index:]
	var page ThreadInfoPage
	if err := json.Unmarshal(jsonData, &page); err != nil {
		return nil, err
	}
	return page.Payload.Actions, nil
}

func removeDuplicates(list []Action) []Action {
	var lastId string
	newList := make([]Action, 0, len(list))
	for i := 0; i < len(list); i++ {
		if list[i].MessageID != lastId {
			newList = append(newList, list[i])
			lastId = list[i].MessageID
		}
	}
	return newList
}
