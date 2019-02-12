const { Stream } = require('stream');
const fs = require('fs')
const path = require('path')
const fsP = fs.promises;

const TempTranStream = require('./tempTrans')

const _layoutFile = Symbol('_layoutFile')

/**
 *
 *
 * @class StreamTemp
 */
class StreamTemp extends Stream {
    /**
     *Creates an instance of StreamTemp.
     * @param {Object} tempOpts
     * @param {Object} tempOpts.layoutDir directory of layoutFile
     * @param {Object} tempOpts.partials directory of partials
     * @param {Object} tempOpts.extName extension name of files defaults html
     * @memberof StreamTemp
     */
    constructor(tempOpts) {
        super()
        this.layoutDir = tempOpts.layoutDir;
        this.partialsDir = tempOpts.partialsDir;
        this.extName = tempOpts.extName || 'html';

        this[_layoutFile] = null;
        this.partialFiles = [];

        this.partials = {};
        this.layouts = [];
    }

    async setDirs() {
        try {
            [this[_layoutFile], this.partialFiles] = await Promise.all([
                fsP.readdir(this.layoutDir),
                fsP.readdir(this.partialsDir)
            ])
        } catch (err) {
            console.log(err)
        }
    }

    async setFiles() {
        const pushFiles = async (file) => {
            const location = path.join(this.partialsDir, file);
            const fName = file.slice(0, file.indexOf('.'));
            this.partials[fName] = await fsP.readFile(location, {encoding: 'utf8'});
        }
        
        await Promise.all(this.partialFiles.map(pushFiles))
    }

    // fix add error handle 
    streamIn(partial) {
        const fileCompare = `${partial}.${this.extName}`
        const file = this.partialFiles.filter(fileName => fileName === fileCompare);
        // fix
        return fs.createReadStream(path.join(this.partialsDir, file[0]))
    }

    async  render(partial, dest) {
        await this.setDirs();
        await this.setFiles();
        // fix this
        const ls = fs.createReadStream(path.join(this.layoutDir, this[_layoutFile][0]))
        const ts = new TempTranStream();
        
        // ls.pipe(ts)
        //     .on('newEntry', _ => {
        //         this.streamIn(partial)
        //             .on('close', _ => ts.resume())
        //             .pipe(dest)
        //     })
        //     .pipe(dest);
    }
}

module.exports = StreamTemp