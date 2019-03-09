const fs = require('fs');
const { Transform } = require('stream');

const EOL = require('os').EOL;

class ObjectStream extends Transform{
    constructor() {
        super({
            encoding: 'utf8',
            objectMode: true
        });

        this.open = true;
        this.close = false;
    }

    /**
     *
     *
     * @param {Buffer} chunk
     * @returns {Array<Strings>} json strings with no open, sep or close
     * @memberof test
     */
    formatObject(chunk, enc) {
        let json = chunk.toString(enc).split(EOL).join('');
        json = json.split(' ').join('');
        if(this.open) {
            this.open = false;
            if(json.startsWith('[')) {
                json = json.slice(1);
            }
            this.close = true;
        }
        if(this.close) {
            if (json.endsWith(']')) {
                json = json.slice(0, json.length -1);
                this.close = false;
            }
        }
        // split for regular json and for mongo
        return json.split(/(?={)|,(?={)/g);
    }

    /**
     *
     *
     * @param {Buffer} chunk
     * @param {String} enc
     * @param {Function} cb
     * @memberof test
     */
    _transform(chunk, enc, cb) {
        const objArr = this.formatObject(chunk, enc)
        for (let i = 0; i < objArr.length; i++) {
            const ele = objArr[i];
            try {
                JSON.parse(ele);
                this.push(ele, enc)
            } catch (err) {
                this.emit('error', err)
            }
        }
        cb(null);
    }
}

module.exports = ObjectStream
// var count = 0;
// fs.createReadStream(__dirname + '\\data.json')
//     .pipe(new test())
//     .on("data", data => {
//         count++;
//         console.log(`${count}: ${data}`)
//     });