
import React, { useEffect, useMemo, useState } from "react";
import {
  apiFetch,
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  setStoredAuth,
} from "./api";

const placeholderImage =
  "https://placehold.co/600x400/e2e8f0/475569?text=ShopNow";

const initialLoginForm = { email: "", password: "" };
const initialRegisterForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};
const initialProductForm = {
  id: null,
  name: "",
  description: "",
  detail: "",
  price: "",
  oldPrice: "",
  discountPct: "0",
  rating: "4.5",
  tag: "Mới",
  image: "",
  stock: "0",
  categoryId: "",
};

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function calcDisplayPrice(product) {
  return Number(product.finalPrice || product.price || 0);
}

function mapToRows(obj) {
  return Object.entries(obj || {}).map(([label, value]) => ({
    label,
    value: Number(value || 0),
  }));
}

function ProductModal({ product, onClose, onAddToCart, currentUser }) {
  if (!product) return null;
  const displayPrice = calcDisplayPrice(product);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-product" onClick={(e) => e.stopPropagation()}>
        <button className="icon-button close-button" onClick={onClose}>
          ×
        </button>
        <div className="product-detail-layout">
          <img
            className="product-detail-image"
            src={product.image || placeholderImage}
            alt={product.name}
          />
          <div className="product-detail-content">
            <div className="chip-row">
              <span className="chip">{product.category?.name || "Chưa có danh mục"}</span>
              {product.tag ? <span className="chip chip-accent">{product.tag}</span> : null}
              <span className="chip">Rating {product.rating || 4.5}</span>
            </div>
            <h2>{product.name}</h2>
            <div className="price-row large">
              <strong>{formatPrice(displayPrice)}</strong>
              {product.oldPrice ? (
                <span className="old-price">{formatPrice(product.oldPrice)}</span>
              ) : null}
              {product.discountPct ? (
                <span className="discount-badge">-{product.discountPct}%</span>
              ) : null}
            </div>
            <p className="muted">{product.description}</p>
            <div className="detail-block">
              <h3>Mô tả chi tiết</h3>
              <p>{product.detail || product.description || "Chưa có mô tả chi tiết."}</p>
            </div>
            <div className="detail-grid">
              <div className="detail-card">
                <span className="label">Tồn kho</span>
                <strong>{product.stock ?? 0}</strong>
              </div>
              <div className="detail-card">
                <span className="label">Mã sản phẩm</span>
                <strong>#{product.id}</strong>
              </div>
            </div>
            <div className="button-row">
              <button className="primary-button" onClick={() => onAddToCart(product)}>
                {currentUser ? "Thêm vào giỏ hàng" : "Đăng nhập để mua"}
              </button>
              <button className="secondary-button" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({
  open,
  onClose,
  cart,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
  submitting,
}) {
  const cartTotal = cart.reduce(
    (sum, item) => sum + calcDisplayPrice(item) * item.quantity,
    0
  );

  return (
    <div className={`drawer-backdrop ${open ? "show" : ""}`} onClick={onClose}>
      <aside className={`drawer ${open ? "open" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>Giỏ hàng</h3>
          <button className="icon-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="drawer-content">
          {cart.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.image || placeholderImage} alt={item.name} />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>{formatPrice(calcDisplayPrice(item))}</p>
                  <div className="quantity-row">
                    <button onClick={() => onDecrease(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onIncrease(item.id)}>+</button>
                  </div>
                  <button className="text-link danger" onClick={() => onRemove(item.id)}>
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="drawer-footer">
          <div className="summary-row">
            <span>Tạm tính</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>
          <button className="primary-button full-width" onClick={onCheckout} disabled={submitting || cart.length === 0}>
            {submitting ? "Đang thanh toán..." : "Thanh toán giả lập"}
          </button>
        </div>
      </aside>
    </div>
  );
}

function AuthPanel({
  authMode,
  setAuthMode,
  loginForm,
  setLoginForm,
  registerForm,
  setRegisterForm,
  onLogin,
  onRegister,
  submitting,
}) {
  return (
    <div className="auth-grid">
      <section className="panel">
        <div className="tab-row">
          <button
            className={`tab ${authMode === "login" ? "active" : ""}`}
            onClick={() => setAuthMode("login")}
          >
            Đăng nhập
          </button>
          <button
            className={`tab ${authMode === "register" ? "active" : ""}`}
            onClick={() => setAuthMode("register")}
          >
            Đăng ký
          </button>
        </div>

        {authMode === "login" ? (
          <div className="form-grid">
            <label>
              <span>Email</span>
              <input
                value={loginForm.email}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Nhập email"
              />
            </label>
            <label>
              <span>Mật khẩu</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Nhập mật khẩu"
              />
            </label>
            <button className="primary-button full-width" onClick={onLogin} disabled={submitting}>
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
        ) : (
          <div className="form-grid">
            <label>
              <span>Họ và tên</span>
              <input
                value={registerForm.fullName}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
                placeholder="Nhập họ và tên"
              />
            </label>
            <label>
              <span>Email</span>
              <input
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Nhập email"
              />
            </label>
            <label>
              <span>Mật khẩu</span>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Nhập mật khẩu"
              />
            </label>
            <label>
              <span>Xác nhận mật khẩu</span>
              <input
                type="password"
                value={registerForm.confirmPassword}
                onChange={(e) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Nhập lại mật khẩu"
              />
            </label>
            <button className="primary-button full-width" onClick={onRegister} disabled={submitting}>
              {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </button>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Tài khoản demo</h2>
        <p className="muted">
          Nếu mật khẩu tài khoản mẫu chưa khớp bcrypt trong database, bạn vẫn có thể đăng ký tài khoản mới ngay tại đây.
        </p>
        <div className="info-card">
          <strong>Admin</strong>
          <p>admin@shopnow.com</p>
          <p>admin123</p>
        </div>
        <div className="info-card">
          <strong>Customer</strong>
          <p>user@shopnow.com</p>
          <p>user123</p>
        </div>
      </section>
    </div>
  );
}

function AnalyticsSection({ analytics }) {
  const bestSelling = analytics?.bestSellingProducts || [];
  const monthRows = mapToRows(analytics?.revenueByMonth);
  const quarterRows = mapToRows(analytics?.revenueByQuarter);
  const yearRows = mapToRows(analytics?.revenueByYear);
  const maxBest = Math.max(...bestSelling.map((item) => item.quantity), 1);

  return (
    <div className="analytics-grid">
      <section className="panel">
        <h3>Sản phẩm bán chạy</h3>
        {bestSelling.length === 0 ? (
          <p className="muted">Chưa có dữ liệu bán hàng.</p>
        ) : (
          <div className="bar-list">
            {bestSelling.map((item) => (
              <div key={item.name} className="bar-row">
                <div className="bar-label">
                  <span>{item.name}</span>
                  <strong>{item.quantity}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(item.quantity / maxBest) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h3>Doanh thu theo tháng</h3>
        <DataTable rows={monthRows} />
      </section>
      <section className="panel">
        <h3>Doanh thu theo quý</h3>
        <DataTable rows={quarterRows} />
      </section>
      <section className="panel">
        <h3>Doanh thu theo năm</h3>
        <DataTable rows={yearRows} />
      </section>
    </div>
  );
}

function DataTable({ rows }) {
  if (!rows.length) {
    return <p className="muted">Chưa có dữ liệu.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Kỳ</th>
            <th>Giá trị</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>{formatPrice(row.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersSection({ orders }) {
  return (
    <section className="panel">
      <h2>Lịch sử đơn hàng</h2>
      {orders.length === 0 ? (
        <p className="muted">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="stack">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-head">
                <div>
                  <strong>Đơn hàng #{order.id}</strong>
                  <p className="muted">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="order-meta">
                  <span className="chip">{order.status}</span>
                  <strong>{formatPrice(order.totalAmount)}</strong>
                </div>
              </div>
              <div className="stack compact">
                {order.items?.map((item) => (
                  <div className="order-item" key={item.id}>
                    <span>{item.product?.name || `Sản phẩm #${item.productId}`}</span>
                    <span>
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </span>
                    <strong>{formatPrice(item.totalPrice)}</strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);

  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());

  const [page, setPage] = useState("shop");
  const [authMode, setAuthMode] = useState("login");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [categoryName, setCategoryName] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const isAdmin = currentUser?.role === "ADMIN";

  const setNotice = (type, text) => setMessage({ type, text });
  const clearNotice = () => setMessage({ type: "", text: "" });

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const keyword = search.trim().toLowerCase();
      const categoryNameText = product.category?.name?.toLowerCase() || "";
      const matchSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword) ||
        (product.detail || "").toLowerCase().includes(keyword) ||
        categoryNameText.includes(keyword);
      const matchCategory =
        selectedCategory === "all" || String(product.categoryId) === selectedCategory;
      return matchSearch && matchCategory;
    });

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => calcDisplayPrice(a) - calcDisplayPrice(b));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => calcDisplayPrice(b) - calcDisplayPrice(a));
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    return result;
  }, [products, search, selectedCategory, sortBy]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  async function loadProducts() {
    const data = await apiFetch("/products", { token: "" });
    setProducts(Array.isArray(data) ? data : []);
  }

  async function loadCategories() {
    const data = await apiFetch("/categories", { token: "" });
    setCategories(Array.isArray(data) ? data : []);
  }

  async function loadUsers() {
    if (!token || !isAdmin) return;
    const data = await apiFetch("/users");
    setUsers(Array.isArray(data) ? data : []);
  }

  async function loadAnalytics() {
    if (!token || !isAdmin) return;
    const data = await apiFetch("/orders/analytics");
    setAnalytics(data);
  }

  async function loadMyOrders() {
    if (!token) return;
    const data = await apiFetch("/orders/my-orders");
    setOrders(Array.isArray(data) ? data : []);
  }

  async function loadCurrentUser(authToken = token) {
    if (!authToken) return null;
    try {
      const user = await apiFetch("/auth/me", { token: authToken });
      setCurrentUser(user);
      setStoredAuth(authToken, user);
      return user;
    } catch {
      clearStoredAuth();
      setToken("");
      setCurrentUser(null);
      return null;
    }
  }

  async function bootstrap() {
    try {
      setLoading(true);
      clearNotice();
      await Promise.all([loadProducts(), loadCategories()]);
      if (token) {
        const me = await loadCurrentUser(token);
        if (me?.role === "ADMIN") {
          await Promise.all([loadUsers(), loadAnalytics()]);
        } else if (me) {
          await loadMyOrders();
        }
      }
    } catch (error) {
      setNotice("error", error.message || "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (page === "orders" && token) {
      loadMyOrders().catch((error) => setNotice("error", error.message));
    }
    if (page === "admin" && token && isAdmin) {
      Promise.all([loadUsers(), loadAnalytics()]).catch((error) =>
        setNotice("error", error.message)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, token, isAdmin]);

  const handleLogin = async () => {
    try {
      setSubmitting(true);
      clearNotice();
      const data = await apiFetch("/auth/login", {
        method: "POST",
        token: "",
        body: JSON.stringify(loginForm),
      });
      setToken(data.token);
      setCurrentUser(data.user);
      setStoredAuth(data.token, data.user);
      setLoginForm(initialLoginForm);
      setPage(data.user.role === "ADMIN" ? "admin" : "shop");
      setNotice("success", "Đăng nhập thành công.");
      if (data.user.role === "ADMIN") {
        await Promise.all([loadUsers(), loadAnalytics()]);
      } else {
        await loadMyOrders();
      }
    } catch (error) {
      setNotice("error", error.message || "Đăng nhập thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      setNotice("error", "Mật khẩu xác nhận chưa khớp.");
      return;
    }

    try {
      setSubmitting(true);
      clearNotice();
      const data = await apiFetch("/auth/register", {
        method: "POST",
        token: "",
        body: JSON.stringify({
          fullName: registerForm.fullName,
          email: registerForm.email,
          password: registerForm.password,
        }),
      });
      setToken(data.token);
      setCurrentUser(data.user);
      setStoredAuth(data.token, data.user);
      setRegisterForm(initialRegisterForm);
      setPage("shop");
      setNotice("success", "Đăng ký thành công.");
    } catch (error) {
      setNotice("error", error.message || "Đăng ký thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    setToken("");
    setCurrentUser(null);
    setUsers([]);
    setAnalytics(null);
    setOrders([]);
    setPage("shop");
    setNotice("success", "Đã đăng xuất.");
  };

  const addToCart = (product) => {
    if (!currentUser) {
      setPage("auth");
      setNotice("error", "Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng.");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    setCartOpen(true);
    setNotice("success", "Đã thêm sản phẩm vào giỏ hàng.");
  };

  const adjustCart = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      setPage("auth");
      setNotice("error", "Vui lòng đăng nhập trước khi thanh toán.");
      return;
    }

    if (!cart.length) {
      setNotice("error", "Giỏ hàng đang trống.");
      return;
    }

    try {
      setSubmitting(true);
      clearNotice();
      const data = await apiFetch("/orders/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      setCart([]);
      setCartOpen(false);
      await loadCurrentUser(token);
      await loadMyOrders();
      if (isAdmin) {
        await loadAnalytics();
      }
      setNotice(
        "success",
        `Thanh toán giả lập thành công. Bạn được cộng ${data.addedPoints || 0} điểm.`
      );
      setPage("orders");
    } catch (error) {
      setNotice("error", error.message || "Thanh toán thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetProductForm = () => {
    setProductForm(initialProductForm);
  };

  const editProduct = (product) => {
    setProductForm({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      detail: product.detail || "",
      price: String(product.price ?? ""),
      oldPrice: product.oldPrice != null ? String(product.oldPrice) : "",
      discountPct:
        product.discountPct != null ? String(product.discountPct) : "0",
      rating: String(product.rating ?? 4.5),
      tag: product.tag || "Mới",
      image: product.image || "",
      stock: String(product.stock ?? 0),
      categoryId: String(product.categoryId ?? ""),
    });
    setPage("admin");
    setNotice("success", "Đã nạp dữ liệu sản phẩm vào form chỉnh sửa.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveProduct = async () => {
    if (
      !productForm.name ||
      !productForm.description ||
      !productForm.price ||
      !productForm.image ||
      !productForm.categoryId
    ) {
      setNotice("error", "Vui lòng nhập đầy đủ thông tin sản phẩm.");
      return;
    }

    const payload = {
      name: productForm.name,
      description: productForm.description,
      detail: productForm.detail,
      price: Number(productForm.price),
      oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null,
      discountPct: productForm.discountPct ? Number(productForm.discountPct) : 0,
      rating: productForm.rating ? Number(productForm.rating) : 4.5,
      tag: productForm.tag,
      image: productForm.image,
      stock: productForm.stock ? Number(productForm.stock) : 0,
      categoryId: Number(productForm.categoryId),
    };

    try {
      setSubmitting(true);
      clearNotice();

      if (productForm.id) {
        await apiFetch(`/products/${productForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setNotice("success", "Cập nhật sản phẩm thành công.");
      } else {
        await apiFetch("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice("success", "Thêm sản phẩm thành công.");
      }

      resetProductForm();
      await loadProducts();
      await loadCategories();
      if (isAdmin) await loadAnalytics();
    } catch (error) {
      setNotice("error", error.message || "Lưu sản phẩm thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa sản phẩm này?");
    if (!confirmed) return;

    try {
      setSubmitting(true);
      clearNotice();
      await apiFetch(`/products/${id}`, { method: "DELETE" });
      await loadProducts();
      setNotice("success", "Đã xóa sản phẩm.");
    } catch (error) {
      setNotice("error", error.message || "Xóa sản phẩm thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      setNotice("error", "Vui lòng nhập tên danh mục.");
      return;
    }

    try {
      setSubmitting(true);
      clearNotice();
      await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({ name: categoryName.trim() }),
      });
      setCategoryName("");
      await loadCategories();
      setNotice("success", "Đã thêm danh mục.");
    } catch (error) {
      setNotice("error", error.message || "Thêm danh mục thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa danh mục này?");
    if (!confirmed) return;

    try {
      setSubmitting(true);
      clearNotice();
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
      await loadCategories();
      setNotice("success", "Đã xóa danh mục.");
    } catch (error) {
      setNotice("error", error.message || "Xóa danh mục thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      clearNotice();
      const formData = new FormData();
      formData.append("file", file);

      const data = await apiFetch("/upload/image", {
        method: "POST",
        body: formData,
        headers: {},
      });

      if (data.url) {
        setProductForm((prev) => ({ ...prev, image: data.url }));
        setNotice("success", "Upload ảnh thành công.");
      } else if (data.filename) {
        setNotice(
          "success",
          `Backend local trả về filename "${data.filename}". Hãy dán URL ảnh công khai vào ô ảnh sản phẩm nếu cần hiển thị trực tiếp.`
        );
      } else {
        setNotice("success", "Upload thành công.");
      }
    } catch (error) {
      setNotice("error", error.message || "Upload ảnh thất bại.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-card">Đang tải dữ liệu từ backend MySQL...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <div>
            <h1>ShopNow</h1>
            <p className="muted">
              Frontend React đã khớp với backend MySQL hiện tại
            </p>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
              />
            </div>

            <button
              className={`nav-button ${page === "shop" ? "active" : ""}`}
              onClick={() => setPage("shop")}
            >
              Cửa hàng
            </button>

            {currentUser ? (
              <>
                <button
                  className={`nav-button ${page === "orders" ? "active" : ""}`}
                  onClick={() => setPage("orders")}
                >
                  Đơn hàng
                </button>
                {isAdmin && (
                  <button
                    className={`nav-button ${page === "admin" ? "active" : ""}`}
                    onClick={() => setPage("admin")}
                  >
                    Quản trị
                  </button>
                )}
                <span className="user-pill">
                  {currentUser.fullName} · {currentUser.role} · {currentUser.loyaltyPoint || 0} điểm
                </span>
                <button className="nav-button" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <button
                className={`nav-button ${page === "auth" ? "active" : ""}`}
                onClick={() => setPage("auth")}
              >
                Đăng nhập
              </button>
            )}

            <button className="primary-button cart-button" onClick={() => setCartOpen(true)}>
              Giỏ hàng ({cartCount})
            </button>
          </div>
        </div>
      </header>

      {message.text ? (
        <div className="container notice-wrap">
          <div className={`notice ${message.type || "info"}`}>
            <span>{message.text}</span>
            <button className="text-link" onClick={clearNotice}>
              Đóng
            </button>
          </div>
        </div>
      ) : null}

      {page === "shop" ? (
        <>
          <section className="hero-section">
            <div className="container hero-grid">
              <div>
                <span className="hero-badge">React + Vite + MySQL backend</span>
                <h2>
                  Mua sắm online, xem chi tiết sản phẩm, thanh toán giả lập và lưu lịch sử đơn hàng
                </h2>
                <p className="muted hero-text">
                  Bản frontend này dùng API thật để đăng nhập, lấy sản phẩm, danh mục,
                  lịch sử đơn hàng, analytics và quản lý sản phẩm dành cho admin.
                </p>
                <div className="button-row">
                  <button className="primary-button" onClick={() => setPage("shop")}>
                    Xem sản phẩm
                  </button>
                  {!currentUser ? (
                    <button className="secondary-button" onClick={() => setPage("auth")}>
                      Tạo tài khoản
                    </button>
                  ) : (
                    <button className="secondary-button" onClick={() => setPage("orders")}>
                      Xem đơn hàng
                    </button>
                  )}
                </div>
              </div>
              <div className="hero-card">
                <div className="hero-metrics">
                  <div className="metric">
                    <span className="metric-label">Sản phẩm</span>
                    <strong>{products.length}</strong>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Danh mục</span>
                    <strong>{categories.length}</strong>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Yêu thích</span>
                    <strong>{favorites.length}</strong>
                  </div>
                </div>
                <p className="muted">
                  Khi bấm vào sản phẩm, bạn sẽ mở được phần chi tiết với mô tả mở rộng.
                </p>
              </div>
            </div>
          </section>

          <section className="container controls-section">
            <div className="filters-row">
              <button
                className={`pill-button ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`pill-button ${
                    selectedCategory === String(category.id) ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(String(category.id))}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="sort-box">
              <label>Sắp xếp</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Nổi bật</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>
          </section>

          <section className="container product-grid">
            {filteredProducts.length === 0 ? (
              <div className="panel">
                <p className="muted">Không có sản phẩm phù hợp.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <button
                    className="favorite-button"
                    onClick={() => toggleFavorite(product.id)}
                    title="Yêu thích"
                  >
                    {favorites.includes(product.id) ? "♥" : "♡"}
                  </button>
                  <img
                    src={product.image || placeholderImage}
                    alt={product.name}
                    onClick={() => setSelectedProduct(product)}
                  />
                  <div className="product-body">
                    <div className="chip-row">
                      <span className="chip">{product.category?.name || "Chưa có danh mục"}</span>
                      {product.tag ? <span className="chip chip-accent">{product.tag}</span> : null}
                    </div>
                    <h3 onClick={() => setSelectedProduct(product)}>{product.name}</h3>
                    <p className="muted clamp-2">{product.description}</p>
                    <div className="price-row">
                      <strong>{formatPrice(calcDisplayPrice(product))}</strong>
                      {product.oldPrice ? (
                        <span className="old-price">{formatPrice(product.oldPrice)}</span>
                      ) : null}
                    </div>
                    <div className="meta-row">
                      <span>⭐ {product.rating || 4.5}</span>
                      <span>Tồn kho: {product.stock ?? 0}</span>
                    </div>
                    <div className="button-row">
                      <button className="primary-button" onClick={() => addToCart(product)}>
                        {currentUser ? "Thêm vào giỏ" : "Đăng nhập để mua"}
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      ) : null}

      {page === "auth" ? (
        <main className="container section-gap">
          <AuthPanel
            authMode={authMode}
            setAuthMode={setAuthMode}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            registerForm={registerForm}
            setRegisterForm={setRegisterForm}
            onLogin={handleLogin}
            onRegister={handleRegister}
            submitting={submitting}
          />
        </main>
      ) : null}

      {page === "orders" ? (
        <main className="container section-gap">
          <OrdersSection orders={orders} />
        </main>
      ) : null}

      {page === "admin" && isAdmin ? (
        <main className="container section-gap admin-layout">
          <section className="panel">
            <div className="section-head">
              <h2>{productForm.id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</h2>
              <div className="button-row">
                <button className="secondary-button" onClick={resetProductForm}>
                  Làm mới form
                </button>
                <button className="primary-button" onClick={handleSaveProduct} disabled={submitting}>
                  {submitting ? "Đang lưu..." : productForm.id ? "Cập nhật" : "Thêm sản phẩm"}
                </button>
              </div>
            </div>

            <div className="form-grid two-col">
              <label>
                <span>Tên sản phẩm</span>
                <input
                  value={productForm.name}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên sản phẩm"
                />
              </label>

              <label>
                <span>Danh mục</span>
                <select
                  value={productForm.categoryId}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))
                  }
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Giá bán</span>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                />
              </label>

              <label>
                <span>Giá cũ</span>
                <input
                  type="number"
                  value={productForm.oldPrice}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, oldPrice: e.target.value }))
                  }
                />
              </label>

              <label>
                <span>Khuyến mãi (%)</span>
                <input
                  type="number"
                  value={productForm.discountPct}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, discountPct: e.target.value }))
                  }
                />
              </label>

              <label>
                <span>Rating</span>
                <input
                  type="number"
                  step="0.1"
                  value={productForm.rating}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, rating: e.target.value }))}
                />
              </label>

              <label>
                <span>Tag</span>
                <input
                  value={productForm.tag}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, tag: e.target.value }))}
                />
              </label>

              <label>
                <span>Tồn kho</span>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, stock: e.target.value }))}
                />
              </label>

              <label className="full-span">
                <span>Ảnh sản phẩm (URL)</span>
                <input
                  value={productForm.image}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="Dán URL ảnh hoặc upload file"
                />
              </label>

              <label className="full-span upload-box">
                <span>Upload ảnh</span>
                <input type="file" accept="image/*" onChange={handleUploadImage} />
                <small className="muted">
                  {uploading
                    ? "Đang upload..."
                    : "Nếu backend local chỉ trả filename, bạn vẫn nên dán một URL ảnh công khai vào ô trên."}
                </small>
              </label>

              <label className="full-span">
                <span>Mô tả ngắn</span>
                <textarea
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows="3"
                />
              </label>

              <label className="full-span">
                <span>Mô tả chi tiết</span>
                <textarea
                  value={productForm.detail}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, detail: e.target.value }))
                  }
                  rows="5"
                />
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>Quản lý danh mục</h2>
            <div className="inline-form">
              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nhập tên danh mục"
              />
              <button className="primary-button" onClick={handleAddCategory} disabled={submitting}>
                Thêm
              </button>
            </div>
            <div className="stack compact">
              {categories.map((category) => (
                <div className="list-row" key={category.id}>
                  <div>
                    <strong>{category.name}</strong>
                    <p className="muted">
                      {category._count?.products ?? 0} sản phẩm
                    </p>
                  </div>
                  <button
                    className="text-link danger"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="panel full-span">
            <h2>Danh sách sản phẩm</h2>
            <div className="stack">
              {products.map((product) => (
                <div className="product-admin-row" key={product.id}>
                  <img src={product.image || placeholderImage} alt={product.name} />
                  <div className="grow">
                    <div className="chip-row">
                      <span className="chip">{product.category?.name || "Chưa có danh mục"}</span>
                      {product.tag ? <span className="chip chip-accent">{product.tag}</span> : null}
                    </div>
                    <h3>{product.name}</h3>
                    <p className="muted">{product.description}</p>
                    <div className="meta-row">
                      <span>{formatPrice(calcDisplayPrice(product))}</span>
                      <span>Tồn kho: {product.stock ?? 0}</span>
                    </div>
                  </div>
                  <div className="stack compact align-end">
                    <button className="secondary-button" onClick={() => editProduct(product)}>
                      Sửa
                    </button>
                    <button
                      className="text-link danger"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Người dùng</h2>
            <div className="stack compact">
              {users.length === 0 ? (
                <p className="muted">Chưa tải được danh sách người dùng hoặc không có dữ liệu.</p>
              ) : (
                users.map((user) => (
                  <div className="list-row" key={user.id}>
                    <div>
                      <strong>{user.fullName}</strong>
                      <p className="muted">
                        {user.email} · {user.role} · {user.loyaltyPoint || 0} điểm
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="panel full-span">
            <h2>Thống kê bán hàng</h2>
            <AnalyticsSection analytics={analytics} />
          </section>
        </main>
      ) : null}

      <footer className="footer">
        <div className="container footer-inner">
          <span>© 2026 ShopNow Frontend MySQL</span>
          <span>React + Vite + Fetch API</span>
        </div>
      </footer>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        currentUser={currentUser}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onIncrease={(id) => adjustCart(id, 1)}
        onDecrease={(id) => adjustCart(id, -1)}
        onRemove={removeCartItem}
        onCheckout={handleCheckout}
        submitting={submitting}
      />
    </div>
  );
}
