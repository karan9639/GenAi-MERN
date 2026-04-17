import mongoose from "mongoose";
import { use } from "react";

const userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true,
        unique:[true,"Username already exists"],
    },
    email:{
        type:String,
        required:true,
        unique:[true,"Account with this email already exists"],
    },
    password:{
        type:String,
        required:true,
    }
})

const userModel=mongoose.model("User",userSchema);