const session = require('express-session');
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./module/Database');
const fakeDatabase = require('./module/fakeUserData'); 
const fakeDatabaseBad = require('./module/fakeDatabaseBad'); 
const config = require('./config');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());
// Postavljanje express-session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

if (config.externalUrl) {
  const hostname = '0.0.0.0'; //ne 127.0.0.1
  app.listen(config.port, hostname, () => {
    console.log(`Server locally running at http://${hostname}:${config.port}/ and from outside on ${config.externalUrl}`);
  });
} else {
  https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app)
    .listen(config.port, function () {
      console.log(`Server running at https://localhost:${config.port}/`);
    });
}

app.get('/', (req, res) => {
  res.render('search', { title: 'DRUGA LABORATORIJSKA VJEZBA' });
});

app.post('/search', async (req, res) => {
  const searchTerm = req.body.input;
  const vulnerabilityEnabled = req.body.vulnerability === 'on';

  //console.log('Uneseni pojam za pretragu:', searchTerm);

  try {
    const competitions = await db.searchCompetitionsByName(searchTerm, vulnerabilityEnabled); 
   // res.send('Rezultati upita: ' + JSON.stringify(competitions));
   res.render('results', { competitions: competitions, searchTerm: searchTerm });
  } catch (error) {
    console.error('Greska prilikom pretrage natjecanja:', error);
    res.status(500).send('Greska prilikom pretrage natjecanja');
  }
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log('Uslo u login:', username + ' ' + password);


  // Provjera korisni?kih podataka
  const user = fakeDatabase.users[username];

  if (user && user.password === password) {
    // Kreiranje sesije
    req.session.username = username;
    const sessionId = req.sessionID;
    fakeDatabase.sessions[sessionId] = { username };
    res.cookie('session_id', sessionId);

    res.redirect('/auth');
  } else {
    // Neuspje?na autentifikacija
    res.status(401).send('Neuspjesna autentifikacija');
  }
});


app.get('/login_bad', (req, res) => {
  const username = req.query.username;
  const password = req.query.password;

  console.log('Uslo u login_bad:', username + ' ' + password);
  const user = fakeDatabaseBad.users[username];

  if (user && user.password === password) {
    req.session.username = username;
    const sessionId = req.sessionID;
    fakeDatabase.sessions[sessionId] = { username };
    res.cookie('session_id', sessionId);

    // Prijenos podataka na stranu klijenta
    const sessionData = {
      success: true,
      message: 'Uspjesna autentifikacija',
      sessionData: {
        username: username,
        password: password,
        sessionID: req.sessionID,
        secret: user.secret
      },
    };
res.render('broken_auth', { sessionData: sessionData });
  } else {
    // Neuspje?na autentifikacija
    res.status(401).send('Neuspjesna autentifikacija');
  }
});

app.get('/auth', (req, res) => {

  console.log('Session in auth route:', req.session);

  if (req.session.username) {
    console.log('Uslo u auth:');

    // Sesija je valjana, dohvatite podatke korisnika
    const user = fakeDatabase.users[req.session.username];
    console.log('Sesija :', req.session);

    console.log('Session id :', req.sessionID);

    console.log('db sesions :', fakeDatabase.sessions);

    res.render('auth', { title: 'Autentificiran!', user });
  } else {
    // Ako nema valjane sesije, preusmjerite na po?etnu stranicu
    res.redirect('/');
  }
});


app.get('/logout', async (req, res) => {
  // Odjava - uni?ti sesiju
  console.log('db sesion to be destroyed:', req.sessionID);

  delete fakeDatabase.sessions[req.sessionID];

  await new Promise(resolve => {
    req.session.destroy(() => {
      resolve();
    });
  });


  console.log('db sesions after logout:', fakeDatabase.sessions);
  res.redirect('/');
});


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

