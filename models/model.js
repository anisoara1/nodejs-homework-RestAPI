import { model, Schema } from "mongoose";

export const Contact = model(
  "contact",
  new Schema(
    {
      name: {
        type: String,
        required: [true, "Set name for contact"],
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
      favorite: {
        type: Boolean,
        default: false,
      },
    },
    { versionKey: false }
  )
);
