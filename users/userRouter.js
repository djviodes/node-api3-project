const express = require('express');

const Hubs = require('./userDb');
const Posts = require('../posts/postDb');

const router = express.Router();

//custom middleware

function validateUserId(req, res, next) {
  const { id } = req.params;
  Hubs.getById(id)
    .then(data => {
      if (data) {
        req.hub = data
        next()
      } else {
        next({ code: 400, message: 'invalid user id' })
      }
    })
    .catch(err => {
      next({ code: 500, message: err })
    })
}

function validateUser(req, res, next) {
  if(req.body === {}) {
    next({ code: 400, message: 'missing user data' })
  } else if (!req.body.name) {
    next({ code: 400, message: 'missing required name field' })
  } else {
    next()
  }
}

function validatePost(req, res, next) {
  if(req.body === {}) {
    next({ code: 400, message: 'missing post data' })
  } else if (!req.body.text) {
    next({ code: 400, message: 'missing required text field' })
  } else {
    next()
  }
}

router.post('/', validateUser, (req, res) => {
  Hubs.insert(req.body)
    .then(data => {
      const newUser = { ...data, ...req.body }
      console.log(newUser)
      res.status(201).json(req.body)
    })
    .catch(err => {
      res.status(500).json({
        message: err.message
      });
    });
});

router.post('/:id/posts', validatePost, (req, res) => {
  Posts.insert(req.body)
    .then(data => {
      res.status(201).json(data)
    })
    .catch(err => {
      res.status(500).json({
        message: err.message
      });
    });
});

router.get('/', (req, res) => {
  Hubs.get(req.query)
    .then(data => {
      res.status(200).json(data)
    })
    .catch(err => {
      res.status(500).json({
        message: err.message
      });
    });
});

router.get('/:id', validateUserId, (req, res) => {
  res.status(200).json(req.hub)
});

router.get('/:id/posts', (req, res) => {
  Hubs.getUserPosts(req.params.id)
    .then(data => {
      if (!data.length) {
        res.status(404).json({
          message: 'Post not found'
        });
      } else {
        res.status(200).json(data);
      }
    })
    .catch(err => {
      res.status(500).json({
        message: err.message
      });
    });
});

router.delete('/:id', (req, res) => {
  Hubs.remove(req.params.id)
    .then(count => {
      if (count > 0) {
        res.status(200).json({
          message: `User ${req.params.id} has been successfully deleted`
        });
      } else {
        res.status(404).json({
          message: 'User not found'
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: err.message
      });
    });
});

router.put('/:id', (req, res) => {
  const changes = req.body;
  Hubs.update(req.params.id, changes)
    .then(data => {
      if (data) {
        const updateUser = { id: req.params.id, ...changes }
        res.status(200).json(updateUser);
      } else {
        res.status(400).json({
          message: 'You must have goofed something up. Mickey does NOT approve...'
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: err.message
      });
    });
});

router.use((err, req, res, next) => {
  res.status(err.code).json({ message: err.message });
});

module.exports = router;
