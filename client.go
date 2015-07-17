package main

import (
	"errors"
	"fmt"
	
	"github.com/yhat/scrape"
	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
	"net/http"
	"net/http/cookiejar"
)

type Client struct {
	client *http.Client
}

func NewClient() Client {
	jar, _ := cookiejar.New(nil)
	return Client{&http.Client{Jar: jar}}
}

func (c Client) Login(email, password string) error {
	values, err := c.postValuesForLogin(email, password)
	
	// TODO: submit the login form.
	
	fmt.Println(values, err)
	return errors.New("not yet implemented")
}

func (c Client) postValuesForLogin(email, password string) (map[string]string, error) {
	resp, err := c.client.Get("https://www.facebook.com/")
	if err != nil {
		return nil, err
	}
	doc, err := html.Parse(resp.Body)
	if err != nil {
		return nil, err
	}
	loginForm, _ := scrape.Find(doc, scrape.ById("login_form"))
	if loginForm == nil {
		return nil, errors.New("unable to find login form")
	}
	hiddenInputs := scrape.FindAll(loginForm, MatcherHybrid(scrape.ByTag(atom.Input),
		MatchByAttribute("type", "hidden")))
	res := map[string]string{}
	for _, input := range hiddenInputs {
		res[scrape.Attr(input, "name")] = scrape.Attr(input, "value")
	}
	return res, nil
}
