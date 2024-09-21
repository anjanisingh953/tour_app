const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');
const fs = require('fs');
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`));

exports.ImportData = async()=>{
    
    console.log('Data imported')

    try{
        await Tour.create(tours);
        console.log('data inserted successfully');
    }catch(err){
        console.log('Import data errr >>>',err)
    }
}; 


// exports.checkID = (req, res, next, val)=>{
//     console.log(`Tour id is ${val}`);
//     if(req.params.id * 1 > tours.length){
//         return res.status(404).json({
//              status: 'failed',
//              message:'Invalid id'
//         });        
//     };
//     next();
// } 

exports.createTour = factory.createOne(Tour);

exports.aliasTopTours = (req,res,next)=>{
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next();
}





exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {path: 'reviews'} );
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);


exports.getTourStats = catchAsync(async(req, res, next)=>{
      const stats = await Tour.aggregate([
          {
            $match: { ratingsAverage: { $gte: 4.5 } }
          },
          {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $avg: '$price' },
                maxPrice: { $avg: '$price' }
                 
            }  
          },
          {
            $sort: { avgPrice : -1 }
          }
      ]);

        res.status(200).json({
            status:'success',
            data: {stats}
        });


})


exports.getMonthlyPlan = catchAsync(async(req, res, next)=>{

       const year = req.params.year * 1 ;
       
       const plan = await Tour.aggregate([

            {
                $unwind: '$startDates'  
            },
            {
                $match: {
                    startDates:{
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)    
                    }
                }
            },
            {
               $group: {
                 _id: { $month:  '$startDates' },
                 numTourStarts: { $sum: 1},
                 tours: { $push: '$name'    }
               } 
            },
            {
                $addFields: { month: '$_id' }
            },
            {
               $project: {
                    _id: 0 
               } 
            },
            {
                $sort: { numTourStarts: -1 }
            },
            {
               $limit: 3 

            }

       ]);
       
       res.status(200).json({
            status:'success',
            data: {plan}
       });


  
});



// router.route('/tours-within/:distance/center/:latlang/:unit', tourController.getToursWithin);

// tours-distance/233/center/424.222,-252121/unit/mi
exports.getToursWithin = catchAsync( async(req, res, next)=>{
    const {distance, latlng, unit } = req.params;
    const [ lat, lng ] = latlng.split(',');

    const radius = (unit === 'mi')? distance / 3963.2 : distance / 6378.1 ;   //Here convert distance into radian,because mongo db needs radius into radian


    if(!lat || !lng){
       return next(new AppError('Please provide latitude and longitude in the format lat,lag'));
    };

    console.log(distance, lat, lng  , unit );

    const tours = await Tour.find({
             startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } 
        });


    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            data: tours
        }
    })

});


exports.getDistances = catchAsync(async(req, res, next)=>{


    const { latlng, unit } = req.params;
    const [ lat, lng ] = latlng.split(',');

    const multiplier = (unit === 'mi') ? 0.000621371  : 0.001;
 
    if(!lat || !lng){
       return next(new AppError('Please provide latitude and longitude in the format lat,lag'));
    };

    const distances = await Tour.aggregate([

        {
            $geoNear: {
                near: { 
                    type: 'Point',
                    coordinates: [lng * 1, lat *1 ],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })


})
