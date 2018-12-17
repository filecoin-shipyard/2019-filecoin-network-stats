'use strict';

var dbm;
var type;
var seed;
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var Promise;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  Promise = options.Promise;
};

exports.up = function (db) {
  const outPath = path.join(__dirname, '.locations');
  const unzip = spawn('unzip', [path.join(__dirname, 'IP2LOCATION-LITE-DB5.CSV.ZIP'), '-d', outPath]);

  return new Promise((resolve, reject) => {
    unzip.on('close', (code) => {
      if (code === 0) {
        return resolve();
      }

      reject();
    })
  }).then(() => db.runSql(`
    CREATE TABLE ip_to_locations (
      ip_from      bigint                 NOT NULL,
      ip_to        bigint                 NOT NULL,
      country_code character(2)           NOT NULL,
      country_name character varying(64)  NOT NULL,
      region_name  character varying(128) NOT NULL,
      city_name    character varying(128) NOT NULL,
      latitude     real                   NOT NULL,
      longitude    real                   NOT NULL,
      CONSTRAINT ip_to_locations_pkey PRIMARY KEY (ip_from, ip_to)
    );
    
    CREATE INDEX ip_to_locations_ip_from ON ip_to_locations(ip_from);
    
    COPY ip_to_locations FROM '${outPath}/IP2LOCATION-LITE-DB5.CSV' WITH CSV QUOTE AS '"';
  `)).then(() => {
    const rimraf = spawn('rm', ['-rf', outPath]);
    return new Promise((resolve, reject) => {
      rimraf.on('close', (code) => {
        if (code === 0) {
          return resolve();
        }

        reject();
      });
    })
  })
};

exports.down = function (db) {
  var filePath = path.join(__dirname, 'sqls', '20181228030823-create-ip-to-locations-down.sql');
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
      if (err) return reject(err);
      console.log('received data: ' + data);

      resolve(data);
    });
  }).then(function (data) {
    return db.runSql(data);
  });
};

exports._meta = {
  "version": 1
};
