const path = require('path');
const StreamPlate = require('./streamtemp/StreamTemp');

const hDir = path.join(__dirname, 'example');
const temp = new StreamPlate({
    layoutDir: path.join(hDir, 'layout'),
    partialsDir: path.join(hDir, 'partials')
});

(async () => {
    const st = await temp.init()
    st.render('error', process.stdout);
 })()

 // this should render the stream of docs to html
 // db.find().pipe(temp.render('test))
