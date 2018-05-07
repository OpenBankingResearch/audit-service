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


       var connStr = process.argv[2] || process.env.AZUREBUS_URL;
        if (!connStr) throw new Error('Must provide connection string');
        var queueName = 'sbqtest';
        
        console.log('Connecting to ' + connStr + ' queue ' + queueName);
        var sbService = azure.createServiceBusService(connStr);
        sbService.createQueueIfNotExists(queueName, function (err) {
          if (err) {
           console.log('Failed to create queue: ', err);
          } else {
           setInterval(checkForMessages.bind(null, sbService, queueName, processMessage.bind(null, sbService)), 5000);
           setInterval(sendMessages.bind(null, sbService, queueName), 15000);
          }
        }); 

        console.log('Server running at:', server.info.uri);
    });

});
