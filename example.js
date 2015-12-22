
var gcloudmon = require("./");

var gcloudmon = new gcloudmon({ project: "project-name",
                    authJSON: require("./key.json") });

var value = 69;

gcloudmon.on("error", function (err) {
    console.log("Something bad happened:", err.message);
})


// List metrics
gcloudmon.listMetrics(function (err,data){
    console.log('List metrics:', err, data.metrics);
});

// Define custom labels
labels = [
    {
        "key": "custom.cloudmonitoring.googleapis.com/your/metric/one",
        "description": "Metric One"
    },
    {
        "key": "custom.cloudmonitoring.googleapis.com/your/metric/two",
        "description": "Metric Two"
    }
];


// Create custom metric
gcloudmon.createMetric('/your/metric', labels, function (err,data){
    console.log(data);
}
);


// Submit metric data to the cloud
value = 69;
gcloudmon.setValue("/your/metric", value, { "/your/metric/one": "gcloudmon" }, function(err,data){
    console.log('setValue result:', err, data);
});

// Delete custom metric
gcloudmon.deleteMetric('/your/metric',function (err,data){ 
    console.log('Deleting custom metric:', err, data);
});
