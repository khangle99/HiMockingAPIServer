import mongoose from 'mongoose';

const mockSchema = new mongoose.Schema({
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  headers: { type: Map, of: String, default: {} },
  params: { type: Map, of: String, default: {} },
  response: { type: mongoose.Schema.Types.Mixed, required: true },
});

const Mock = mongoose.model('Mock', mockSchema);

export default Mock;