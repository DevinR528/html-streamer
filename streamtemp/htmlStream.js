const fs = require('fs');
const path = require('path');
const {Readable, Transform, Writable} = require('stream');
const trumpet = require('trumpet');

class accum extends Transform {
    constructor() {
        super({ encoding: 'utf8' });
        this.savedHtml = [];
    }

    _transform(chunk, enc, cb) {
        const val = chunk.toString();
        this.savedHtml.push(val)
        cb(null, chunk);
    }

    _final(cb) {
        this.emit("saved", this.savedHtml)
        cb()
    }
}

/**
 *
 * @param {String} html
 * @param {String} hash
 * @returns {String} scoped html
 */
class htmlTrans {
    constructor(html, hash) {
        this.hash = hash;
        this.enc = 'utf8';
        this.accum = new accum();

        this.r = new Readable({
            encoding: this.enc,
            read(size) {
                this.push(html)
                this.push(null)
            }
        })

        this.t = trumpet();
        this.t.selectAll('*', ele => {
            let className = ele.getAttribute('class')
            className = className === undefined ? '' : className;
            ele.setAttribute('class', `${this.hash}${className}`)
            ele.createReadStream({ outer: true })
        });
    }

    scope() {
        return new Promise((resolve, reject) => {
            this.accum.on('saved', () => {
                resolve(this.accum.savedHtml.join(''))
            });
            this.accum.on('error', err => {
                reject(err)
            });

            this.r.pipe(this.t)
                .pipe(this.accum);             
        })
    }
}

module.exports = htmlTrans

// (async () => {
//     const loc = path.join(__dirname, '/../example/partials/error/error.html')
//     const file = fs.readFileSync(loc, { encoding: 'utf8' })
//     const ht = new htmlTrans(file);
//     const o = await ht.scope();
//     console.log(o)
// })()