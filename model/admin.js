const adminSchema = new Schema({
  adminId: {
    type: String,
    required: true,
    unique: true
  },
  permissions: [{
    type: String,
    enum: ['users', 'classes', 'grades', 'attendance', 'reports', 'settings']
  }],
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  lastSystemAccess: {
    type: Date
  }
});

const Admin = User.discriminator('Admin', adminSchema);