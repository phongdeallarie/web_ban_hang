import express from "express";
import { prisma } from "../lib/prisma.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({ include: { category: true }, orderBy: { id: "desc" } });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.post("/", protect, isAdmin, async (req, res) => {
  try {
    const { name, description, detail, price, oldPrice, discountPct, rating, tag, image, stock, categoryId } = req.body || {};
    if (!name || !description || !price || !image || !categoryId) {
      return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
    }
    const parsedPrice = Number(price);
    const parsedOldPrice = oldPrice ? Number(oldPrice) : null;
    const parsedDiscountPct = discountPct ? Number(discountPct) : 0;
    const finalPrice = parsedOldPrice && parsedDiscountPct ? parsedOldPrice * (1 - parsedDiscountPct / 100) : parsedPrice;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        detail,
        price: parsedPrice,
        oldPrice: parsedOldPrice,
        discountPct: parsedDiscountPct,
        finalPrice,
        rating: rating ? Number(rating) : 4.5,
        tag,
        image,
        stock: stock ? Number(stock) : 0,
        categoryId: Number(categoryId),
      },
      include: { category: true },
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.put("/:id", protect, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, detail, price, oldPrice, discountPct, rating, tag, image, stock, categoryId } = req.body || {};
    const parsedPrice = Number(price);
    const parsedOldPrice = oldPrice ? Number(oldPrice) : null;
    const parsedDiscountPct = discountPct ? Number(discountPct) : 0;
    const finalPrice = parsedOldPrice && parsedDiscountPct ? parsedOldPrice * (1 - parsedDiscountPct / 100) : parsedPrice;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        detail,
        price: parsedPrice,
        oldPrice: parsedOldPrice,
        discountPct: parsedDiscountPct,
        finalPrice,
        rating: rating ? Number(rating) : 4.5,
        tag,
        image,
        stock: stock ? Number(stock) : 0,
        categoryId: Number(categoryId),
      },
      include: { category: true },
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.product.delete({ where: { id } });
    return res.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

export default router;
