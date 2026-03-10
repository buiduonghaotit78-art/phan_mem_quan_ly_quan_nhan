import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  ShieldCheck, 
  LayoutDashboard, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  BarChart3, 
  Users,
  ChevronRight,
  Menu,
  X,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface Registration {
  _id: string;
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
  visitDate: string;
  notes: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

interface Stats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;

  companyStats: { _id: string; count: number }[];
  platoonStats: { _id: string; count: number }[];
  squadStats: { _id: string; count: number }[];
}

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-100 text-rose-700 border-rose-200",
  }[status as keyof typeof styles] || "bg-gray-100 text-gray-700 border-gray-200";

  const labels = {
    Pending: "Chờ duyệt",
    Approved: "Đã duyệt",
    Rejected: "Từ chối",
  }[status as keyof typeof labels] || status;

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", styles)}>
      {labels}
    </span>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-zinc-700">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
    />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-zinc-700">{label}</label>
    <select
      {...props}
      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<"form" | "admin" | "stats" | "login">("form");
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [platoonFilter, setPlatoonFilter] = useState("all");
  const [addressFilter, setAddressFilter] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    visitorName: "",
    visitorId: "",
    visitorPhone: "",
    vehicleType: "",
    numberVehicle: "",
    relationship: "",
    soldierName: "",
    address: "",
    unit: {
      company: "Đại đội 1",
      platoon: "Trung đội 1",
      squad: "Tiểu đội 1",
    },
    notes: "",
  });

  // Login state
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, view]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [regRes, statsRes] = await Promise.all([
        fetch("/api/admin/registrations", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (regRes.ok) setRegistrations(await regRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Kiểm tra loại xe
  if (!formData.vehicleType) {
    alert("Vui lòng chọn loại xe!");
    return;
  }

  // Kiểm tra địa chỉ
  if (!formData.address) {
    alert("Vui lòng chọn xã/phường!");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Gửi đăng ký thành công!");

      setFormData({
        visitorName: "",
        visitorId: "",
        visitorPhone: "",
        vehicleType: "",
        numberVehicle: "",
        relationship: "",
        soldierName: "",
        address: "",
        unit: { company: "Đại đội 1", platoon: "Trung đội 1", squad: "Tiểu đội 1" },
        notes: "",
      });
    } else {
      alert("Dữ liệu không hợp lệ!");
    }
  } catch (err) {
    alert("Có lỗi xảy ra, vui lòng thử lại.");
  } finally {
    setLoading(false);
  }
};

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      if (res.ok) {
        const { token } = await res.json();
        setToken(token);
        localStorage.setItem("admin_token", token);
        setView("admin");
      } else {
        alert("Sai tài khoản hoặc mật khẩu");
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/admin/export", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "danh-sach-dang-ky.xlsx";
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("admin_token");
    setView("form");
  };

  const filteredRegistrations = registrations.filter((r) => {
  const matchSearch =
    r.visitorName.toLowerCase().includes(search.toLowerCase()) ||
    r.visitorId.includes(search) ||
    r.visitorPhone.includes(search);

  const matchStatus =
    statusFilter === "all" || r.status === statusFilter;

  const matchCompany =
    companyFilter === "all" || r.unit.company === companyFilter;

  const matchPlatoon =
    platoonFilter === "all" || r.unit.platoon === platoonFilter;

  const matchAddress =
    addressFilter === "all" || r.unit.address === addressFilter;

  return matchSearch && matchStatus && matchCompany && matchPlatoon && matchAddress;
});

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("form")}>
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img 
                src="/img/logo-quan-doi-nhan-dan-viet-nam-2.png"
                alt="Logo Tiểu đoàn 460"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">TIỂU ĐOÀN BB460</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Hệ thống thăm thân</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {token ? (
              <>
                <button onClick={() => setView("admin")} className={cn("text-sm font-medium transition-colors", view === "admin" ? "text-emerald-700" : "text-zinc-500 hover:text-zinc-900")}>Quản trị</button>
                <button onClick={() => setView("stats")} className={cn("text-sm font-medium transition-colors", view === "stats" ? "text-emerald-700" : "text-zinc-500 hover:text-zinc-900")}>Thống kê</button>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700">
                  <LogOut size={16} /> Đăng xuất
                </button>
              </>
            ) : (
              <button onClick={() => setView("login")} className="text-sm font-medium text-zinc-500 hover:text-zinc-900">Quản trị viên</button>
            )}
          </div>

          <button className="md:hidden p-2 text-zinc-500" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-zinc-200 p-4 space-y-4 shadow-xl"
          >
            {token ? (
              <>
                <button onClick={() => { setView("admin"); setIsMenuOpen(false); }} className="block w-full text-left py-2 font-medium">Quản trị</button>
                <button onClick={() => { setView("stats"); setIsMenuOpen(false); }} className="block w-full text-left py-2 font-medium">Thống kê</button>
                <button onClick={handleLogout} className="block w-full text-left py-2 font-medium text-rose-600">Đăng xuất</button>
              </>
            ) : (
              <button onClick={() => { setView("login"); setIsMenuOpen(false); }} className="block w-full text-left py-2 font-medium">Quản trị viên</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main 
        className="w-full p-4 md:p-8 bg-cover bg-center rounded-xl"
        style={{
          backgroundImage: "url('/img/anh_nen.png')"
        }}
      >
        <AnimatePresence mode="wait">
          {view === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="bg-emerald-700 p-8 text-white">
                  <h2 className="text-2xl font-bold">Đăng ký thăm thân</h2>
                  <p className="text-emerald-100 mt-1">Vui lòng điền đầy đủ thông tin để đơn vị phê duyệt</p>
                </div>
                
                <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Thông tin người thăm</h3>
                      <Input 
                        label="Họ và tên người thăm" 
                        required 
                        value={formData.visitorName}
                        onChange={(e: any) => setFormData({...formData, visitorName: e.target.value})}
                      />
                      <Input 
                        label="Số CCCD" 
                        required 
                        value={formData.visitorId}
                        onChange={(e: any) => setFormData({...formData, visitorId: e.target.value})}
                      />
                      <Input 
                        label="Số điện thoại" 
                        required 
                        value={formData.visitorPhone}
                        onChange={(e: any) => setFormData({...formData, visitorPhone: e.target.value})}
                      />
                      <div className="grid grid-cols-3 gap-3">
  
                      <div className="col-span-1">
                        <Select
                          label="Loại xe"
                          options={[
                            { value: "", label: "-- Chọn loại xe --" },
                            { value: "Xe máy", label: "Xe máy" },
                            { value: "Ô tô", label: "Ô tô" },
                            { value: "Xe đạp", label: "Xe đạp" },
                            { value: "Khác", label: "Khác" },
                          ]}
                          value={formData.vehicleType}
                          onChange={(e: any) =>
                            setFormData({ ...formData, vehicleType: e.target.value })
                          }
                        />
                      </div>

                      <div className="col-span-2">
                        <Input
                          label="Biển số phương tiện"
                          required
                          placeholder="VD: 79V1-12345"
                          value={formData.numberVehicle}
                          onChange={(e: any) =>
                            setFormData({ ...formData, numberVehicle: e.target.value })
                          }
                        />
                      </div>

                    </div>
                      <Input 
                        label="Quan hệ với chiến sĩ" 
                        required 
                        placeholder="VD: Bố, Mẹ, Vợ..."
                        value={formData.relationship}
                        onChange={(e: any) => setFormData({...formData, relationship: e.target.value})}
                      />
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Thông tin chiến sĩ</h3>
                      <Input 
                        label="Họ và tên chiến sĩ" 
                        required 
                        value={formData.soldierName}
                        onChange={(e: any) => setFormData({...formData, soldierName: e.target.value})}
                      />
                      <Select 
                        label="Địa chỉ"
                        options={[
                          { value: "", label: "-- Chọn xã --" },
                          { value: "Phường Nha Trang", label: "Phường Nha Trang" },
                          { value: "Phường Bắc Nha Trang", label: "Phường Bắc Nha Trang" },
                          { value: "Phường Tây Nha Trang", label: "Phường Tây Nha Trang" },
                          { value: "Phường Nam Nha Trang", label: "Phường Nam Nha Trang" },
                          { value: "Phường Cam Ranh", label: "Phường Cam Ranh" },
                          { value: "Phường Bắc Cam Ranh", label: "Phường Bắc Cam Ranh" },
                          { value: "Phường Ba Ngòi", label: "Phường Ba Ngòi" },
                          { value: "Phường Cam Phú", label: "Phường Cam Phú" },
                          { value: "Phường Cam Phúc", label: "Phường Cam Phúc" },
                          { value: "Phường Ninh Hòa", label: "Phường Ninh Hòa" },
                          { value: "Phường Bắc Ninh Hòa", label: "Phường Bắc Ninh Hòa" },
                          { value: "Phường Nam Ninh Hòa", label: "Phường Nam Ninh Hòa" },
                          { value: "Phường Phan Rang", label: "Phường Phan Rang" },
                          { value: "Phường Đông Phan Rang", label: "Phường Đông Phan Rang" },
                          { value: "Phường Tây Phan Rang", label: "Phường Tây Phan Rang" },
                          { value: "Phường Tháp Chàm", label: "Phường Tháp Chàm" },

                          { value: "Xã Nam Cam Ranh", label: "Xã Nam Cam Ranh" },
                          { value: "Xã Bắc Ninh Hòa", label: "Xã Bắc Ninh Hòa" },
                          { value: "Xã Tân Định", label: "Xã Tân Định" },
                          { value: "Xã Nam Ninh Hòa", label: "Xã Nam Ninh Hòa" },
                          { value: "Xã Tây Ninh Hòa", label: "Xã Tây Ninh Hòa" },
                          { value: "Xã Hòa Trí", label: "Xã Hòa Trí" },
                          { value: "Xã Đại Lãnh", label: "Xã Đại Lãnh" },
                          { value: "Xã Tu Bông", label: "Xã Tu Bông" },
                          { value: "Xã Vạn Thắng", label: "Xã Vạn Thắng" },
                          { value: "Xã Vạn Ninh", label: "Xã Vạn Ninh" },
                          { value: "Xã Vạn Hưng", label: "Xã Vạn Hưng" },
                          { value: "Xã Diên Khánh", label: "Xã Diên Khánh" },
                          { value: "Xã Diên Lạc", label: "Xã Diên Lạc" },
                          { value: "Xã Diên Thọ", label: "Xã Diên Thọ" },
                          { value: "Xã Diên Điền", label: "Xã Diên Điền" },
                          { value: "Xã Diên Tân", label: "Xã Diên Tân" },
                          { value: "Xã Cam Lâm", label: "Xã Cam Lâm" },
                          { value: "Xã Cam Hiệp", label: "Xã Cam Hiệp" },
                          { value: "Xã Cam An", label: "Xã Cam An" },
                          { value: "Xã Cam Thành", label: "Xã Cam Thành" },
                          { value: "Xã Cam Phước", label: "Xã Cam Phước" },
                          { value: "Xã Cam Thịnh", label: "Xã Cam Thịnh" },
                          { value: "Xã Cam Hòa", label: "Xã Cam Hòa" },
                          { value: "Xã Khánh Sơn", label: "Xã Khánh Sơn" },
                          { value: "Xã Sơn Hiệp", label: "Xã Sơn Hiệp" },
                          { value: "Xã Sơn Bình", label: "Xã Sơn Bình" },
                          { value: "Xã Sơn Trung", label: "Xã Sơn Trung" },
                          { value: "Xã Sơn Lâm", label: "Xã Sơn Lâm" },
                          { value: "Xã Sơn Thái", label: "Xã Sơn Thái" },
                          { value: "Xã Khánh Vĩnh", label: "Xã Khánh Vĩnh" },
                          { value: "Xã Sông Cầu", label: "Xã Sông Cầu" },
                          { value: "Xã Cầu Bà", label: "Xã Cầu Bà" },
                          { value: "Xã Giang Ly", label: "Xã Giang Ly" },
                          { value: "Xã Liên Sang", label: "Xã Liên Sang" },
                          { value: "Xã Khánh Thành", label: "Xã Khánh Thành" },
                          { value: "Xã Khánh Bình", label: "Xã Khánh Bình" },
                          { value: "Xã Khánh Trung", label: "Xã Khánh Trung" },
                          { value: "Xã Khánh Nam", label: "Xã Khánh Nam" },
                          { value: "Xã Khánh Hiệp", label: "Xã Khánh Hiệp" },
                          { value: "Xã Khánh Đông", label: "Xã Khánh Đông" },
                          { value: "Xã Khánh Phú", label: "Xã Khánh Phú" },
                          { value: "Xã Khánh Hòa", label: "Xã Khánh Hòa" },
                          { value: "Xã Phước Hữu", label: "Xã Phước Hữu" },
                          { value: "Xã Phước Thái", label: "Xã Phước Thái" },
                          { value: "Xã Phước Trung", label: "Xã Phước Trung" },
                          { value: "Xã Phước Hậu", label: "Xã Phước Hậu" },
                          { value: "Xã Phước Dinh", label: "Xã Phước Dinh" },
                          { value: "Xã Phước Minh", label: "Xã Phước Minh" }
                        ]}
                        value={formData.address}
                        onChange={(e: any) => setFormData({...formData, address: e.target.value})}
                      />
                      <Select 
                        label="Đại đội" 
                        options={[
                          { value: "Đại đội 1", label: "Đại đội 1" },
                          { value: "Đại đội 2", label: "Đại đội 2" },
                          { value: "Đại đội 3", label: "Đại đội 3" },
                        ]}
                        value={formData.unit.company}
                        onChange={(e: any) => setFormData({...formData, unit: {...formData.unit, company: e.target.value}})}
                      />
                      <Select 
                        label="Trung đội" 
                        options={[
                          { value: "Trung đội 1", label: "Trung đội 1" },
                          { value: "Trung đội 2", label: "Trung đội 2" },
                          { value: "Trung đội 3", label: "Trung đội 3" },
                          { value: "Trung đội 4", label: "Trung đội 4" },
                          { value: "Trung đội 5", label: "Trung đội 5" },
                          { value: "Trung đội 6", label: "Trung đội 6" },
                          { value: "Trung đội 7", label: "Trung đội 7" },
                          { value: "Trung đội 8", label: "Trung đội 8" },
                        ]}
                        value={formData.unit.platoon}
                        onChange={(e: any) => setFormData({...formData, unit: {...formData.unit, platoon: e.target.value}})}
                      />
                      <Select 
                        label="Tiểu đội" 
                        options={[
                          { value: "Tiểu đội 1", label: "Tiểu đội 1" },
                          { value: "Tiểu đội 2", label: "Tiểu đội 2" },
                          { value: "Tiểu đội 3", label: "Tiểu đội 3" },
                          { value: "Tiểu đội 4", label: "Tiểu đội 4" },
                          { value: "Tiểu đội 5", label: "Tiểu đội 5" },
                          { value: "Tiểu đội 6", label: "Tiểu đội 6" },
                          { value: "Tiểu đội 7", label: "Tiểu đội 7" },
                          { value: "Tiểu đội 8", label: "Tiểu đội 8" },
                          { value: "Tiểu đội 9", label: "Tiểu đội 9" },
                          { value: "Tiểu đội 10", label: "Tiểu đội 10" },
                          { value: "Tiểu đội 11", label: "Tiểu đội 11" },
                          { value: "Tiểu đội 12", label: "Tiểu đội 12" },
                          { value: "Tiểu đội 13", label: "Tiểu đội 13" },
                        ]}
                        value={formData.unit.squad}
                        onChange={(e: any) => setFormData({...formData, unit: {...formData.unit, squad: e.target.value}})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">Vật chất đem vào</label>
                    <textarea 
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm min-h-[100px]"
                      placeholder="VD: Nước, bánh, kẹo,..."
                      value={formData.notes}
                      onChange={(e: any) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UserPlus size={20} />
                    {loading ? "Đang xử lý..." : "Gửi đăng ký thăm thân"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {view === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto mt-20"
            >
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-900">
                    <ShieldCheck size={32} />
                  </div>
                  <h2 className="text-xl font-bold">Quản trị hệ thống</h2>
                  <p className="text-zinc-500 text-sm">Đăng nhập để quản lý đăng ký</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <Input 
                    label="Tên đăng nhập" 
                    required 
                    value={loginData.username}
                    onChange={(e: any) => setLoginData({...loginData, username: e.target.value})}
                  />
                  <Input 
                    label="Mật khẩu" 
                    type="password" 
                    required 
                    value={loginData.password}
                    onChange={(e: any) => setLoginData({...loginData, password: e.target.value})}
                  />
                  <button 
                    disabled={loading}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setView("form")}
                    className="w-full text-zinc-500 text-sm font-medium hover:text-zinc-900 transition-colors"
                  >
                    Quay lại trang đăng ký
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {view === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Danh sách đăng ký</h2>
                  <p className="text-zinc-500 text-sm">Quản lý và phê duyệt các yêu cầu thăm thân</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-wrap gap-3 items-center">

                  <input
                    placeholder="Tìm tên, CCCD, SĐT..."
                    className="px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <select
                    className="px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Pending">Chờ duyệt</option>
                    <option value="Approved">Đã duyệt</option>
                    <option value="Rejected">Từ chối</option>
                  </select>

                  <select
                    className="px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                  >
                    <option value="all">Tất cả đại đội</option>
                    <option value="Đại đội 1">Đại đội 1</option>
                    <option value="Đại đội 2">Đại đội 2</option>
                    <option value="Đại đội 3">Đại đội 3</option>
                  </select>

                  <select
                    className="px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                    value={platoonFilter}
                    onChange={(e) => setPlatoonFilter(e.target.value)}
                  >
                    <option value="all">Tất cả trung đội</option>
                    <option value="Trung đội 1">Trung đội 1</option>
                    <option value="Trung đội 2">Trung đội 2</option>
                    <option value="Trung đội 3">Trung đội 3</option>
                    <option value="Trung đội 4">Trung đội 4</option>
                    <option value="Trung đội 5">Trung đội 5</option>
                    <option value="Trung đội 6">Trung đội 6</option>
                    <option value="Trung đội 7">Trung đội 7</option>
                    <option value="Trung đội 8">Trung đội 8</option>
                  </select>

                  <select
                    className="px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                    value={addressFilter}
                    onChange={(e) => setAddressFilter(e.target.value)}
                  >
                    <option value="all">Tất cả xã</option>
                    <option value="Phường Nha Trang">Phường Nha Trang</option>
                    <option value="Phường Bắc Nha Trang">Phường Bắc Nha Trang</option>
                    <option value="Phường Tây Nha Trang">Phường Tây Nha Trang</option>
                    <option value="Phường Nam Nha Trang">Phường Nam Nha Trang</option>
                    <option value="Phường Cam Ranh">Phường Cam Ranh</option>
                    <option value="Phường Bắc Cam Ranh">Phường Bắc Cam Ranh</option>
                    <option value="Phường Ba Ngòi">Phường Ba Ngòi</option>
                    <option value="Phường Cam Phú">Phường Cam Phú</option>
                    <option value="Phường Cam Phúc">Phường Cam Phúc</option>
                    <option value="Phường Ninh Hòa">Phường Ninh Hòa</option>
                    <option value="Phường Bắc Ninh Hòa">Phường Bắc Ninh Hòa</option>
                    <option value="Phường Nam Ninh Hòa">Phường Nam Ninh Hòa</option>
                    <option value="Phường Phan Rang">Phường Phan Rang</option>
                    <option value="Phường Đông Phan Rang">Phường Đông Phan Rang</option>
                    <option value="Phường Tây Phan Rang">Phường Tây Phan Rang</option>
                    <option value="Phường Tháp Chàm">Phường Tháp Chàm</option>
                    <option value="Xã Nam Cam Ranh">Xã Nam Cam Ranh</option>
                    <option value="Xã Bắc Ninh Hòa">Xã Bắc Ninh Hòa</option>
                    <option value="Xã Tân Định">Xã Tân Định</option>
                    <option value="Xã Nam Ninh Hòa">Xã Nam Ninh Hòa</option>
                    <option value="Xã Tây Ninh Hòa">Xã Tây Ninh Hòa</option>
                    <option value="Xã Hòa Trí">Xã Hòa Trí</option>
                    <option value="Xã Đại Lãnh">Xã Đại Lãnh</option>
                    <option value="Xã Tu Bông">Xã Tu Bông</option>
                    <option value="Xã Vạn Thắng">Xã Vạn Thắng</option>
                    <option value="Xã Vạn Ninh">Xã Vạn Ninh</option>
                    <option value="Xã Vạn Hưng">Xã Vạn Hưng</option>
                    <option value="Xã Diên Khánh">Xã Diên Khánh</option>
                    <option value="Xã Diên Lạc">Xã Diên Lạc</option>
                    <option value="Xã Diên Thọ">Xã Diên Thọ</option>
                    <option value="Xã Diên Điền">Xã Diên Điền</option>
                    <option value="Xã Diên Tân">Xã Diên Tân</option>
                    <option value="Xã Cam Lâm">Xã Cam Lâm</option>
                    <option value="Xã Cam Hiệp">Xã Cam Hiệp</option>
                    <option value="Xã Cam An">Xã Cam An</option>
                    <option value="Xã Cam Thành">Xã Cam Thành</option>
                    <option value="Xã Cam Phước">Xã Cam Phước</option>
                    <option value="Xã Cam Thịnh">Xã Cam Thịnh</option>
                    <option value="Xã Cam Hòa">Xã Cam Hòa</option>
                    <option value="Xã Khánh Sơn">Xã Khánh Sơn</option>
                    <option value="Xã Sơn Hiệp">Xã Sơn Hiệp</option>
                    <option value="Xã Sơn Bình">Xã Sơn Bình</option>
                    <option value="Xã Sơn Trung">Xã Sơn Trung</option>
                    <option value="Xã Sơn Lâm">Xã Sơn Lâm</option>
                    <option value="Xã Sơn Thái">Xã Sơn Thái</option>
                    <option value="Xã Khánh Vĩnh">Xã Khánh Vĩnh</option>
                    <option value="Xã Sông Cầu">Xã Sông Cầu</option>
                    <option value="Xã Cầu Bà">Xã Cầu Bà</option>
                    <option value="Xã Giang Ly">Xã Giang Ly</option>
                    <option value="Xã Liên Sang">Xã Liên Sang</option>
                    <option value="Xã Khánh Thành">Xã Khánh Thành</option>
                    <option value="Xã Khánh Bình">Xã Khánh Bình</option>
                    <option value="Xã Khánh Trung">Xã Khánh Trung</option>
                    <option value="Xã Khánh Nam">Xã Khánh Nam</option>
                    <option value="Xã Khánh Hiệp">Xã Khánh Hiệp</option>
                    <option value="Xã Khánh Đông">Xã Khánh Đông</option>
                    <option value="Xã Khánh Phú">Xã Khánh Phú</option>
                    <option value="Xã Khánh Hòa">Xã Khánh Hòa</option>
                    <option value="Xã Phước Hữu">Xã Phước Hữu</option>
                    <option value="Xã Phước Thái">Xã Phước Thái</option>
                    <option value="Xã Phước Trung">Xã Phước Trung</option>
                    <option value="Xã Phước Hậu">Xã Phước Hậu</option>
                    <option value="Xã Phước Dinh">Xã Phước Dinh</option>
                    <option value="Xã Phước Minh">Xã Phước Minh</option>
                  </select>

                  </div>

                <button 
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 bg-white border border-zinc-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-all"
                >
                  <Download size={18} /> Xuất Excel
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Ngày thăm</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Người thăm</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Quan hệ</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Địa chỉ</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Chiến sĩ</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Đơn vị</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Phương tiện</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Vật chất</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Trạng thái</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {registrations.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="p-12 text-center text-zinc-400">
                            Chưa có dữ liệu đăng ký
                          </td>
                        </tr>
                      ) : (
                        filteredRegistrations.map((reg) => (
                          <tr key={reg._id} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="p-4 text-sm">
                              {new Date(reg.visitDate).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="p-4">
                              <div className="font-medium">{reg.visitorName}</div>
                              <div className="text-xs text-zinc-500">{reg.visitorId}</div>
                              <div className="text-xs text-zinc-500">{reg.visitorPhone}</div>
                            </td>
                            <td className="p-4">
                              <div>{reg.relationship}</div>
                            </td>
                            <td className="p-4">
                              <div>{reg.address}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium">{reg.soldierName}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">{reg.unit.company}</div>
                              <div className="text-xs text-zinc-500">{reg.unit.platoon} - {reg.unit.squad}</div>
                            </td>
                            <td className="p-4">
                              <div>{reg.numberVehicle}</div>
                            </td>
                            <td className="p-4">
                              <div>{reg.notes}</div>
                            </td>
                            <td className="p-4">
                              <StatusBadge status={reg.status} />
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {reg.status === "Pending" && (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateStatus(reg._id, "Approved")}
                                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Phê duyệt"
                                    >
                                      <CheckCircle size={20} />
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateStatus(reg._id, "Rejected")}
                                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                      title="Từ chối"
                                    >
                                      <XCircle size={20} />
                                    </button>
                                  </>
                                )}
                                <button className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-lg transition-colors">
                                  <ChevronRight size={20} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {view === "stats" && stats && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold">Thống kê dữ liệu</h2>
                <p className="text-zinc-500 text-sm">Tổng quan hoạt động đăng ký thăm thân</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="flex items-center gap-3 text-zinc-500 mb-2">
                    <FileText size={18} />
                    <span className="text-sm font-medium">Tổng đăng ký</span>
                  </div>
                  <div className="text-3xl font-bold">{stats.total}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="flex items-center gap-3 text-amber-500 mb-2">
                    <Clock size={18} />
                    <span className="text-sm font-medium">Đang chờ</span>
                  </div>
                  <div className="text-3xl font-bold">{stats.pending}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="flex items-center gap-3 text-emerald-500 mb-2">
                    <CheckCircle size={18} />
                    <span className="text-sm font-medium">Đã duyệt</span>
                  </div>
                  <div className="text-3xl font-bold">{stats.approved}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="flex items-center gap-3 text-rose-500 mb-2">
                    <XCircle size={18} />
                    <span className="text-sm font-medium">Từ chối</span>
                  </div>
                  <div className="text-3xl font-bold">{stats.rejected}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <h3 className="text-lg font-bold mb-6">Phân bổ theo trạng thái</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Chờ duyệt", value: stats.pending },
                            { name: "Đã duyệt", value: stats.approved },
                            { name: "Từ chối", value: stats.rejected },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#f59e0b" />
                          <Cell fill="#10b981" />
                          <Cell fill="#f43f5e" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <h3 className="text-lg font-bold mb-6">Đăng ký theo Đại đội</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.companyStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: "#f8f9fa" }} />
                        <Bar dataKey="count" fill="#065f46" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <h3 className="text-lg font-bold mb-6">Đăng ký theo Trung đội</h3>

                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.platoonStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: "#f8f9fa" }} />
                        <Bar dataKey="count" fill="#2563eb" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <h3 className="text-lg font-bold mb-6">Đăng ký theo Tiểu đội</h3>

                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.squadStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: "#f8f9fa" }} />
                        <Bar dataKey="count" fill="#dc2626" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-zinc-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck size={20} className="text-emerald-700" />
            <span className="font-bold tracking-tight">PHẦN MỀM QUẢN LÝ QUÂN NHÂN ĐẠI ĐỘI BB2, TIỂU ĐOÀN 460</span>
          </div>
          <p className="text-zinc-500 text-sm">© Tác giả do Trung uý Bùi Dương Hào, SĐT liên hệ: 0384971009.</p>
        </div>
      </footer>
    </div>
  );
}
