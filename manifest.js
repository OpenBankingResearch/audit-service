'use strict';

const Confidence = require('confidence');
const Config = require('./config');
const Pack = require('./package');


const criteria = {
    env: process.env.NODE_ENV
};


const manifest = {
    $meta: 'This file defines the auditing service.',
    server: {
        debug: {

            request: ['error']
        },
        connections: {
            routes: {
                security: true
            }
        }
    },
    connections: [{
        port: Config.get('/port/api'),
        labels: ['api']
    }],
    registrations: [{
            plugin: 'vision'
        }, {
            plugin: 'inert'
        }, {
            plugin: 'lout'
        }, {
            plugin: 'h2o2'
        }, {
            plugin: 'chairo'
        },
      /*   {
            plugin: './server/azureBus'
        }, */
        {
            plugin: './server/api/index'
        },
        {
            plugin: {
                register: "good",
                options: {
                    ops: { interval: 5000 },
                    reporters: {
                        console: [{
                                module: "good-squeeze",
                                name: "Squeeze",
                                args: [{
                                    log: "*",
                                    response: "*"
                                }]
                            },
                            {
                                module: "good-console"
                            },
                            "stdout"
                        ],
                        logstash: [{
                            module: 'good-squeeze',
                            name: 'Squeeze',
                            args: [{
                                log: "*",
                                response: "*"
                            }]

                        }, {
                            module: 'good-logstash',
                            args: [
                                'udp://' + process.env.SVC_LOGSTASH_URL + ':' + process.env.SVC_LOGSTASH_PORT   
                            ]
                        }],
                        HTTPReporter: [{
                            module: 'good-squeeze',
                            name: 'Squeeze',
                            args: [{
                                log: "*",
                                response: "*",
                                ops:"*",
                                request:"*",
                                error:"*"
                            }]
                        }, {
                            module: 'good-http',
                            args: [process.env.LOG_API , {
                                wreck: {
                                    headers: { 'x-api-key': 12345 }
                                }
                            }]
                        }]


                    }
                }
            }
        }
    ]
};



const store = new Confidence.Store(manifest);


exports.get = function(key) {

    return store.get(key, criteria);
};


exports.meta = function(key) {

    return store.meta(key, criteria);
};