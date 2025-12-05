const express = require("express");
const cors = require("cors");
const model = require("./model");
const session = require("express-session");
const multer = require("multer");
const path = require("path");

const app = express();

const corsOptions = {
  // Allow both local development and the deployed site
  origin: [
    "http://localhost:3000",
    "https://s25-midterm-project-saulaguiar29.onrender.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(cors());

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// Middleware for authentication
function authorizeUser(req, res, next) {
  console.log("Current user session:", req.session);
  if (req.session && req.session.userId) {
    model.User.findOne({ _id: req.session.userId }).then(function (user) {
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(
  session({
    secret: "48934ffh98hgs,fjgj;leruiewo2ps0028cpoiurujf;alkcm",
    saveUninitialized: true,
    resave: false,
  })
);

// VIDEOGAME ROUTES
app.get("/videogames", authorizeUser, function (req, res) {
  model.Videogame.find({ user: req.user._id }).then((videogames) => {
    res.json(videogames);
  });
});
app.get("/videogames/:id", authorizeUser, function (req, res) {
  model.Videogame.findOne({ _id: req.params.id, user: req.user._id })
    .then((game) => {
      if (!game) {
        return res.status(404).send("Game not found");
      }
      res.json(game);
    })
    .catch((error) => {
      console.error("Failed to get videogame", error);
      res.status(500).send("Error getting game");
    });
});

app.post("/videogames", authorizeUser, function (req, res) {
  console.log("Parsed request body:", req.body);
  let newVideogame = new model.Videogame({
    name: req.body.name,
    platform: req.body.platform,
    condition: req.body.condition,
    rating: req.body.rating,
    genre: req.body.genre,
    progress: req.body.progress,
    wishlist: req.body.wishlist,
    year: req.body.year,
    favorite: req.body.favorite,
    playing: req.body.playing,
    score: req.body.score,
    difficulty: req.body.difficulty,
    notes: req.body.notes,
    image: req.body.image,
    user: req.user._id,
  });

  newVideogame
    .save()
    .then(() => {
      res.status(201).send("Created");
    })
    .catch((error) => {
      if (error.errors) {
        let errorMessages = {};
        for (let field in error.errors) {
          errorMessages[field] = error.errors[field].message;
        }
        res.status(422).json(errorMessages);
      } else {
        res.status(422).send("Error");
        console.error("Failed to save videogame", error);
      }
    });
});

app.put("/videogames/:id", authorizeUser, function (req, res) {
  model.Videogame.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  )
    .then((updatedGame) => {
      if (!updatedGame) {
        return res.sendStatus(404);
      }
      res.json(updatedGame);
    })
    .catch((error) => {
      console.error("Failed to update videogame", error);
      res.status(500).send("Error updating game");
    });
});

app.delete("/videogames/:id", authorizeUser, function (req, res) {
  model.Videogame.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    .then((deletedGame) => {
      if (!deletedGame) {
        return res.sendStatus(404);
      }
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error("Failed to delete videogame", error);
      res.status(500).send("Error deleting game");
    });
});

// IMAGE UPLOAD ROUTE
app.post("/upload", authorizeUser, upload.single("image"), function (req, res) {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// USER ROUTES
app.post("/users", async function (req, res) {
  console.log("Parsed request body:", req.body);
  try {
    let newUser = new model.User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    });

    await newUser.setEncryptedPassword(req.body.plainPassword);
    await newUser.save();
    res.status(201).send("Created");
  } catch (error) {
    console.error("Failed to save user", error);
    res.status(500).send("Error creating user");
  }
});

// SESSION ROUTES
app.get("/session", authorizeUser, function (req, res) {
  res.json(req.user);
});

app.post("/session", function (req, res) {
  model.User.findOne({ email: req.body.email }).then(function (user) {
    if (!user) {
      return res.sendStatus(401);
    }
    user
      .verifyEncryptedPassword(req.body.plainPassword)
      .then(function (verified) {
        if (verified) {
          req.session.userId = user._id;
          res.sendStatus(201);
        } else {
          res.sendStatus(401);
        }
      });
  });
});

app.delete("/session", authorizeUser, function (req, res) {
  req.session.userId = null;
  res.sendStatus(200);
});

// Start the server
app.listen(8080, function () {
  console.log("Server ready. Listening on port 8080");
});
