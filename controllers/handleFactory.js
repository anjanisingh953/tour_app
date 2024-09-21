const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
exports.deleteOne = Model =>catchAsync(async(req, res, next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id);

    if(!doc){
        return next(new AppError('No document found with that id', 404));
    }

    res.status(204).json({
        status:'success',
        data: null
    })
});


exports.updateOne = Model => catchAsync(async(req, res, next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new:true,
    runValidators:true

    });

    if(!doc){
        return next(new AppError('No document found with that id', 404));
    }

    res.status(200).json({
        status:'success',
        data: {
            data: doc
        }
    })

});


exports.createOne = Model => catchAsync(async(req, res, next)=>{
    const doc = await Model.create(req.body);
    res.status(200).json({
        status:'success',
        data: {
            data:doc
        }
    });

});


exports.getOne = (Model, populateOption)=>catchAsync(async(req, res, next)=>{
    
    let query = Model.findById(req.params.id);
    if(populateOption) query = query.populate(populateOption);

    const doc = await query;

     
    if(!doc){
        return next(new AppError('No document found with that id', 404));
    }

    res.status(200).json({
        status:'success',
        data:{
            data: doc
        }
    })

});    



exports.getAll = Model =>catchAsync(async(req, res, next)=>{
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


    //To allow for nested Get reviews on Tour
    let filter = {};
    if(req.params.tourId) filter = {tour: req.params.tourId}

    //Execute the Query
    const features = new APIFeatures(Model.find(filter), req.query).filter().limitFields().paginate();
    // const doc= await features.query.explain(); 
    const doc= await features.query; 

    //Send Response
    res.status(200).json({
            status:'success',
            results: doc.length,
            data:{
                data:doc
            }
    })       

});
