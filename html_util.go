package main

import (
	"github.com/yhat/scrape"
	"golang.org/x/net/html"
)

// MatchByAttribute creates a scrape.Matcher which matches elements which have a given attribute set
// to a given value.
func MatchByAttribute(attr, value string) scrape.Matcher {
	return func(n *html.Node) bool {
		return scrape.Attr(n, attr) == value
	}
}

// MatcherHybrid creates a matcher which only matches the intersection of other matchers.
func MatcherHybrid(matchers ...scrape.Matcher) scrape.Matcher {
	return func(n *html.Node) bool {
		for _, m := range matchers {
			if !m(n) {
				return false
			}
		}
		return true
	}
}
