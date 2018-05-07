'use strict';

const Confidence = require('confidence');
const Dotenv = require('dotenv');

Dotenv.config({
    silent: true
});

const criteria = {
    env: process.env.NODE_ENV
};


const config = {
    $meta: 'This file configures the auditService.',
    projectName: 'auditService',
    port: {
        api: {
            $filter: 'env',
            test: 9090,
            production: process.env.SVC_PORT || 8081,
            development: process.env.SVC_PORT || 8081,
            $default: process.env.SVC_PORT || 4051
        }
    },
    database: {
        $filter: 'env',
        production: {
            elastic: {
                username: '',
                password: '',
                url: process.env.SVC_ELASTIC_URL , // 'localhost:32768', ,
                database: '',
                log:'trace'
            }
        },
        development: {
            elastic: {
                username: '',
                password: '',
                url: process.env.SVC_ELASTIC_URL , // 'localhost:32768', ,
                database: '',
                log:'trace'
            }
        },
        $default: {
            elastic: {
                username: '',
                password: '',
                url: process.env.SVC_ELASTIC_URL, // 'localhost:32768', ,
                database: '',
                log:'trace'
            }

        }
    },

    microservice: {
        $filter: 'env',
        production: {
            listen: {
                type: process.env.AUDIT_SVC_TYPE || 'tcp',
                port: process.env.AUDIT_SVC_PORT || 4051,
                pin: ['role:log','role:audit']
            }
        },
        development: {
            listen: {
                type: process.env.AUDIT_SVC_TYPE || 'tcp',
                port: process.env.AUDIT_SVC_PORT || 4051,
                pin: ['role:log','role:audit']
            }
        },
        $default: {
            listen: {
                type: process.env.AUDIT_SVC_TYPE || 'tcp',
                port: process.env.AUDIT_SVC_PORT || 4051,
                pin: ['role:log','role:audit']
            }
        }
    }

};


const store = new Confidence.Store(config);


exports.get = function(key) {

    return store.get(key, criteria);
};


exports.meta = function(key) {

    return store.meta(key, criteria);
};