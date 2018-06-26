'use strict';

import mongoose from 'mongoose';

const puppySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  breed: {
    type: String,
    minlength: 7,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('puppy', puppySchema, 'puppy', skipInit);