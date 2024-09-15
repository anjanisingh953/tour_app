const Tour = require('../models/tourModel');
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

exports.getAllTours = async(req,res)=>{
    try {
        console.log(req.query);

        //Build the Query
        // 1A. Filtering
        let queryObj = {...req.query};
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((el)=> delete queryObj[el]);
        

        //1B. Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\bgte|gt|lte|lt\b/g, match => `$${match}`);
        // console.log(JSON.parse(queryStr));
        let query = Tour.find(JSON.parse(queryStr)); 


        //2. Sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            console.log(sortBy)
            query = query.sort(sortBy); 
        }else{
            query = query.sort('-createdAt');
        }


        //Field Limiting
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        }else{
            query = query.select('-__v');
        }



        //Execute the Query
        const tours = await query;

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

