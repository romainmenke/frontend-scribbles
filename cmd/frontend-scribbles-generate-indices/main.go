package main

import (
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

func (x *index) html(isRoot bool) string {
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

	middle := ""

	if !isRoot {
		middle += "<a href=\"/frontend-scribbles/\">/</a><br>"
		middle += "<a href=\"../" + "\">../</a><br>"
	}

	middle += "<a href=\"./\">" + x.name + "</a><br>" + x.list(2)

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
		middle += "<li><a href=\"" + filepath.Join("/frontend-scribbles/", subIndex.path, "index.html") + "\">" + subIndex.name + "</a>"
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

	knownDirs := map[string]struct{}{
		"docs":  struct{}{},
		"js":    struct{}{},
		"css":   struct{}{},
		"trash": struct{}{},
	}

	// Gather indices
	err := filepath.Walk("./docs", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() {
			return nil
		}

		dirPath := strings.TrimPrefix(path, "docs")
		superPath := filepath.Dir(strings.TrimPrefix(path, "docs"))
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
	err = filepath.Walk("./docs", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() {
			return nil
		}

		if _, ok := knownDirs[info.Name()]; !ok {
			return filepath.SkipDir
		}

		dirPath := strings.TrimPrefix(path, "docs")
		if index, ok := indices[dirPath]; ok {
			err := ioutil.WriteFile(filepath.Join(path, "index.html"), []byte(index.html(false)), 0644)
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
		err := ioutil.WriteFile(filepath.Join("./docs", "index.html"), []byte(index.html(true)), 0644)
		if err != nil {
			panic(err)
		}
	}
}
