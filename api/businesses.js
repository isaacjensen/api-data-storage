const router = require('express').Router();
const { validateAgainstSchema } = require('../lib/validation');
const businesses = require('../data/businesses');
const { reviews, getReviewByID } = require('./reviews');
const { photos } = require('./photos');
const { connectToDb, getDbReference } = require('../lib/mongo');
//const { ObjectID } = require('bson');
const ObjectID = require('mongodb').ObjectID;
const { ObjectId } = require('bson');
exports.router = router;
exports.businesses = businesses;

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  ownerid: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false }
};
async function deleteBusinessByID(id) {
  const db = getDbReference();
  const collection = db.collection('businesses');
  const result = await collection.deleteOne({
    _id: new ObjectID(id)
  });
  return result.deletedCount > 0;
}

async function updateBusinessbyID(id, business) {
  const businessValues = {
    name: business.name,
    address: business.address,
    city: business.city,
    state: business.state,
    zip: business.zip,
    phone: business.phone,
    category: business.category,
    subcategory: business.subcategory,
    website: business.website,
    email: business.email
  };
  const db = getDbReference();
  const collection = db.collection('businesses');
  const result = await collection.replaceOne({
    _id: new ObjectID(id)
  }, businessValues);
  return result.matchedCount > 0;
}

async function getBusinessbyID(id) {
  const db = getDbReference();
  const collection = db.collection('businesses');
  let total = []
  const results = await collection.find({
    _id: new ObjectID(id)
  }).toArray();
  total.push(results);

  const new_collection = db.collection('reviews'); //switch collections for next query
  const reviews_results = await  new_collection.aggregate([
    {$match: {businessid: id}}
  ]).toArray();
  total.push(reviews_results);

  const new_new_collection = db.collection('photos'); //switch collections for next query
  const new_new_results = await  new_new_collection.aggregate([
    {$match: {businessid: id}}
  ]).toArray();
  total.push(new_new_results);

  const final = [{
    businesses:results,
    reviews: reviews_results,
    photos: new_new_results
  }];
  return final;
}

async function getBusinessPage(page) {
  const db = getDbReference();
  const collection = db.collection('businesses'); //getting access to lodgings collection
  const count = await collection.countDocuments();
  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;

  const results = await collection.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray()

  return {
    businesses: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
}

async function insertNewBusiness(business) {
  //business = extractValidFields(business, businessSchema);
  const db = getDbReference();
  const collection = db.collection('businesses');
  const result = await collection.insertOne(business);
  console.log(' -- result:', result)
  return result.insertedId;
}

/*
 * Route to return a list of businesses.
 */
router.get('/', async (req, res) => {
  try {
    const businessPage = await getBusinessPage(parseInt(req.query.page) || 1);
    res.status(200).send(businessPage);
  } catch (err) {
    console.error("  -- error:", err);
    res.status(500).send({
      err: "Error fetching lodgings page from DB. Try again later"
    });
  }
});

/*
 * Route to create a new business.
 */
router.post('/', async (req, res, next) => {
  if (validateAgainstSchema(req.body, businessSchema)) {
    try {
      const id = await insertNewBusiness(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      res.status(500).send({
        err: "Error inserting business into DB. Try again later"
      });
    }
    //const business = validation.extractValidFields(req.body, businessSchema);
  } else {
    res.status(400).json({
      error: "Request body is not a valid business object"
    });
  }
});

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessid', async function (req, res, next) {
  try {
    const business = await getBusinessbyID(req.params.businessid);
    res.status(200).send(business);
  } catch (err) {
    res.status(500).json({
      error: "Error fetching business by ID from DB. Try again later"
    });
  }
});

/*
 * Route to replace data for a business.
 */
router.put('/:businessid', async function (req, res, next) {
  const businessid = parseInt(req.params.businessid);
    if (validateAgainstSchema(req.body, businessSchema)) {
      try {
        const updateSuccessful = await updateBusinessbyID(req.params.businessid, req.body);
        if(updateSuccessful) {
          res.status(200).send({
            success: "business updated"
          });
        } else {
          next();
        }
      } catch(err) {
        res.status(500).json({
          error: "Unable to update business: ", businessid
        });
      }
    } else {
      res.status(400).json({
        error: "Request body is not a valid business object"
      });
    }
});

/*
 * Route to delete a business.
 */
router.delete('/:businessid', async function (req, res, next) {
  try {
    const deleteSuccessful = await deleteBusinessByID(req.params.businessid);
    if(deleteSuccessful) {
      res.status(204).send({
        success: "deleted business"
      });
    }
    else {
      next();
    }
  } catch(err) {
    res.status(500).send({
      error: "Unable to delete business"
    })
  }
});
