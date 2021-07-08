const router = require('express').Router();
const { validateAgainstSchema } = require('../lib/validation');
exports.router = router;
const ObjectID = require('mongodb').ObjectID;
const { businesses } = require('./businesses');
const { reviews } = require('./reviews');
const { photos } = require('./photos');
const { connectToDb, getDbReference } = require('../lib/mongo');

async function getUsersBusinesses(id) {
  const db = getDbReference();
  const collection = db.collection('businesses'); //switch collections for next query
  const results = await collection.aggregate([
    {$match: {ownerid: id}}
  ]).toArray();
  return results;
}

async function getUsersReviews(id) {
  const db = getDbReference();
  const collection = db.collection('reviews'); //switch collections for next query
  const results = await collection.aggregate([
    {$match: {userid: id}}
  ]).toArray();
  return results;
}

async function getUsersPhotos(id) {
  const db = getDbReference();
  const collection = db.collection('photos'); //switch collections for next query
  const results = await collection.aggregate([
    {$match: {userid: id}}
  ]).toArray();
  return results;
}

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', async function (req, res) {
  const userid = parseInt(req.params.userid);
  try {
    const businesses = await getUsersBusinesses(userid);
    if(businesses) {
      res.status(200).send(businesses);
    } else {
      res.status(500).send({
        err: "Error fetching user's businesses from DB. Try again later"
      });
    }
  } catch (err) {
    console.error("  -- error:", err);
    res.status(500).send({
      err: "Error fetching user's businesses from DB. Try again later"
    });
  }
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', async function (req, res) {
  const userid = parseInt(req.params.userid);
  try {
    const reviews = await getUsersReviews(userid);
    if(reviews) {
      res.status(200).send(reviews);
    } else {
      res.status(500).send({
        err: "Error fetching user's reviews from DB. Try again later"
      });
    }
  } catch (err) {
    console.error("  -- error:", err);
    res.status(500).send({
      err: "Error fetching user's reviews from DB. Try again later"
    });
  }
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', async function (req, res) {
  const userid = parseInt(req.params.userid);
  try {
    const photos = await getUsersPhotos(userid);
    if(photos) {
      res.status(200).send(photos);
    } else {
      res.status(500).send({
        err: "Error fetching user's photos from DB. Try again later"
      });
    }
  } catch (err) {
    console.error("  -- error:", err);
    res.status(500).send({
      err: "Error fetching user's photos from DB. Try again later"
    });
  }
});
