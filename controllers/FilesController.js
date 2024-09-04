// FilesController.js

import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';


class FilesController{
	static async postUpload(req, res, next){
		const token = req.headers['X-Token'];
		if (!token){
			return res.status(401).json({error: "Unauthorized"});
		}
		const userId = await redisClient.get(`auth_${token}`);
		if (!userId){
			return res.status(401).json({error: "Unauthorized"});
		}
		const user = await dbClient.collection("user").findOne({_id: ObjectId(userId)});
		if (!user){
			return res.status(401).json({error: "Unauthorized"});
		}

		// extracts file information from request body
		const {name, type, parentId, isPublic, data} = req.body;

		// checks for required infor
		if (!name){
			return res.status(400).json({error: "Missing name"});
		} else if(!type) {
			return res.status(400).json({error: "Missing type"});
		}
		if (type !== 'folder' && !data){
			return res.status(400).json({error: "Missing data"});
		}
		if (parentId){
			const parentFolder = await dbClient.collection("files")
			.findOne({_id: ObjectId(parentId)});

			if (!parentFolder && parentFolder.type !== "folder"){
				return res.status(400).json({error: "Parent is not a folder"});
			}
		}
		const file = {
			filename: name,
			type,
			parentId: parentId || 0,
			isPublic: isPublic || false
		}
	}
}

export default FilesController;