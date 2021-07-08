const router = require('express').Router();
const { validateAgainstSchema } = require('../lib/validation');
const { connectToDb, getDbReference } = require('../lib/mongo');
const photos = require('../data/photos');
const ObjectID = require('mongodb').ObjectID;
exports.router = router;
exports.photos = photos;

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
};

async function deletePhotoByID(id) {
  const db = getDbReference();
  const collection = db.collection('photos');
  const result = await collection.deleteOne({
    _id: new ObjectID(id)
  });
  return result.deletedCount > 0;
}

async function updatePhotoByID(id, photo){
  const photoValues = {
    userid: photo.userid,
    businessid: photo.businessid,
    caption: photo.caption
  };
  const db = getDbReference();
  const collection = db.collection('photos');
  const result = await collection.replaceOne({
    _id: new ObjectID(id)
  }, photoValues);
  return result.matchedCount > 0;
}

async function insertNewPhoto(photo) {
  const db = getDbReference();
  const collection = db.collection('photos');
  const result = await collection.insertOne(photo);
  console.log(' -- result:', result)
  return result.insertedId;
}

async function getPhotoByID(id) {
  const db = getDbReference();
  const collection = db.collection('photos');
  const results = await collection.find({
    _id: new ObjectID(id)
  }).toArray();
  return results[0];
}

/*
 * Route to create a new photo.
 */
router.post('/', async function (req, res, next) {
  if (validateAgainstSchema(req.body, photoSchema)) {
    try {
      const id = await insertNewPhoto(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      res.status(500).send({
        err: "Error inserting photo into DB. Try again later"
      });
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid photo object"
    });
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', async function (req, res, next) {
  try {
    const photo = await getPhotoByID(req.params.photoID);
    if(photo) {
      res.status(200).send(photo);
    } else {
      res.status(500).json({
        error: "Error fetching photo by ID from DB. Try again later"
      });
    }
  } catch (err) {
    res.status(500).json({
      error: "Error fetching photo by ID from DB. Try again later"
    });
  }
});

/*
 * Route to update a photo.
 */
router.put('/:photoID', async function (req, res, next) {
    if (validateAgainstSchema(req.body, photoSchema)) {
      try {
        const updateSuccessful = await updatePhotoByID(req.params.photoID, req.body);
        if(updateSuccessful) {
          res.status(200).send({});
        } else {
          next();
        }
      } catch(err) {
        res.status(500).json({
          error: "Unable to update photo "
        });
      }
    } else {
      res.status(400).json({
        error: "Request body is not a valid photo object"
      });
    }
});

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', async function (req, res, next) {
  try {
    const deleteSuccessful = await deletePhotoByID(req.params.photoID);
    if(deleteSuccessful) {
      res.status(204).send({
        success: "deleted photo"
      });
    }
    else {
      next();
    }
  } catch(err) {
    res.status(500).send({
      error: "Unable to delete photo"
    })
  }
});
