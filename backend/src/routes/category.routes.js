import express from "express";
import { prisma } from "../lib/prisma.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.post("/", protect, isAdmin, async (req, res) => {
  try {
    const { name } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: "Tên danh mục là bắt buộc" });
    }

    const category = await prisma.category.create({ data: { name } });
    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.put("/:id", protect, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body || {};
    const updated = await prisma.category.update({ where: { id }, data: { name } });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return res.status(400).json({ message: "Không thể xóa danh mục vì còn sản phẩm thuộc danh mục này" });
    }
    await prisma.category.delete({ where: { id } });
    return res.json({ message: "Xóa danh mục thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

export default router;
