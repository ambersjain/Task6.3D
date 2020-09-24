const router = require('express').Router();

// Worker Model
const Worker = require("../models/worker");

/*
    WORKER ROUTES
*/


/* USE GET, POST and DELETE TO
  - Retrieve, add and remove workers respectively[URI: /workers]
*/


router.route('/workers')
  .get((req, res) => {
    Worker.find((err, workerList) => {
      if (err) { res.send(err) }
      else { res.send(workerList) }
    })

  })
  .post((req, res) => {
    const worker = new Worker({
      id: req.body.id,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      address: req.body.address,
      mobile_number: req.body.mobile_number,
    });

    worker.save((err) => {
      if (err) { res.send(err); console.log("Unable to add the worker"); }
      else { res.send("Worker Added Succesfully") }
    })
  })
  .delete((req, res) => {
    Worker.deleteMany((err) => {
      if (err) { res.send(err) }
      else { res.send("Successfully deleted all worker records!") }
    })
  });


/* USE GET, PUT and DELETE TO
  - Retrieve, update and remove a specific worker [URI: /workers/:id]
*/

/* USE PATCH TO
  - Update specific worker’s address and mobile phone [URI: /workers/:id]
  - Update a specific worker’s password [URI: /workers/:id]
*/
router.route('/workers/:id')
  .get((req, res) => {
    Worker.findOne({ id: req.params.id }, (err, foundWorker) => {
      if (foundWorker) { res.send(foundWorker) }
      else { res.send("Worker not found.") }
    })
  })
  .put((req, res) => {
    Worker.update(
      { id: req.params.id },
      {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        address: req.body.address,
        mobile_number: req.body.mobile_number
      },
      { overwrite: true },
      (err) => {
        if (err) { res.send(err) }
        else { res.send("Successfully Updated!") }
      }
    )
  })
  .delete((req, res) => {
    Worker.deleteOne({ id: req.params.id }, (err, foundWorker) => {
      if (foundWorker) { res.send(foundWorker) }
      else { res.send("Worker account not deleted") }
    })
  })
  .patch((req, res) => {
    Worker.update(
      { id: req.params.id },
      { $set: req.body },
      { overwrite: true },
      (err) => {
        if (err) { res.send(err) }
        else { res.send("Successfully Updated!") }
      }
    )
  })

  module.exports = router;
