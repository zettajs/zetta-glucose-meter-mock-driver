var zetta = require('zetta');
var GlucoseMeter = require('../index');
var argv = require('minimist')(process.argv.slice(2));
var analytics = require('./apps/analytics');

var increment = argv['i'];

zetta()
  .use(GlucoseMeter, {increment: increment})
  .use(analytics)
  .link('http://dev.zettaapi.org')
  .link('http://testing-analytics.iot.apigee.net')
  .listen(1337);
