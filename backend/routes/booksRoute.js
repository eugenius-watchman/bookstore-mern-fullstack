import express from "express";
import { Book } from "../models/bookModel.js";
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Create public/images directory if it doesn't exist
const uploadDir = 'public/images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images are allowed (JPEG, JPG, PNG, GIF)'));
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route to upload book cover image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    const imageUrl = `/images/${req.file.filename}`;
    res.status(200).json({ 
      message: 'Image uploaded successfully',
      imageUrl 
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message || 'Failed to upload image' 
    });
  }
});

// Route to get all books from database
router.get("/", async (req, res) => {
  try {
    const books = await Book.find({});
    res.status(200).json({
      count: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get One Book from DB by Id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID format" });
    }
    
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get One Book by ISBN
router.get("/isbn/:isbn", async (req, res) => {
  try {
    const book = await Book.findOne({ isbn: req.params.isbn });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to Create/Save a book with optional image
router.post("/", upload.single('image'), async (req, res) => {
  try {
    const requiredFields = ['title', 'author', 'summary', 'publishYear'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const newBook = {
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      publishYear: req.body.publishYear,
      isbn: req.body.isbn,
      imageUrl: req.file ? `/images/${req.file.filename}` : null
    };

    const book = await Book.create(newBook);
    res.status(201).json(book);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.isbn) {
      return res.status(400).json({
        message: "Book with this ISBN already exists"
      });
    }
    res.status(500).json({ message: error.message });
  }
});

// Route to Update a book by Id with optional image
router.put("/:id", upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID format" });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.imageUrl = `/images/${req.file.filename}`;
    }

    // Check if at least one field is provided
    const fieldsToCheck = ['title', 'author', 'summary', 'publishYear', 'isbn', 'imageUrl'];
    const hasUpdates = fieldsToCheck.some(field => updateData[field] !== undefined);
    
    if (!hasUpdates) {
      return res.status(400).json({
        message: "Provide at least one field to update"
      });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book updated successfully",
      book: updatedBook
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.isbn) {
      return res.status(400).json({
        message: "Book with this ISBN already exists"
      });
    }
    res.status(500).json({ message: error.message });
  }
});

// Route to Delete a book by Id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID format" });
    }

    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Optional: Delete associated image file
    if (book.imageUrl) {
      const imagePath = path.join('public', book.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({
      message: "Book deleted successfully",
      deletedBook: book
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;