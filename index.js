const path = require('path');
const StreamPlate = require('./streamtemp/streamTemp');

const hDir = path.join(__dirname, 'example');
const st = new StreamPlate({
    layoutDir: path.join(hDir, 'layout'),
    partialsDir: path.join(hDir, 'partials')
});

st.render('error', process.stdout);
//st.render('test').pipe(process.stdout)
