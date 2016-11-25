'use strict';

var google = require('googleapis');
var gmonitoring = google.monitoring("v3");
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var CUSTOM_METRIC_DOMAIN = 'custom.googleapis.com';

function getNow() {
    var d = new Date();
    return JSON.parse(JSON.stringify(d).replace('Z', '000Z'));
}

var gcloudmon = function (options) {
    options = options || {};

    this.prefix = options.prefix || CUSTOM_METRIC_DOMAIN;
    this.project = 'projects/' + options.project;

    var monitoringScopes = [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/monitoring',
        'https://www.googleapis.com/auth/monitoring.read',
        'https://www.googleapis.com/auth/monitoring.write'
    ];

	if(options.keyFilename) {
		var authJSON = require(options.keyFilename);

		this.getMonitoringClient = function (callback) {
			google.auth.fromJSON(options.authJSON, function (err, authClient){
				if (err) {
					return callback(err);
				}
				if (authClient.createScopedRequired && authClient.createScopedRequired()) {
					authClient = authClient.createScoped(monitoringScopes);
				}
				callback(null, authClient);
			});
		}
	}else{
		this.getMonitoringClient = function (callback) {
			google.auth.getApplicationDefault(function (err, authClient, projectId) {
				if (err) {
					return callback(err);
				}
				if (authClient.createScopedRequired && authClient.createScopedRequired()) {
					authClient = authClient.createScoped(monitoringScopes);
				}
				callback(null, authClient);
			});
		}
	}
};

util.inherits(gcloudmon, EventEmitter);

gcloudmon.prototype.listMonitoredResourceDescriptors = function (callback){
    var self = this;

    self.getMonitoringClient(function (err, authClient) {
        gmonitoring.projects.monitoredResourceDescriptors.list({
            auth: authClient,
            name: self.project,
            pageSize: 5
        }, callback);
    });
}

gcloudmon.prototype.listMetricDescriptors = function (callback){
    var self = this;

    self.getMonitoringClient(function (err, authClient) {
        gmonitoring.projects.metricDescriptors.list({
            auth: authClient,
            name: self.project,
            pageSize: 5
        }, callback);
    });
}

gcloudmon.prototype.listGroups = function (callback){
    var self = this;

    self.getMonitoringClient(function (err, authClient) {
        gmonitoring.projects.groups.list({
            auth: authClient,
            name: self.project,
            pageSize: 10
        }, callback);
    });
}

gcloudmon.prototype.createMetric = function (params, callback){
    var self = this;

    self.getMonitoringClient(function (err, authClient) {
        gmonitoring.projects.metricDescriptors.create({
            auth: authClient,
            name: self.project,
            resource: {
                name: params.name,
                description: params.description,
                displayName: params.displayName,
                type: self.prefix + '/' + params.type,
                labels: params.labels,
                metricKind: params.metricKind || "GAUGE",
                valueType: params.valueType || "INT64"
            }
          }, callback);
    });
}

gcloudmon.prototype.deleteMetric = function (metricType, callback){
    var self = this;

    self.getMonitoringClient(function (err, authClient) {
        gmonitoring.projects.metricDescriptors.delete({
            auth: authClient,
            name: self.project + '/metricDescriptors/' + self.prefix + '/' + metricType
        }, callback);
    });
}

gcloudmon.prototype.setValue = function(metricType, value, params, callback){
    var self = this;
    var now = getNow();

    self.getMonitoringClient(function (err, authClient) {
        gmonitoring.projects.timeSeries.create({
            auth: authClient,
            name: self.project,
            resource: {
                timeSeries: [{
                    metric: {
                        type: self.prefix + '/' + metricType,
                        labels: params.labels
                    },
                    resource: {
                        type: params.resourceType || "global"
                    },
                    metricKind: params.metricKind || "GAUGE",
                    valueType: params.valueType || "INT64",
                    points: {
                        interval: {
                            startTime: params.intervalStart || now,
                            endTime: params.intervalEnd || now
                        },
                        value: {
                            [Number.isInteger(value) ? "int64Value" : "doubleValue"]: value
                        }
                    }
                }]
           }
        }, callback);
    });
}
gcloudmon.prototype.setValues = function (data,callback){
    var self = this;
    var now = getNow();

    self.getMonitoringClient(function (err, authClient) {

        var resources = {
            "timeSeries": data.map(function (params){
                return {
                    metric: {
                        type: self.prefix + '/' + params.metricType,
                        labels: params.labels
                    },
                    resource: {
                        type: params.resourceType || "global"
                    },
                    metricKind: params.metricKind || "GAUGE",
                    valueType: params.valueType || "INT64",
                    points: {
                        interval: {
                            startTime: params.intervalStart || now,
                            endTime: params.intervalEnd || now
                        },
                        value: {
                            [Number.isInteger(params.metricValue) ? "int64Value" : "doubleValue"]: params.metricValue
                        }
                    }
                }
            })
        };
        gmonitoring.projects.timeSeries.create({
            auth: authClient,
            name: self.project,
            resource: resources
        }, callback);
    });
}

module.exports = gcloudmon;
