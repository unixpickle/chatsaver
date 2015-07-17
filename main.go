package main

import (
	"bufio"
	"fmt"
	"os"
	
	"github.com/howeyc/gopass"
)

func main() {
	fmt.Print("Username: ")
	username := readLine()
	fmt.Print("Password: ")
	password := string(gopass.GetPasswdMasked())
	fmt.Println("Logging in...")
	
	client := NewClient()
	if err := client.Login(username, password); err != nil {
		fmt.Fprintln(os.Stderr, "Error logging in: "+err.Error())
		os.Exit(1)
	}
	
	fmt.Println("Logged in.")
}

func readLine() string {
	scanner := bufio.NewScanner(os.Stdin)
	scanner.Split(bufio.ScanLines) 
	if !scanner.Scan() {
		fmt.Fprintln(os.Stderr, "EOF")
		os.Exit(1)
	}
	return scanner.Text()
}
