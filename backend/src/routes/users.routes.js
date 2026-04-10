import express from "express";
import { prisma } from "../lib/prisma.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, isAdmin, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, fullName: true, email: true, role: true, loyaltyPoint: true, createdAt: true },
      orderBy: { id: "desc" },
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    if (user.role === "ADMIN") return res.status(400).json({ message: "Không thể xóa tài khoản admin" });
    await prisma.user.delete({ where: { id } });
    return res.json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

export default router;
