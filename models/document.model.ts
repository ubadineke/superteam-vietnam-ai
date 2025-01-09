import mongoose, { model, Document, Schema } from 'mongoose';

interface IDocument extends Document {
  _id: mongoose.Types.ObjectId;
  id: String;
  name: String;
}

const documentSchema = new Schema<IDocument>(
  {
    id: {
      type: String,
      required: [true, 'Please provide organization'],
    },
    name: {
      type: String,
      required: [true, 'Provide document name'],
    },
  },
  { timestamps: true }
);

const Documents = model<IDocument>('Document', documentSchema);

export default Documents;
