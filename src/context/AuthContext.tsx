import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  ensureFirebaseReady,
} from "../lib/firebaseClient";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(isFirebaseConfigured);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;

    ensureFirebaseReady().then((ready) => {
      if (!isMounted) return;
      setConfigured(ready);

      if (ready && auth) {
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (!isMounted) return;
          setUser(currentUser);
          setLoading(false);
        });
      } else {
        // Check if demo user was cached
        const cachedUser = localStorage.getItem("tripwise_demo_user");
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {
            setUser(null);
          }
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const ready = await ensureFirebaseReady();

    if (ready && auth) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        setUser(result.user);
        toast.success(`Chào mừng ${result.user.displayName || "bạn"}!`, {
          description: "Đã đăng nhập thành công tài khoản Google",
        });
      } catch (err: any) {
        console.error("Lỗi đăng nhập Google:", err);
        if (err.code === "auth/popup-closed-by-user") {
          toast.info("Bạn đã đóng cửa sổ đăng nhập");
        } else if (err.code === "auth/unauthorized-domain") {
          toast.error(
            "Tên miền chưa được cấp phép (Authorized domain) trong Firebase Console!",
            { duration: 6000 }
          );
        } else {
          toast.error(err.message || "Đăng nhập thất bại. Vui lòng thử lại!");
        }
      }
    } else {
      // Demo fallback if Firebase is not yet provisioned in .env
      toast.info("Chế độ Thử nghiệm (Demo)", {
        description: "Đang đăng nhập bằng tài khoản Demo để bạn kiểm tra giao diện...",
        duration: 3500,
      });
      const demoUser = {
        uid: "demo_traveler_global_uid",
        displayName: "Người dùng Thử nghiệm (Demo)",
        email: "demo.traveler@gmail.com",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Traveler",
      } as unknown as User;
      setUser(demoUser);
      localStorage.setItem("tripwise_demo_user", JSON.stringify(demoUser));
    }
  };

  const signOut = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      localStorage.removeItem("tripwise_demo_user");
      toast.info("Đã đăng xuất tài khoản");
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: configured,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
