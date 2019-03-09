# Html Streamers

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]

## Streaming html response for each 'doc' from database
just have an html file with your document props as inner text just like handlebars

```html
<h1>TEST</h1>
<div>
    <h2>you did it {{name}}</h2>
    <p>{{age}}</p>
    <p>{{date}}</p>
</div>
```

## Stream your docs to html streamer

```json
[
    {
        "name": "devin",
        "age": 1,
        "birth": 1551577903697
    },
    {
        "name": "jim",
        "age": 2,
        "birth": 1551577903698
    }
]
```

```js
db.find().stream()
    .pipe(htmlStream)
    .pipe(response)
```

## Out put will look like this

```html
<h1>TEST</h1>
<div>
    <h2>you did it devin</h2>
    <p>1</p>
    <p>1551577903697}</p>
</div>
```

## Installing and using
To use this with hyper simply add hyper_auto-complete to your .hyper.js

```bash
npm i html-streamer
```

or clone the [git repo](https://github.com/DevinR528/) and help out


[build-badge]: https://img.shields.io/travis/user/repo/master.png?style=flat-square
[build]: https://travis-ci.org/user/repo

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/npm-package

[coveralls-badge]: https://img.shields.io/coveralls/user/repo/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/user/repo
