const StreamPlate = require('./streamtemp/StreamTemp');

if (require.main === module) {
    const path = require('path');
    const hDir = path.join(__dirname, 'example');
    const temp = new StreamPlate({
        layoutDir: path.join(hDir, 'layout'),
        partialsDir: path.join(hDir, 'partials')
    });

    (async () => {
        const st = await temp.init()
        st.render('error', process.stdout);
    })()
} else {
    module.exports = StreamPlate
}

 // this should render the stream of docs to html
 // db.find().pipe(temp.render('test))
 