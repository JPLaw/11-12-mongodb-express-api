'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import Puppy from '../model/puppy';
import logger from '../lib/logger';


const jsonParser = bodyParser.json();
const puppyRouter = new Router();

puppyRouter.post('/api/puppy', jsonParser, (request, response) => {
  logger.log(logger.INFO, 'PUPPY-ROUTER POST to /api/puppy - processing a request');
  if (!request.body.name) {
    logger.log(logger.INFO, 'PUPPY-ROUTER POST /api/puppy: Responding with 400 error for no name');
    return response.sendStatus(400);
  }

  // I need run the init() method (which returns a promise) on POST and PUT requests because Mongoose is still in the process of 
  // indexing fields that I flagged as "unique". If I don't run init() first, I get false positive tests that don't properly catch for 
  // 409 conflit errors when duplicate values are posted to the db. 
  Puppy.init()
    .then(() => {
      return new Puppy(request.body).save();
    })
    .then((newPuppy) => {
      logger.log(logger.INFO, `PUPPY-ROUTER POST:  a new puppy was saved: ${JSON.stringify(newPuppy)}`);
      return response.json(newPuppy);
    })
    .catch((err) => {
      // we will hit here if we have some misc. mongodb error or parsing id error
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `PUPPY-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed, ${err.message}`);
        return response.sendStatus(404);
      }

      // a required property was not included, i.e. in this case, "name"
      if (err.message.toLowerCase().includes('validation failed')) {
        logger.log(logger.ERROR, `PUPPY-ROUTER PUT: responding with 400 status code for bad request ${err.message}`);
        return response.sendStatus(400);
      }
      // we passed in a name that already exists on a resource in the db because in our Puppy model, we set name to be "unique"
      if (err.message.toLowerCase().includes('duplicate key')) {
        logger.log(logger.ERROR, `PUPPY-ROUTER PUT: responding with 409 status code for duplicate key ${err.message}`);
        return response.sendStatus(409);
      }

      // if we hit here, something else not accounted for occurred
      logger.log(logger.ERROR, `PUPPY-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500); // Internal Server Error
    });
  return undefined;
});

// you need this question mark after ":id" or else Express will skip to the catch-all in lib/server.js 
puppyRouter.get('/api/puppy/:id?', (request, response) => {
  logger.log(logger.INFO, 'PUPPY-ROUTER GET /api/puppy/:id = processing a request');

  // TODO:
  // if (!request.params.id) do logic here to return an array of all resources, else do the logic below

  if (!request.params.id) {
    return Puppy.find({})
      .then((puppy) => {
        logger.log(logger.INFO, 'PUPPY-ROUTER GET /api/puppy responding with 200 code for successful get');
        return response.json(puppy);
      })
      .catch((err) => {
        // we will hit here if we have a mongodb error or parsing id error
        if (err.message.toLowerCase().includes('cast to objectid failed')) {
          logger.log(logger.ERROR, `PUPPY-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed`);
          return response.sendStatus(404);
        }

        // if we hit here, something else not accounted for occurred
        logger.log(logger.ERROR, `PUPPY-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
        return response.sendStatus(500);
      });
  }

  return Puppy.findOne({ _id: request.params.id })
    .then((puppy) => {
      if (!puppy) {
        logger.log(logger.INFO, 'PUPPY-ROUTER GET /api/puppy/:id: responding with 404 status code for no puppy found');
        return response.sendStatus(404);
      }
      logger.log(logger.INFO, 'PUPPY-ROUTER GET /api/puppy/:id: responding with 200 status code for successful get');
      return response.json(puppy);
    })
    .catch((err) => {
      // we will hit here if we have a mongodb error or parsing id error
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `PUPPY-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed`);
        return response.sendStatus(404);
      }

      // if we hit here, something else not accounted for occurred
      logger.log(logger.ERROR, `PUPPY-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
});

puppyRouter.put('/api/puppy/:id?', jsonParser, (request, response) => {
  if (!request.params.id) {
    logger.log(logger.INFO, 'PUPPY-ROUTER PUT /api/puppy: Responding with a 400 error code for no id passed in');
    return response.sendStatus(400);
  }

  // we need to pass these options into "findByIdAndUpdate" so we can actually return the newly modified document in the 
  // promise per "new", and "runValidators" ensures that the original validators we set on the model
  const options = {
    new: true,
    runValidators: true,
  };

  Puppy.init()
    .then(() => {
      return Puppy.findByIdAndUpdate(request.params.id, request.body, options);
    })
    .then((updatedPuppy) => {
      logger.log(logger.INFO, `PUPPY-ROUTER PUT - responding with a 200 status code for successful updated puppy: ${JSON.stringify(updatedPuppy)}`);
      return response.json(updatedPuppy);
    })
    .catch((err) => {
      
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `PUPPY-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed, ${err.message}`);
        return response.sendStatus(404);
      }

      
      if (err.message.toLowerCase().includes('validation failed')) {
        logger.log(logger.ERROR, `PUPPY-ROUTER PUT: responding with 400 status code for bad request ${err.message}`);
        return response.sendStatus(400);
      }
      
      if (err.message.toLowerCase().includes('duplicate key')) {
        logger.log(logger.ERROR, `PUPPY-ROUTER PUT: responding with 409 status code for duplicate key ${err.message}`);
        return response.sendStatus(409);
      }

      logger.log(logger.ERROR, `PUPPY-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
  return undefined;
});

puppyRouter.delete('/api/puppy/:id?', (request, response) => {
  logger.log(logger.INFO, 'PUPPY-ROUTER DELETE /api/puppy/:id = processing a request');
  
  if (!request.params.id) {
    return response.sendStatus(404);
  }
  
  return Puppy.deleteOne({ _id: request.params.id })
    .then((data) => {
      if (!data.n) {
        logger.log(logger.INFO, 'PUPPY-ROUTER DELETE /api/puppy/:id responding with 404 status code for no puppy found');
        return response.sendStatus(400);
      }
  
      logger.log(logger.INFO, 'PUPPY-ROUTER DELETE api/puppy responding with 204 code for successful delete');
      return response.sendStatus(204);
    })
    .catch((err) => {
      // we will hit here if we have a mongodb error or parsing id error
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `PUPPY-ROUTER DELETE: responding with 404 status code to mongdb error, objectId ${request.params.id} failed`);
        return response.sendStatus(404);
      }
  
      // if we hit here, something else not accounted for occurred
      logger.log(logger.ERROR, `PUPPY-ROUTER DELETE: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
});

export default puppyRouter;
