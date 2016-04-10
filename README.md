# Google Cloud Monitoring v3 Wrapper

A simple node.js wrapper arround the [Google Cloud Monitoring v3 API](https://cloud.google.com/monitoring/api/)

## Installation

```bash
npm install gcloudmon
```

## Usage

1. Enable *Google Cloud Monitoring API* in your Google Developer Console.
2. Create a new Client ID for a Service Account (JSON Key) and download it.
3. Start using gcloudmon to create custom metrics

## Example

```javascript
var gcloudmon = require("gcloudmon");

var gcloudmon = new gcloudmon({ project: "your-project-id",
                    authJSON: require("./your-JSON-key.json") });

gcloudmon.on("error", function (err) {
    console.log("Something bad happened:", err.message);
})

// List metrics
gcloudmon.listMetricDescriptors(function (err,data){
    console.log(data);
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
  }
);

// Delete custom metric
gcloudmon.deleteMetric('your/metric', function(err,data){
    console.log(err,data);
});

```


## Links

[Available Google metrics](https://cloud.google.com/monitoring/api/metrics)

[Google CloudMonitoring API beta nodejs client source code](https://github.com/google/google-api-nodejs-client/blob/master/apis/monitoring/v3.js)
This `gcloudmon` module is inspired by [iamat/google-cloudmonitoring](https://github.com/iamat/google-cloudmonitoring/)


## License

MIT License

Copyright (C) 2016 Martin Lazarov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
