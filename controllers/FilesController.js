// FilesController.js

import redisClient from   '../utils/redis';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';
import path from 'path';
import { promises } from 'fs';


class FilesController{
	// upload user file
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
		const {name, type, parentId=0, isPublic=flase, data} = req.body;

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

			if (!parentFolder){
				return res.status(400).json({error: "Parent not found"});
			}
			if (parentFolder.type !== "folder"){
				return res.status(400).json({error: "Parent is not a folder"});
			}
		}
		const fileDocument = {
			filename: name,
			type,
			parentId,
			isPublic,
			userId: ObjectId(userId)
		}

		if (type === 'folder'){
			const result = await dbClient.db
			.collection("files")
			.insertOne(fileDocument);

			return res.status(201).json({
				id: result.insertedId, ...fileDocument
			});
		}

		// handles non-folder file types

		if (['file', 'image'].includes(type)){
			// sets filepath to save file
			const folderPath = process.env.FOLDER_PATH || '/tmp/file_manager';
			const localPath = path.join(folder, v4());

			// create the folder is it doesn't exist
			await promises.mkdir(folderPath, {recursive: true});
			// coonverts file data to base64 encoding
			const fileData = Buffer.from(data, 'base64');
			await promises.writeFile(localPath, fileData);
			fileDocument.localPath = localPath;
			fileDocument.userId = userId;

			// saves file info to database
			const result = dbClient.db.collection("files")
			.insertOne(fileDocument);
			return res.status(201).json({id: result.insertedId, ...fileDocument});
		}
	}

	// gets user file in file info
	static async getShow(req, res){
		// retrieve user

		const token = req.headers['X-Token'];

		if (!token){
			return res.status(401).json({error: "Unauthorized"});
		}
		const userId = await redisClient.get(`auth_${token}`);
		if (!userId){
			return res.status(401).json({error: "Unauthorized"});
		}

		const user =  await dbClient.db.collection("users")
		.findOne({_id: ObjectId(userId)});
		if (!user){
			return res.status(401).json({error: "Unauthorized"});
		}

		// Retreive file from database
		const fileId = req.params.id;
		const file = dbClient.db.collection("files")
		.findOne({_id: fileId});

		// confirms file existence
		if (!file){
			return res.status(404).json({error: "Not found"});
		}

		return res.status(200).json(file);
	}

	// get file index
	static async getIndex(req, res){
		// retrieve user

		const token = req.headers['X-Token'];

		if (!token){
			return res.status(401).json({error: "Unauthorized"});
		}
		const userId = await redisClient.get(`auth_${token}`);
		if (!userId){
			return res.status(401).json({error: "Unauthorized"});
		}

		const user =  await dbClient.db.collection("users")
		.findOne({_id: ObjectId(userId)});
		if (!user){
			return res.status(401).json({error: "Unauthorized"});
		}

		const files = dbClient.db.collection("files").find().toArray();

		return res.status(200).json(files);
	}

	// publish user file
	static async putPublish(req, res){
		// retrieve user for authorization
		const token = req.headers['X-Token'];

		if (!token){
			return res.status(401).json({error: "Unauthorized"});
		}
		const userId = await redisClient.get(`auth_${token}`);
		if (!userId){
			return res.status(401).json({error: "Unauthorized"});
		}
		const user =  await dbClient.db.collection("users")
		.findOne({_id: ObjectId(userId)});
		if (!user){
			return res.status(401).json({error: "Unauthorized"});
		}
		// checks for file's existence
		const fileId = await redisClient.get(`auth_${token}`);
		if (!fileId){
			return res.status(404).json({error: "Not found"});
		}
		const fileDoc = await dbClient.db.collection("files")
		.findOne({_id: ObjectId(fileId), userId: ObjectId(user.id)});

		if (!fileDoc){
			return res.status(404).json({error: "Not found"});
		}
		// updates the file's isPublic property true
		await dbClient.db.collection("files").updateOne(
			{_id: ObjectId(fileId), userId: ObjectId(userId)},
			{$set: {isPublic: true}}
		);

		const updates = await dbClient.db.collection("files")
		.findOne({_id: ObjectId(fileId)});

		return res.status(200).json(updates);
	}

	// Unpublish user file
	static async putUnpublish(req, res){
		// retrieve user
		const token = req.headers['X-Token'];

		if (!token){
			return res.status(401).json({error: "Unauthorized"});
		}
		const userId = await redisClient.get(`auth_${token}`);
		if (!userId){
			return res.status(401).json({error: "Unauthorized"});
		}
		const user =  await dbClient.db.collection("users")
		.findOne({_id: ObjectId(userId)});
		if (!user){
			return res.status(401).json({error: "Unauthorized"});
		}

		// checks for file's existence
		const fileId = await redisClient.get(`auth_${token}`);
		if (!fileId){
			return res.status(404).json({error: "Not found"});
		}
		const fileDoc = await dbClient.db.collection("files")
		.findOne({_id: ObjectId(fileId), userId: ObjectId(user.id)});

		if (!fileDoc){
			return res.status(404).json({error: "Not found"});
		}
		// updates the file's isPublic property true
		await dbClient.db.collection("files").updateOne(
			{_id: ObjectId(fileId), userId: ObjectId(userId)},
			{$set: {isPublic: false}}
		);

		const updates = await dbClient.db.collection("files")
		.findOne({_id: ObjectId(fileId)});

		return res.status(200).json(updates);
	}

	// gets file content
	static async getFile(req, res){
		const token = req.headers['X-Token'];

		if (!token){
			return res.status(401).json({error: "Unauthorized"});
		}
		const userId = await redisClient.get(`auth_${token}`);
		if (!userId){
			return res.status(401).json({error: "Unauthorized"});
		}
		const user =  await dbClient.db.collection("users")
		.findOne({_id: ObjectId(userId)});
		if (!user){
			return res.status(401).json({error: "Unauthorized"});
		}

		// checks for file's existence
		const fileId = await redisClient.get(`auth_${token}`);
		if (!fileId){
			return res.status(404).json({error: "Not found"});
		}
		const fileDoc = await dbClient.db.collection("files")
		.findOne({_id: ObjectId(fileId), userId: ObjectId(user.id)});

		if (!fileDoc){
			return res.status(404).json({error: "Not found"});
		}

		if (fileDoc.type === "folder"){
			return res.status(400).json({error: "A folder doesn't have content"});
		}

		const fileData = await promises.readFile(fileDoc.localPath);

		if (!fileData){
			return res.status(404).json({error: "Not Found"})
		}
		// will continue later
	}
}

export default FilesController;