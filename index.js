var google = require('googleapis');
var cloudmonitoring = google.cloudmonitoring("v2beta2");
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var gcloudmon = function (options) {
    options = options || {};

    this.project = options.project;
    this.prefix = options.prefix || "custom.cloudmonitoring.googleapis.com";

    this._authJSON = options.authJSON,

    this._jwtClient = new google.auth.JWT(null,
                                          null,
                                          null,
                                          "https://www.googleapis.com/auth/monitoring");
    this._jwtClient.fromJSON(this._authJSON);
};

util.inherits(gcloudmon, EventEmitter);

gcloudmon.prototype.createMetric = function (name, labels, callback){
    var self = this;

    var point = {
        "name": "custom.cloudmonitoring.googleapis.com/"+name,
        "typeDescriptor": {
            "metricType": "gauge",
            "valueType": "int64"
        },
        "labels": labels
    }

    var params = { auth: self._jwtClient,
                   project: self.project,
                   resource: point};

    cloudmonitoring.metricDescriptors.create(params, function (err, data) {
        if (err) {
            err.name = name;
            err.labels = labels;
            self.emit("error", err);
        }
        if(typeof(callback) === 'function') callback(err,data);
    });

}

gcloudmon.prototype.deleteMetric = function (name, callback){
    var self = this;

    var params = { auth: self._jwtClient,
                   project: self.project,
                   metric: encodeURIComponent(self._transformLabel(name))
    };

    cloudmonitoring.metricDescriptors.delete(params, function (err, data) {
        if (err) {
            err.metric = name;
            self.emit("error", err);
        }
        if(typeof(callback) === 'function') callback(err, data);
    });

}

gcloudmon.prototype.listMetrics = function (callback,searchstr){
    var self = this;

    var params = { auth: self._jwtClient,
                   project: self.project,
                   query: searchstr
                 };

    cloudmonitoring.metricDescriptors.list(params, function (err, data) {
        if (err) {
            self.emit("error", err);
        }
        callback(err,data);
    });
}

gcloudmon.prototype.setValue = function (name, value, labels, callback) {
    var self = this;
    var point = {
        "kind": "cloudmonitoring#writeTimeseriesRequest",
        "timeseries": [
            {
                "timeseriesDesc": {
                    "project": self.project,
                    "metric": self.prefix + name,
                    "labels": self._transformLables(labels)
                },
                "point": {
                    "start": (new Date()).toISOString(),
                    "end": (new Date()).toISOString(),
                    "int64Value": value
                }
            }
        ]
    };

    var params = { auth: self._jwtClient,
                   project: self.project,
                   resource: point
                 };

    cloudmonitoring.timeseries.write(params, function (err, data) {
        if (err) {
            err.value = value;
            self.emit("error", err);
        }
        if(typeof(callback) === 'function') callback(err, data);
    });
};

gcloudmon.prototype.setValues = function (values, callback) {
    var self = this;
    var point = {
        "timeseries": values.map(function (v) {
            return {
                "timeseriesDesc": {
                    "project": self.project,
                    "metric": self.prefix + v.name,
                    "labels": self._transformLables(v.labels)
                },
                "point": {
                    "start": (new Date()).toISOString(),
                    "end": (new Date()).toISOString(),
                    "int64Value": v.value
                }
            };
        })
    };

    var params = { auth: self._jwtClient,
                   project: self.project,
                   resource: point};

    cloudmonitoring.timeseries.write(params, function (err, data) {
        if (err) {
            err.values = values;
            self.emit("error", err);
        }
	if(typeof(callback) === 'function') callback(err, data);
    });
};

gcloudmon.prototype._transformLables = function (labels) {
    var self = this;
    var l = {};

    Object.keys(labels).map(function (label) {
        full_label = self._transformLabel(label);
	l[full_label] = labels[label];
    });

    return l;
};

gcloudmon.prototype._transformLabel = function(label){
    self = this;
    if (label.search(/\./) !== -1) { // use user defined prefix
        return label;
    }
    return self.prefix + label;
}

module.exports = gcloudmon;
