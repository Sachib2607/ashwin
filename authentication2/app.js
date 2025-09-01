const express = require('express');
const app = express();
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const userModel = require("./models/user");
const bcrypt = require("bcrypt");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('index');
});

app.get("/login", async (req, res) => {
   res.render("login") 
})

app.post("/login", async (req, res) => {
   let user= await userModel.findOne({email:req.body.email}).then(async(user)=>{
        if(!user) return res.status(404).send("Something went wrong");
        bcrypt.compare(req.body.password, user.password,function(err, result) {
            if(result===false) return res.status(404).send("Something went wrong");
            res.send("yes you can login")
            let token = jwt.sign({ email:user.email }, "gjdroejrt", { expiresIn: "1h" });

        // 4. set cookie
        res.cookie("token", token, { httpOnly: true });
        });
        
    })
})
app.post("/logout", (req, res) => {
    res.cookie("token","");
    res.redirect("/")
    res.send("Logged out successfully");
});

app.post("/create", async (req, res) => {
    try {
        const { username, email, password, age } = req.body;

        // 1. generate salt + hash
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // 2. save user
        let createdUser = await userModel.create({
            username,
            email,
            password: hash,
            age
        });

        // 3. generate JWT token
        let token = jwt.sign({ email }, "gjdroejrt", { expiresIn: "1h" });

        // 4. set cookie
        res.cookie("token", token, { httpOnly: true });

        res.send("User created successfully!");
        // ya res.redirect("/") agar home page dikhana hai
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating user");
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
