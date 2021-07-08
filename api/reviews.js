const router = require('express').Router();
const validation = require('../lib/validation');
const ObjectID = require('mongodb').ObjectID;
const { connectToDb, getDbReference } = require('../lib/mongo');
const reviews = require('../data/reviews');
const { validateAgainstSchema } = require('../lib/validation');
exports.router = router;
exports.reviews = reviews;

/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
  userid: { required: true },
  businessid: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false }
};

async function deleteReviewByID(id) {
  const db = getDbReference();
  const collection = db.collection('reviews');
  const result = await collection.deleteOne({
    _id: new ObjectID(id)
  });
  return result.deletedCount > 0;
}

async function updateReviewByID(id, review){
  const reviewValues = {
    userid: review.userid,
    businessid: review.businessid,
    dollars: review.caption,
    stars: review.stars,
    review: review.review
  };
  const db = getDbReference();
  const collection = db.collection('reviews');
  const result = await collection.replaceOne({
    _id: new ObjectID(id)
  }, reviewValues);
  return result.matchedCount > 0;
}

async function insertNewReview(review) {
  const db = getDbReference();
  const collection = db.collection('reviews');
  const result = await collection.insertOne(review);
  console.log(' -- result:', result)
  return result.insertedId;
}

async function getReviewByID(id) {
  const db = getDbReference();
  const collection = db.collection('reviews');
  const results = await collection.find({
    _id: new ObjectID(id)
  }).toArray();
  return results[0];
}
exports.getReviewByID = getReviewByID;

// async function listReviews() {
//   const db = getDbReference();
//   const collection = db.collection('reviews');
//   const results = await collection.find({}).toArray();
// return {
//   reviews: results
// };
// }

// router.get('/', async function (req,res,next) {
//   const reviews = listReviews();
//   if(reviews) {
//     res.status(200).send(reviews);
//   } else {
//     res.status(404).send({
//       err: "error"
//     });
//   }
// });
/*
 * Route to create a new review.
 */
router.post('/', async function (req, res, next) {
  if (validateAgainstSchema(req.body, reviewSchema)) {
    try {
      const id = await insertNewReview(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      res.status(500).send({
        err: "Error inserting review into DB. Try again later"
      });
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid review object"
    });
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewID', async function (req, res, next) {
  try {
    const review = await getReviewByID(req.params.reviewID);
    if(review) {
      res.status(200).send(review);
    } else {
      res.status(500).json({
        error: "Error fetching review by ID from DB. Try again later"
      });
    }
  } catch (err) {
    res.status(500).json({
      error: "Error fetching review by ID from DB. Try again later"
    });
  }
});

/*
 * Route to update a review.
 */
router.put('/:reviewID', async function (req, res, next) {
  if (validateAgainstSchema(req.body, reviewSchema)) {
    try {
      const updateSuccessful = await updateReviewByID(req.params.reviewID, req.body);
      if(updateSuccessful) {
        res.status(200).send({});
      } else {
        next();
      }
    } catch(err) {
      res.status(500).json({
        error: "Unable to update review "
      });
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid review object"
    });
  }
});

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', async function (req, res, next) {
  try {
    const deleteSuccessful = await deleteReviewByID(req.params.reviewID);
    if(deleteSuccessful) {
      res.status(204).send({
        success: "deleted review"
      });
    }
    else {
      next();
    }
  } catch(err) {
    res.status(500).send({
      error: "Unable to delete review"
    })
  }
});
