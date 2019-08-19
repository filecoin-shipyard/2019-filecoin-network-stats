'use strict';

var dbm;
var type;
var seed;
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var readline = require('readline');
var Promise;

var files = [
  'xaa',
  'xab',
  'xac',
  'xad',
  'xae',
  'xaf',
  'xag',
  'xah',
  'xai',
  'xaj',
  'xak',
  'xal',
  'xam',
  'xan',
  'xao',
  'xap',
  'xaq',
  'xar',
  'xas',
  'xat',
  'xau',
  'xav',
  'xaw',
  'xax',
  'xay',
  'xaz',
  'xba',
  'xbb',
  'xbc',
  'xbd',
  'xbe',
  'xbf',
  'xbg',
  'xbh',
  'xbi',
  'xbj',
  'xbk',
  'xbl',
  'xbm',
  'xbn',
  'xbo',
  'xbp',
  'xbq',
  'xbr',
  'xbs',
  'xbt',
  'xbu',
  'xbv',
  'xbw',
  'xbx',
  'xby',
  'xbz',
  'xca',
  'xcb',
  'xcc',
  'xcd',
  'xce',
  'xcf',
  'xcg',
  'xch',
  'xci',
  'xcj',
  'xck',
  'xcl',
  'xcm',
  'xcn',
  'xco',
  'xcp',
  'xcq',
  'xcr',
  'xcs',
  'xct',
  'xcu',
  'xcv',
  'xcw',
  'xcx',
  'xcy',
  'xcz',
  'xda',
  'xdb',
  'xdc',
  'xdd',
  'xde',
  'xdf',
  'xdg',
  'xdh',
  'xdi',
  'xdj',
  'xdk',
  'xdl',
  'xdm',
  'xdn',
  'xdo',
  'xdp',
  'xdq',
  'xdr',
  'xds',
  'xdt',
  'xdu',
  'xdv',
  'xdw',
  'xdx',
  'xdy',
  'xdz',
  'xea',
  'xeb',
  'xec',
  'xed',
  'xee',
  'xef',
  'xeg',
  'xeh',
  'xei',
  'xej',
  'xek',
  'xel',
  'xem',
  'xen',
  'xeo',
  'xep',
  'xeq',
  'xer',
  'xes',
  'xet',
  'xeu',
  'xev',
  'xew',
  'xex',
  'xey',
  'xez',
  'xfa',
  'xfb',
  'xfc',
  'xfd',
  'xfe',
  'xff',
  'xfg',
  'xfh',
  'xfi',
  'xfj',
  'xfk',
  'xfl',
  'xfm',
  'xfn',
  'xfo',
  'xfp',
  'xfq',
  'xfr',
  'xfs',
  'xft',
  'xfu',
  'xfv',
  'xfw',
  'xfx',
  'xfy',
  'xfz',
  'xga',
  'xgb',
  'xgc',
  'xgd',
  'xge',
  'xgf',
  'xgg',
  'xgh',
  'xgi',
  'xgj',
  'xgk',
  'xgl',
  'xgm',
  'xgn',
  'xgo',
  'xgp',
  'xgq',
  'xgr',
  'xgs',
  'xgt',
  'xgu',
  'xgv',
  'xgw',
  'xgx',
  'xgy',
  'xgz',
  'xha',
  'xhb',
  'xhc',
  'xhd',
  'xhe',
  'xhf',
  'xhg',
  'xhh',
  'xhi',
  'xhj',
  'xhk',
  'xhl',
  'xhm',
  'xhn',
  'xho',
  'xhp',
  'xhq',
  'xhr',
  'xhs',
  'xht',
  'xhu',
  'xhv',
  'xhw',
  'xhx',
  'xhy',
  'xhz',
  'xia',
  'xib',
  'xic',
  'xid',
  'xie',
  'xif',
  'xig',
  'xih',
  'xii',
  'xij',
  'xik',
  'xil',
  'xim',
  'xin',
  'xio',
  'xip',
  'xiq',
  'xir',
  'xis',
  'xit',
  'xiu',
  'xiv',
  'xiw',
  'xix',
  'xiy',
  'xiz',
  'xja',
  'xjb',
  'xjc',
  'xjd',
  'xje',
  'xjf',
  'xjg',
  'xjh',
  'xji',
  'xjj',
  'xjk',
  'xjl',
  'xjm',
  'xjn',
  'xjo',
  'xjp',
  'xjq',
  'xjr',
  'xjs',
  'xjt',
  'xju',
  'xjv',
  'xjw',
  'xjx',
  'xjy',
  'xjz',
  'xka',
  'xkb',
  'xkc',
  'xkd',
  'xke',
  'xkf',
  'xkg',
  'xkh',
  'xki',
  'xkj',
  'xkk',
  'xkl',
  'xkm',
  'xkn',
  'xko',
  'xkp',
  'xkq',
  'xkr',
  'xks',
  'xkt',
  'xku',
  'xkv',
  'xkw',
  'xkx',
  'xky',
  'xkz',
  'xla',
  'xlb',
  'xlc',
  'xld',
];

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
  function migrateFile(i) {
    if (i === files.length) {
      return;
    }

    var filePath = path.join(__dirname, 'ip_data', files[i] + '.gz');
    var stream = fs.createReadStream(filePath);
    var gunzip = zlib.createGunzip();

    return new Promise(function (resolve, reject) {
      var lines = [];

      console.log('Migrating IP file', files[i]);
      console.log('Index ' + (i + 1) + ' of ' + files.length);

      readline.createInterface({
        input: gunzip,
      }).on('line', function (l) {
        lines.push(l);
      }).on('close', function () {
        resolve(lines);
      }).on('error', function (e) {
        reject(e);
      });

      stream.on('data', function (data) {
        gunzip.write(data);
      });
      stream.on('end', function () {
        gunzip.end();
      });
      stream.on('error', function (e) {
        reject(e);
      });
    }).then(function (data) {
      return db.runSql(data.join('\n'));
    }).then(function () {
      return migrateFile(i + 1);
    });
  }


  return migrateFile(0);
};

exports.down = function (db) {
  return db.runSql('TRUNCATE ip_to_locations;');
};

exports._meta = {
  "version": 1
};
