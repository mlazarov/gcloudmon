
var gcloudmon = require("./");

var gcloudmon = new gcloudmon({ project: "your-project-id",
                    keyFilename: "./your-JSON-key.json" });

gcloudmon.on("error", function (err) {
    console.log("Something bad happened:", err.message);
})

// List metrics
gcloudmon.listMetricDescriptors(function (err,data){
    console.log(err, data);
});

// List metrics
gcloudmon.listMonitoredResourceDescriptors(function (err,data){
    console.log(err, data);
});

// Custom metric data
var params = {
    name: "Custom Metric name",
    displayName: "Custom Metric",
    type: 'your/metric',
    labels: [
      {
        key: "type",
        description: "Data Type",
        valueType: "string"
      }
    ]
};

// Create custom metric
gcloudmon.createMetric(params, function(err,data){
    console.log(err,data);
});

// Submit metric data to the cloud
gcloudmon.setValue('your/metric', 69, {labels: {type: 'position'}}, function (err,data){
    console.log(err,data);
});

// Submit multiple metrics data to the cloud
var metrics = [{
  metricType: 'your/metric',
  metricValue: 69,
  labels: {type: 'position'}
  },
  {
    metricType: 'your/metric',
    metricValue: 96,
    labels: {type: 'revposition'}
  },
  {
    metricType: 'your/metric2',
    metricValue: 101,
    labels: {type: 'unicorns'}
  }];
gcloudmon.setValues(metrics, function (err,data){
    console.log(err,data);
});

// Delete custom metric
gcloudmon.deleteMetric('your/metric', function(err,data){
    console.log(err,data);
});
