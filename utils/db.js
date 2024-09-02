// utils/db.js

import { MongoClient } from 'mongodb';
//import { process } from 'process';

class DBClient {  
  constructor() {  
    const host = process.env.DB_HOST || 'localhost';  
    const port = process.env.DB_PORT || 27017;  
    const url = `mongodb://${host}:${port}`;  
    const database = process.env.DB_DATABASE || 'file_manager';  

    this.client = new MongoClient(url);
    this.client.connect((err) => {
      if (err) {
        console.log(`MongoDb client not connected to server: ${err}`);
      }
    });

    this.db = this.client.db(database);
  }
    

  isAlive() {  
    return this.client.isConnected();  
  }  

  async nbUsers() {  
    const userCollection = await this.db.collection("users");
    return userCollection.countDocuments();
  }  

  async nbFiles() {  
    const fileCollection = await this.db.collection("files"); 
    return fileCollection.countDocuments;
  }  
}  

const dbClient = new DBClient();
