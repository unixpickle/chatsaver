// Command chatsaver archives a Facebook Messenger chat
// history.
package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/howeyc/gopass"
	"github.com/unixpickle/fbmsgr"
)

func main() {
	fmt.Print("Email/username: ")
	user := readLine()
	fmt.Print("Password: ")
	pass, err := gopass.GetPasswdMasked()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	fmt.Println()
	fmt.Println("Authenticating...")

	sess, err := fbmsgr.Auth(user, string(pass))
	if err != nil {
		fmt.Fprintln(os.Stderr, "Failed to login:", err)
		os.Exit(1)
	}

	fbid := promptChat(sess)

	fmt.Print("Destination filename: ")
	file := readLine()

	fmt.Println("Downloading messages...")
	var actions []map[string]interface{}

	actionChan, errChan := sess.FullActionLog(fbid, nil)
	for action := range actionChan {
		actions = append(actions, action.RawFields())
		fmt.Printf("\rGot %d actions...", len(actions))
	}
	fmt.Printf("\rTotal of %d actions...\n", len(actions))

	if err := <-errChan; err != nil {
		fmt.Fprintln(os.Stderr, "Fetch error:", err)
	}

	// Sort the actions chronologically.
	for i := 0; i < len(actions)/2; i++ {
		actions[i], actions[len(actions)-(i+1)] = actions[len(actions)-(i+1)], actions[i]
	}

	encoded, err := json.MarshalIndent(actions, "", "  ")
	if err != nil {
		fmt.Fprintln(os.Stderr, "Serialization failed:", err)
		os.Exit(1)
	}

	if err := ioutil.WriteFile(file, encoded, 0755); err != nil {
		fmt.Fprintln(os.Stderr, "Failed to write file:", err)
		os.Exit(1)
	}
}

func promptChat(s *fbmsgr.Session) string {
	fmt.Println("Listing your chats...")
	var idx int
	for {
		listing, err := s.Threads(idx, 20)
		if err != nil {
			fmt.Fprintln(os.Stderr, "Failed to list threads:", err)
			os.Exit(1)
		}
		for _, entry := range listing.Threads {
			otherNames := []string{}
			for _, id := range entry.Participants {
				for _, person := range listing.Participants {
					if person.FBID == id {
						otherNames = append(otherNames, person.Name)
					}
				}
			}
			names := strings.Join(otherNames, ",")
			if entry.Name == "" {
				fmt.Println(entry.ThreadFBID, "with", names)
			} else {
				fmt.Printf("%s named %s (with %s)\n", entry.ThreadFBID, entry.Name, names)
			}
		}
		if len(listing.Threads) < 20 {
			break
		}
		idx += len(listing.Threads)
	}
	fmt.Print("Pick FBID: ")
	return readLine()
}

func readLine() string {
	var res string
	for {
		buf := make([]byte, 1)
		if n, err := os.Stdin.Read(buf); err != nil {
			break
		} else if n != 0 {
			if buf[0] == '\n' {
				break
			}
			res += string(buf[0])
		}
	}
	return res
}
