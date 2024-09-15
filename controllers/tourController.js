const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures')

// const fs = require('fs');
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

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

exports.createTour = async(req,res)=>{
    try {

        const newTour = await Tour.create(req.body);
        res.status(200).json({
            status:'success',
            data: {
                tour:newTour
            }
        });
        
    } catch (err) {
            res.status(400).json({
                status: 'failed',
                message: err
            })
    }

};

exports.aliasTopTours = (req,res,next)=>{
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next();
}





exports.getAllTours = async(req,res)=>{
    try {
        console.log(req.query);

        //Build the Query
        // 1A. Filtering
        // let queryObj = {...req.query};
        // const excludeFields = ['page', 'sort', 'limit', 'fields'];
        // excludeFields.forEach((el)=> delete queryObj[el]);
        

        //1B. Advanced Filtering
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\bgte|gt|lte|lt\b/g, match => `$${match}`);
        // // console.log(JSON.parse(queryStr));
        // let query = Tour.find(JSON.parse(queryStr)); 


        //2. Sorting
        // if(req.query.sort){
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     console.log(sortBy)
        //     query = query.sort(sortBy); 
        // }else{
        //     query = query.sort('-createdAt');
        // }


        //3. Field Limiting
        // if(req.query.fields){
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // }else{
        //     query = query.select('-__v');
        // }


        //4. Pagination
        // const page = req.query.page * 1 || 1 ;
        // const limit = req.query.limit * 1 || 10 ;
        // const skip = (page - 1) * limit;

        // query = query.skip(skip).limit(limit);

        // if(req.query.page){
        //     const numTours = await Tour.countDocuments();
        //     if(skip >= numTours) throw new Error('This page does not exist');
        // }



        //Execute the Query
        const features = new APIFeatures(Tour.find(), req.query).filter().limitFields().paginate();
        const tours = await features.query; 

        //Send Response
        res.status(200).json({
                status:'success',
                results: tours.length,
                data:{
                    tours
                }
        })       
    } catch (err) {
        res.status(400).json({
            status:'failed',
            message:err
        })        
    }
};


exports.getTour = async(req,res)=>{
    try {
        const tour = await Tour.findById(req.params.id)
        res.status(200).json({
            status:'success',
            data:{
                tour
            }
        })
    } catch (err) {
        res.status(400).json({
            status:'failed',
            message:err
        })        
    }
};    

exports.updateTour = async(req,res)=>{
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators:true

        });

        res.status(200).json({
            status:'success',
            data: tour
        })


    }catch(err){    
        res.status(400).json({
            status:'failed',
            message:err
        })        

    }
};


exports.deleteTour = async(req,res)=>{
    try{
        const tour = await Tour.findByIdAndDelete(req.params.id);

        res.status(200).json({
            status:'success',
            data: 'Tour is deleted'
        })


    }catch(err){    
        res.status(400).json({
            status:'failed',
            message:err
        })        

    }
};

exports.getTourStats = async(req, res)=>{
    try{
    
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


    }catch(err){

        res.status(400).json({
            status:'failed',
            message:err
        })        

    }
}


exports.getMonthlyPlan = async(req,res)=>{

    try {
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


    } catch (err) {
 
        res.status(400).json({
            status:'failed',
            message:err
        })              
    }
}