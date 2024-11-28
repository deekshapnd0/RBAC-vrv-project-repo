const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user.model');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        // Username/email does NOT exist
        if (!user) {
          return done(null, false, {
            message: 'Username/email not registered',
          });
        }
        // Email exist and now we need to verify the password
        const isMatch = await user.isValidPassword(password);
        return isMatch
          ? done(null, user)
          : done(null, false, { message: 'Incorrect password' });
      } catch (error) {
        done(error);
      }
    }
  )
);



// Serialize user ID to store in session
passport.serializeUser((user, done) => {
  done(null, user.id); // Store user ID in session
});

// Deserialize user from session using async/await
passport.deserializeUser(async (id, done) => {
  try {
    // Use await to get the user from the database
    const user = await User.findById(id).exec(); // Using exec() is optional but can be included if you want

    if (!user) {
      return done(new Error('User not found'), null);  // If user not found, pass an error
    }

    done(null, user);  // If user is found, pass it to done
  } catch (err) {
    done(err);  // If there's an error, pass it to done
  }
});
