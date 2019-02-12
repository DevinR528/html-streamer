const { Transform } = require('stream');

class TemplateError extends Error {
  constructor (msg, num) {
    super('Streaming Template: ' + msg)
    this.num = num
  }

  get name () {
    return 'TempError'
  }
}

/**
 *
 *
 * @class TempTrans
 * @extends {Transform}
 */
class TempTrans extends Transform {
  /**
   *Creates an instance of TempTrans.
   * @param {Object} [opts] options object
   * @memberof TempTrans
   */
  constructor(opts) {
    super(opts);

    this.startOfTemp = true;
    this.middleOfTemp = false
    this.endOfTemp = false;
    
    this.templates = [];

    this.count = 0;
  }

  /**
   *
   *
   * @param {String} sliceStr
   * @memberof TempTrans
   */
  splitTemplate(sliceStr) {
    const htmlArr = sliceStr.split(/\{\{\{|\}\}\}/);
    if (htmlArr.length > 0) {
      const htmlTemp = { open: '', name: '', close: '' };
      for (let i = 0; i < htmlArr.length; i++) {
        if(this.startOfTemp) {
          htmlTemp.open = htmlArr[i];
          this.startOfTemp = false;
          this.middleOfTemp = true;
        } else if(this.middleOfTemp) {
          htmlTemp.name = htmlArr[i];
          this.middleOfTemp = false;
          this.endOfTemp = true;
        } else if(this.endOfTemp) {
          htmlTemp.close = htmlArr[i];
          this.endOfTemp = false;
          this.startOfTemp = true;
          const saveObj = Object.assign({}, htmlTemp)
          this.templates.push(saveObj);
        }
      }
    }
  }

  /**
   *
   *
   * @param {Buffer} chunk
   * @param {string} encoding
   * @param {Function} cb
   * @memberof TempTrans
   */
  _transform(chunk, encoding, cb) {
    const html = chunk.toString();
    this.splitTemplate(html);
    if(this.templates.length > 0) {
      for (let i = 0; i < this.templates.length; i++) {
        const temp = this.templates[i];
        for (const prop in temp) {
          if (prop === 'name'){
            this.emit('newEntry', temp[prop]);
            this.pause()
          } else {
            this.push(temp[prop])
          }
        }
      }
      cb()
    } else {
      this.emit('error', new TemplateError('Found nothing to stream', 3))
    }
  }
}

module.exports = TempTrans;