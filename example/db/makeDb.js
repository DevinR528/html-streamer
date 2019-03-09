const fs = require('fs');
const path = require('path');

const people = [];
const names = ['devin', 'jim', 'austin', 'jamie']
for (let i = 0; i < names.length; i++) {
    const obj = Object.assign({}, {
        name: names[i],
        age: i + 1,
        birth: Date.now()
    });
    people.push(obj);
}

fs.writeFile(__dirname + '/data.json', JSON.stringify(people), err => {
    if (err) console.log(err);
});