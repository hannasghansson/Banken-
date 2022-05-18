import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import session from 'express-session';

const port = 3000
const app = express();
const saltRounds = 10;
app.use(express.json());
app.use(express.static('views'))

// MongClinet koppling
const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('bank');
const usersCollection = db.collection('usersColl');
const accountCollection = db.collection('accountColl');

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'shhhh, very secret',
  cookie: {
    maxAge: 60 * 60 * 1000
  }
}));

// Meddelande blir hemligt om du inte är inloggad
const restrict = (req, res, next) => {
  if (req.session.username) {
    next();
  } else {
    res.status(401).send({ error: 'Unauthorized' });
  }
}

// Logga ut
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({
      loggedin: false
    });
  });
});

// Register new user
app.post('/api/register', async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, saltRounds);

  await usersCollection.insertOne({
    username: req.body.username,
    password: hash
  });

  res.json({
    success: true,
    username: req.body.username
  });
});

// Login
app.post('/api/login', async (req, res) => {
  const user = await usersCollection.findOne({ username: req.body.username });
  const passMatches = await bcrypt.compare(req.body.password, user.password);
  if (user && passMatches) {
    req.session.username = user.username;
    
    res.json({
      username: user.username
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Inloggad användare
  app.get('/api/loggedin', (req, res) => {
  if (req.session.username) {
    res.json({
      username: req.session.username
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// secret button
app.get('/api/secretdata', restrict, (req, res) => {
  res.json({
    secret: 'Javascript is fun!'
  });
});


// Hämta alla användare
app.get('/api/getUser/:id', async (req, res) => {
  const users = await usersCollection.find({}).toArray(); 
  res.json (users);
});

// Hämta 1 användare
//app.get('/api/user/:id', async (req, res) => {
//  const users = await usersCollection.findOne({ _id: ObjectId(req.params.id) }); 
//  res.json (users);
//});
 
// Skapar 1 bank konto 
app.post('/api/createAccount', async(req,res) =>{
  await accountCollection.insertOne({
    ...req.body,
    date : new Date()
  });
  res.json(req.body);
});


// Hämta Alla bankonton  
app.get('/api/getAllAccounts', async (req, res) => {
  const users = await accountCollection.find({}).toArray(); 
  res.json (users);
});

// Hämta enskild konto 
app.get('/api/getAccount/:id', async (req, res) => {
  const users = await accountCollection.findOne({ _id: ObjectId(req.params.id) }); 
  res.json (users);
});


// Add pengar på konto
app.put('/api/addAmount/:id', async (req, res) => {
  let usersAddAmount = await accountCollection.findOne({ _id: ObjectId(req.params.id) })
  usersAddAmount = {
    ...usersAddAmount,
    ...req.body
  };
  await accountCollection.updateOne({ _id: ObjectId(req.params.id)}, { $set: usersAddAmount });
  res.json ({ 
    success: true,
    usersAddAmount
  })
});

//  Reduce pengar på konto
app.put('/api/reduceAmount/:id', async (req, res) => {
  let usersReduceAmount = await accountCollection.findOne({ _id: ObjectId(req.params.id) })
  usersReduceAmount = {
    ...usersReduceAmount,
    ...req.body
  };
  await accountCollection.updateOne({ _id: ObjectId(req.params.id)}, { $set: usersReduceAmount });
  res.json ({ 
    success: true,
    usersReduceAmount
  })
});

// Ta bort konto
app.delete('/api/deleteAccount/:id', async (req, res) => {
  await accountCollection.deleteOne({_id: ObjectId(req.params.id)});
  res.status(204).send();
});

// Datum 
app.post('/api/addDateAccount', async (req, res) => {
  const entry = {
    ...req.body,
    date: new Date(req.body.date)
  };
  await accountCollection.insertOne(entry);
  res.json({
    success: true,
    entry
  });
});

app.listen(port, () => console.log(`Listening on ${port}`));