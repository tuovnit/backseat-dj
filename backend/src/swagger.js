const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Backseat DJ',
    description: 'Description'
  },
  host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const routes = ['./routes/spotifyRoutes',
	'./routes/queueRoutes',
	'./routes/authRoutes',
	'./routes/soundcloudRoutes',
	'./routes/userRoutes',
	];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);