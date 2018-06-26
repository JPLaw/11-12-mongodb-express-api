'use strict';

import faker from 'faker';
import superagent from 'superagent';
import Puppy from '../model/note';
import { startServer, stopServer } from '../lib/server';
import { notEqual } from 'assert';

const apiUrl = `http://localhost:${process.env.PORT}/api/puppy`;

const createPuppyMockPromise = () => {
    return new Puppy({
        name: faker.lorem.words(1),
        breed: faker.lorem.words(2),
    }).save();
};

beforeAll(startServer);
afterAll(stopServer);

afterEach(() => Puppy.remove({}));

describe('POST requests to /api/puppy', () => {
    test('POST 200 for successful creation of note', () => {
        const mockPuppyToPost = {
            name: faker.lorem.words(1),
            breed: faker.lorem.words(2),
        };
        return superagent.post(apiUrl)
        .send(mockPuppyToPost)
        .then((response) => {
            expect(response.status).toEqual(200);
            expect(response.body.name).toEqual(mockPuppyToPost.name);
            expect(response.body.breed).toEqual(mockPuppyToPost.breed);
            expect(response.body._id).toBeTruthy();
            expect(response.body.createdOn).toBeTruthy();
        })
        .catch((err) => {
            throw err;
        });
    });

    it('should POST 400 for not sending in a required NAME property', () => {
        const mockPuppyToPost = {
            breed: faker.lorem.words(2),
        };
        return superagent.post(apiUrl)
            .send(mockPuppyToPost)
            .then((response) => {
                throw response;
            })
            .catch((err) => {
                expect(err.status).toEqual(400);
            });
    });

    it('should POST 409 for a duplicate key', () => {
        return createPuppyMockPromise()
        .then((newPuppy) => {
            return superagent.post(apiUrl)
            .send({ name: newPuppy.name })
            .then((response) => {
                throw response;
            })
            .catch((err) => {
                expect(err.status).toEqual(409);
            });
        })
        .catch((err) => {
            throw err;
        });
    });
});

describe('GET requests to /api/puppy', () => {
    test('200 GET for succesful fetching of a puppy', () => {
      let mockPuppyForGet;
      return createPuppyMockPromise()
        .then((puppy) => {
          mockPuppyForGet = puppy;
          // I can return this to the next then block because superagent requests are also promisfied
          return superagent.get(`${apiUrl}/${mockPuppyForGet._id}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.name).toEqual(mockPuppyForGet.name);
          expect(response.body.breed).toEqual(mockPuppyForGet.breed);
        })
        .catch((err) => {
          throw err;
        });
    });
  
    test('404 GET: no puppy with this id', () => {
      return superagent.get(`${apiUrl}/THISISABADID`)
        .then((response) => {
          throw response;
        })
        .catch((err) => {
          expect(err.status).toEqual(404);
        });
    });
  });
  
  describe('PUT request to /api/puppy', () => {
    test('200 PUT for successful update of a resource', () => {
      return createPuppyMockPromise()
        .then((newPuppy) => {
          return superagent.put(`${apiUrl}/${newPuppy._id}`)
            .send({ name: 'updated name', breed: 'updated breed' })
            .then((response) => {
              expect(response.status).toEqual(200);
              expect(response.body.name).toEqual('updated name');
              expect(response.body.breed).toEqual('updated breed');
              expect(response.body._id.toString()).toEqual(newPuppy._id.toString());
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          throw err;
        });
    });
  });

  describe('DELETE request to api/puppy', () => {
      test('200 DELETE for a successful deletion of a resource', () => {
          
      })
  })