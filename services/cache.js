const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');


const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

// get ref to existing default .exec function defined on a mongoose query.
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '-default-');

  return this;
}

// overwrite and execute additional code when query is executed.
mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  // don't modify this.getQuery directly.  It will modify the underlying code. get object passed in to getQuery and add collection name.
  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }));
  // console.log('====================================');
  // console.log(key);
  // console.log('====================================');

  // verify we have value for 'key' in redis
  const cacheValue = await client.hget(this.hashKey, key);
  // if yes, return key
  if (cacheValue) {
    // patches model instance and parses to document for mongoDB

    const doc = JSON.parse(cacheValue);
    // const doc = new this.model(JSON.parse(cacheValue));
    // same as:
    // new blog({
    //   title: 'Hi',
    //   content: 'There'
    // })

    // console.log('====================================');
    // console.log(this);
    // console.log('====================================');

    //returning parsed cache from redis
    // return JSON.parse(cacheValue);
    // return doc;

    // using terenary expression as +- checker
    return Array.isArray(doc) ?
      doc.map(d => new this.model(d)) :
      new this.model(doc);
  }
  //otherwise issue query and store result in redis
  const result = await exec.apply(this, arguments);

  //sets stringified results to redis client key...
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

  return result;
  // console.log('====================================');
  // console.log(result.validate);
  // console.log('====================================');
}

// clear hashes

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
