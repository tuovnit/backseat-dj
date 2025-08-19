const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const validator = require('validator')
const { User }= require('../models/user');
var express = require('express');
const { json } = require('body-parser');
//const { username } = require('../utils/config');

const app = express();
const saltRounds = 10;

const login = (req, res) => {
    console.log('POST request for login')
    const clientEmail = req.body.email;
    const clientPassword = req.body.password;

    //Checks to see if email is formatted correctly; foo@email.com => true, fooemail.com => false
    if(!validator.isEmail(clientEmail)){
        return res.status(400).json({message: "Not a valid email format"})
    }

    //Checks to see if all fields exist
    if(clientEmail && clientPassword){
        //makes a query to the database to see if there is already an account with this email
        User.findOne(
            {
                where: {
                    email: clientEmail,
                }
            })
            .then(query => {
                //if this email exists then send back to the client a 400 error and let them know this email is already being used
                if(query){
                    bcrypt.compare(clientPassword, query.dataValues.password, (err, result) => {
                        if(err){
                            console.log(err);
                            return res.status(500).json({message: "error comparing password and hash"});
                        }
                        else if(result){
                            console.log('Result: ', result)
                            return res.status(200).json(
                                {
                                    message: "Login Successful.",
                                    userName: query.dataValues.name,
									userID: query.dataValues.id,
									email: query.dataValues.email,
                                });
                        }
                        else{
                            return res.status(400).json({message: "Login information incorrect"});
                        }
                    })
                }
                else{
                    return res.status(400).json({message: "Login failed"});
                }
            })
            .catch(err => {
                console.log(err)
            })
    }
    // These two checks shouldnt ever be hit since the client also does checking to make sure that a password and name are provided.
    // But they're here just in case.
    else if(!clientEmail){
        return res.status(400).json({message: "Email required."});
    }
    else if(!clientPassword){
        return res.status(400).json({message: "Password required."});
    }
}

//handle creating user account and then send response back to client
const createAccount = (req, res) => {
    console.log("POST request for creating account");

    const clientEmail = req.body.email;
    const clientPassword = req.body.password;
    const clientName = req.body.name;

    //Checks to see if email is formatted correctly; foo@email.com => true, fooemail.com => false
    if(!validator.isEmail(clientEmail)){
        return res.status(400).json({message: "Not a valid email format"})
    }

    //Checks to see if all fields exist
    if(clientEmail && clientPassword && clientName){
        //makes a query to the database to see if there is already an account with this email
        User.findOne(
            {
                where: {
                    email: clientEmail
                }
            })
            .then(query => {
                //if this email exists then send back to the client a 400 error and let them know this email is already being used
                if(query){
                    return res.status(400).json({message: "An account with this email address already exists."});
                }
                //otherwise create the account
                else{
                    bcrypt.hash(clientPassword, saltRounds, (err, hash) => {
                        if(err){
                            return res.status(500).json({message: "Password hashing error."});
                        }
                        else{
                            return User.create(
                                {
                                    email: clientEmail,
                                    password: hash,
                                    name: clientName,
                                    guest: false
                                })
                                .then((query) => {
                                    res.status(200).json({message: "Account created successfully.",
									userName: query.dataValues.name,
									userID: query.dataValues.id,
									email: query.dataValues.email,
									})
                                })
                                .catch(err => {
                                    console.log(err);
                                    return res.status(500).json({message: "Error creating account."});
                                })
                        }
                    })
                }
            })
            .catch(err => {
                console.log(err);
            })
    }
    // These two checks shouldnt ever be hit since the client also does checking to make sure that a password and name are provided.
    // But they're here just in case. 
    else if(!clientPassword){
        return res.status(400).json({message: "A password is required to create an account."});
    }
    else if(!clientName){
        return res.status(400).json({message: "A name is required."});
    }
    else if(!clientEmail){
        return res.status(400).json({message: "An email is required."});
    }
}
//handles if a user needs to change their password
const resetPassword = (req, res) => {
    console.log("POST request for changing password")
    clientEmail = req.body.email;
    clientNewPassword = req.body.newPassword;

    if(!clientEmail || !clientNewPassword){
        return res.status(400).json({message: "Email and new password required"})
    }

    User.findOne({
        where: {
            email: clientEmail
        }
    })
    .then(query => {
        if(query){
            bcrypt.hash(clientNewPassword, saltRounds, (err, hash) => {
                if(err){
                    return res.status(500).json({message: "Password hashing error."});
                }
                else{
                    query.update({password: hash})
                    .then(() => {
                        res.status(200).json({message: "Password changed successfully",})
                    })
                    .catch(err => {
                        console.log(err);
                        return res.status(500).json({message: "Error changing password"});
                    })
                }
            })
        }
    })
    .catch(err => {
        console.log(err)
    })



}

module.exports = {
	login,
    createAccount,
    resetPassword
}

