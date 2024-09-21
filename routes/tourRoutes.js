const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

// POST /tour/3445/reviews
// GET /tour/3445/reviews
// GET /tour/3445/reviews/565566


router.use('/:tourId/reviews',reviewRouter);



// router.param('id',tourController.checkID);
router.route('/import_data').post(tourController.ImportData);
router.route('/top-5-tours').get(tourController.aliasTopTours,tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
.route('/monthly-plan/:year')
.get(authController.protect, authController.restirctTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);


router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/').get(tourController.getAllTours).post(authController.protect, authController.restirctTo('admin', 'lead-guide'), tourController.createTour);
router.route('/:id').post(tourController.getTour).patch(authController.protect, authController.restirctTo('admin', 'lead-guide'),tourController.updateTour).delete(authController.protect, authController.restirctTo('admin', 'lead-guide'), tourController.deleteTour);

module.exports = router;