var util = require('util');
var Client = require('node-rest-client').Client;
var analyticsAPI = new Client();

var aggregationProperty = 'concentration';
var aggregationMonitors = {
  average: 'average',
  max: 'max',
  min: 'min'
}

// registering remote methods 
analyticsAPI.registerMethod("getData", "http://results.testing-analytics.iot.apigee.net", "GET");

module.exports = function(server) {
  var self = this;

  var glucoseMeterQuery = server.where({ type: 'glucose-meter' });
  server.observe([glucoseMeterQuery], function(glucoseMeter){
    Object.keys(aggregationMonitors).forEach(function(aggregationMonitor, index){
      glucoseMeter._initMonitor(aggregationMonitor, {});
      glucoseMeter._monitors.push(aggregationMonitor);

      setInterval(function() {
        callAnalyticsAPI(glucoseMeter, aggregationProperty, aggregationMonitor);
      }.bind(), 1000);
      
    });
  });
}

var callAnalyticsAPI = function(device, aggregationProperty, aggregationMonitor) {

  var args = {
    parameters: {
      topic: device.type + '/' + device.id + '/' + aggregationProperty,
      field: 'value',
      aggregation: aggregationMonitors[aggregationMonitor]
    }
  };

  analyticsAPI.methods.getData(args, function (data, response) {
    var analyticsData = JSON.parse(data.toString());
    if (analyticsData.entities.length > 0) {
      device[aggregationMonitor] = analyticsData.entities[0].properties.value;
    }
  });

}