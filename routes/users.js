var express = require('express');
var router = express.Router();
var redis = require('redis');
var client = redis.createClient();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
  client.get('name', function(err, reply) {
    console.log(reply)
  })
});

module.exports = router;
