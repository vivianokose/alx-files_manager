// controllers/AppController.js

import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController{
  /**
   * AppController
   */

  static async getStatus(req, res, next){
    // returns status of redis and db servers

    res.status(200).json({
      "redis": await redisClient.isAlive(),
      "db": await dbClient.isAlive(),
    });
  }

  static async getStats(req, res, next){
    res.status(200).json({
      "users": await dbClient.nbUsers(),
      "files": await dbClient.nbFiles(),
    })
  }
}

export default AppController;
