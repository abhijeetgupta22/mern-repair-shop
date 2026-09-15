import { dbState, getEmbeddedData, saveEmbeddedData } from '../config/db.js';

export function createAdapter(collectionKey, mongooseModel) {
  return {
    async find(query = {}) {
      if (dbState.isMongoose && mongooseModel) {
        return await mongooseModel.find(query).sort({ createdAt: -1 });
      }
      const data = getEmbeddedData();
      const items = data[collectionKey] || [];
      return items.filter(item => matchQuery(item, query)).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    },

    async findOne(query = {}) {
      if (dbState.isMongoose && mongooseModel) {
        return await mongooseModel.findOne(query);
      }
      const data = getEmbeddedData();
      const items = data[collectionKey] || [];
      return items.find(item => matchQuery(item, query)) || null;
    },

    async findById(id) {
      if (dbState.isMongoose && mongooseModel) {
        return await mongooseModel.findById(id);
      }
      const data = getEmbeddedData();
      const items = data[collectionKey] || [];
      return items.find(item => item._id === id || item.id === id) || null;
    },

    async create(doc) {
      const now = new Date().toISOString();
      const newDoc = {
        _id: 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
        createdAt: now,
        updatedAt: now,
        ...doc
      };

      if (dbState.isMongoose && mongooseModel) {
        return await mongooseModel.create(doc);
      }

      const data = getEmbeddedData();
      if (!data[collectionKey]) data[collectionKey] = [];
      data[collectionKey].push(newDoc);
      saveEmbeddedData(data);
      return newDoc;
    },

    async findByIdAndUpdate(id, update, options = { new: true }) {
      if (dbState.isMongoose && mongooseModel) {
        return await mongooseModel.findByIdAndUpdate(id, update, options);
      }
      const data = getEmbeddedData();
      const items = data[collectionKey] || [];
      const index = items.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;

      const current = items[index];
      const updated = {
        ...current,
        ...(update.$set || update),
        updatedAt: new Date().toISOString()
      };

      // Handle $inc if present
      if (update.$inc) {
        for (const [key, val] of Object.entries(update.$inc)) {
          updated[key] = (Number(current[key]) || 0) + Number(val);
        }
      }

      items[index] = updated;
      saveEmbeddedData(data);
      return updated;
    },

    async findByIdAndDelete(id) {
      if (dbState.isMongoose && mongooseModel) {
        return await mongooseModel.findByIdAndDelete(id);
      }
      const data = getEmbeddedData();
      const items = data[collectionKey] || [];
      const index = items.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;
      const [deleted] = items.splice(index, 1);
      saveEmbeddedData(data);
      return deleted;
    },

    async countDocuments(query = {}) {
      if (dbState.isMongoose && mongooseModel) {
        return await mongooseModel.countDocuments(query);
      }
      const data = getEmbeddedData();
      const items = data[collectionKey] || [];
      if (!Object.keys(query).length) return items.length;
      return items.filter(item => matchQuery(item, query)).length;
    }
  };
}

function matchQuery(item, query) {
  for (const [key, val] of Object.entries(query)) {
    if (val === undefined) continue;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if (val.$regex) {
        const regex = new RegExp(val.$regex, val.$options || 'i');
        if (!regex.test(getNestedVal(item, key) || '')) return false;
        continue;
      }
      if (val.$in) {
        if (!val.$in.includes(getNestedVal(item, key))) return false;
        continue;
      }
      if (val.$ne) {
        if (getNestedVal(item, key) === val.$ne) return false;
        continue;
      }
    }
    if (getNestedVal(item, key) !== val) return false;
  }
  return true;
}

function getNestedVal(obj, path) {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}
