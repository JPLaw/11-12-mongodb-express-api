'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import Puppy from '../model/puppy';
import logger from '../lib/logger';


const jsonParser = bodyParser.json();
const puppyRouter = new Router();

puppyRouter.post('/api/puppy', jsonParser, (request, response, next) => {
  logger.log(logger.INFO, 'PUPPY-ROUTER POST to /api/puppy - processing a request');
  if (!request.body.name) {
    logger.log(logger.INFO, 'PUPPY-ROUTER POST /api/puppy: Responding with 400 error for no name');
    return response.sendStatus(400);
  }

  Puppy.init()
    .then(() => {
      return new Puppy(request.body).save();
    })
    .then((newPuppy) => {
      logger.log(logger.INFO, `PUPPY-ROUTER POST:  a new puppy was saved: ${JSON.stringify(newPuppy)}`);
      return response.json(newPuppy);
    })
    .catch(next);
  return undefined;
});

// you need this question mark after ":id" or else Express will skip to the catch-all in lib/server.js 
puppyRouter.get('/api/puppy/:id?', (request, response, next) => {
  logger.log(logger.INFO, 'PUPPY-ROUTER GET /api/puppy/:id = processing a request');
  // if (!request.params.id) do logic here to return an array of all resources, else do the logic below
  if (!request.params.id) {
    return Puppy.find({})
      .then((puppy) => {
        logger.log(logger.INFO, 'PUPPY-ROUTER GET /api/puppy responding with 200 code for successful get');
        return response.json(puppy);
      })
      .catch(next);
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
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `PUPPY-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed`);
        return response.sendStatus(404);
      }
      logger.log(logger.ERROR, `PUPPY-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
});

puppyRouter.put('/api/puppy/:id?', jsonParser, (request, response, next) => {
  if (!request.params.id) {
    logger.log(logger.INFO, 'PUPPY-ROUTER PUT /api/puppy: Responding with a 400 error code for no id passed in');
    return response.sendStatus(400);
  }
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
    .catch(next);
  return undefined;
});

puppyRouter.delete('/api/puppy/:id?', (request, response, next) => {
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
    .catch(next);
});

export default puppyRouter;
