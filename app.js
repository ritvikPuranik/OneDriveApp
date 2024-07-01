const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const bodyParser = require('body-parser');

// const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const session = require('express-session');
const flash = require('connect-flash');
const msal = require('@azure/msal-node');
const PORT = 3000;

const authRouter = require('./routes/auth');
// const calendarRouter = require('./routes/calendar');
const folderRouter = require('./routes/folder');
var app = express();
app.locals.users = {};


app.use(session({
  secret: 'your_secret_value_here',
  resave: false,
  saveUninitialized: false,
  unset: 'destroy'
}));

// Flash middleware
app.use(flash());
app.use(bodyParser.json());

// Set up local vars for template layout
app.use(function(req, res, next) {
  // Read any flashed errors and save
  // in the response locals
  res.locals.error = req.flash('error_msg');

  // Check for simple error string and
  // convert to layout's expected format
  var errs = req.flash('error');
  for (var i in errs){
    res.locals.error.push({message: 'An error occurred', debug: errs[i]});
  }

  // Check for an authenticated user and load
  // into response locals
  if (req.session.userId) {
    res.locals.user = app.locals.users[req.session.userId];
  }

  next();
});
// </SessionSnippet>

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var hbs = require('hbs');

hbs.registerHelper('truncate', function (str, len) {
  console.log('entered truncate');
  if (str.length <= len) {
    return str;
  }
  return str.slice(0, len - 3) + '...';
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
app.use('/auth', authRouter);
// app.use('/calendar', calendarRouter);
app.use('/folder', folderRouter);
app.use('/users', usersRouter);

/* GET home page. */
app.get('/', function(req, res) {
  console.log('entered home');
  let params = {
    active: { home: true }
  };

  res.render('index', params);
});

app.post('/signin', async(req, res) =>{
  console.log('entered signin>', req.body);
  const {client_id, client_secret} = req.body;
  const msalConfig = {
    auth: {
      clientId: client_id || '',
      authority: process.env.OAUTH_AUTHORITY,
      clientSecret: client_secret
    },
    system: {
      loggerOptions: {
        loggerCallback(loglevel, message, containsPii) {
          if (!containsPii) console.log(message);
        },
        piiLoggingEnabled: false,
        logLevel: msal.LogLevel.Verbose,
      }
    }
  };
  // Create msal application object
  app.locals.msalClient = new msal.ConfidentialClientApplication(msalConfig);

  const scopes = process.env.OAUTH_SCOPES || 'https://graph.microsoft.com/.default';
  const urlParameters = {
    scopes: scopes.split(','),
    redirectUri: process.env.OAUTH_REDIRECT_URI
  };

  try {
    const authUrl = await req.app.locals.msalClient.getAuthCodeUrl(urlParameters);
    console.log('auth url received>>', authUrl);
    res.redirect(authUrl);
  }
  catch (error) {
    console.log(`Error: ${error}`);
    req.flash('error_msg', {
      message: 'Error getting auth URL',
      debug: JSON.stringify(error, Object.getOwnPropertyNames(error))
    });
    res.redirect('/');
  }
});

// Update the endpoint to handle POST requests with a query parameter
app.post('/notificationClient', async (req, res) => {
  try {
    // Extract the validation token from query parameters
    const validationToken = decodeURIComponent(req.query.validationToken);
    console.log('Received validationToken post: value now>',validationToken);

    // Respond with the validation token
    res.status(200).type('text/plain');
    console.log('res object>>', res);
    res.send(validationToken);
  } catch (error) {
    console.error('Error handling notificationClient request:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/notificationClient', async (req, res) => {
  try {
    console.log('Received validationToken notificationClient GET:');
    // Extract the validation token from query parameters
    const validationToken = req.query.validationToken;


    // Respond with the validation token
    res.status(200).send(decodeURIComponent(validationToken));
  } catch (error) {
    console.error('Error handling notificationClient request:', error);
    res.status(500).send('Internal Server Error');
  }
});

// app.get('/lifecycleNotifications', async (req, res) => {
//   try {
//     // Extract the validation token from query parameters
//     const validationToken = req.query.validationToken;

//     console.log('Received validationToken /lifecycleNotifications GET:', validationToken);

//     // Respond with the validation token
//     res.status(200).send(decodeURIComponent(validationToken));
//   } catch (error) {
//     console.error('Error handling notificationClient request:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// app.post('/lifecycleNotifications', async (req, res) => {
//   try {
//     // Extract the validation token from query parameters
//     const validationToken = req.query.validationToken;

//     console.log('Received validationToken /lifecycleNotifications POST:', validationToken);

//     // Respond with the validation token
//     res.status(200).send(decodeURIComponent(validationToken));
//   } catch (error) {
//     console.error('Error handling notificationClient request:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Start the server
app.listen(PORT, async() => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
