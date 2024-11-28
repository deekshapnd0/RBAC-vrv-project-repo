const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const { roles } = require('../utils/constants');
const router = express.Router();

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Route to view all users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.render('manage-users', { users });
  } catch (error) {
    next(error);  // Pass the error to the error handler middleware
  }
});

// Route to view a specific user's profile
router.get('/user/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the ID is a valid ObjectId
    if (!isValidObjectId(id)) {
      req.flash('error', 'Invalid user ID');
      return res.redirect('/admin/users');
    }

    const person = await User.findById(id);

    // Check if user exists
    if (!person) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }

    res.render('profile', { person });
  } catch (error) {
    next(error);
  }
});

// Route to update a user's role
router.post('/update-role', async (req, res, next) => {
  try {
    const { id, role } = req.body;

    // Check if id and role are provided
    if (!id || !role) {
      req.flash('error', 'Invalid request: id and role are required');
      return res.redirect('back');
    }

    // Validate ObjectId and role
    if (!isValidObjectId(id)) {
      req.flash('error', 'Invalid user ID');
      return res.redirect('back');
    }

    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('back');
    }

    // Prevent admin from changing their own role
    if (req.user.id === id) {
      req.flash('error', 'You cannot change your own role');
      return res.redirect('back');
    }

    // Update the user role
    const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });

    req.flash('info', `Updated role for ${user.email} to ${user.role}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

// Route to render Add User page
router.get('/add-user', (req, res, next) => {
  try {
    res.render('add-user');
  } catch (error) {
    next(error);
  }
});

// Route to handle adding a new user
router.post('/add-user', async (req, res, next) => {
  try {
    const { email, password, confirmPassword, role } = req.body;

    // Validate input fields
    if (!email || !password || !confirmPassword || !role) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/admin/add-user');
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/admin/add-user');
    }

    // Check if the email is already in use
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

// Route to delete a user
router.post('/delete-user', async (req, res, next) => {
  try {
    const { id } = req.body;

    // Validate the ID
    if (!id || !isValidObjectId(id)) {
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

module.exports = router;
