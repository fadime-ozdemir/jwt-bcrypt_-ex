require("dotenv").config()
const express = require("express")
const jwt = require("jsonwebtoken")
const app = express()
const bcrypt = require('bcrypt')
// this server is for login/out and refresh token

// use json file in server (without body parser) from req.body
app.use(express.json())

//user store
const users = [{ username: "Kyle",
password: "123"},  {username: "Jim",    
password: "123"}, {username: "Dada",
password: "123"}, {
    username: "fad",
    password: "$2b$10$vSTaRmYZ2dIRnkrvRdw0/uiqA9wFv3WkB9fi9933geRu.A8yIqToa"
}]

// here where we store token, it can be session, db ...
let refreshTokens = []

// create a new token
app.post("/token", (req, res)=>{
    // get the token from req.
    const refreshToken = req.body.token
    // check if there is a refresh token
    if(refreshToken == null) return res.sendStatus(401)
    // check if refreshToken is in db
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=> {
        if(err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ user })
        res.json({accessToken: accessToken})
    })
})

app.delete("/logout", (req, res)=> {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token )
    res.sendStatus(204)
})

let newUsers = []
// login
app.get("/users", (req, res)=>{
    // this return users stores in db, the password is hashed and 
res.json(users)
})

app.post("/login", async (req, res)=>{
    // first you need to auth user
    let user = users.find( user => user.username = req.body.username)

    if(user == null) {
        return res.status(400).send("Cannot find user");
    }
    
    try{
       if( await bcrypt.compare(req.body.password, user.password) ) { // this should be true but it is false because we didn't save the hashed password to db
           const accessToken = generateAccessToken( user.password )
           const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
           // save the refresh token to genere again access token later
           refreshTokens.push(refreshToken) 
           res.json({accessToken:accessToken, refreshToken: refreshToken})
       } else {
           res.send("Not allowed")
       }

    } catch {
        res.sendStatus(500)
    }

})

// sign up
app.post("/users", async (req, res) => {
    try {
        // const salt = await bcrypt.genSalt() || pass 10 as arg
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = { username: req.body.username, password: hashedPassword }
        users.push(user)
        res.sendStatus(201)
    } catch {
        res.sendStatus(500)
    }
})
function generateAccessToken( user ) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15s"})
}


app.listen(4000)