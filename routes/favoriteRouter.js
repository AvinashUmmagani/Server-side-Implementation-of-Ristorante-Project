const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favorites = require('../models/favorite');
const cors = require('./cors');
const favoriteRouter = express.Router();
var authenticate = require('../authenticate'); 

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next ) => {
    Favorites.findOne({ user: req.user._id })
    .populate('user')
    .populate('dishes')
    .then((favorite)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch((err) => {next(err)})
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user : req.user._id})
    .then((favorite) => {
        if (favorite != null) {
            for(i = 0;i<req.body.length;i++){
                if(favorite.dishes.includes(req.body[i]._id)){
                    continue;
                }
                else{
                    favorite.dishes.push(req.body[i]._id);
                }
            }
            favorite.save()
            .then((favorite) => {
                console.log(favorite);
                Favorites.findOne({user : req.user._id})
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })            
            }, (err) => next(err));
        }
        else {
            Favorites.create({user : req.user._id , dishes : req.body})
            .then((favorite)=>{
                console.log("Fav added",favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(favorite);
            }, (err)=>next(err))
            .catch((err)=>next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndDelete({user : `${req.user._id}`})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    }, (err)=>next(err))
    .catch((err)=>next(err));
});



favoriteRouter.route('/:dishID')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user : req.user._id})
    .then((favorite) => {
        if (favorite != null) {
            if(!favorite.dishes.includes(req.params.dishID)){
                favorite.dishes.push(req.params.dishID);
            }
            favorite.save()
            .then((favorite) => {
                console.log(favorite);
                Favorites.findOne({user : req.user._id})
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })            
            }, (err) => next(err));
        }
        else {
            Favorites.create({user : req.user._id , dishes : req.body})
            .then((favorite)=>{
                console.log("Fav added",favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(favorite);
            }, (err)=>next(err))
            .catch((err)=>next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user : `${req.user._id}`})
    .then((resp)=>{
        if(resp!=null){
            resp.dishes = resp.dishes.filter(e => e!=req.params.dishID)
            resp.save()
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        }
        else{
            var err = new Error("Fav not found");
            next(err);
        }
        
    }, (err)=>next(err))
    .catch((err)=>next(err));
});

module.exports = favoriteRouter;