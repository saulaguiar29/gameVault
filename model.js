const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://se4200:webapps2@cluster0.7kckgbq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    dbName: "gamelibrary",
  }
);

const Videogame = mongoose.model("Videogame", {
  name: {
    type: String,
    required: true,
    trim: true,
  },
  platform: {
    type: String,
    required: true,
    trim: true,
  },
  condition: {
    type: String,
    required: false,
    enum: ["New", "Like New", "Good", "Fair", "Poor", "CIB", "No Box"], //these are conditions
  },
  rating: {
    type: String,
    enum: ["E", "T", "M"], //types of ratings
  },
  //more stuff I added
  genre: {
    type: String,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
  },
  // language: {
  //   type: String,
  // },
  wishlist: {
    type: Boolean,
  },
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear(), //prevents future dates
  },
  favorite: {
    type: Boolean,
  },
  playing: {
    type: Boolean,
  },
  score: {
    type: Number,
    min: 1,
    max: 100,
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 10,
  },
  notes: {
    type: String,
  },
  //may delete this not sure yet
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, //may need to change
  },
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  encryptedPassword: {
    type: String,
    required: true,
    minlength: 8,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
});
//get retrieve collection 200 create member post 201 put update collection 200 delete collection 200
userSchema.methods.setEncryptedPassword = function (plainPassword) {
  let promise = new Promise((resolve, reject) => {
    //this is the promise function
    //resolve and reject are also functions
    bcrypt.hash(plainPassword, 12).then((hash) => {
      console.log("hashed pw:", hash);
      //this is the user INSTANCE
      this.encryptedPassword = hash;
      resolve();
    });
  });

  // ------------------ above this line --------------------
  //return the promise for future eggs
  return promise;
};
//make the promise return the promise and at some point in the future resolve the promise
userSchema.methods.verifyEncryptedPassword = function (plainPassword) {
  let promise = new Promise((resolve, reject) => {
    bcrypt.compare(plainPassword, this.encryptedPassword).then((result) => {
      resolve(result);
    });
  });

  //return the promise for the future
  return promise;
};

const User = mongoose.model("User", userSchema);

function encryptMyPassword() {
  bcrypt.hash(myPlaintextPassword, 12).then(function (hash) {
    console.log("hashed pw:", hash);
  });
}
module.exports = {
  Videogame,
  User,
  encryptMyPassword,
};

//npm install express-session
//var session = require('express-session')

//mongodb has filters we will be using
