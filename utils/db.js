// utils/db.js

import { MongoClient } from 'mongodb';

class DBClient {

  // instantiates DBclient
  constructor() {  
    const host = process.env.DB_HOST || 'localhost';  
    const port = process.env.DB_PORT || 27017;  
    const database = process.env.DB_DATABASE || 'file_manager';  
    const url = `mongodb://${host}:${port}/${database}`;  

    this.client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });

    this.client.connect((err) => {
      if (err) {
        console.log(`MongoDb client not connected to server: ${err}`);
      }
    });

    this.db = this.client.db(`${database}`);
  }


  /**
   * Checks if database connection is active
   */

  isAlive() {  
    return this.client.isConnected();  
  }  

  /**
   * gets the number of usr documents
   */

  async nbUsers() {  
    const userCollection = await this.db.collection("users");
    return userCollection.countDocuments();
  }  

  /**
   * gets number of documents in `files` collection
   * returns {Promise <Number>}
   */

  async nbFiles() {  
    const fileCollection = await this.db.collection("files"); 
    return fileCollection.countDocuments;
  }  
}  

const dbClient = new DBClient();

export default dbClient;
