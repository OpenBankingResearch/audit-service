'use strict';
const Config = require('../config');
const Fs = require('fs');
const Hoek = require('hoek');
const azure = require('azure-sb');


const internals = {};

internals.transport = new twilio(Config.get('/sms/accountSid'), Config.get('/sms/authToken'));

internals.templateCache = {};


internals.checkForMessages = function(sbService, queueName, callback) {
    
    sbService.receiveQueueMessage(queueName, { isPeekLock: true }, function (err, lockedMessage) {
        if (err) {
        if (err == 'No messages to receive') {
            console.log('No messages');
        } else {
            callback(err);
        }
        } else {
        callback(null, lockedMessage);
        }
    });

};

internals.processMessage = function(sbService, err, lockedMsg) {
    if (err) {
      console.log('Error on Rx: ', err);
    } else {
      console.log('Rx: ', lockedMsg);
      sbService.deleteMessage(lockedMsg, function(err2) {
        if (err2) {
          console.log('Failed to delete message: ', err2);
        } else {
          console.log('Deleted message.');
        }
      })
    }
  }
  
  internals.sendMessages = function(sbService, queueName) {
    var msg = 'Message # ' + (++idx);
    sbService.sendQueueMessage(queueName, msg, function (err) {
     if (err) {
       console.log('Failed Tx: ', err);
     } else {
       console.log('Sent ' + msg);
     }
    });
  }
  

exports.register = function(server, options, next) {

    server.expose('checkForMessages', internals.checkForMessages);
    server.expose('processMessage', internals.processMessage);
    server.expose('sendMessages', internals.sendMessages);

    next();
};

exports.azureBus = internals.azureBus;

exports.register.attributes = {
    name: 'azureBus'
};

