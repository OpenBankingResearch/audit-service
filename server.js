'use strict';

const Composer = require('./index');
const Config = require('./config').get('/microservice/listen');

Composer((err, server) => {

    if (err) {
        throw err;
    }

    server.decorate('reply', 'success', function(msg, data) {

        return this.response({ status: 'ok', msg: msg, result: data });
    });

    server.seneca.listen({
        type: Config.type,
        pin: Config.pin,
        port: Config.port
        ,host:'localhost'
    })

    server.start((error) => {

        if (error) {
            throw error;
        }

        console.log('Server running at:', server.info.uri);
    });

});
