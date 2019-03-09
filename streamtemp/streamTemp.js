const { Transform } = require('stream');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto')
const fsP = fs.promises;

const hParse = require('htmlparser2');
const cssPrefix = require('css-prefix');

const TempTranStream = require('./tempTrans');
const { DirError, FileError } = require('./Errors');
const Hstream = require('./htmlStream');

const EOL = require('os').EOL;

const _lFile = Symbol('_lFile');
const _pFiles = Symbol('_pFiles');
const _styles = Symbol('_styles');

/**
 *
 *
 * @class StreamTemp
 */
class StreamTemp extends Transform {
    /**
     *Creates an instance of StreamTemp.
     * @param {Object} opts
     * @param {String} opts.layoutDir directory of layoutFile
     * @param {String} opts.partialsDir directory of partials
     * @param {String} [opts.extName] extension name of files defaults .html
     * @memberof StreamTemp
     */
    constructor(opts) {
        super({
            encoding: 'utf8',
            readableObjectMode: true
        })

        if (!opts.layoutDir) {
            throw new DirError('You must provide a Directory for layout');
        }
        if (!opts.partialsDir) {
            throw new DirError('You must provide a Directory for partials');
        }

        this.lDir = opts.layoutDir;
        this.pDir = opts.partialsDir;

        if (!(path.isAbsolute(this.lDir))) {
            throw new DirError('Path to layout must be absolut');
        }
        if (!(path.isAbsolute(this.pDir))) {
            throw new DirError('Path to partials must be absolut');
        }

        if (opts.extName) {
            if (!(opts.extName.startsWith('.'))) {
                opts.extName = '.' + opts.extName
            }
        }
        this.extName = opts.extName || '.html';

        this[_lFile] = null;
        this[_pFiles] = [];

        this.partials = {};
        this[_styles] = {};
    }

    async init() {
        await this.setDirs();
        this[_lFile] = this[_lFile][0];
        await this.setFiles()
        return this;
    }

    async setDirs() {
        try {
            [ this[_lFile], this[_pFiles] ] = await Promise.all([
                fsP.readdir(this.lDir),
                fsP.readdir(this.pDir)
            ]);
        } catch (err) {
            throw new DirError(`The directory "${err.path}" was not found`);
        }
    }

    async setFiles() {
        const hashes = {};
        var pushFiles = async (file) => {
            const loc = path.join(this.pDir, file);
            const stat = await fsP.lstat(loc);
            // find directories
            if (stat.isDirectory()) {
                const moreFiles = await fsP.readdir(loc);
                // add new folder to location and recursivly call pushfiles
                var recurs = async (f) => {
                    // file is actually a folder f is the file name
                    await pushFiles(path.join(file, f))
                };
                await Promise.all(moreFiles.map(recurs));
                return;
            }
            const fName = loc.slice(loc.lastIndexOf(path.sep)+1, loc.indexOf('.'));
            // sets new hash for unseen file pairs 
            hashes[fName] = hashes[fName] ? hashes[fName] : `${crypto.randomBytes(6).toString('hex')}__`;
            // if .css
            if (/.+\.css$/.test(loc)) {
                await this.setSyles(loc, fName, hashes[fName]);
            } else {
            // else normal html so save to object cache
                await this.setHtml(loc, fName, hashes[fName])
            }
        }

        try {
            await Promise.all(this[_pFiles].map(pushFiles));
        } catch (err) {
            console.log(err)
            throw new FileError(`The file at "${err.path}" was not found`)
        }
    }

    async setSyles(location, name, hash) {
        const css = await fsP.readFile(location, {encoding: 'utf8'})
        this[_styles][name] = Object.assign({}, {
            val: cssPrefix({
                prefix: hash,
                elementClass: hash
            }, css),
            path: location
        })
    }

    async setHtml(location, name, hash) {
        const html = await fsP.readFile(location, {encoding: 'utf8'});
        const hs = new Hstream(html, hash);
        const sHtml = await hs.scope();

        this.partials[name] = Object.assign({}, {
            val: sHtml,
            path: location
        });
    }

    // fix add error handle 
    streamIn(partial) {
        console.log(this[_styles])
        console.log(this.partials)
        const file = Object.keys(this.partials)
            .filter(fileName => fileName === partial);
        // fix
        return fs.createReadStream(this.partials[file].path)
    }

    async  render(partial, dest) {
        // fix this
        const ls = fs.createReadStream(path.join(this.lDir, this[_lFile]))
        const ts = new TempTranStream();
        ts.on('newEntry', _ => {
            this.streamIn(partial)
                .on('close', _ => ts.resume())
        });
        ls.pipe(ts)
    }

    _transform(chunk, enc, cb) {
        c
    }
}

module.exports = StreamTemp