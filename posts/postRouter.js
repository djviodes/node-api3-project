const express = require('express');

const Hubs = require('./postDb');

const router = express.Router();

// custom middleware

function validatePostId(req, res, next) {
  const { id } = req.params;
  Hubs.getById(id)
    .then(data => {
      if (data) {
        req.hub = data
        next()
      } else {
        next({ code: 400, message: 'There is no hub with id ' + id })
      }
    })
    .catch(error => {
      next({ code: 500, message: error })
    })
}

router.get('/', (req, res) => {
  Hubs.get(req.query)
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json({
        message: err.message,
        stack: err.stack
      });
    });
});

router.get('/:id', validatePostId, (req, res) => {
  // do your magic!
});

router.delete('/:id', validatePostId, (req, res) => {
  // do your magic!
});

router.put('/:id', validatePostId, (req, res) => {
  // do your magic!
});

router.use((err, req, res, next) => {
  res.status(err.code).json({ message: err.message });
});

module.exports = router;
