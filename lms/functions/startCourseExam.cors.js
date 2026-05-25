const functions = require('firebase-functions');

const allowedOrigin = 'https://learnpaddi.in';

exports.startCourseExam = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', allowedOrigin);
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  const parsedRequestBody = req.body || {};
  console.log('startCourseExam request body:', parsedRequestBody);

  return res.status(200).json({
    message: 'Course exam started successfully!',
    dataReceived: parsedRequestBody,
  });
});
