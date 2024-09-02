import { createClient, print } from 'redis';
import { promisify } from 'util';

class RedisClient{
	constructor(){
	this.client = createClient();
	this.client.on('error', (err) => console.log(err));
	this.client.on('connect', () => console.log('Redis client conmected to the server'));
	}

	isAlive () {
		return this.client.connected;
	}

	async get (key) {
		const getAsync = promisify(this.client.get).bind(this.client)
		return await getAsync(key);
	}

	async set (key, value) {
		const setAsync = promisify(this.client.set).bind(this.client);
		return await setAsync(key, value, print);
	}
}

const redisClient = new RedisClient();

module.exports = redisClient;
