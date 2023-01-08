import { json } from "express";
import Account from "../models/Account.model.js";
import Student from "./student.controller.js";
import Teacher from "./teacher.controller.js";
import Admin from "./admin.controller.js";
import bcrypt from "bcryptjs";




const GetAllAccount = async (req, res) => {
  try {
    const accounts = await Account.find();
    res.status(200).json({
      status: "success",
      length: accounts.length,
      accounts,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Missing require fail",
    });
  }
};
const GetOneAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    res.status(200).json({
      status: "success",
      account,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "ID invalid",
    });
  }
};

const DeleteAccount = async (req, res) => {
  try {
    const id = req.params.id;
    const queryAccount = await Account.findById(id);
    if (queryAccount.role == 0) {
      Student.DeleteStudent(req, res, id);
    } else if (queryAccount.role == 1) {
      Teacher.DeleteTeacher(req, res, id);
    } else if (queryAccount.role == 2) {
      Admin.DeleteAdmin(req, res, id);
    }
    const data = await Account.findByIdAndDelete(id);
    res.send(`Document with ${data.name} has been deleted..`);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "ID invalid",
    });
  }
};

const UpdatePasswordAccount = async (req, res) => {
  try {
    const id = req.params.id;
    const password = await bcrypt.hash(req.body.password, 10);

    const data = await Account.findByIdAndUpdate(
      id,
      { password },
      {
        returnOriginal: false,
      }
    );
    res.send(data);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "ID invalid",
    });
  }
};

const UpdateInfoAccount = async (req) => {
  var dataRes;
  const data = {
    id: req.session.authAccount?.account?._id,
    fullname: req.body.fullname,
    email: req.body.email,
  };
  const existEmail = await Account.findOne({ email: data.email });
  if (existEmail) {
    dataRes = { status: 300, message: "exist email" };
  } else {
    
    const response = await Account.findByIdAndUpdate(data.id, { email: data.email },
      { returnOriginal: false  });
    
    var responseRole ;
    if(req.session.authAccount?.account?.role ==0 )
    {
      responseRole = await Student.UpdateStudent(req);
    }
    else if(req.session.authAccount?.account?.role ==1 )
    {
      responseRole = await Teacher.UpdateTeacher(req);
    }
    else {
      responseRole =await Admin.UpdateAdmin(req);
    }
   
    dataRes = {...response._doc, detail : responseRole ,status:200, message: "update success" }
  }
  return dataRes;

  // try {
  //   const id = req.params.id;

  //   console.log(req.body)

  //   res.send(data)
  // } catch (err) {
  //   res.status(404).json({
  //     status: "fail",
  //     message: "ID invalid",
  //   });
  // }
};

const CreateAccount = async (req) => {
  const { email, username, password, role, avatar } = req.body;

  try {
    const handleCreateAccount = async () => {
      const newAccount = new Account({
        avatar,
        email,
        username,
        password,
        role,
      });

      const dataToSave = await newAccount.save();

      if (dataToSave.role == 1) {
        Teacher.CreateTeacher(req, dataToSave._id);
      } else if (dataToSave.role == 2) {
        Admin.CreateAdmin(req, dataToSave._id);
      } else {
        Student.CreateStudent(req, dataToSave._id);
      }

    Account.findOne({ $or:[{username},{email}]})
    .then(function(doc) {
      
          if(doc)
          {
            return json("account or Email exist");
          }
          else {
           
            handleCreateAccount();
          }
     });

      const mergedObject = Object.assign({}, req.body, dataToSave._doc);
      console.log(mergedObject);
      return json(mergedObject);
    };

    Account.findOne({ $or: [{ username }, { email }] }).then(function (doc) {
      if (doc) {
        return json("account or Email exist");
      } else {
        handleCreateAccount();
      }
    });
  } catch (err) {
    return json({
      status: "fail",
      message: err.message,
    });
  }
};
  const detailCourseUI = async (req,res)=>{
    
    const courseDetail={"title":"JavaScript for Beginners test","price":"$50.00 test","subtitle":"Learn javascript online and supercharge your web design with this Javascript for beginners training course. Test","lastUpdate":"11/2022 test","image":"/student/js.png","number_review":"18 test"}
    res.render('Student/courseDetail',{course:courseDetail})
  };


const accountUI= async(req,res)=>{
  const profile={"avatar":"/avata.png","email":"ptvy@gmail.com","username":"vyvy","password":"1","role":"3"};
  res.render('vwStudent/profile',  {account:profile});
}

export default {
  GetAllAccount,
  CreateAccount,
  DeleteAccount,
  GetOneAccount,
  UpdatePasswordAccount,
  UpdateInfoAccount,
  accountUI,
  detailCourseUI
};