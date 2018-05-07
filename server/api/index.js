'use strict';

const Joi = require('joi');
const slug = require('slug');
const crypto = require("crypto");

const Boom = require('boom');
const Event = require('./models/event');


var Elasticsearch = require('elasticsearch');


var Promise = require('bluebird');


const DatabaseConfig = require('./../../config').get('/database/elastic');
var client = new Elasticsearch.Client({
    host: DatabaseConfig.url,
    log: DatabaseConfig.log
});

var elasticConfig = {
    indexAudit: 'audit',
    indexLog: 'log',
    type: 'logs'
};


exports.register = function (server, options, next) {

    // Set up a Seneca action

    var id = 0;

    server.seneca.add({
        role: 'audit',
        cmd: 'add'
    }, function (message, next) {

        var sluggedName;

        // Validate log object
        const result = Joi.validate(message.log, Event);

        if (result.error) {

            console.log('Audit:add(). Validation failed', result.value);

            return next(result.value);
        }

        message.log.date = new Date();
        message.log.id = getUniqueId();

        createIndex(elasticConfig.indexAudit);
        addToIndex(elasticConfig.indexAudit, message.log);

        return next({
            msg: 'audit saved'
        });

    });


    server.seneca.add({
        role: 'log',
        cmd: 'addBulk'
    }, function (message, next) {

        return next({
            msg: 'log saved'
        });

        message.log.id = getUniqueId();

        createIndex(elasticConfig.indexLog);

        for (var i = 0, len = message.log.events.length; i < len; i++) {

            message.log.events[i].date = new Date();
            message.log.events[i].id = getUniqueId();
            message.log.events[i].host = message.log.host;
            message.log.events[i].schema = message.log.schema;

            addToIndex(elasticConfig.indexLog, message.log.events[i]);
        }

        return next({
            msg: 'log saved'
        });

    });

    function getUniqueId() {

        return crypto.randomBytes(16).toString("hex");

    }

    function createIndex(indexName) {

        indexExists(indexName, function (err, exists) {
            console.log('index exists', exists);
            if (!exists) {
                console.log('createIndex');
                client.indices.create({
                    index: indexName
                    //mapping: this.opts.mapping
                });
            }

        });

    }

    function indexExists(indexName, callback) {
        client.indices.exists({
            index: indexName
        }, callback);
    }

    function addToIndex(indexName, data) {
        console.log('addToIndex');
        client.index({
            index: indexName,
            type: elasticConfig.type,
            //id: '1',
            body: data
        }, function (err, data) {

            console.log('data added to elastic')

        });
    }


    server.route({
        path: '/audit',
        method: 'POST',
        handler: function (request, reply) {

            console.log('model properties', request.payload)

            request.seneca.act({
                role: 'audit',
                cmd: 'add',
                log: request.payload
            }, function (err, result) {

                if (err) {
                    console.log(err);
                    return reply(Boom.wrap(err, 'Internal ElasticSearch error'));
                }

                console.log('post log rest api called');

                return reply.success('log added', result)
            });

        },
        config: {
            validate: {
                payload: {
                    severity: Joi.string(),
                    user: Joi.string().required(),
                    id: Joi.string(),
                    timeStamp: Joi.date().required(),
                    category: Joi.string(),
                    description: Joi.string(),
                    descriptionId: Joi.string(),
                    fullyQualifiedClassName: Joi.string(),
                    methodName: Joi.string(),
                    data: [Joi.object(), Joi.string()]

                }
            }
        }
    });

    server.route({
        path: '/log/bulk',
        method: 'POST',
        handler: function (request, reply) {

            console.log('model properties', request.payload)

            request.seneca.act({
                role: 'log',
                cmd: 'addBulk',
                log: request.payload
            }, function (err, result) {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                console.log('post log bulk rest api called');

                return reply.success('log added', result)
            });

        },
        config: {
            validate: {
                payload: {
                    "host": Joi.string(),
                    "schema": Joi.string(),
                    "timeStamp": Joi.date(),
                    events: Joi.array()

                }
            }
        }
    });


    next();
};


exports.register.attributes = {
    name: 'api'
};