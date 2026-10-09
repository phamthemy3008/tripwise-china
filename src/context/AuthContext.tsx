import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../lib/firebaseClient";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  googleAccessToken: string | null;
  signInWithGoogle: () => Promise<void>;
  requestGoogleWorkspaceAccess: () => Promise<string | null>;
  signOut: () => Promise<void>;
  mockSignIn?: (email?: string, name?: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  googleAccessToken: null,
  signInWithGoogle: async () => {},
  requestGoogleWorkspaceAccess: async () => null,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("tripwise_google_token");
    }
    return null;
  });

  useEffect(() => {
    if (auth && isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Check if local simulated user session exists (for preview/testing before keys are entered)
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
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      toast.warning("Chưa cấu hình Firebase API Keys trong file .env!", {
        description: "Đang bật chế độ Demo Test để bạn có thể xem giao diện...",
        duration: 4000,
      });
      // Fallback demo user so the app never crashes
      const demoUser = {
        uid: "demo_google_user_123",
        displayName: "Người dùng Thử nghiệm (Demo)",
        email: "demo.traveler@gmail.com",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Traveler",
      } as unknown as User;
      setUser(demoUser);
      localStorage.setItem("tripwise_demo_user", JSON.stringify(demoUser));
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken || null;
      if (token) {
        setGoogleAccessToken(token);
        sessionStorage.setItem("tripwise_google_token", token);
      }
      setUser(result.user);
      toast.success(`Chào mừng ${result.user.displayName || "bạn"}!`, {
        description: "Đã đăng nhập thành công và kết nối Google Docs / Drive",
      });
    } catch (err: any) {
      console.error("Lỗi đăng nhập Google:", err);
      if (err.code === "auth/popup-closed-by-user") {
        toast.info("Bạn đã đóng cửa sổ đăng nhập");
      } else if (err.code === "auth/unauthorized-domain") {
        toast.error("Tên miền chưa được cấp phép (Authorized domain) trong Firebase Console!", {
          duration: 5000,
        });
      } else {
        toast.error(err.message || "Đăng nhập thất bại. Vui lòng thử lại!");
      }
    }
  };

  const requestGoogleWorkspaceAccess = async (): Promise<string | null> => {
    if (!auth || !isFirebaseConfigured) {
      toast.info("Đang ở chế độ xem thử (Demo), vui lòng kiểm tra quyền chia sẻ công khai của file.");
      return null;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken || null;
      if (token) {
        setGoogleAccessToken(token);
        sessionStorage.setItem("tripwise_google_token", token);
        toast.success("Đã cấp quyền truy cập Google Docs & Drive!");
        return token;
      }
      return null;
    } catch (err: any) {
      console.error("Lỗi cấp quyền Google Workspace:", err);
      if (err.code === "auth/popup-closed-by-user") {
        toast.info("Bạn đã hủy cấp quyền");
      } else {
        toast.error("Không thể cấp quyền Google Workspace: " + (err.message || ""));
      }
      return null;
    }
  };

  const signOut = async () => {
    try {
      if (auth && isFirebaseConfigured) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      setGoogleAccessToken(null);
      sessionStorage.removeItem("tripwise_google_token");
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
        isConfigured: isFirebaseConfigured,
        googleAccessToken,
        signInWithGoogle,
        requestGoogleWorkspaceAccess,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
