const mongoose = require('mongoose');
const Tour = require('./tourModel');   
const reviewSchema = new mongoose.Schema({

    review: {
        type: String,
        required: [true, 'Review can not be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},{
    toJSON: { virtuals:true },
    toObject: { virtuals: true }        
});


reviewSchema.index( { tour: 1, user: 1} );



    //Query Middleware

    reviewSchema.pre(/^find/,function(next){
        // this.populate({
        //     path: 'tour', //tour is the field name of reviewSchema
        //     select: 'name'
        // }).populate(({
        //     path: 'user',
        //     select: 'name photo'
        // }));

        this.populate(({
            path: 'user',
            select: 'name photo'
        }));

        next();
    })


//static methods
reviewSchema.statics.calAverageRatings = async function(tourId){
 const stats =  await this.aggregate([
        {
            $match: { tour: tourId}
         },
         {
            $group: {
                      _id: '$tour',
                      nRating: { $sum : 1 },
                      avgRating: { $avg: '$rating' }
                    }
         }
         
    ]);

    // console.log(stats);
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: 0,
            ratingsAverage: 5
        })
    }

};

reviewSchema.post('save',function(){
    //Here this.constructor is pointing to Review Model
    this.constructor.calAverageRatings(this.tour);
});


reviewSchema.pre(/^findOneAnd/,async function(next){
    this.r = await this.model.findOne(this.getQuery()).exec();
    // console.log(this.r);
    next();
})

reviewSchema.post(/^findOneAnd/,async function(){
  
    if(this.r){
        await this.r.constructor.calAverageRatings(this.r.tour);
    }

})

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;