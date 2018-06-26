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

