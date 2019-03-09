class DirError extends Error {
    constructor (msg, num) {
      super(msg)
      this.num = num
    }
  
    get name () {
      return 'DirectoryError'
    }
}

class FileError extends Error {
    constructor (msg, num) {
      super(msg)
      this.num = num
    }
  
    get name () {
      return 'FileError'
    }
}

module.exports = { FileError, DirError }