import { createClient, print } from 'redis';
import { promisify } from 'util';

class RedisClient{
	constructor(){
	  this.client = createClient();
  	this.client.on('error', (err) => console.log(`Redis client not connected to server: ${err}`));
    this.client.on('connect', () => console.log('Redis client connected to server'));
	}

	isAlive () {
    console.log(this.client.connected);
		if (this.client.connected){
      return true;
    }
    return false;
	}

	async get (key) {
		const getAsync = promisify(this.client.get).bind(this.client)
		return await getAsync(key);
	}

	async set (key, value, duration) {
		const setAsync = promisify(this.client.set).bind(this.client);
		await setAsync(key, value);
    await this.client.expire(key, duration);
	}

  async del(key){
    const delAsync = promisify(this.client.del).bind(this.client);
    await delAsync(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
