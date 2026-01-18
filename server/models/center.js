import { model, Schema } from "mongoose";

const centerSchema = new Schema({
  name: String,
  type: { type: String, enum: ["hospital", "police"] },
  city: String,
  address: String,
  contact: String,
});

export const centerModel = model("center",centerSchema)