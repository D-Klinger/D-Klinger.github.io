/**
 * InventoryItem Model
 * Defines the schema for inventory items stored in MongoDB.
 */

const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
    },
    description: { 
        type: String, 
    },
    category: { 
        type: String, 
    },
    quantity: { 
        type: Number, 
        required: true
    },
    price: { 
        type: Number,
    },
    perishable: { 
      type: Boolean,
      default: false,
    },
    expirationDate: { 
      type: Date, 
      required: function() { 
        return this.perishable; 
      } 
    },
    location: { 
      type: String 
    },
    dateAdded: { 
      type: Date, 
      default: Date.now 
    },
    supplier: { 
      type: String 
    },
    reorderThreshold: { 
      type: Number, 
      default: 0 
    }
});


module.exports = mongoose.model('InventoryItem', InventoryItemSchema);