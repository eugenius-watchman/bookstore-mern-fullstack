import mongoose from "mongoose";

const bookSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
            required: true,
        },
        publishYear: {
            type: Number,
            required: true,
        },
        isbn: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (v) {
                    // Basic ISBN-10 or ISBN-13 format check
                    return /^(?:\d{9}[\dXx]|\d{13})$/.test(v);
                },
                message: (props) => `${props.value} is not a valid ISBN!`,
            },
        },
        imageUrl:{
            type: String,
            default: ""
        }
    },
    {
        timestamps: true,
    }
);

export const Book = mongoose.model('Book', bookSchema);