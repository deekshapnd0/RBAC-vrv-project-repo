const User = require('../models/user.model');
const router = require('express').Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    // res.send(users);
    res.render('manage-users', { users });
  } catch (error) {
    next(error);
  }
});

router.get('/user/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      res.redirect('/admin/users');
      return;
    }
    const person = await User.findById(id);
    res.render('profile', { person });
  } catch (error) {
    next(error);
  }
});

router.post('/update-role', async (req, res, next) => {
  try {
    const { id, role } = req.body;

    // Checking for id and roles in req.body
    if (!id || !role) {
      req.flash('error', 'Invalid request');
      return res.redirect('back');
    }

    // Check for valid mongoose objectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      return res.redirect('back');
    }

    // Check for Valid role
    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('back');
    }

    // Admin cannot remove himself/herself as an admin
    if (req.user.id === id) {
      req.flash(
        'error',
        'Admins cannot remove themselves from Admin, ask another admin.'
      );
      return res.redirect('back');
    }

    // Finally update the user
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    req.flash('info', `updated role for ${user.email} to ${user.role}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// Route to render the Add User page
router.get('/add-user', (req, res, next) => {
  try {
    res.render('add-user');
  } catch (error) {
    next(error);
  }
});

// Route to handle form submissions
router.post('/add-user', async (req, res, next) => {
  try {
    const { email, password, confirmPassword, role } = req.body;

    // Validate input
    if (!email || !password || !confirmPassword || !role) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/admin/add-user');
    }

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/admin/add-user');
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email is already in use.');
      return res.redirect('/admin/add-user');
    }

    // Create and save the new user
    const newUser = new User({ email, password, role });
    await newUser.save();

    req.flash('info', 'User added successfully.');
    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
});


// Delete user route
router.post('/delete-user', async (req, res, next) => {
  try {
    const { id } = req.body;

    // Validate the ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid user ID.');
      return res.redirect('/admin/users');
    }

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      req.flash('error', 'You cannot delete your own account.');
      return res.redirect('/admin/users');
    }

    // Delete the user from the database
    await User.findByIdAndDelete(id);

    req.flash('info', 'User deleted successfully.');
    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
});
