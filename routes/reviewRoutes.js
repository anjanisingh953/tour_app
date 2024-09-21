const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams:true });

// POST /tour/3445/reviews
// GET /tour/3445/reviews
// GET /tour/3445/reviews/565566


router.use(authController.protect);

router
.route('/')
.get(reviewController.getAllReviews)
.post(
    authController.restirctTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
 );

 router
 .route('/:id')
 .get(reviewController.getReview)
 .patch(authController.restirctTo('admin','user'), reviewController.updateReview)
 .delete(authController.restirctTo('admin','user'), reviewController.deleteReview);


module.exports = router;