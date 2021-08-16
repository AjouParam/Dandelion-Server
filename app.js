"use strict";

const express=require('express');
const morgan=require('morgan');
const cors=require('cors');
const session=require("express-session");
const router=require("./src/routes");

const app=express();
app.use(express.json());
app.use(express.urlencoded( {extended : false } ));
app.use(cors());
app.use("/", router);

module.exports=app;