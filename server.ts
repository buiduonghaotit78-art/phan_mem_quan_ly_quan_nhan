import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import dotenv from "dotenv";
import { numberValueTypes } from "motion";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- Database Models ---

interface IRegistration extends mongoose.Document {
  visitorName: string;
  visitorId: string;
  visitorPhone: string;
  vehicleType: string;
  numberVehicle: string;
  relationship: string;
  soldierName: string;
  address: string;
  unit: {
    company: string;
    platoon: string;
    squad: string;
  };
  visitDate: Date;
  notes: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: Date;
}

const RegistrationSchema = new mongoose.Schema({
  visitorName: { type: String, required: true },
  visitorId: { type: String, required: true },
  visitorPhone: { type: String, required: true },
  vehicleType: { type: String, required: true },
  numberVehicle: { type: String, required: true },
  relationship: { type: String, required: true },
  soldierName: { type: String, required: true },
  address: { type: String, required: true },
  unit: {
    company: { type: String, required: true },
    platoon: { type: String, required: true },
    squad: { type: String, required: true },
  },
  visitDate: { type: Date, default: Date.now },
  notes: String,
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

const Registration = mongoose.model<IRegistration>("Registration", RegistrationSchema);

interface IUser extends mongoose.Document {
  username: string;
  password: string;
}

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model<IUser>("User", UserSchema);

// --- Middleware ---

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET || "fallback_secret", (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Public: Create registration
app.post("/api/registrations", async (req, res) => {
  try {
    const registration = new Registration(req.body);
    await registration.save();
    res.status(201).json(registration);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "24h" });
    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all registrations
app.get("/api/admin/registrations", authenticateToken, async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update status
app.patch("/api/admin/registrations/:id", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const registration = await Registration.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(registration);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Statistics
app.get("/api/admin/stats", authenticateToken, async (req, res) => {
  try {

    const total = await Registration.countDocuments();
    const approved = await Registration.countDocuments({ status: "Approved" });
    const rejected = await Registration.countDocuments({ status: "Rejected" });
    const pending = await Registration.countDocuments({ status: "Pending" });

    // Thống kê theo Đại đội
    const companyStats = await Registration.aggregate([
      {
        $group: {
          _id: "$unit.company",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Thống kê theo Trung đội
    const platoonStats = await Registration.aggregate([
      {
        $group: {
          _id: "$unit.platoon",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Thống kê theo Tiểu đội
    const squadStats = await Registration.aggregate([
      {
        $group: {
          _id: "$unit.squad",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      total,
      approved,
      rejected,
      pending,
      companyStats,
      platoonStats,
      squadStats
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Export Excel
app.get("/api/admin/export", authenticateToken, async (req, res) => {
  try {
    const registrations = await Registration.find().lean();
    const data = registrations.map((r: any) => ({
      "Họ tên người thăm": r.visitorName,
      "CCCD": r.visitorId,
      "SĐT": r.visitorPhone,
      "Loại phương tiện": r.vehicleType,
      "Biển số phương tiện": r.numberVehicle,
      "Quan hệ": r.relationship,
      "Họ tên chiến sĩ": r.soldierName,
      "Địa chỉ": r.address,
      "Đại đội": r.unit.company,
      "Trung đội": r.unit.platoon,
      "Tiểu đội": r.unit.squad,
      "Ngày thăm": new Date(r.visitDate).toLocaleDateString("vi-VN"),
      "Ghi chú": r.notes,
      "Trạng thái": r.status === "Pending" ? "Chờ duyệt" : r.status === "Approved" ? "Đã duyệt" : "Từ chối",
      "Ngày đăng ký": new Date(r.createdAt).toLocaleString("vi-VN"),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách đăng ký");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=danh-sach-dang-ky.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buf);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// --- Server Setup ---

async function startServer() {
  // Connect to MongoDB
  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB");

      // Create initial admin if not exists
      const adminUser = await User.findOne({ username: process.env.ADMIN_USERNAME || "admin" });
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "password123", 10);
        await new User({ username: process.env.ADMIN_USERNAME || "admin", password: hashedPassword }).save();
        console.log("Initial admin user created");
      }
    } catch (err) {
      console.error("MongoDB connection error:", err);
    }
  } else {
    console.warn("MONGODB_URI not found in environment variables. Database features will not work.");
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
