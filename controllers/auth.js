const bcrypt = require("bcryptjs");
// nodemailer is a package that makes sending emails from inside nodejs
const nodemailer = require("nodemailer");

// sendgrid is a package that helps with integrating sendgrid and
// conveniently use together with nodemailer
const sendgridTransport = require("nodemailer-sendgrid-transport");

const User = require("../models/user");

// initializing for nodemailer
const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: ""
  }
}));

exports.getLogin = (req, res, next) => {

  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else (
      // to be rendered nothing
      message = null
  );

  console.log(req.flash("error"));

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {

  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else (
      // to be rendered nothing
      message = null
  );

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {

  const email = req.body.email;
  const password = req.body.password;

  // searching and comparing user by email
  User.findOne({ email: email })
      // if found the particular user by email then result will be searched user
      .then(user => {

        if (!user) {

          // providing User Feedback
          // using flash message in case if Email not found
          req.flash("error", "Invalid email or password!");

          return res.redirect("/login");
        }

        bcrypt.compare(password, user.password)
            .then(doMatch => {
              if (doMatch) {

                req.session.isLoggedIn = true;
                req.session.user = user;

                return req.session.save(err => {

                  console.log(err);

                  return res.redirect("/");
                });
              }

              // providing User Feedback
              // using flash message in case if Password not found
              req.flash("error", "Invalid email or password!");
              res.redirect("/login");
            })
            .catch(err => {
              console.log(err);
            });

      })
      .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {

  // req.body.email === <input name="email"> in signup.ejs
  const email = req.body.email;

  // req.body.password === <input name="password"> in signup.ejs
  const password = req.body.password;

  // req.body.confirmPassword === <input name="confirmPassword"> in signup.ejs
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
      .then(userDoc => {

        if (userDoc) {

          req.flash("error", "E-mail exists already, please pick a different one!");
          return res.redirect("/signup");
        }

        return bcrypt
            .hash(password, 12)
            .then(hashedPassword => {

              const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
              });

              return user.save();
            })
            .then(result => {

              res.redirect("/login");

              return transporter.sendMail({
                to: email,
                from: "1voyagertest3@gmail.com",
                subject: "Test Signup",
                html: "<h1>Successfully Signed up!</h1>"
              });
            })
            .catch(err => {
              console.log(err);
            });
      })
      .catch(err => {
        console.log(err);
      });

};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);

    res.redirect("/");
  });
};


