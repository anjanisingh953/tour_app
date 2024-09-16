const mongoose = require('mongoose');
const tourSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,'A Tour must have a name'],
        unique:true,
        trim:true,
        minLength: [3, 'A tour name must have more or equal to 3 characters'],
        maxLength: [15, 'A tour name must have less or equal to 15 characters'] 
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
        max: [5, 'Rating must be below or equal 5']
    },
    ratingsAverage:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'A Tour must have a price'],
        validate:{
            validator: function(val){
                //this only points to current doc on NEW document creation
                return val < this.price;
            },
            message: 'Discount price should be below regular price'
        }
    },
    priceDiscount:Number,
    summary:{
        type:String,
        trim:true,

    },
    description:{
        type:String,
        trim:true,
        required:[true,'A Tour must have a summary'],
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
    startDates: [Date]



});

const Tour = mongoose.model('Tour',tourSchema);     

module.exports = Tour;