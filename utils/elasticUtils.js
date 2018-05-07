'use strict';


var elasticSearch = function(opts) {

        this.opts = opts
        this.opts.mapping = {
            house: {
                name: {
                    type: 'string'
                }
            }
        }

 console.log(this.opts);

        const DatabaseConfig = require('./../config').get('/database/elastic');

        var Elasticsearch = require('elasticsearch');
        var Promise = require('bluebird');

        var log = console.log.bind(console);

        var client = new Elasticsearch.Client({
            host: DatabaseConfig.url,
            log: DatabaseConfig.log
        });

        function indexExists (callback) {
              client.indices.exists({
                    index: this.opts.indexName
                },callback);
            }

        return {
            dropIndex: function(indexName) {

                return indexExists.then(function(exists) {
                    // if (exists) { 
                    //   return deleteIndex(); 
                    // } 
                }).then(function(data) {
                    return client.indices.delete({
                        index: indexName
                    });
                });

            },

            createIndex: function() {
                return 
indexExists(function(exists) {
                    console.log('index exists',exists);
                    if (!exists) {
                        console.log('createIndex');
                        client.indices.create({
                            index: this.opts.indexName
                            //mapping: this.opts.mapping
                        });
                    }
                });

            },

            
            addToIndex: function(table, data) {
                console.log('addToIndex');
                client.index({
                    index: this.opts.indexName,
                    type: table,
                    //id: '1',
                    body: data
                },function(err, data){

                  console.log(data)

                });
            },

            search: function(query) {
                return client.search({
                    index: this.opts.indexName,
                    q: query
                }).then(log);
            },

            closeConnection: function() {
                client.close();
            },

            getFromIndex: function(table) {
                return client.get({
                    //id: 1,
                    index: this.opts.indexName,
                    type: table,
                }).then(log);

            },

            waitForIndexing: function() {
                log('Wait for indexing ....');
                return new Promise(function(resolve) {
                    setTimeout(resolve, 2000);
                });
            }


        }
      }


        module.exports = elasticSearch