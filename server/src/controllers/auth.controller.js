import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";

export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All field are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be atleast 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email Already exist" });
    }

    const index = Math.floor(Math.random() * 100) + 1; //1 to 100
    const randomAvatar = `https://avatar-placeholder.iran.liara.run/${index}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    //Creating user in stream as well
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating stream user", error);
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, //miliseconds to days
      httpOnly: true, //prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signup controller : " + error.message);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Enter all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Incorrect Email or Password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect Email or Password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Login Successfull" });
  } catch (error) {
    console.log("Error in login controller : " + error.message);
    res.status(500).json({ message: "Server Error" });
  }
}
export async function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout Succesfull" });
}

export async function onboard(req,res){
  try {
    const userId = req.user._id;
    const {fullName,bio,location} = req.body;

    if(!fullName || !bio || !location){
      return res.status(400).json({

        message : "All fields are required",
        missingFields : [
          !fullName && "fullname",
          !bio && "bio",
          !location && "location",
        ].filter(Boolean),
      })
    }

    const updatedUser = await User.findByIdAndUpdate(userId,{
      ...req.body,
      isOnboarded : true
    },{new:true})

    if(!updatedUser) return res.status(401).json({message : "User not found"});

    try {
      await upsertStreamUser({
        id : updatedUser._id.toString(),
        name : updatedUser.fullName,
        image : updatedUser.profilePic ||" ",
      })
      console.log(`stream user updated after onboarding for ${updatedUser.fullName}`);
      
    } catch (StreamError) {
      console.log("Error updating stream during onboarding",StreamError.message);
    }

    res.status(200).json({success : true,user : updatedUser})
  } catch (error) {
    
  }
}