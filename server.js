require("dotenv").config()
const express = require("express")
const jwt = require("jsonwebtoken")
const app = express()

// if user is authenticated you can show its posts

const posts =[{
    username: "Kyle",
    password: "123",
    title: "Post 1"
}, {
    username: "Jim",    
    password: "123",
    title: "Post 2"
}, {
    username: "Dada",
    password: "123",
    title: "Post 3"
}]
// use json file in server (without body parser) from req.body
app.use(express.json())

app.get("/posts", authenticateToken, (req,res)=>{
    res.json(posts.filter(post=> post.username === req.user.username ))
})

function authenticateToken( req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if(token == null) return res.sendStatus(401) // no token sent
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        if(err) return res.sendStatus(403) // token no longer valid
        req.user = user
        next()
    })
}


app.listen(3000)