import express from "express";
import { prisma } from "../lib/prisma.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, async (req, res) => {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng đang trống" });
    }

    const productIds = items.map((item) => Number(item.productId));
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    let totalAmount = 0;
    const orderItemsData = items.map((item) => {
      const product = products.find((p) => p.id === Number(item.productId));
      const unitPrice = Number(product?.finalPrice || product?.price || 0);
      const quantity = Number(item.quantity || 1);
      const totalPrice = unitPrice * quantity;
      totalAmount += totalPrice;
      return { productId: product.id, quantity, unitPrice, totalPrice };
    });

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        paymentMethod: "mock",
        paymentStatus: "paid",
        status: "completed",
        items: { create: orderItemsData },
      },
      include: { items: { include: { product: true } } },
    });

    const pointToAdd = Math.floor(totalAmount / 10000);
    await prisma.user.update({ where: { id: req.user.id }, data: { loyaltyPoint: { increment: pointToAdd } } });

    return res.status(201).json({ message: "Thanh toán giả lập thành công", order, addedPoints: pointToAdd });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.get("/analytics", protect, isAdmin, async (_req, res) => {
  try {
    const orderItems = await prisma.orderItem.findMany({ include: { product: true, order: true } });
    const bestSellingMap = {};
    const revenueByMonth = {};
    const revenueByQuarter = {};
    const revenueByYear = {};

    for (const item of orderItems) {
      const productName = item.product.name;
      bestSellingMap[productName] = (bestSellingMap[productName] || 0) + item.quantity;
      const date = new Date(item.order.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;
      revenueByMonth[`${year}-${month}`] = (revenueByMonth[`${year}-${month}`] || 0) + item.totalPrice;
      revenueByQuarter[`${year}-${quarter}`] = (revenueByQuarter[`${year}-${quarter}`] || 0) + item.totalPrice;
      revenueByYear[`${year}`] = (revenueByYear[`${year}`] || 0) + item.totalPrice;
    }

    const bestSellingProducts = Object.entries(bestSellingMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);

    return res.json({ bestSellingProducts, revenueByMonth, revenueByQuarter, revenueByYear });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

export default router;
