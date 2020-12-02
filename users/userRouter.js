const express = require("express");
const { update } = require("../data/dbConfig");
const Hubs = require("./userDb");
const Posts = require("../posts/postDb");

const router = express.Router();

function validateUserId(req, res, next) {
  const { id } = req.params;

  Hubs.getById(id)
    .then((data) => {
      console.log(data);
      if (data) {
        req.hub = data;
        next();
      } else {
        res.status(404).json({ message: `ID ${id} does not exist at all` });
        console.log({ message: `ID ${id} does not exist at all` });
      }
    })
    .catch((error) => {
      console.log(error.message, error.stack);
      res.status(500).json({
        message: error.message,
        stack: error.stack,
      });
    });
}

function validateUser(req, res, next) {
  console.log(req.body);
  if (req.body === {}) {
    res.status(400).json({ message: "missing user data" });
  } else if (!req.body.name) {
    res.status(400).json({ message: "missing required name field" });
  } else {
    next();
  }
}

function validatePost(req, res, next) {
  console.log(req.body);
  if (req.body === {}) {
    res.status(400).json({ message: "missing post data" });
  } else if (!req.body.text) {
    res.status(400).json({ message: "missing required post field" });
  } else {
    next();
  }
}

router.post("/", [validateUser], (req, res) => {
  Hubs.insert(req.body)
    .then((hub) => {
      const newUser = { ...hub, ...req.body };
      console.log(newUser);
      res.status(201).json(req.body);
    })
    .catch((error) => {
      console.log(error.message, error.stack);
      res.status(500).json({
        message: error.message,
        stack: error.stack,
      });
    });
});

router.post("/:id/posts", [validatePost], (req, res) => {
  Posts.insert(req.body)
    .then((hubs) => {
      console.log(hubs);
      res.status(201).json(hubs);
    })
    .catch((error) => {
      console.log(error.message, error.stack);
      res.status(500).json({
        message: error.message,
        stack: error.stack,
      });
    });
});

router.get("/", (req, res) => {
  Hubs.get(req.query)
    .then((hubs) => {
      res.status(200).json(hubs);
    })
    .catch((error) => {
      console.log(error.message, error.stack);
      res.status(500).json({
        message: error.message,
        stack: error.stack,
      });
    });
});

router.get("/:id", [validateUserId], (req, res) => {
  res.status(200).json(req.hub);
});

router.get("/:id/posts", (req, res) => {
  Hubs.getUserPosts(req.params.id)
    .then((hubs) => {
      console.log(hubs);
      if (!hubs.length) {
        res.status(404).json({
          message: `the user with ID ${req.params.id} does not exist`,
        });
      } else {
        res.status(200).json(hubs);
      }
    })
    .catch((error) => {
      console.log(error.message, error.stack);
      res.status(500).json({
        message: error.message,
        stack: error.stack,
      });
    });
});

router.delete("/:id", (req, res) => {
  Hubs.remove(req.params.id)
    .then((count) => {
      if (count > 0) {
        res
          .status(200)
          .json({ message: `user ${req.params.id} has been deleted` });
      } else {
        res
          .status(404)
          .json({ message: `user with ID ${req.params.id} cannot be found` });
      }
    })
    .catch((error) => {
      console.log(error.message, error.stack);
      res.status(500).json({
        message: error.message,
        stack: error.stack,
      });
    });
});

router.put("/:id", (req, res) => {
  const changes = req.body;

  Hubs.update(req.params.id, changes)
    .then((hub) => {
      if (hub) {
        const changeUser = { id: req.params.id, ...changes };
        res.status(200).json(changeUser);
      } else {
        res.status(400).json({
          message: `the user with ID ${req.params.id} does not exist`,
        });
      }
    })
    .catch((error) => {
      console.log(error.message, error.stack);
      res.status(500).json({
        message: error.message,
        stack: error.stack,
      });
    });
});

module.exports = router;
