const router = require('express').Router();
const { Attribute } = require('../models/Schemas');

// GET ALL
router.get('/', async (req, res) => {
  try {
    const attributes = await Attribute.find();
    res.status(200).json(attributes);
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE NEW
router.post('/', async (req, res) => {
  try {
    const newAttr = new Attribute({
      name: req.body.name,
      type: req.body.type
    });
    const savedAttr = await newAttr.save();
    res.status(201).json(savedAttr);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;