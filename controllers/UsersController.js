// UsersController.js

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const { ObjectId } = require('mongodb');
const sha1 = require('sha1');

// UsersController class
//
export default class UsersController{
	static async postNew(req, res, next){
		const {email, password} = req.body;
		if (!email) {
			res.status(400).json({"error": "Missing email"});
		} else if (!password) {
			rea.status(400).json({"error": "Missing password"});
		}
		const existingUsr = dbClient.db.collection("users").findOne({email});
		if (existingUsr){
			res.status(400).json({"error": "Already exist"});
		}
		const newUser = dbClient.db.collection("users").insertOne({
			"email": email,
			"password": sha1(password)
		});

		res.status(201).json({"id": newUser.insertedId, "email": email});
	}

	static async getMe(req, res, next){
		// extracts toke from header
		const token = req.headers['X-Token'];
		if (!token){
			return res.status.json({error: "Unauthorized"});
		}
		const userId = await redisClient.get(`auth_${token}`);

		if (!userId){
			return res.status.json({error: "Unauthorized"});
		}
		const user = dbClient.collection("users").findOne({_id: ObjectId(userId)});
		if (!user){
			return res.status.json({error: "Unauthorized"});
		}
		return res.status(200).json({id: user.id, email: user.email});
	}
}
