require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const session = require('express-session')

const Redis = require('ioredis');
const redisClient = new Redis();
const RedisStore = require('connect-redis')(session)
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocument, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const dbClient = new DynamoDBClient({ region: 'us-east-1' })
const docClient = DynamoDBDocument.from(dbClient)

const app = express()
const tableName = process.env.TABLE



app.use(session({
  store: new RedisStore({ client: redisClient ,
     prefix: 'sess:', 
       port: 6379,

  }),
  secret: 'SECRET',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 } // e.g. 1 min
}));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
const JWT_SECRET = process.env.SECRET

/////////////////OTP functions//////////////////////////
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.TRANSPORTEREMAIL,       
        pass: process.env.TRANSPORTERPASS,    
    }
});

/////////////////////////////////////////
app.get('/', (req, res) => {
    res.redirect("/signup")
})
app.get('/login', (req, res) => {
    res.render("login")
})
app.get("/signup", (req, res) => {
    res.render("signup")
})

app.post("/signup", async (req, res) => {
    const name = req.body.name
    const username = req.body.username
    const password = req.body.password
    req.session.name = name
    const encryptedPassword = await bcrypt.hash(password, 10)
    const scanResult = await docClient.send(new ScanCommand({
        TableName: tableName,
        FilterExpression: "username=:u",
        ExpressionAttributeValues: {
            ':u': username
        }
    }))



    if (scanResult.Items.length > 0 && Object.values(scanResult.Items[0]).includes(username)) {
 return res.render("userExists")

    }

    const items = {
        name: name,
        username: username,
        password: encryptedPassword
    }
    await docClient.send(new PutCommand({
        TableName: tableName,
        Item: items,
         ConditionExpression: 'attribute_not_exists(username)'
    }))

  res.render("userCreated")

})

app.post("/login", async (req, res) => {
    const username = req.body.username
    const password = req.body.password



    const scanResult = await docClient.send(new ScanCommand({
        TableName: tableName,
        FilterExpression: "username=:u",
        ExpressionAttributeValues: {
            ':u': username
        }
    }))
    const user = scanResult.Items[0]



    console.log("Users signed up", user);
    req.session.user = user
    if (!user) {
        return res.send('User not found, please signup');

    }
    console.log(password);
    
    try {
        const match = await bcrypt.compare(password, user.password)
        if (!match) {
           return res.send("passwords doesnt match")
        }
        console.log("match:", match);
        const otp = generateOTP()
        req.session.otp = otp
        req.session.name=user.name
        req.session.otpExpires = Date.now() + 60 * 1000;
        const mailParams = {
            from: 'prasannabalaji095@gmail.com',
            to: user.username,
            subject: 'Your OTP Code',
            text: `Your OTP is ${otp}`,
        }
        transporter.sendMail(mailParams, (data, err) => {
            if (err) {
                console.error(err)
                throw err
            }
            else {
                console.log(data);

            }

        })

        res.redirect("/verify-otp")

    } catch (err) {
        console.error("Error while login", err)
        throw err
    }
})
app.get("/verify-otp", (req, res) => {
    res.render("verifyOtp")
})
app.post("/verify-otp", (req, res) => {
    const receivedOtp = req.body.otp
    const user = req.session.user
    const otp = req.session.otp
    const expireTime = req.session.otpExpires;

    console.log("session user", user);

    if (otp === receivedOtp) {

        if (Date.now() > expireTime) {
          return   res.send("Expired otp")

        }
        else {
            const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7h' })
            res.cookie('token', token, { httpOnly: true })
            res.redirect("/dashboard")
        }
    }
    else {
     return    res.send("OTP invalid")
    }
})
const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
      return  res.send("Login failed")
    }
    const decode = jwt.verify(token, JWT_SECRET)
    req.user = decode
    next()
}
app.get("/dashboard", authenticateToken, async (req, res) => {


    
    
    
    res.render("dashboard", { name:req.session.name })

})
app.get('/logout', async (req, res) => {
    res.clearCookie('token')
    res.redirect("/")

})
app.listen(3000, () => {
    console.log("App started");

})
