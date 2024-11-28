const router = require('express').Router();

router.get('/', (req, res, next) => {
  const user = req.user || null;
  res.render('index',{user: req.user || null});
});


module.exports = router;