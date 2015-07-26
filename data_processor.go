package main

import (
	"bufio"
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
	ThreadID          string       `json:"thread_id"`
	Body              string       `json:"body"`
	HTMLBody          string       `json:"html_body"`
	HasAttachment     bool         `json:"has_attachment"`
	Attachments       []Attachment `json:"attachments"`

	AuthorName string `json:"author_full_name"`
}

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

func commandLineInput(prompt string) string {
	fmt.Print(prompt)
	scanner := bufio.NewScanner(os.Stdin)
	scanner.Scan()
	return scanner.Text()
}

func fillOutUsernames(actions []Action) {
	idToName := map[string]string{}
	for i, action := range actions {
		if name, ok := idToName[action.Author]; ok {
			action.AuthorName = name
		} else {
			input := commandLineInput("Name for " + action.Author + ": ")
			idToName[action.Author] = input
			action.AuthorName = input
		}
		actions[i] = action
	}
}

func filterThreadId(allActions []Action) []Action {
	// If all the thread IDs are the same, we don't need to ask.
	var threadId string
	for i, action := range allActions {
		if i == 0 {
			threadId = action.ThreadID
		} else if threadId != action.ThreadID {
			threadId := commandLineInput("Thread ID: ")
			newActions := make([]Action, 0, len(allActions))
			for _, action := range allActions {
				if action.ThreadID == threadId {
					newActions = append(newActions, action)
				}
			}
			return newActions
		}
	}

	return allActions
}

func main() {
	if len(os.Args) != 3 {
		log.Fatal("Usage: data_processor <directory path> <processed_out.js>")
	}
	dir, err := os.Open(os.Args[1])
	if err != nil {
		log.Fatal("Failed to open directory: ", err)
	}
	defer dir.Close()
	names, err := dir.Readdirnames(-1)
	if err != nil {
		log.Fatal("Cannot read directory: ", err)
	}
	allActions := make([]Action, 0)
	for _, name := range names {
		p := filepath.Join(os.Args[1], name)
		contents, err := ioutil.ReadFile(p)
		if err != nil {
			log.Print("Failed to read: "+p+": ", err)
			continue
		}
		actions, err := parseActions(contents)
		if err != nil {
			log.Print("Failed to parse: "+p+": ", err)
			continue
		}
		allActions = append(allActions, actions...)
	}
	sort.Sort(ActionList(allActions))
	log.Print("got ", len(allActions), " actions")
	allActions = removeDuplicates(allActions)
	log.Print("got ", len(allActions), " unique actions")
	allActions = filterThreadId(allActions)
	log.Print("got ", len(allActions), " in thread")
	fillOutUsernames(allActions)

	outputActions := make([]OutputAction, len(allActions))
	for i, act := range allActions {
		outputActions[i] = OutputAction{act.AuthorName, act.Body, act.Timestamp, act.HasAttachment,
			act.Attachments}
	}
	data, err := json.Marshal(outputActions)
	if err != nil {
		log.Fatal(err)
	}
	data = append([]byte("window.allFacebookMessages = "), append(data, ';')...)
	if err := ioutil.WriteFile(os.Args[2], data, 0777); err != nil {
		log.Fatal(err)
	}
	log.Print("Wrote output to: " + os.Args[2])
}

func parseActions(data []byte) ([]Action, error) {
	index := strings.Index(string(data), "{")
	if index < 0 {
		return nil, errors.New("no JSON object in data")
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
