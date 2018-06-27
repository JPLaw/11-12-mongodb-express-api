[![Build Status](https://travis-ci.org/JPLaw/11-12-mongodb-express-api.svg?branch=master)](https://travis-ci.org/JPLaw/11-12-mongodb-express-api)  11: Single Resource Express API
======

##Resource: Puppy
Fields: 
name (string, required, unique)
breed (string, required)

##Endpoints
POST api/puppy
```
  // example post request body
  request.body: {
    name: 'Old Yeller'
    breed: 'Yellow Lab'
}
```

GET api/puppy?id={puppy_id}
```
// example endpoint to get puppy # 1234
api/puppy?id=1234
```

DELETE api/puppy?id={puppy_id}
```
// example endpoint to get puppy # 1234
api/puppy?id=1234
```

PUT api/puppy?id={puppy_id}
```
// example endpoint to get puppy # 1234
api/puppy?id=1234
```


