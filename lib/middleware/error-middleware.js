'use strict';

import logger from '../logger';

// (error, request, reponse, next)

export default (error, request, response, next) => { //eslint-disable-line
  logger.log(logger.ERROR, `ERROR MIDDLEWARE: ${JSON.stringify(error)}`);
    
  if (error.status) {
    logger.log(logger.ERROR, `Responding with a ${error.status} code and message ${error.message}`); 
    return response.sendStatus(error.status);
  }

  const errorMessage = error.message.toLowerCase();

  if (errorMessage.includes('object failed')) {
    logger.log(logger.ERROR, `Responding with a 404 status code ${errorMessage}`);
    return response.sendStatus(404);
  }

  if (errorMessage.includes('validation failed')) {
    logger.log(logger.ERROR, `Reswponding with a 400 code ${errorMessage}`);
    return response.sendStatus(400);
  }

  if (errorMessage.includes('duplicate key')) {
    logger.log(logger.ERROR, `Responding with a 409 status code ${errorMessage}`);
    return response.sendStatus(409);
  }

  if (errorMessage.includes('unauthorized')) {
    logger.log(logger.ERROR, `Responding with a 401 status code ${errorMessage}`);
    return response.sendStatus(401);
  }

  logger.log(logger.ERROR, `Reposning with a 500 status code ${JSON.stringify(error)}`);
  return response.sendStatus(500);
};
