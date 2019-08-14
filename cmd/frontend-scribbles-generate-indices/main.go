package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

type index struct {
	path string
	name string
	sub  []*index
}

func (x *index) html() string {
	start := `<!DOCTYPE html>
	<html lang="en" dir="ltr">
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title></title>

			<link rel="stylesheet" href="/index-stylesheet.css">
		</head>
		<body>
`

	end := `</body>
	</html>
`

	middle := "<a href=\"/\">" + x.name + "</a>" + x.list(2)

	return start + middle + end
}

func (x *index) list(level int) string {
	if len(x.sub) == 0 {
		return ""
	}

	start := "<ul>"
	end := "</ul>"
	middle := ""

	for _, subIndex := range x.sub {
		middle += "<li><a href\"" + strings.TrimSuffix(subIndex.path, "/") + "/" + "\">" + subIndex.name + "</a>"
		middle += subIndex.list(level + 1)
		middle += "</li>"
	}

	return start + middle + end
}

func main() {

	rootIndex := &index{
		path: "/",
		name: "root",
	}
	indices := map[string]*index{
		"/": rootIndex,
	}

	// Gather indices
	err := filepath.Walk("./pages", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() {
			return nil
		}

		// Containing dir has an index.html
		if _, err := os.Stat(filepath.Join(filepath.Dir(path), "index.html")); !os.IsNotExist(err) {
			return filepath.SkipDir
		}

		dirPath := strings.TrimPrefix(path, "pages")
		superPath := filepath.Dir(strings.TrimPrefix(path, "pages"))
		if super, ok := indices[superPath]; ok {
			newIndex := &index{
				path: dirPath,
				name: info.Name(),
			}

			super.sub = append(super.sub, newIndex)
			indices[dirPath] = newIndex
		}

		return nil
	})
	if err != nil {
		panic(err)
	}

	// Output indices
	err = filepath.Walk("./pages", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() {
			return nil
		}

		// dir has an index.html
		if _, err := os.Stat(filepath.Join(path, "index.html")); !os.IsNotExist(err) {
			return filepath.SkipDir
		}

		dirPath := strings.TrimPrefix(path, "pages")
		if index, ok := indices[dirPath]; ok {
			err := ioutil.WriteFile(filepath.Join(path, "index-test.html"), []byte(index.html()), 0644)
			if err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		panic(err)
	}

	if index, ok := indices["/"]; ok {
		err := ioutil.WriteFile(filepath.Join("./pages", "index-test.html"), []byte(index.html()), 0644)
		if err != nil {
			panic(err)
		}
	}

	fmt.Printf("%+v", rootIndex)
}
