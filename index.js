import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

mongoose.connect("mongodb://127.0.0.1:27017/login")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

const Message = mongoose.model("Message", messageSchema);


const app = express();

// Set view engine and static folder
app.set('view engine', 'ejs');
app.use(express.static(path.join(path.resolve(), 'public')));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware to check authentication
const isAuthenticated = async (req, res, next) => {
    const { tokay } = req.cookies;
    if (tokay) {
        try {
            req.message = await Message.findById(tokay);
            next();
        } catch (err) {
            console.error("Error finding user:", err);
           res.redirect('/index')
        }
    } else {
        res.redirect('/index')
   
    }
};

app.get('/index', (req, res) => {
    res.render('index')
})

app.post('/',async(req, res, next) => {
    const {email} = req.body

    
   
       let i= await Message.findOne({email})
     
     
    if (!i) {
        const user = await Message.create({
            name: req.body.name,
            email: req.body.email
        })
        res.cookie("tokay", user._id, {
            httpOnly: true,
            expires: new Date(Date.now() + 60 * 100000)
        });
        res.redirect('/');
    }
    else{
        res.render('index',{mass:"already have"});
    }
});

app.get('/', isAuthenticated, (req, res) => {
    res.redirect('/ans');
});

app.get('/ans', isAuthenticated, (req, res) => {
    res.render('ans');
});

app.get('/login', (req, res) => {
    res.render('ri');
});

app.post('/login', async (req, res) => {
    const { email,name } = req.body;
    try {
        const user = await Message.findOne({ email });
        const no = await Message.findOne({  name });
        console.log(no);
        if (user&&no) {
            res.cookie("tokay", user._id, {
                httpOnly: true,
                expires: new Date(Date.now() + 60 * 100000)
            });
            res.redirect('/');
           
        } else {
            res.render('ri',{mass:"check id pass"} );
            // console.log(user);
        }
    } catch (err) {
        console.error("Error finding user:", err);
        res.redirect('/login');
    }
});



app.get('/lo', (req, res) => {
    res.clearCookie('tokay');
    res.redirect('/login');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
