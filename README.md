# blogReactNodeMEAN4

npm run dev

redis used as cacheing server
brew services start redis
brew services restart redis

terminal (redis client):

> node
> const redis = require('redis')
> const redisUrl = 'redis://127.0.0.1:6379'
> const client = redis.createClient(redisUrl)

redis will only store num and letter. use JSON.stringify as workaround. i.e.: client.set('colors', JSON.stringify({ red: 'rojo' }))
result returns a JSON format instead of converting to an object. i.e.: client.get('colors', (err, val) => console.log(JSON.parse(val)))
Result:> { red: 'rojo' }

using user.id as UUID.

redis does not offer native support for returning promises. Could use callbacks... but using promisify in node util lib.

to clear redis cache:

> node
> const redis = require('redis')
> const redisUrl = 'redis://127.0.0.1:6379'
> const client = redis.createClient(redisUrl)
> client.flushall()

checks to see if query has been fetched by redis:

query.exec((err, result) => console.log(result));
same as...
query.then(result => console.log(result));
same as...
const result = await query;

hooked into mongoose for cached query

jest runs tests in parallel

doc.travis-ci.com
pkill node

default mongodb port 27017
default redis port 6379
# nodeci
