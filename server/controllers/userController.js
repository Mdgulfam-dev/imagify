import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator'
import Razorpay from 'razorpay'
import transactionModel from "../models/transactionModel.js";
import dotenv from 'dotenv';
dotenv.config();


// export const registerUser = async (req, res) =>{
//     try {
//         const {name , email, password} = req.body;
//         const normalizedEmail = email.trim().tolowerCase();


//         if(!name || !email || !password){
//             return res.json({success:false, message: 'Missing Details'});
//         }
        

        
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const userData = {
//             name, 
//             email,
//             password: hashedPassword
//         }
//         console.log(hashedPassword);
//         const newUser = new userModel(userData);
//         const user = await newUser.save();

//         const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);

//         res.json({success: true, token, user: {name: user.name}});
        
//     } catch (error) {
//         console.log(error);
//         res.json({success: false, message: error.message})
        
//     }
// }


const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const exists = await userModel.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Validate email format and password strength
    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Please enter a strong password (at least 8 characters)",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = new userModel({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      
    });
    // Save the new user in the database
    await newUser.save();
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const loginUser = async(req, res) =>{
    try {
        const {email, password} = req.body;
        // const user = await userModel.findOne({email});
        const normalizedEmail = email.trim().toLowerCase();
        const user = await userModel.findOne({ email: normalizedEmail }); 


        if(!user){
            return res.json({success:false, message:"User Doesn't exist"});

        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(isMatch){
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);

            res.json({success:true, token, user: {name: user.name}});

        }else{
            return res.json({success:false, message: 'Invalid credentials'});
        }

        
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})

    }
};

const userCredits = async(req, res) => {
    try {
        // const {userId} = req.body;
         const userId = req.user.id; // ✅ updated line
        const user = await userModel.findById(userId);
        res.json({success:true, credits: user.creditBalance, user:{name: user.name}});
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message});
        
    }

};

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// const paymentRazorpay = async(req, res) => {
//   try {
//     const {userId, planId} = req. body;

//     const userData = await userModel.findById(userId);

//     if(!userId || !planId || !userData){
//       return res.json({success: false, message:"Missing Details"});
//     }
//     let credits, plan, amount, date;
//     switch (planId) {
//       case 'Basic':
//         plan = 'Basic'
//         credits = 100
//         amount = 10
//         break;

//       case 'Advanced':
//         plan = 'Advanced'
//         credits = 500
//         amount = 50
//         break;
        
//       case 'Business':
//         plan = 'Business'
//         credits = 5000
//         amount = 250
//         break;  
    
//       default:
//         return res.json({success: false, message: 'plan not found'});
//     }

//     date = Date.now();

//     const transactionData = {
//       userId, plan, amount, credits, date
//     }

//     const newTransaction = await transactionModel.create(transactionData);

//     const options = {
//         amount: amount * 100,
//         currency: process.env.CURRENCY,
//         receipt:  newTransaction._id,
//       }

//     await razorpayInstance.orders.create(options, (error, order)=>{
      
//       if(error){
//         console.log(error);
//         res.json({success:false, message: error});
//       }
//       res.json({success: true, order})

//     })
    
//   } catch (error) {
//     console.log(error);
//     res.json({success:false, message: error.message});
//   }
// }

const paymentRazorpay = async (req, res) => {
  try {
    // const { userId, planId } = req.body;
    const userId = req.user.id;  // ✅ get userId from token middleware
    const { planId } = req.body; // ✅ get planId from frontend post body
    

    if (!userId || !planId) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let credits, plan, amount;
    switch (planId) {
      case 'Basic':
        plan = 'Basic';
        credits = 100;
        amount = 10;
        break;
      case 'Advanced':
        plan = 'Advanced';
        credits = 500;
        amount = 50;
        break;
      case 'Business':
        plan = 'Business';
        credits = 5000;
        amount = 250;
        break;
      default:
        return res.json({ success: false, message: 'Invalid planId' });
    }

    const date = Date.now();
    const transactionData = { userId, plan, amount, credits, date };
    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY || 'INR',
      // receipt: newTransaction._id.toString(),
      receipt: newTransaction._id,
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyRazorpay = async(req, res) =>{
  try {
    const {razorpay_order_id} = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

    if(orderInfo.status === 'paid'){
      const transactionData = await transactionModel.findById(orderInfo.receipt);
      if(transactionData.payment){
        return res.json({success: false, message:"Payment Failed"})
      }

      const userData = await userModel.findById(transactionData.userId);

      const creditBalance = userData.creditBalance + transactionData.credits ;
      await userModel.findByIdAndUpdate(userData._id, {creditBalance});

      await transactionModel.findByIdAndUpdate(transactionData._id, {payment: true});
      res.json({success: true, message:"Credit Added"})

    } else{
      res.json({success: false, message: "Payment Failed"});
    }
    
  } catch (error) {
    console.log(error);
    res.json({success: false, message: error.message});
    
  }
}


export {registerUser,loginUser,userCredits, paymentRazorpay, verifyRazorpay};