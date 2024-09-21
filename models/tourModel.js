const mongoose = require('mongoose');
const tourSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,'A Tour must have a name'],
        unique:true,
        trim:true,
        minLength: [3, 'A tour name must have more or equal to 3 characters'],
        maxLength: [30, 'A tour name must have less or equal to 30 characters'] 
    },
    duration:{
        type:Number,
        required:[true,'A tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A Tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true,'A Tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min: [1, 'Rating must be above or equal 1'],
        max: [5, 'Rating must be belowor equal 5'],
        set: val => Math.round( val * 10) / 10
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'A Tour must have a price']
        
    },
    priceDiscount:{
        type: Number,
        validate:{
            validator: function(val){
                //this only points to current doc on NEW document creation
                return val < this.price;
            },
            message: 'Discount price should be below regular price'
        }
    },
    summary:{
        type:String,
        trim:true,

    },
    description:{
        type:String,
        trim:true,
        required:[true,'A Tour must have a description'],
    },
    imageCover:{
        type:String,
        required:[true,'A Tour must have a imageCover']
    },
    images:[String],
    createdAt:{
        type: Date,
        default: Date.now(),
        select:false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {  
        type:{
            type: String,
            default: 'Point', //May be Point, line, OR polygons
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'

        }
    ]



},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }  
}
);


tourSchema.index( { price: 1, ratingsAverage: -1 } );
tourSchema.index( { startLocation: '2dsphere' });

// virtual populate
tourSchema.virtual('reviews',{
    ref:'Review',   //Model name of parent collection for which we want populate
    foreignField: 'tour',   //Field name which is defined in parent collection for our current model
    localField: '_id'     // field name where our current model's id is stored i.e _id  
})


//document Middleware
// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// })


//Query middleware
tourSchema.pre(/^find/,function(next){
    this.populate({
       path: 'guides',
       select: '-__v' 
    });

    next();
})




const Tour = mongoose.model('Tour',tourSchema);     

module.exports = Tour;