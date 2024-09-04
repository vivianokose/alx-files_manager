// AuthController.js
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import sha1 from 'sha1';
import { v4 } from 'uuid';

export default class AuthController{
	// Authenticates and login user
	static async getConnect(req, res){
		// gets authorization header from the request
		//
		const authHeader = req.headewrs.authorization;

		if (!authHeader || !authHeader.startsWith('Basic ')){
			return res.status(401).json({ error: 'Unauthorized' });
		}
		// extracts the base64 encoded credentials from the header
		const encodedCredentials = authHeader.split(' ')[1];
		const credentials = Buffer.from(encodedCredentials, 'base64').toString('ascii');

		const [email, password] = credentials.split(':');
		if (!password || !email){
			return res.status(401).json({
				error: 'Unauthorized'
			});
		}
		const user = await dbClient.db.collection("users").findOne({
			email, password: sha1(password)
		});

		if (!user){
			return res.status(401).json({ error: "Unauthorized" });
		}


		const token = v4(); //generates a unique token
		const tokenKey = `auth_${token}`;
		await redisClient.set(tokenKey, user._id.toString(), 24 * 3600);
		return res.status(200).json({token});
	}

	static async getDisconnect(req, res){
		const authToken = req.headers['X-Token'];

		if (!authToken){
			return res.status(401).json({error: "Unauthorized"});
		}

		const userId = await redisClient.get(authToken);
		if (!userId){
			return res.status(401).json({error: "Unauthorized"});
		}
		await redisClient.del(`auth_${authToken}`);
		return res.status(204);
	}
}
